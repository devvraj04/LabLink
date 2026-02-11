const Registers = require('../models/Registers');
const Records = require('../models/Records');
const Request_To = require('../models/Request_To');

// Registers
exports.createRegister = async (req, res, next) => {
  try {
    const rec = new Registers(req.body);
    await rec.save();
    res.status(201).json({ success: true, data: rec });
  } catch (err) { next(err); }
};

exports.listRegisters = async (req, res, next) => {
  try {
    const items = await Registers.find().limit(200);
    res.json({ success: true, data: items });
  } catch (err) { next(err); }
};

// Records
exports.createRecordRel = async (req, res, next) => {
  try {
    const rec = new Records(req.body);
    await rec.save();
    res.status(201).json({ success: true, data: rec });
  } catch (err) { next(err); }
};

exports.listRecords = async (req, res, next) => {
  try {
    const items = await Records.find().limit(200);
    res.json({ success: true, data: items });
  } catch (err) { next(err); }
};

// Request_To
exports.createRequestTo = async (req, res, next) => {
  try {
    const rec = new Request_To(req.body);
    await rec.save();
    res.status(201).json({ success: true, data: rec });
  } catch (err) { next(err); }
};

exports.listRequestTo = async (req, res, next) => {
  try {
    const items = await Request_To.find().limit(200);
    res.json({ success: true, data: items });
  } catch (err) { next(err); }
};
