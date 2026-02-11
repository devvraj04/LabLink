const BB_Manager = require('../models/BB_Manager');

exports.createManager = async (req, res, next) => {
  try {
    const manager = new BB_Manager(req.body);
    await manager.save();
    res.status(201).json({ success: true, data: manager });
  } catch (err) {
    next(err);
  }
};

exports.listManagers = async (req, res, next) => {
  try {
    const managers = await BB_Manager.find().limit(100);
    res.json({ success: true, data: managers });
  } catch (err) {
    next(err);
  }
};

exports.getManager = async (req, res, next) => {
  try {
    const manager = await BB_Manager.findById(req.params.id);
    if (!manager) return res.status(404).json({ success: false, message: 'Manager not found' });
    res.json({ success: true, data: manager });
  } catch (err) {
    next(err);
  }
};

exports.deleteManager = async (req, res, next) => {
  try {
    await BB_Manager.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};
