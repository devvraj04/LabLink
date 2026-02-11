const Recording_Staff = require('../models/Recording_Staff');

exports.createStaff = async (req, res, next) => {
  try {
    const staff = new Recording_Staff(req.body);
    await staff.save();
    res.status(201).json({ success: true, data: staff });
  } catch (err) {
    next(err);
  }
};

exports.listStaff = async (req, res, next) => {
  try {
    const staff = await Recording_Staff.find().limit(100);
    res.json({ success: true, data: staff });
  } catch (err) {
    next(err);
  }
};

exports.getStaff = async (req, res, next) => {
  try {
    const staff = await Recording_Staff.findById(req.params.id);
    if (!staff) return res.status(404).json({ success: false, message: 'Staff not found' });
    res.json({ success: true, data: staff });
  } catch (err) {
    next(err);
  }
};

exports.deleteStaff = async (req, res, next) => {
  try {
    await Recording_Staff.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};
