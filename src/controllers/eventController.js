const Event = require('../models/Event');
const responseFormatter = require('../utils/responseFormatter');

const createEvent = async (req, res) => {
  try {
    console.log(req.role);
    if (req.role !== 'organizer' && req.role !== 'admin') {
      return res
        .status(403)
        .json(responseFormatter({}, 403, 'Only organizers or admins can create events'));
    }

    const {
      title,
      description,
      date,
      time,
      location,
      capacity,
      ticketPrice,
      category,
      imageUrl
    } = req.body;

    const event = await Event.create({
      title,
      description,
      date,
      time,
      location,
      capacity,
      ticketPrice,
      category,
      imageUrl,
      organizer: req.userId
    });

    res
      .status(201)
      .json(responseFormatter(event, 201, 'Event created successfully'));
  } catch (error) {
    res
      .status(400)
      .json(responseFormatter({}, 400, `Error: ${error.message}`));
  }
};


const getEvents = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filterOptions = {};
    if (req.query.category) filterOptions.category = req.query.category;
    if (req.query.date) filterOptions.date = req.query.date;
    
    if (req.query.startDate && req.query.endDate) {
      filterOptions.date = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate)
      };
    }

    if (req.query.search) {
      filterOptions.title = { $regex: req.query.search, $options: 'i' };
    }

    const events = await Event.find(filterOptions)
      .populate('organizer', 'name email')
      .skip(skip)
      .limit(limit)
      .sort({ date: 1 });

    const total = await Event.countDocuments(filterOptions);

    res.json({
      events,
      page,
      pages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organizer', 'name email');

    if (!event) {
      res.status(404);
      throw new Error('Event not found');
    }

    res.json(event);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      res.status(404);
      throw new Error('Event not found');
    }

    if (event.organizer.toString() !== req.userId.toString()) {
      res.status(403);
      throw new Error('User not authorized to update this event');
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json(updatedEvent);
  } catch (error) {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode).json({ message: error.message });
  }
};

const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      res.status(404);
      throw new Error('Event not found');
    }
    if (req.role !== 'admin' && event.organizer.toString() !== req.userId.toString()) {
      res.status(403);
      throw new Error('User not authorized to delete this event');
    }

    await event.deleteOne();
    res.json({ message: 'Event removed' });
  } catch (error) {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode).json({ message: error.message });
  }
};

const getMyEvents = async (req, res) => {
  try {
    const events = await Event.find({ organizer: req.userId });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  getMyEvents
};