const express = require('express');
const router = express.Router();
const verifyToken = require('../utils/verifyToken');

const { 
  registerUser, 
  loginUser,
  getUserProfile,
  deleteUser,
  getAllUsers
} = require('../controllers/userController');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile/:userId',verifyToken, getUserProfile);
router.delete('/delete/:userId',verifyToken, deleteUser);
router.get('/',verifyToken, getAllUsers);


module.exports = router;