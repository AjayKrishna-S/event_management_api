const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  date: {
    type: Date,
    required: [true, 'Please add a date']
  },
  location: {
    type: String,
    required: [true, 'Please add a location']
  },
  capacity: {
    type: Number,
    required: [true, 'Please add a capacity']
  },
  ticketPrice: {
    type: Number,
    required: [true, 'Please add a ticket price']
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    required: [true, 'Please add a category']
  },
  imageUrl: {
    type: String,
    required: [true, 'Please add an image URL']
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Event', eventSchema);
