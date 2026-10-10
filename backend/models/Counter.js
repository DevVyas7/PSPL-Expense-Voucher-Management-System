const mongoose = require('mongoose');

const counterSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true
  },
  seq: {
    type: Number,
    default: 0
  }
});

// Atomic sequence generator for unique voucher numbers
counterSchema.statics.getNextVoucherNumber = async function (year = new Date().getFullYear()) {
  const counterId = `voucher_${year}`;
  const counter = await this.findByIdAndUpdate(
    counterId,
    { $inc: { seq: 1 } },
    { returnDocument: 'after', upsert: true }
  );
  
  const paddedSeq = String(counter.seq).padStart(4, '0');
  return `EXP-${year}-${paddedSeq}`;
};

module.exports = mongoose.model('Counter', counterSchema);
