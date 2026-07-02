const { getUserPermissions } = require('../../../services/permission.service');
const logger = require('../../../services/logger.service');

const checkPermission = (requiredSlug, moduleName = "general") => {
  return async (req, res, next) => {
    try {
      const userId = req.user?.id;
      if (!userId) {             
        logger.error({ type: 'PERMISSION_ERROR', request: logger.getRequestInfo(req), response: { status: 401, message: 'Unauthorized user', data: [] } }, moduleName);
        return res.json({ status: 401, message: 'Unauthorized user', data: [] });
      }

      const permissions = await getUserPermissions(userId);
      // console.log("permissions", permissions);
      console.log("permission required to perform this action: ", requiredSlug);


      // every checks all the permission must include in permissions array
      // some checks atleast one permission must include in permissions array
      if (!requiredSlug.every(slug => permissions.includes(slug))) {
        logger.error({ type: 'PERMISSION_ERROR', request: logger.getRequestInfo(req), response: { status: 403, message: 'Access denied, You do not have the required permission to perform this action.', data: [] } }, moduleName);
        return res.json({ status: 403, message: 'Access denied, You do not have the required permission to perform this action.', data: [] });
      }
    
      next();
    } catch (error) {
      logger.error({ type: 'PERMISSION_ERROR', request: logger.getRequestInfo(req), response: { status: 500, message: 'Permission check failed', data: [] } }, moduleName);
      return res.json({ status: 500, message: error.message, data: [] });
    }
  };
};

module.exports = checkPermission;
