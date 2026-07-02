const fs = require('fs');
const path = require('path');

// Returns the daily log folder path based on module and current date
function getLogFolderPath(moduleName = 'admin') {
  const now = new Date();
  const year = now.getFullYear().toString();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');

  return path.join(__dirname, '../logs', moduleName, year, month, day);
}

// Creates the log folder if it does not exist
function ensureLogFolderExists(folderPath) {
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
}

// Map event types to specific log file names
function getLogFileName(eventStatus, moduleName) {
  const statusUpper = (eventStatus || '').toUpperCase();

  if (statusUpper === 'SUCCESS') {
    return 'action.txt';
  }

  if (statusUpper === 'FAILURE') {
    return 'exception.txt';
  }

  // default fallback
  return `${moduleName}.txt`;
}

// Appends a JSON log event to the daily log file
function logEvent(eventObj, moduleName = 'admin') {
  const folderPath = getLogFolderPath(moduleName);
  ensureLogFolderExists(folderPath);

  const logFile = path.join(folderPath, getLogFileName(eventObj.status, moduleName));
  const logLine = JSON.stringify(eventObj) + '\n';

  fs.appendFile(logFile, logLine, (err) => {
    if (err) {
      console.error('Failed to write log event:', err);
    }
  });
}

// Logs a successful event with status SUCCESS
function successLog(details, moduleName = 'admin') {
  const event = {
    timestamp: new Date().toISOString(),
    type: details.type || 'INFO',
    status: 'SUCCESS',
    request: details.request || {},
    response: details.response || {},
  };
  logEvent(event, moduleName);
}

// Logs an error event with status FAILURE
function errorLog(details, moduleName = 'admin') {
  const event = {
    timestamp: new Date().toISOString(),
    type: details.type || 'ERROR',
    status: 'FAILURE',
    request: details.request || {},
    response: details.response || {},
  };
  logEvent(event, moduleName);
}

// Extracts request info and removes sensitive fields
function getRequestInfo(req) {
  const payload = { ...req.body };
  const sensitiveFields = ["password", "newPassword", "confirmPassword", "token"];
  sensitiveFields.forEach(field => {
    if (field in payload) payload[field] = "";
  });

  return {
    method: req.method,
    url: req.originalUrl,
    user: {
      userId: req?.user?.id || null,
      username: req?.user?.username || ""
    },
    payload,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  };
}

module.exports = {
  success: successLog,
  error: errorLog,
  getRequestInfo
};
