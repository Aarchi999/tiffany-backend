const { Op } = require("sequelize");
const sidebarMenuConfig = require("../../../config/SidebarMenu/Menu/sidebarMenuConfig");
// const menuConfig = require("../../../config/SidebarMenu/Menu/sidebarMenuConfig");
const logger = require("../../../services/logger.service");
const {
  roles,
  permissions,
  role_permissions,
  modules
} = require("../../../models");

const MODULE_NAME = "admin";

// Fetch SideMenu based on role
const ROLE_LEVELS = {
  developer_admin: 1,
  super_admin: 2,
  restaurant_owner: 3,
  store_admin: null
};

const getMenus = async (req, res) => {
  const requestInfo = logger.getRequestInfo(req);

  try {
    const roleName = req.user?.role || req.query?.roleName;
    const roleId = req.user?.role_id;

    if (!roleName || !roleId) {
      const response = {
        status: 403,
        message: "Role not found. Please login or provide a valid role.",
        data: [],
      };
      logger.error({ type: 'GET_MENUS', request: requestInfo, response }, MODULE_NAME);
      return res.json(response);
    }

    const userLevel = Number(ROLE_LEVELS[roleName]);
    // if (!userLevel) {
    //   const response = {
    //     status: 400,
    //     message: "User level not found for role.",
    //     data: [],
    //   };
    if (userLevel === undefined) {
      const response = {
        status: 400,
        message: "User level not found for role.",
        data: [],
      };

      logger.error({ type: 'GET_MENUS', request: requestInfo, response }, MODULE_NAME);
      return res.json(response);
    }

    // ✅ Fetch all permissions of this role
    const rolePermissionData = await role_permissions.findAll({
      where: { role_id: roleId },
      include: [
        {
          model: permissions,
          as: "permission",
          attributes: ["slug", "module_id"],
          include: [{ model: modules, as: "module", attributes: ["id", "module_name", "level"] }],
        },
      ],
    });

    // Flatten user permissions and module levels
    const userPermissions = rolePermissionData
      .map((rp) => rp.permission?.slug)
      .filter(Boolean);

    // Build module-level map: { module_id: level }
    const moduleLevels = {};
    rolePermissionData.forEach((rp) => {
      if (rp.permission?.module_id && rp.permission?.module?.level != null) {
        moduleLevels[rp.permission.module_id] = rp.permission.module.level;
      }
    });

    // ✅ Helper: filter menu based on module level + permission
    const canAccess = (menuItem) => {

      if (userLevel === null) {
        return (
          !menuItem.required_permission ||
          userPermissions.includes(menuItem.required_permission)
        );
      }

      if (menuItem.required_permission) {
        const perm = rolePermissionData.find(
          (rp) => rp.permission?.slug === menuItem.required_permission
        );
        if (!perm) return false;

        const moduleLevel = Number(perm.permission?.module?.level);
        // if (moduleLevel > userLevel) return false;
        if (moduleLevel < userLevel) return false;
      }
      return !menuItem.required_permission || userPermissions.includes(menuItem.required_permission);
    };

    // ✅ Build allowed menus
    const allowedMenus = sidebarMenuConfig
      .map((menu) => {
        if (menu.content && Array.isArray(menu.content)) {
          const filteredContent = menu.content.filter(canAccess);
          if (filteredContent.length > 0) {
            return {
              title: menu.title,
              iconStyle: menu.iconStyle,
              classsChange: menu.classsChange,
              content: filteredContent.map((sub) => ({
                title: sub.title,
                to: sub.to,
                iconStyle: sub.iconStyle || null,
              })),
            };
          }
          return null;
        } else if (canAccess(menu)) {
          return {
            title: menu.title,
            to: menu.to || null,
            iconStyle: menu.iconStyle || null,
            classsChange: menu.classsChange || "",
          };
        }
        return null;
      })
      .filter(Boolean);

    const response = {
      status: 200,
      message: "Sidebar menu fetched successfully",
      roleName,
      data: allowedMenus,
    };
    logger.success({ type: 'GET_MENUS', request: requestInfo, response }, MODULE_NAME);
    return res.json(response);

  } catch (err) {
    return res.status(500).json({
      status: 500,
      message: err.message,
      data: [],
    });
  }
};

module.exports = {
  getMenus
};
