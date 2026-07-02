const {
  users,
  restaurant_staff,
  user_devices
} = require('../../../models');
const { verifyAccessToken } = require('../../../services/token.service');
const logger = require('../../../services/logger.service');

// const authGuard = ( allowedRoles = [], moduleName = "general" ) => {
const authGuard = (moduleName = "general", skipLogIfEmpty = false) => {
  return async (req, res, next) => {
    try {
      let token = null;

      if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
        token = req.headers.authorization.split(" ")[1];
      }
      // console.log("decoded", token);

      if (!token) {
        if (!skipLogIfEmpty) {
          logger.error({
            type: 'AUTH_ERROR',
            request: logger.getRequestInfo(req),
            response: { status: 401, message: 'Access token missing', data: [] }
          }, moduleName);
        }
        return res.json({ status: 401, message: 'Access token missing', data: [] });
      }

      // const decoded = verifyAccessToken(token);

      let decoded;
      try {
        decoded = verifyAccessToken(token); // Should throw error if expired
      } catch (err) {
        if (err.name === 'TokenExpiredError') {
          if (!skipLogIfEmpty) {
            logger.error({
              type: 'AUTH_ERROR',
              request: logger.getRequestInfo(req),
              response: { status: 403, message: 'Access token expired', data: [] }
            }, moduleName);
          }
          return res.status(403).json({ status: 403, message: 'Access token expired', data: [] });
        } else if (err.name === 'JsonWebTokenError') {
          // Token signature mismatch or invalid format
          if (!skipLogIfEmpty) {
            logger.error({
              type: 'AUTH_ERROR',
              request: logger.getRequestInfo(req),
              response: { status: 403, message: 'Token signature mismatch', data: [] }
            }, moduleName);
          }
          return res.status(403).json({ status: 403, message: 'Token signature mismatch', data: [] });
        } else {
          if (!skipLogIfEmpty) {
            logger.error({
              type: 'AUTH_ERROR',
              request: logger.getRequestInfo(req),
              response: { status: 401, message: 'Invalid token', data: [] }
            }, moduleName);
          }
          return res.status(401).json({ status: 401, message: 'Invalid token', data: [] });
        }

      }

      // console.log("decoded", decoded);
      if (!decoded || !decoded.id) {
        if (!skipLogIfEmpty) {
          logger.error({
            type: 'AUTH_ERROR',
            request: logger.getRequestInfo(req),
            response: { status: 401, message: 'Invalid token', data: [] }
          }, moduleName);
        }
        return res.status(401).json({ status: 401, message: 'Invalid token', data: [] });
      }

      const user = await users.findByPk(decoded.id);
      // console.log("decoded", user);
      if (!user || user.is_active !== '1') {
        if (!skipLogIfEmpty) {
          logger.error({
            type: 'AUTH_ERROR',
            request: logger.getRequestInfo(req),
            response: { status: 401, message: 'User not found or inactive', data: [] }
          }, moduleName);
        }
        return res.status(403).json({ status: 403, message: 'User not found or inactive', data: [] });
      }

      // Device binding: token must include `device_id` and device must belong to user
      if (!decoded.device_id) {
        if (!skipLogIfEmpty) {
          logger.error({
            type: 'AUTH_ERROR',
            request: logger.getRequestInfo(req),
            response: { status: 401, message: 'Device identifier missing in token', data: [] }
          }, moduleName);
        }
        return res.status(401).json({ status: 401, message: 'Device identifier missing in token', data: [] });
      }

      const device = await user_devices.findOne({ where: { id: decoded.device_id, user_id: user.id, deleted_at: null } });
      if (!device) {
        if (!skipLogIfEmpty) {
          logger.error({
            type: 'AUTH_ERROR',
            request: logger.getRequestInfo(req),
            response: { status: 401, message: 'Device not found or invalid', data: [] }
          }, moduleName);
        }
        return res.status(401).json({ status: 401, message: 'Device not found or invalid', data: [] });
      }

      // Attach device info
      req.device = {
        id: device.id,
        device_type: device.device_type,
        os_type: device.os_type,
        device_name: device.device_name,
        fcm_token: device.fcm_token
      };

      const role = decoded?.role?.name || null;


      /* ---------------- ATTACH RESTAURANT CONTEXT ---------------- */

      // let restaurantContext = null;

      // try {
      //   if (role === 'restaurant_owner') {
      //     // returns HQ restaurant
      //     restaurantContext = await users.getOwnedParentRestaurants(user.id, require('../../models'));
      //   }

      //   if (role === 'store_admin') {
      //     // returns HQ + store hierarchy
      //     restaurantContext = await users.getStoreAdminRestaurantHierarchy(user.id, require('../../models'));
      //   }
      // } catch (err) {
      //   console.error("Failed to attach restaurant context:", err);
      // }

      /* ---------------- ATTACH restaurant_id ---------------- */

      let restaurant_id = null;

      // if (role === 'restaurant_owner') {
      //   // Owner → parent restaurant
      //   const ownerRestaurant = await models.users.getOwnedParentRestaurants(user.id, models);
      //   restaurant_id = ownerRestaurant ? ownerRestaurant.id : null;
      // }

      if (role === 'store_admin') {
        // Store admin → store restaurant
        const staff = await restaurant_staff.findOne({
          where: { user_id: user.id },
          attributes: ['restaurant_id']
        });

        restaurant_id = staff ? staff.restaurant_id : null;
      }



      req.user = {
        id: user.id,
        username: user.name,
        email: user.email,
        is_active: user.is_active,
        role: role,
        role_id: decoded?.role?.id || null,
        restaurant_id
      };

      // Role-based access control
      // if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
      //   return res.json({ status: 403, message: 'Access denied (role)', data: [] });
      // }

      console.log("req user", req.user);

      next();
    } catch (error) {
      if (!skipLogIfEmpty) {
        logger.error({
          type: 'AUTH_ERROR',
          request: logger.getRequestInfo(req),
          response: { status: 500, message: error.message, data: [] }
        }, moduleName);
      }
      return res.json({ status: 500, message: error.message, data: [] });
    }
  };
};

module.exports = authGuard;
