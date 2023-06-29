const mongoose = require('mongoose');

const referralSchema = mongoose.Schema({
  referredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  newUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  refereeEmail: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending',
  },
  rewardAmount: {
    type: Number,
    required: true,
  },
});

const Referral = mongoose.model('Referral', referralSchema);

module.exports = Referral;
