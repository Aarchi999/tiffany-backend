const jwt = require('jsonwebtoken');

const { user_roles, roles } = require('../models');

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const ACCESS_TOKEN_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN;  // short-lived
const REFRESH_TOKEN_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN; // long-lived

const JWT_TOKEN_SECRET = process.env.JWT_TOKEN_SECRET;
const JWT_TOKEN_EXPIRES_IN = process.env.JWT_TOKEN_EXPIRES_IN;  // long-lived


const getRole = async (user) => {
  const userRole = await user_roles.findOne({
    where: { user_id: user.id },
    include: [{ model: roles, as: 'role', attributes: ['id', 'name'] }]
  });

  if (!userRole || !userRole.role) return null;

  return {
    id: userRole.role.id,
    name: userRole.role.name
  };
};

// Generate Access Token
// Accept optional deviceId to include in token payload as `device_id`.
exports.generateAccessToken = async (user, deviceId = null) => {
  const role = await getRole(user);
  const payload = { id: user.id, email: user.email, role };
  if (deviceId) payload.device_id = deviceId;
  return jwt.sign(payload, JWT_ACCESS_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRES_IN });
};

// Generate Refresh Token
// Accept optional deviceId to include in token payload as `device_id`.
exports.generateRefreshToken = async (user, deviceId = null) => {
  const role = await getRole(user);
  const payload = { id: user.id, email: user.email, role };
  if (deviceId) payload.device_id = deviceId;
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRES_IN });
};

// // Generate Customer Token
// // Accept optional deviceId to include in token payload as `device_id`.
// exports.generateToken = async (user, deviceId = null) => {
//   const payload = { id: user.id };
//   if (deviceId) payload.device_id = deviceId;
//   console.log("🚀 ~ payload:", payload)
//   return jwt.sign(payload, JWT_TOKEN_SECRET, { expiresIn: JWT_TOKEN_EXPIRES_IN });
// }

// Verify Access Token
exports.verifyAccessToken = (token, res) => {
  return jwt.verify(token, JWT_ACCESS_SECRET);
};

// Verify Refresh Token
exports.verifyRefreshToken = (token) => {
  return jwt.verify(token, JWT_REFRESH_SECRET);
};


// Generate Customer Token
// Accept optional deviceId to include in token payload as `device_id`.
exports.generateToken = async (user, deviceId = null) => {
  const payload = { id: user.id };
  if (deviceId) payload.device_id = deviceId;
  console.log("🚀 ~ payload:", payload)
  return jwt.sign(payload, JWT_TOKEN_SECRET, { expiresIn: JWT_TOKEN_EXPIRES_IN });
}

// Verify Customer Token
exports.verifyToken = (token) => {
  return jwt.verify(token, JWT_TOKEN_SECRET);
};