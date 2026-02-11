/**
 * Complete Database Seeder
 * Seeds all collections with proper relationships and complete data
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import all models
const City = require('./models/City');
const Hospital = require('./models/Hospital');
const Donor = require('./models/Donor');
const Recipient = require('./models/Recipient');
const BB_Manager = require('./models/BB_Manager');
const Recording_Staff = require('./models/Recording_Staff');
const DonationCamp = require('./models/DonationCamp');
const Appointment = require('./models/Appointment');
const BloodRequest = require('./models/BloodRequest');
const BloodSpecimen = require('./models/BloodSpecimen');
const HospitalInventory = require('./models/HospitalInventory');
const EmergencyRequest = require('./models/EmergencyRequest');
const Chat = require('./models/Chat');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...\n');

    // ⚠️ PRESERVE existing admin users and manually registered hospitals
    console.log('🔒 Checking for existing data to preserve...');
    const User = require('./models/User');
    const existingAdmin = await User.findOne({ role: 'manager' });
    // Only preserve hospitals that DON'T have @seed.com emails (portal-registered ones)
    const existingHospitals = await Hospital.find({ 
      email: { 
        $exists: true, 
        $ne: null, 
        $not: /@seed\.com$/ // Exclude seed emails
      } 
    });
    
    console.log(`   - Admin users: ${existingAdmin ? '1 found (will preserve)' : 'None'}`);
    console.log(`   - Portal-registered hospitals: ${existingHospitals.length} found (will preserve)\n`);

    // Clear existing data EXCEPT preserved items
    console.log('🧹 Clearing old mock/seed data...');
    // Don't delete from User collection (preserves admin)
    // Delete ALL hospitals except portal-registered (non-seed) ones
    const hospitalIdsToKeep = existingHospitals.map(h => h._id);
    await Hospital.deleteMany({ _id: { $nin: hospitalIdsToKeep } });
    
    await Donor.deleteMany({});
    await Recipient.deleteMany({});
    await BB_Manager.deleteMany({});
    await Recording_Staff.deleteMany({});
    await DonationCamp.deleteMany({});
    await Appointment.deleteMany({});
    await BloodRequest.deleteMany({});
    await BloodSpecimen.deleteMany({});
    await HospitalInventory.deleteMany({});
    await EmergencyRequest.deleteMany({});
    await Chat.deleteMany({});
    // Clear cities only if no hospitals reference them
    await City.deleteMany({});
    console.log('✅ Cleared mock data (preserved admin & registered hospitals)\n');

    // ==================== SEED CITIES ====================
    console.log('📍 Seeding Cities...');
    const cities = await City.insertMany([
      { City_Id: 1, City_Name: 'Mumbai' },
      { City_Id: 2, City_Name: 'Delhi' },
      { City_Id: 3, City_Name: 'Bangalore' },
      { City_Id: 4, City_Name: 'Hyderabad' },
      { City_Id: 5, City_Name: 'Chennai' },
      { City_Id: 6, City_Name: 'Kolkata' },
      { City_Id: 7, City_Name: 'Pune' },
      { City_Id: 8, City_Name: 'Ahmedabad' },
      { City_Id: 9, City_Name: 'Jaipur' },
      { City_Id: 10, City_Name: 'Lucknow' }
    ]);
    console.log(`✅ Created ${cities.length} cities\n`);

    // ==================== SEED HOSPITALS ====================
    console.log('🏥 Seeding Hospitals (Mumbai-focused + other cities)...');
    const newHospitals = await Hospital.insertMany([
      // ===== MUMBAI HOSPITALS (10) ===== 
      {
        Hosp_Id: 101,
        Hosp_Name: 'Tata Memorial Hospital',
        name: 'Tata Memorial Hospital',
        Hosp_Phone: '02224177000',
        phone: '02224177000',
        Hosp_Needed_Bgrp: 'O+',
        City_Id: cities[0]._id, // Mumbai
        address: 'Dr. E Borges Road, Parel East, Mumbai - 400012',
        email: 'tata.memorial@seed.com',
        password: await bcrypt.hash('hospital123', 10),
        isApproved: true,
        registrationDate: new Date('2024-01-15')
      },
      {
        Hosp_Id: 102,
        Hosp_Name: 'KEM Hospital',
        name: 'KEM Hospital',
        Hosp_Phone: '02224136051',
        phone: '02224136051',
        Hosp_Needed_Bgrp: 'A+',
        City_Id: cities[0]._id,
        address: 'Acharya Donde Marg, Parel, Mumbai - 400012',
        email: 'kem.mumbai@seed.com',
        password: await bcrypt.hash('hospital123', 10),
        isApproved: true,
        registrationDate: new Date('2024-02-10')
      },
      {
        Hosp_Id: 103,
        Hosp_Name: 'Lilavati Hospital',
        name: 'Lilavati Hospital',
        Hosp_Phone: '02226751000',
        phone: '02226751000',
        Hosp_Needed_Bgrp: 'B+',
        City_Id: cities[0]._id,
        address: 'A-791, Bandra Reclamation, Bandra West, Mumbai - 400050',
        email: 'lilavati.mumbai@seed.com',
        password: await bcrypt.hash('hospital123', 10),
        isApproved: true,
        registrationDate: new Date('2024-03-05')
      },
      {
        Hosp_Id: 104,
        Hosp_Name: 'Hinduja Hospital',
        name: 'Hinduja Hospital',
        Hosp_Phone: '02244549000',
        phone: '02244549000',
        Hosp_Needed_Bgrp: 'AB+',
        City_Id: cities[0]._id,
        address: 'Veer Savarkar Marg, Mahim West, Mumbai - 400016',
        email: 'hinduja.mumbai@seed.com',
        password: await bcrypt.hash('hospital123', 10),
        isApproved: true,
        registrationDate: new Date('2024-04-20')
      },
      {
        Hosp_Id: 105,
        Hosp_Name: 'Nanavati Super Speciality Hospital',
        name: 'Nanavati Super Speciality Hospital',
        Hosp_Phone: '02226455000',
        phone: '02226455000',
        Hosp_Needed_Bgrp: 'O-',
        City_Id: cities[0]._id,
        address: 'Vile Parle West, Mumbai - 400056',
        email: 'nanavati.mumbai@seed.com',
        password: await bcrypt.hash('hospital123', 10),
        isApproved: true,
        registrationDate: new Date('2024-05-12')
      },
      {
        Hosp_Id: 106,
        Hosp_Name: 'Fortis Hospital Mulund',
        name: 'Fortis Hospital Mulund',
        Hosp_Phone: '02267142222',
        phone: '02267142222',
        Hosp_Needed_Bgrp: 'A-',
        City_Id: cities[0]._id,
        address: 'Mulund Goregaon Link Road, Mulund West, Mumbai - 400078',
        email: 'fortis.mulund@seed.com',
        password: await bcrypt.hash('hospital123', 10),
        isApproved: true,
        registrationDate: new Date('2024-06-08')
      },
      {
        Hosp_Id: 107,
        Hosp_Name: 'Breach Candy Hospital',
        name: 'Breach Candy Hospital',
        Hosp_Phone: '02223667788',
        phone: '02223667788',
        Hosp_Needed_Bgrp: 'B-',
        City_Id: cities[0]._id,
        address: '60-A, Bhulabhai Desai Road, Breach Candy, Mumbai - 400026',
        email: 'breachcandy.mumbai@seed.com',
        password: await bcrypt.hash('hospital123', 10),
        isApproved: true,
        registrationDate: new Date('2024-07-15')
      },
      {
        Hosp_Id: 108,
        Hosp_Name: 'Kokilaben Dhirubhai Ambani Hospital',
        name: 'Kokilaben Dhirubhai Ambani Hospital',
        Hosp_Phone: '02230999999',
        phone: '02230999999',
        Hosp_Needed_Bgrp: 'AB-',
        City_Id: cities[0]._id,
        address: 'Four Bungalows, Andheri West, Mumbai - 400053',
        email: 'kokilaben.mumbai@seed.com',
        password: await bcrypt.hash('hospital123', 10),
        isApproved: true,
        registrationDate: new Date('2024-08-22')
      },
      {
        Hosp_Id: 109,
        Hosp_Name: 'Sion Hospital',
        name: 'Sion Hospital',
        Hosp_Phone: '02224076501',
        phone: '02224076501',
        Hosp_Needed_Bgrp: 'O+',
        City_Id: cities[0]._id,
        address: 'Sion-Trombay Road, Sion, Mumbai - 400022',
        email: 'sion.mumbai@seed.com',
        password: await bcrypt.hash('hospital123', 10),
        isApproved: true,
        registrationDate: new Date('2024-09-10')
      },
      {
        Hosp_Id: 110,
        Hosp_Name: 'JJ Hospital',
        name: 'JJ Hospital',
        Hosp_Phone: '02223739600',
        phone: '02223739600',
        Hosp_Needed_Bgrp: 'A+',
        City_Id: cities[0]._id,
        address: 'J.J. Marg, Nagpada-Byculla, Mumbai - 400008',
        email: 'jj.mumbai@seed.com',
        password: await bcrypt.hash('hospital123', 10),
        isApproved: true,
        registrationDate: new Date('2024-10-05')
      },
      // ===== PUNE HOSPITALS (3) =====
      {
        Hosp_Id: 201,
        Hosp_Name: 'Ruby Hall Clinic',
        name: 'Ruby Hall Clinic',
        Hosp_Phone: '02066455000',
        phone: '02066455000',
        Hosp_Needed_Bgrp: 'O+',
        City_Id: cities[6]._id, // Pune
        address: '40, Sassoon Road, Pune - 411001',
        email: 'rubyhall.pune@seed.com',
        password: await bcrypt.hash('hospital123', 10),
        isApproved: true,
        registrationDate: new Date('2024-03-18')
      },
      {
        Hosp_Id: 202,
        Hosp_Name: 'Jehangir Hospital',
        name: 'Jehangir Hospital',
        Hosp_Phone: '02066815555',
        phone: '02066815555',
        Hosp_Needed_Bgrp: 'A-',
        City_Id: cities[6]._id,
        address: '32, Sassoon Road, Pune - 411001',
        email: 'jehangir.pune@seed.com',
        password: await bcrypt.hash('hospital123', 10),
        isApproved: true,
        registrationDate: new Date('2024-04-25')
      },
      {
        Hosp_Id: 203,
        Hosp_Name: 'Noble Hospital',
        name: 'Noble Hospital',
        Hosp_Phone: '02041331000',
        phone: '02041331000',
        Hosp_Needed_Bgrp: 'B+',
        City_Id: cities[6]._id,
        address: '153, Magarpatta City Road, Hadapsar, Pune - 411013',
        email: 'noble.pune@seed.com',
        password: await bcrypt.hash('hospital123', 10),
        isApproved: true,
        registrationDate: new Date('2024-05-30')
      },
      // ===== DELHI HOSPITALS (2) =====
      {
        Hosp_Id: 301,
        Hosp_Name: 'AIIMS Delhi',
        name: 'AIIMS Delhi',
        Hosp_Phone: '01126588500',
        phone: '01126588500',
        Hosp_Needed_Bgrp: 'AB+',
        City_Id: cities[1]._id, // Delhi
        address: 'Sri Aurobindo Marg, Ansari Nagar, New Delhi - 110029',
        email: 'aiims.delhi@seed.com',
        password: await bcrypt.hash('hospital123', 10),
        isApproved: true,
        registrationDate: new Date('2024-02-14')
      },
      {
        Hosp_Id: 302,
        Hosp_Name: 'Safdarjung Hospital',
        name: 'Safdarjung Hospital',
        Hosp_Phone: '01126730000',
        phone: '01126730000',
        Hosp_Needed_Bgrp: 'O-',
        City_Id: cities[1]._id,
        address: 'Ring Road, Safdarjung Enclave, New Delhi - 110029',
        email: 'safdarjung.delhi@seed.com',
        password: await bcrypt.hash('hospital123', 10),
        isApproved: true,
        registrationDate: new Date('2024-07-08')
      }
    ]);
    
    // Combine with preserved hospitals
    const hospitals = [...existingHospitals, ...newHospitals];
    console.log(`✅ Created ${newHospitals.length} seed hospitals (${existingHospitals.length} preserved)\n`);

    // ==================== SEED DONORS ====================
    console.log('🩸 Seeding Donors...');
    const donors = await Donor.insertMany([
      {
        Bd_Name: 'Rahul Sharma',
        Bd_Phone: '9876543220',
        Bd_Bgroup: 'O+',
        Bd_Age: 28,
        Bd_Email: 'rahul.sharma@email.com',
        Bd_Add: '12 MG Road, Mumbai',
        City_Id: cities[0]._id,
        Bd_Sex: 'Male',
        lastDonationDate: new Date('2025-10-15'),
        password: await bcrypt.hash('donor123', 10)
      },
      {
        Bd_Name: 'Priya Patel',
        Bd_Phone: '9876543221',
        Bd_Bgroup: 'A+',
        Bd_Age: 25,
        Bd_Email: 'priya.patel@email.com',
        Bd_Add: '45 Park Street, Delhi',
        City_Id: cities[1]._id,
        Bd_Sex: 'Female',
        lastDonationDate: new Date('2025-11-20'),
        password: await bcrypt.hash('donor123', 10)
      },
      {
        Bd_Name: 'Amit Kumar',
        Bd_Phone: '9876543222',
        Bd_Bgroup: 'B+',
        Bd_Age: 32,
        Bd_Email: 'amit.kumar@email.com',
        Bd_Add: '78 Brigade Road, Bangalore',
        City_Id: cities[2]._id,
        Bd_Sex: 'Male',
        lastDonationDate: new Date('2025-09-10'),
        password: await bcrypt.hash('donor123', 10)
      },
      {
        Bd_Name: 'Sneha Reddy',
        Bd_Phone: '9876543223',
        Bd_Bgroup: 'AB+',
        Bd_Age: 30,
        Bd_Email: 'sneha.reddy@email.com',
        Bd_Add: '99 Jubilee Hills, Hyderabad',
        City_Id: cities[3]._id,
        Bd_Sex: 'Female',
        lastDonationDate: new Date('2025-12-05'),
        password: await bcrypt.hash('donor123', 10)
      },
      {
        Bd_Name: 'Vikram Singh',
        Bd_Phone: '9876543224',
        Bd_Bgroup: 'O-',
        Bd_Age: 35,
        Bd_Email: 'vikram.singh@email.com',
        Bd_Add: '23 Anna Salai, Chennai',
        City_Id: cities[4]._id,
        Bd_Sex: 'Male',
        lastDonationDate: new Date('2025-08-15'),
        password: await bcrypt.hash('donor123', 10)
      }
    ]);
    console.log(`✅ Created ${donors.length} donors\n`);

    // ==================== SEED RECIPIENTS ====================
    console.log('🏥 Seeding Recipients...');
    const recipients = await Recipient.insertMany([
      {
        Reci_Name: 'Anjali Verma',
        Reci_Bgrp: 'O+',
        Reci_Age: 45,
        Reci_Phone: '9876543230',
        Reci_Sex: 'Female',
        Reci_Bqty: 2,
        Reci_Date: new Date('2026-01-09'),
        City_Id: cities[0]._id,
        status: 'pending'
      },
      {
        Reci_Name: 'Suresh Nair',
        Reci_Bgrp: 'A+',
        Reci_Age: 52,
        Reci_Phone: '9876543231',
        Reci_Sex: 'Male',
        Reci_Bqty: 3,
        Reci_Date: new Date('2026-01-08'),
        City_Id: cities[1]._id,
        status: 'approved'
      },
      {
        Reci_Name: 'Meera Joshi',
        Reci_Bgrp: 'B+',
        Reci_Age: 38,
        Reci_Phone: '9876543232',
        Reci_Sex: 'Female',
        Reci_Bqty: 1,
        Reci_Date: new Date('2026-01-05'),
        City_Id: cities[2]._id,
        status: 'fulfilled'
      }
    ]);
    console.log(`✅ Created ${recipients.length} recipients\n`);

    // ==================== SEED BB MANAGERS ====================
    console.log('👔 Seeding Blood Bank Managers...');
    const managers = await BB_Manager.insertMany([
      {
        M_Name: 'Dr. Ramesh Kulkarni',
        M_Phone: '9876543240'
      },
      {
        M_Name: 'Dr. Sunita Malhotra',
        M_Phone: '9876543241'
      }
    ]);
    console.log(`✅ Created ${managers.length} blood bank managers\n`);

    // ==================== SEED RECORDING STAFF ====================
    console.log('📝 Seeding Recording Staff...');
    const staff = await Recording_Staff.insertMany([
      {
        Reco_Name: 'Kavita Desai',
        Reco_Phone: '9876543250'
      },
      {
        Reco_Name: 'Rajesh Gupta',
        Reco_Phone: '9876543251'
      }
    ]);
    console.log(`✅ Created ${staff.length} recording staff\n`);

    // ==================== SEED DONATION CAMPS ====================
    console.log('⛺ Seeding Donation Camps...');
    const camps = await DonationCamp.insertMany([
      {
        campName: "New Year Blood Drive 2026",
        description: "Start the year by saving lives! Join our first blood donation camp of 2026.",
        campDate: new Date('2026-01-15'),
        startTime: "09:00 AM",
        endTime: "05:00 PM",
        location: {
          name: "City Community Center",
          address: "123 Main Street, Downtown",
          city: "Mumbai",
          pincode: "400001"
        },
        organizer: "BloodLink Foundation",
        contactPerson: {
          name: "Rajesh Kumar",
          phone: "9876543210",
          email: "rajesh@bloodlink.org"
        },
        expectedDonors: 150,
        status: "completed",
        unitsCollected: 142,
        registeredDonors: [donors[0]._id, donors[1]._id]
      },
      {
        campName: "Republic Day Special Blood Camp",
        description: "Celebrate Republic Day by donating blood and honoring our nation.",
        campDate: new Date('2026-01-26'),
        startTime: "08:00 AM",
        endTime: "06:00 PM",
        location: {
          name: "National Stadium",
          address: "Stadium Road, Central Area",
          city: "Delhi",
          pincode: "110001"
        },
        organizer: "Red Cross Society",
        contactPerson: {
          name: "Priya Sharma",
          phone: "9876543211",
          email: "priya@redcross.org"
        },
        expectedDonors: 200,
        status: "upcoming",
        unitsCollected: 0,
        registeredDonors: [donors[2]._id]
      },
      {
        campName: "Corporate Blood Donation Drive",
        description: "Tech companies unite for blood donation. Corporate employees welcome!",
        campDate: new Date('2026-02-14'),
        startTime: "10:00 AM",
        endTime: "04:00 PM",
        location: {
          name: "Tech Park Convention Hall",
          address: "Electronic City Phase 1",
          city: "Bangalore",
          pincode: "560100"
        },
        organizer: "IT Companies Association",
        contactPerson: {
          name: "Anil Krishnan",
          phone: "9876543212",
          email: "anil@techassoc.org"
        },
        expectedDonors: 180,
        status: "upcoming",
        unitsCollected: 0,
        registeredDonors: []
      }
    ]);
    console.log(`✅ Created ${camps.length} donation camps\n`);

    // ==================== SEED APPOINTMENTS ====================
    console.log('📅 Seeding Appointments...');
    const appointments = await Appointment.insertMany([
      {
        donorId: donors[0]._id,
        donorName: donors[0].Bd_Name,
        donorPhone: donors[0].Bd_Phone,
        bloodGroup: donors[0].Bd_Bgroup,
        appointmentDate: new Date('2026-01-20'),
        timeSlot: '10:00-11:00',
        location: 'Tata Memorial Hospital',
        locationAddress: 'Dr. E Borges Road, Parel East, Mumbai - 400012',
        status: 'scheduled',
        notes: 'First time donor, requires counseling'
      },
      {
        donorId: donors[1]._id,
        donorName: donors[1].Bd_Name,
        donorPhone: donors[1].Bd_Phone,
        bloodGroup: donors[1].Bd_Bgroup,
        appointmentDate: new Date('2026-01-22'),
        timeSlot: '14:00-15:00',
        location: 'KEM Hospital',
        locationAddress: 'Acharya Donde Marg, Parel, Mumbai - 400012',
        status: 'scheduled',
        notes: 'Regular donor'
      },
      {
        donorId: donors[2]._id,
        donorName: donors[2].Bd_Name,
        donorPhone: donors[2].Bd_Phone,
        bloodGroup: donors[2].Bd_Bgroup,
        appointmentDate: new Date('2026-01-18'),
        timeSlot: '11:00-12:00',
        location: 'Lilavati Hospital',
        locationAddress: 'A-791, Bandra Reclamation, Mumbai - 400050',
        status: 'completed',
        notes: 'Donation completed successfully'
      }
    ]);
    console.log(`✅ Created ${appointments.length} appointments\n`);

    // ==================== SEED BLOOD REQUESTS ====================
    console.log('🩸 Seeding Blood Requests...');
    const bloodRequests = await BloodRequest.insertMany([
      {
        hospitalId: hospitals[0]._id,
        hospitalName: hospitals[0].Hosp_Name,
        hospitalEmail: hospitals[0].email,
        bloodGroup: 'O+',
        quantity: 2,
        urgency: 'urgent',
        reason: 'Anemia treatment for patient',
        patientDetails: 'Female patient, 45 years old, severe anemia',
        status: 'pending',
        requestDate: new Date('2026-01-09'),
        requiredBy: new Date('2026-01-15')
      },
      {
        hospitalId: hospitals[1]._id,
        hospitalName: hospitals[1].Hosp_Name,
        hospitalEmail: hospitals[1].email,
        bloodGroup: 'A+',
        quantity: 3,
        urgency: 'emergency',
        reason: 'Surgery preparation',
        patientDetails: 'Male patient, 52 years old, scheduled surgery',
        status: 'approved',
        requestDate: new Date('2026-01-08'),
        requiredBy: new Date('2026-01-12'),
        responseDate: new Date('2026-01-09')
      },
      {
        hospitalId: hospitals[2]._id,
        hospitalName: hospitals[2].Hosp_Name,
        hospitalEmail: hospitals[2].email,
        bloodGroup: 'B+',
        quantity: 1,
        urgency: 'routine',
        reason: 'Blood transfusion',
        patientDetails: 'Female patient, 38 years old, routine transfusion',
        status: 'fulfilled',
        requestDate: new Date('2026-01-05'),
        requiredBy: new Date('2026-01-10'),
        fulfillmentDate: new Date('2026-01-09')
      }
    ]);
    console.log(`✅ Created ${bloodRequests.length} blood requests\n`);

    // ==================== SEED BLOOD SPECIMENS ====================
    console.log('🧪 Seeding Blood Specimens...');
    const specimens = await BloodSpecimen.insertMany([
      {
        donor: donors[0]._id,
        bloodGroup: donors[0].Bd_Bgroup,
        collectionDate: new Date('2026-01-08'),
        expiryDate: new Date('2026-02-07'),
        status: 'available',
        specimenNumber: 'WB-2026-001'
      },
      {
        donor: donors[1]._id,
        bloodGroup: donors[1].Bd_Bgroup,
        collectionDate: new Date('2026-01-07'),
        expiryDate: new Date('2026-02-06'),
        status: 'available',
        specimenNumber: 'PR-2026-002'
      },
      {
        donor: donors[2]._id,
        bloodGroup: donors[2].Bd_Bgroup,
        collectionDate: new Date('2026-01-06'),
        expiryDate: new Date('2026-02-05'),
        status: 'used',
        specimenNumber: 'PLT-2026-003'
      }
    ]);
    console.log(`✅ Created ${specimens.length} blood specimens\n`);

    // ==================== SEED HOSPITAL INVENTORY ====================
    console.log('📦 Seeding Hospital Inventory...');
    const inventoryItems = [];
    const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    
    for (const hospital of hospitals.slice(0, 4)) { // Only approved hospitals
      for (const bloodGroup of bloodGroups) {
        inventoryItems.push({
          hospitalId: hospital._id,
          hospitalName: hospital.Hosp_Name,
          bloodGroup: bloodGroup,
          wholeBlood: Math.floor(Math.random() * 50) + 10,
          packedRBC: Math.floor(Math.random() * 40) + 5,
          plasma: Math.floor(Math.random() * 30) + 5,
          platelets: Math.floor(Math.random() * 20) + 2,
          lastUpdated: new Date(),
          minThreshold: 10,
          maxCapacity: 100
        });
      }
    }
    
    const inventory = await HospitalInventory.insertMany(inventoryItems);
    console.log(`✅ Created ${inventory.length} inventory records\n`);

    // ==================== SEED EMERGENCY REQUESTS ====================
    console.log('🚨 Seeding Emergency Requests...');
    const emergencyRequests = await EmergencyRequest.insertMany([
      {
        hospitalId: hospitals[0]._id,
        hospitalName: hospitals[0].Hosp_Name,
        bloodGroup: 'O+',
        unitsNeeded: 3,
        urgencyLevel: 'critical',
        patientCondition: 'Road accident - Heavy blood loss, patient unconscious',
        location: {
          coordinates: {
            latitude: 19.0760,
            longitude: 72.8777
          },
          address: hospitals[0].address
        },
        status: 'active',
        expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
        donorsNotified: 15
      },
      {
        hospitalId: hospitals[1]._id,
        hospitalName: hospitals[1].Hosp_Name,
        bloodGroup: 'A-',
        unitsNeeded: 2,
        urgencyLevel: 'urgent',
        patientCondition: 'Surgery complication - controlled bleeding',
        location: {
          coordinates: {
            latitude: 19.0185,
            longitude: 72.8436
          },
          address: hospitals[1].address
        },
        status: 'fulfilled',
        expiresAt: new Date(Date.now() + 3 * 60 * 60 * 1000),
        fulfilledAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        donorsNotified: 8
      }
    ]);
    console.log(`✅ Created ${emergencyRequests.length} emergency requests\n`);

    // ==================== SEED CHAT ====================
    console.log('💬 Seeding Chat Messages...');
    const chats = await Chat.insertMany([
      {
        hospitalId: hospitals[0]._id,
        hospitalName: hospitals[0].Hosp_Name,
        hospitalEmail: hospitals[0].email,
        messages: [
          {
            sender: 'hospital',
            senderName: hospitals[0].Hosp_Name,
            message: 'Hello Admin, we need assistance with blood stock management.',
            timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            isRead: true
          },
          {
            sender: 'admin',
            senderName: 'Blood Bank Admin',
            message: 'Hello! How can I help you today?',
            timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 10 * 60 * 1000),
            isRead: true
          },
          {
            sender: 'hospital',
            senderName: hospitals[0].Hosp_Name,
            message: 'We are running low on O+ blood. Can you help connect us with donors?',
            timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 20 * 60 * 1000),
            isRead: true
          },
          {
            sender: 'admin',
            senderName: 'Blood Bank Admin',
            message: 'Sure! I will coordinate with nearby donation camps and notify potential donors.',
            timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000),
            isRead: true
          }
        ],
        lastMessage: 'Sure! I will coordinate with nearby donation camps and notify potential donors.',
        lastMessageTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000),
        lastMessageSender: 'admin',
        unreadCount: {
          admin: 0,
          hospital: 0
        },
        isActive: true
      },
      {
        hospitalId: hospitals[1]._id,
        hospitalName: hospitals[1].Hosp_Name,
        hospitalEmail: hospitals[1].email,
        messages: [
          {
            sender: 'hospital',
            senderName: hospitals[1].Hosp_Name,
            message: 'We have an emergency case. Need A- blood urgently.',
            timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
            isRead: false
          }
        ],
        lastMessage: 'We have an emergency case. Need A- blood urgently.',
        lastMessageTime: new Date(Date.now() - 3 * 60 * 60 * 1000),
        lastMessageSender: 'hospital',
        unreadCount: {
          admin: 1,
          hospital: 0
        },
        isActive: true
      }
    ]);
    console.log(`✅ Created ${chats.length} chat conversations\n`);

    // ==================== SUMMARY ====================
    console.log('\n🎉 ================================');
    console.log('   DATABASE SEEDING COMPLETED!');
    console.log('================================\n');
    console.log('📊 Summary:');
    console.log(`   Cities: ${cities.length}`);
    console.log(`   Hospitals: ${hospitals.length} (${hospitals.filter(h => h.isApproved).length} approved, ${hospitals.filter(h => !h.isApproved).length} pending)`);
    console.log(`   Donors: ${donors.length}`);
    console.log(`   Recipients: ${recipients.length}`);
    console.log(`   Blood Bank Managers: ${managers.length}`);
    console.log(`   Recording Staff: ${staff.length}`);
    console.log(`   Donation Camps: ${camps.length}`);
    console.log(`   Appointments: ${appointments.length}`);
    console.log(`   Blood Requests: ${bloodRequests.length}`);
    console.log(`   Blood Specimens: ${specimens.length}`);
    console.log(`   Inventory Records: ${inventory.length}`);
    console.log(`   Emergency Requests: ${emergencyRequests.length}`);
    console.log(`   Chat Conversations: ${chats.length}`);
    console.log('\n📝 Login Credentials:');
    console.log('\n   🏥 HOSPITALS (all password: respective name + 123)');
    console.log('   - apollo.mumbai@hospital.com / apollo123 (Approved)');
    console.log('   - fortis.delhi@hospital.com / fortis123 (Approved)');
    console.log('   - manipal.bangalore@hospital.com / manipal123 (Approved)');
    console.log('   - care.hyderabad@hospital.com / care123 (Approved)');
    console.log('   - pending@hospital.com / pending123 (Pending Approval)');
    console.log('\n   🩸 DONORS (all password: donor123)');
    console.log('   - rahul.sharma@email.com');
    console.log('   - priya.patel@email.com');
    console.log('   - amit.kumar@email.com');
    console.log('   - sneha.reddy@email.com');
    console.log('   - vikram.singh@email.com');
    console.log('\n   👔 MANAGERS (password: manager123)');
    console.log('   - ramesh.kulkarni@bloodbank.com');
    console.log('   - sunita.malhotra@bloodbank.com');
    console.log('\n   📝 STAFF (password: staff123)');
    console.log('   - kavita.desai@bloodbank.com');
    console.log('   - rajesh.gupta@bloodbank.com');
    console.log('\n✅ Database is ready for testing!\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
