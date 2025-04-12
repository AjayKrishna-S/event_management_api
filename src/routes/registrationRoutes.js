const express = require('express');
const router = express.Router();
const verifyToken = require('../utils/verifyToken');

const {
  registerTicket,
  getUserTickets,
  getTicketById,
  cancelTicket,
  getEventTickets,
  updateTicketPayment
} = require('../controllers/registrationController');

router.use(verifyToken);

router.post('/register', registerTicket);
router.get('/', getUserTickets);
router.get('/:id', getTicketById);
router.delete('/:id', cancelTicket);
router.patch('/:id/payment', updateTicketPayment);

router.get('/event/:eventId', getEventTickets);

module.exports = router;