const fs = require('fs');
const path = require('path');

const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Log file path
const logFile = path.join(logsDir, 'api-requests.log');

// Request logger middleware
const logRequest = (req, res, next) => {
  const timestamp = new Date().toISOString();
  const logData = {
    timestamp,
    method: req.method,
    url: req.url,
    ip: req.ip,
    headers: req.headers
  };
  
  // Write to log file
  fs.appendFile(
    logFile,
    JSON.stringify(logData) + '\n',
    (err) => {
      if (err) console.error('Error writing to log file:', err);
    }
  );
  
  console.log(`${timestamp} - ${req.method} ${req.url}`);
  next();
};

module.exports = { logRequest };  