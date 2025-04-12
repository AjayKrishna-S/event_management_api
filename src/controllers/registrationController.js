const Ticket = require('../models/Ticket');
const Event = require('../models/Event');
const responseFormatter = require('../utils/responseFormatter');

const registerTicket = async (req, res) => {
  try {
    const { eventId, quantity, paymentInfo } = req.body;

    if (!eventId) {
      return res.status(400).json(
        responseFormatter({}, 400, "Event ID is required")
      );
    }
    const ticketQuantity = quantity || 1;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json(
        responseFormatter({}, 404, "Event not found")
      );
    }

    if (new Date(event.date) < new Date()) {
      return res.status(400).json(
        responseFormatter({}, 400, "Cannot register for past events")
      );
    }

    if (event.capacity < ticketQuantity) {
      return res.status(400).json(
        responseFormatter({}, 400, `Only ${event.capacity} tickets available`)
      );
    }
    const totalPrice = event.ticketPrice * ticketQuantity;

    const ticket = await Ticket.create({
      event: eventId,
      user: req.userId,
      quantity: ticketQuantity,
      totalPrice,
      paymentInfo: paymentInfo || { status: 'pending' },
      registrationDate: new Date()
    });

    event.capacity -= ticketQuantity;
    await event.save();

    res.status(201).json(
      responseFormatter(
        ticket,
        201,
        `Successfully registered ${ticketQuantity} ticket(s) for the event`
      )
    );
  } catch (error) {
    res.status(500).json(
      responseFormatter({}, 500, `Error: ${error.message}`)
    );
  }
};

const getUserTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find({ user: req.userId })
      .populate({
        path: 'event',
        select: 'title date time location'
      });

    res.status(200).json(
      responseFormatter(
        tickets,
        200,
        "User tickets retrieved successfully"
      )
    );
  } catch (error) {
    res.status(500).json(
      responseFormatter({}, 500, `Error: ${error.message}`)
    );
  }
};

const getTicketById = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate({
        path: 'event',
        select: 'title description date time location ticketPrice category imageUrl creator'
      });

    if (!ticket) {
      return res.status(404).json(
        responseFormatter({}, 404, "Ticket not found")
      );
    }

    if (
      ticket.user.toString() !== req.userId &&
      ticket.event.organizer.toString() !== req.userId &&
      req.userRole !== 'admin'
    ) {
      return res.status(403).json(
        responseFormatter({}, 403, "Not authorized to access this ticket")
      );
    }

    res.status(200).json(
      responseFormatter(
        ticket,
        200,
        "Ticket details retrieved successfully"
      )
    );
  } catch (error) {
    res.status(500).json(
      responseFormatter({}, 500, `Error: ${error.message}`)
    );
  }
};

const cancelTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json(
        responseFormatter({}, 404, "Ticket not found")
      );
    }

    if (ticket.user.toString() !== req.userId && req.userRole !== 'admin') {
      return res.status(403).json(
        responseFormatter({}, 403, "Not authorized to cancel this ticket")
      );
    }

    const event = await Event.findById(ticket.event);
    if (!event) {
      return res.status(404).json(
        responseFormatter({}, 404, "Associated event not found")
      );
    }

    const eventDate = new Date(event.date);
    const hoursBeforeEvent = (eventDate - new Date()) / (1000 * 60 * 60);
    
    if (hoursBeforeEvent < 24) {
      return res.status(400).json(
        responseFormatter({}, 400, "Cannot cancel tickets within 24 hours of event")
      );
    }

    event.capacity += ticket.quantity;
    await event.save();

    await ticket.deleteOne();

    res.status(200).json(
      responseFormatter(
        {},
        200,
        "Ticket successfully cancelled and refund initiated"
      )
    );
  } catch (error) {
    res.status(500).json(
      responseFormatter({}, 500, `Error: ${error.message}`)
    );
  }
};

const getEventTickets = async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json(
        responseFormatter({}, 404, "Event not found")
      );
    }

    if (event.organizer.toString() !== req.userId && req.userRole !== 'admin') {
      return res.status(403).json(
        responseFormatter({}, 403, "Not authorized to access this information")
      );
    }

    const tickets = await Ticket.find({ event: eventId })
      .populate({
        path: 'user',
        select: 'name email'
      });

    const totalTickets = tickets.reduce((sum, ticket) => sum + ticket.quantity, 0);
    const revenue = tickets.reduce((sum, ticket) => sum + ticket.totalPrice, 0);

    res.status(200).json(
      responseFormatter(
        {
          tickets,
          stats: {
            totalRegistrations: tickets.length,
            totalTickets,
            revenue
          }
        },
        200,
        "Event tickets retrieved successfully"
      )
    );
  } catch (error) {
    res.status(500).json(
      responseFormatter({}, 500, `Error: ${error.message}`)
    );
  }
};

const updateTicketPayment = async (req, res) => {
  try {
    const { paymentStatus, paymentInfo } = req.body;
    
    if (!paymentStatus) {
      return res.status(400).json(
        responseFormatter({}, 400, "Payment status is required")
      );
    }

    const ticket = await Ticket.findById(req.params.id);
    
    if (!ticket) {
      return res.status(404).json(
        responseFormatter({}, 404, "Ticket not found")
      );
    }

    const event = await Event.findById(ticket.event);
    
    if (
      ticket.user.toString() !== req.userId &&
      event.organizer.toString() !== req.userId &&
      req.userRole !== 'admin'
    ) {
      return res.status(403).json(
        responseFormatter({}, 403, "Not authorized to update this ticket")
      );
    }

    ticket.paymentInfo = {
      ...ticket.paymentInfo,
      ...paymentInfo,
      status: paymentStatus,
      updatedAt: new Date()
    };

    await ticket.save();

    res.status(200).json(
      responseFormatter(
        ticket,
        200,
        "Ticket payment status updated successfully"
      )
    );
  } catch (error) {
    res.status(500).json(
      responseFormatter({}, 500, `Error: ${error.message}`)
    );
  }
};

module.exports = {
  registerTicket,
  getUserTickets,
  getTicketById,
  cancelTicket,
  getEventTickets,
  updateTicketPayment
};