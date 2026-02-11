const City = require('../models/City');

exports.createCity = async (req, res, next) => {
  try {
    const city = new City(req.body);
    await city.save();
    res.status(201).json({ success: true, data: city });
  } catch (err) {
    next(err);
  }
};

exports.listCities = async (req, res, next) => {
  try {
    const cities = await City.find().sort({ City_Name: 1 });
    res.json({ success: true, data: cities });
  } catch (err) {
    next(err);
  }
};

exports.getCity = async (req, res, next) => {
  try {
    const city = await City.findById(req.params.id);
    if (!city) return res.status(404).json({ success: false, message: 'City not found' });
    res.json({ success: true, data: city });
  } catch (err) {
    next(err);
  }
};

exports.deleteCity = async (req, res, next) => {
  try {
    await City.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};
