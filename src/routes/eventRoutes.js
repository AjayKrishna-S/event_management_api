const express = require('express');
const verifyToken = require('../utils/verifyToken');
const { 
  createEvent, 
  getEvents, 
  getEventById, 
  updateEvent,
  deleteEvent,
  getMyEvents 
} = require('../controllers/eventController');

const router = express.Router();

router.post('/',verifyToken, createEvent);
router.get('/', getEvents);
router.get('/my-events',verifyToken, getMyEvents);
router.get('/:id', getEventById);
router.put('/:id',verifyToken, updateEvent);
router.delete('/:id',verifyToken, deleteEvent);

module.exports = router;