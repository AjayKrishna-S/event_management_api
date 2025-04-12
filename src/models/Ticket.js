const mongoose = require('mongoose');

const TicketSchema = new mongoose.Schema({
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: [true, 'Event is required']
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  quantity: {
    type: Number,
    required: [true, 'Ticket quantity is required'],
    min: [1, 'At least one ticket must be purchased']
  },
  totalPrice: {
    type: Number,
    required: [true, 'Total price is required']
  },
  paymentInfo: {
    status: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending'
    },
    method: String,
    transactionId: String,
    updatedAt: Date
  },
  registrationDate: {
    type: Date,
    default: Date.now
  },
  attendanceStatus: {
    type: String,
    enum: ['registered', 'checked-in', 'no-show'],
    default: 'registered'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Ticket', TicketSchema);