const jwt = require('jsonwebtoken');
const responseFormatter = require('../utils/responseFormatter');
const dotenv = require('dotenv');
dotenv.config();
const key = process.env.JWT_SECRET

const verifyToken = (req, res, next) => {
   const token = req.headers['authorization']?.split(' ')[1];
   if (!token) {
       return res.status(403).json(responseFormatter({}, 403, 'No token provided.'));
   }
   jwt.verify(token, key, (err, decoded) => {
       if (err) {
           return res.status(401).json(responseFormatter({}, 401, 'Unauthorized: Invalid token'));
       }
       req.userId = decoded.id;
       req.role = decoded.role;
       next();
   });
};
module.exports = verifyToken; 
