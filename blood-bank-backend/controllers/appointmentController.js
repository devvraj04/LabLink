const Appointment = require('../models/Appointment');
const Donor = require('../models/Donor');
const Notification = require('../models/Notification');
const BloodSpecimen = require('../models/BloodSpecimen');
const DonorReward = require('../models/DonorReward');

// @desc    Create appointment
// @route   POST /api/appointments
// @access  Public
exports.createAppointment = async (req, res) => {
  try {
    const { 
      donorId, 
      donorName, 
      donorPhone, 
      donorEmail,
      bloodGroup,
      appointmentDate, 
      timeSlot, 
      location,
      locationAddress,
      healthQuestionnaire 
    } = req.body;

    // Validate required fields
    if (!donorName || !donorPhone || !bloodGroup || !appointmentDate || !timeSlot || !location) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, phone, blood group, date, time slot, and location'
      });
    }

    // Check if slot is available
    const existingAppointment = await Appointment.findOne({
      appointmentDate,
      timeSlot,
      location,
      status: 'scheduled'
    });

    if (existingAppointment) {
      return res.status(400).json({
        success: false,
        message: 'This time slot is already booked. Please choose another time.'
      });
    }

    // Check donor eligibility
    let isEligible = true;
    let eligibilityReasons = [];

    if (healthQuestionnaire) {
      if (healthQuestionnaire.weight && healthQuestionnaire.weight < 50) {
        isEligible = false;
        eligibilityReasons.push('Weight must be at least 50kg');
      }
      if (healthQuestionnaire.recentIllness) {
        isEligible = false;
        eligibilityReasons.push('Recent illness - please wait until fully recovered');
      }
      if (healthQuestionnaire.lastDonationDate) {
        const lastDonation = new Date(healthQuestionnaire.lastDonationDate);
        const daysSinceLastDonation = (new Date() - lastDonation) / (1000 * 60 * 60 * 24);
        const requiredDays = healthQuestionnaire.sex === 'F' ? 120 : 90;
        
        if (daysSinceLastDonation < requiredDays) {
          isEligible = false;
          eligibilityReasons.push(`Must wait ${requiredDays} days between donations`);
        }
      }
    }

    if (!isEligible) {
      return res.status(400).json({
        success: false,
        message: 'You are not eligible to donate at this time',
        reasons: eligibilityReasons
      });
    }

    const appointment = await Appointment.create({
      donorId: donorId || null,
      donorName,
      donorPhone,
      donorEmail,
      bloodGroup,
      appointmentDate,
      timeSlot,
      location,
      locationAddress,
      healthQuestionnaire: {
        ...healthQuestionnaire,
        isEligible: true
      },
      status: 'scheduled'
    });

    // Send confirmation notification
    await Notification.create({
      recipientType: 'donor',
      recipientId: donorId,
      recipientModel: 'Donor',
      type: 'appointment_reminder',
      title: 'Appointment Confirmed! 🎉',
      message: `Your blood donation appointment is scheduled for ${new Date(appointmentDate).toLocaleDateString()} at ${timeSlot} at ${location}`,
      priority: 'medium',
      channels: ['in_app', 'email', 'sms'],
      metadata: { appointmentId: appointment._id },
      actionUrl: `/appointments/${appointment._id}`
    });

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully!',
      data: appointment
    });
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all appointments
// @route   GET /api/appointments
// @access  Private
exports.getAllAppointments = async (req, res) => {
  try {
    const { status, date, location } = req.query;

    const query = {};
    if (status) query.status = status;
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      query.appointmentDate = { $gte: startDate, $lt: endDate };
    }
    if (location) query.location = location;

    const appointments = await Appointment.find(query)
      .populate('donorId', 'Bd_Name Bd_Phone Bd_Bgroup')
      .sort({ appointmentDate: 1, timeSlot: 1 });

    res.json({
      success: true,
      count: appointments.length,
      data: appointments
    });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get appointments by donor
// @route   GET /api/appointments/donor/:donorId
// @access  Public
exports.getAppointmentsByDonor = async (req, res) => {
  try {
    const appointments = await Appointment.find({ donorId: req.params.donorId })
      .sort({ appointmentDate: -1 });

    res.json({
      success: true,
      count: appointments.length,
      data: appointments
    });
  } catch (error) {
    console.error('Error fetching donor appointments:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get available time slots
// @route   GET /api/appointments/available-slots
// @access  Public
exports.getAvailableSlots = async (req, res) => {
  try {
    const { date, location } = req.query;

    if (!date || !location) {
      return res.status(400).json({
        success: false,
        message: 'Please provide date and location'
      });
    }

    const allSlots = ['09:00-10:00', '10:00-11:00', '11:00-12:00', '12:00-13:00', '14:00-15:00', '15:00-16:00', '16:00-17:00'];

    const bookedAppointments = await Appointment.find({
      appointmentDate: new Date(date),
      location,
      status: 'scheduled'
    }).select('timeSlot');

    const bookedSlots = bookedAppointments.map(apt => apt.timeSlot);
    const availableSlots = allSlots.filter(slot => !bookedSlots.includes(slot));

    res.json({
      success: true,
      data: {
        allSlots,
        bookedSlots,
        availableSlots
      }
    });
  } catch (error) {
    console.error('Error fetching available slots:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update appointment status
// @route   PUT /api/appointments/:id/status
// @access  Private
exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const appointment = await Appointment.findById(id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    appointment.status = status;
    if (notes) appointment.notes = notes;

    await appointment.save();

    // If completed, create blood specimen and reward donor
    if (status === 'completed') {
      // Create blood specimen
      const specimenCount = await BloodSpecimen.countDocuments();
      const specimenNumber = `SP${String(specimenCount + 1).padStart(6, '0')}`;
      
      const collectionDate = new Date();
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 42);

      await BloodSpecimen.create({
        specimenNumber,
        bloodGroup: appointment.bloodGroup,
        B_Group: appointment.bloodGroup,
        status: 'available',
        Status: 'available',
        collectionDate,
        expiryDate,
        donor: appointment.donorId
      });

      // Award points
      let reward = await DonorReward.findOne({ donorId: appointment.donorId });
      if (!reward) {
        reward = await DonorReward.create({ donorId: appointment.donorId });
      }

      reward.totalDonations += 1;
      reward.totalPoints += 100;
      reward.livesSaved += 1;
      reward.lastDonationDate = new Date();
      
      reward.transactions.push({
        type: 'donation',
        points: 100,
        description: 'Blood donation completed',
        relatedId: appointment._id
      });

      await reward.save();

      // Send thank you notification
      await Notification.create({
        recipientType: 'donor',
        recipientId: appointment.donorId,
        recipientModel: 'Donor',
        type: 'thank_you',
        title: 'Thank You for Saving Lives! ❤️',
        message: `Your donation has been recorded. You've earned 100 points! Your blood can save up to 3 lives.`,
        priority: 'medium',
        channels: ['in_app', 'email'],
        metadata: { appointmentId: appointment._id, points: 100 }
      });
    }

    res.json({
      success: true,
      message: `Appointment ${status}`,
      data: appointment
    });
  } catch (error) {
    console.error('Error updating appointment:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Cancel appointment
// @route   DELETE /api/appointments/:id
// @access  Public
exports.cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    appointment.status = 'cancelled';
    await appointment.save();

    res.json({
      success: true,
      message: 'Appointment cancelled successfully',
      data: appointment
    });
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = exports;
