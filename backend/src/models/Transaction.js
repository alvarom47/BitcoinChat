const mongoose = require('mongoose');
const Schema = new mongoose.Schema({
  txid: { type: String, required: true, unique: true },
  from: [String],
  to: [{ address: String, value: Number, scriptType: String }],
  totalBTC: Number,
  feeBTC: Number,
  timestamp: Date
}, { timestamps: true });
module.exports = mongoose.model('Transaction', Schema);
