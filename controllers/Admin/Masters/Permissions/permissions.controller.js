const { Op } = require("sequelize");
const logger = require('../../../../services/logger.service');
const { users, modules, roles, user_roles, permissions, role_permissions, user_permissions, Sequelize } = require('../../../../models');
const { formatNameToSlug, commaSeparatortoNumberArray } = require('../../../../utils/nameFormatter.utils');
const { isNonEmptyString, isValidEnum, isValidId } = require('../../../../utils/validation.util');

const MODULE_NAME = 'admin';

// CREATE Permission
const createPermission = async (req, res) => {

  const loggerInfo = logger.getRequestInfo(req);
  try {
    const { name, description, status, module_id } = req.body;

    let created_by = req.user.id;


    if (!isNonEmptyString(name)) {
      const response = { status: 400, message: "Permission name must be non-empty", data: [] };
      logger.error({ type: "CREATE_PERMISSION", request: loggerInfo, response }, MODULE_NAME);
      return res.json(response);
    }

    if (!isValidId(module_id)) {
      const response = { status: 400, message: "module_id is required and must be a valid ID", data: [] };
      logger.error({ type: "CREATE_PERMISSION", request: loggerInfo, response }, MODULE_NAME);
      return res.json(response);
    }

    const slug = formatNameToSlug(name);

    if (status && !isValidEnum(status, ['1', '0'])) {
      const response = { status: 400, message: "Invalid status value", data: [] };
      logger.error({ type: "CREATE_PERMISSION", request: loggerInfo, response }, MODULE_NAME);
      return res.json(response);
    }

    // Check existing permission
    const existingPermission = await permissions.findOne({ where: { name } });
    if (existingPermission) {
      const response = { status: 409, message: "Permission with this name already exists", data: [] };
      logger.error({ type: "CREATE_PERMISSION", request: loggerInfo, response }, MODULE_NAME);
      return res.json(response);
    }
    // Check existing slug
    const existingSlug = await permissions.findOne({ where: { slug } });
    if (existingSlug) {
      const response = { status: 409, message: "Permission with this slug already exists", data: [] };
      logger.error({ type: "CREATE_PERMISSION", request: loggerInfo, response }, MODULE_NAME);
      return res.json(response);
    }

    const customer = await permissions.create({firstName });
    {
      const response = { status: 200, message: "Permission created successfully", data: [perm] };
      logger.success({ type: "CREATE_PERMISSION", request: loggerInfo, response }, MODULE_NAME);
      return res.json(response);
    }

    customer: {
      id: 1 
      firstName: "ABc"
    }

    const invoice = await permissions.create({ customer_id: customer.id, invoice_date });
    {
      const response = { status: 200, message: "Permission created successfully", data: [perm] };
      logger.success({ type: "CREATE_PERMISSION", request: loggerInfo, response }, MODULE_NAME);
      return res.json(response);
    }

  } catch (error) {
    const response = { status: 500, message: error.message, data: [] };
    logger.error({ type: "CREATE_PERMISSION", request: loggerInfo, response }, MODULE_NAME);
    return res.json(response);
  }
};

// READ ALL Permissions

const getAllPermissions = async (req, res) => {
  try {
    let {
      search = {},        // search by permission name
      page,
      per_page,
      sort_by = "id",
      sort_order = "asc"
    } = req.query;

    page = parseInt(page) || null;
    per_page = parseInt(per_page) || null;
    const offset = (page - 1) * per_page;

    const whereCondition = {};

    // Apply search filter
    if (search.name) {
      // Decode and replace '+' with space
      const searchDecoded = decodeURIComponent(search.name).replace(/\+/g, " ");

      // Split by comma to support multiple names
      const names = searchDecoded.split(",").map(n => n.trim()).filter(Boolean);

      if (names.length > 0) {
        whereCondition[Op.or] = names.map(name => ({
          name: { [Op.like]: `%${name}%` },
        }));
      }
    }

    if (search.all) {
      const searchAll = decodeURIComponent(search.all.replace(/\+/g, " "));
      whereCondition[Op.or] = [
        { name: { [Op.like]: `%${searchAll}%` } },
      ];
    }

    // Sorting
    const sortableFields = ["id", "name", "createdAt", "updatedAt"];
    let order = [];
    if (sort_by && sortableFields.includes(sort_by)) {
      sort_order = sort_order.toLowerCase() === "desc" ? "DESC" : "ASC";
      order.push([sort_by, sort_order]);
    }

    // Fetch paginated results
    const { count, rows } = await permissions.findAndCountAll({
      where: whereCondition,
      limit: per_page,
      offset,
      order,
      distinct: true,
      include: [
        {
          model: modules,
          as: 'module',
          attributes: ['id', 'module_name', 'level']
        }
      ]
    });

    if (!rows || rows.length === 0) {
      return res.json({
        status: 200,
        message: "No permissions found",
        data: [],
        current_page: page,
        total_pages: 0,
        total_items: 0,
        items_per_page: per_page,
      });
    }

    const formattedData = rows.map((perm) => ({
      id: perm.id,
      name: perm.name,
      slug: perm.slug,
      description: perm.description,
      module_name: perm.module?.module_name || null,
      level: perm.module?.level || null,
      status: perm.status,
      createdAt: perm.createdAt,
      updatedAt: perm.updatedAt,
    }));

    return res.json({
      status: 200,
      message: "Permissions fetched successfully",
      data: formattedData,
      current_page: page,
      total_pages: Math.ceil(count / per_page),
      total_items: count,
      items_per_page: per_page,
    });

  } catch (error) {
    return res.json({
      status: 500,
      message: error.message,
      data: [],
    });
  }
};


// READ ALL PERMISSIONS MODULEWISE

const getAllPermissionsGrouped = async (req, res) => {
  try {
    const { module_id, search = {} } = req.query;

    // Dynamic where condition
    const whereCondition = { status: 1 };
    if (module_id) whereCondition.module_id = module_id;

    // ✅ Add search[all] (search by permission fields + module name)
    if (search.all && search.all.trim()) {
      const searchDecoded = decodeURIComponent(search.all).replace(/\+/g, " ").trim();
      const keyword = searchDecoded;

      whereCondition[Op.or] = [
        { name: { [Op.like]: `%${keyword}%` } },
        { slug: { [Op.like]: `%${keyword}%` } },
        { description: { [Op.like]: `%${keyword}%` } },
        { "$module.module_name$": { [Op.like]: `%${keyword}%` } },
      ];
    }

    // Fetch permissions
    const allPermissions = await permissions.findAll({
      where: whereCondition,
      include: [
        {
          model: modules,
          as: "module",
          attributes: ["id", "module_name"],
        },
      ],
      order: [
        [{ model: modules, as: "module" }, "module_name", "ASC"],
        ["id", "ASC"],
      ],
    });

    if (!allPermissions || allPermissions.length === 0) {
      return res.json({
        status: 200,
        message: "No permissions found",
        data: {},
      });
    }

    // If module_id is passed → return flat list instead of grouped
    if (module_id) {
      const moduleData = allPermissions[0]?.module || null;

      return res.json({
        status: 200,
        message: "Permissions fetched successfully for the module",
        data: {
          // module: moduleData,
          permissions: allPermissions.map((perm) => ({
            id: perm.id,
            module_id: perm.module_id,
            name: perm.name,
            slug: perm.slug,
            description: perm.description,
            module_name: moduleData.module_name,
            status: perm.status,
            created_by: perm.created_by,
            updated_by: perm.updated_by,
            deleted_by: perm.deleted_by,
            created_at: perm.createdAt,
            updated_at: perm.updatedAt,
            deleted_at: perm.deletedAt,
          })),
        },
      });
    }

    // Otherwise → Group by module name
    const groupedPermissions = {};

    allPermissions.forEach((perm) => {
      const moduleName = perm.module?.module_name?.toLowerCase();

      if (!groupedPermissions[moduleName]) groupedPermissions[moduleName] = [];

      groupedPermissions[moduleName].push({
        id: perm.id,
        module_id: perm.module_id,
        name: perm.name,
        slug: perm.slug,
        description: perm.description,
        module_name: moduleName,
        status: perm.status,
        created_by: perm.created_by,
        updated_by: perm.updated_by,
        deleted_by: perm.deleted_by,
        created_at: perm.createdAt,
        updated_at: perm.updatedAt,
        deleted_at: perm.deletedAt,
      });
    });

    return res.json({
      status: 200,
      message: "Permissions fetched successfully",
      data: groupedPermissions,
    });

  } catch (error) {
    return res.json({
      status: 500,
      message: error.message,
      data: {},
    });
  }
};



// READ ONE Permission
const getPermissionById = async (req, res) => {
  try {
    const { permissionId } = req.params;
    if (!isValidId(permissionId)) return res.json({ status: 400, message: "Invalid ID", data: [] });

    const perm = await permissions.findByPk(permissionId, {
      include: [
        {
          model: modules,
          as: 'module',
          attributes: ['id', 'module_name', 'level']
        }
      ]
    });

    if (!perm) return res.json({ status: 200, message: "Permission not found", data: [] });

    return res.json({ status: 200, message: "Permission fetched successfully", data: perm });

  } catch (error) {
    return res.json({ status: 500, message: error.message, data: [] });
  }
};

// UPDATE Permission
const updatePermission = async (req, res) => {
  try {
    const { permissionId } = req.params;
    const { name, description, status, module_id } = req.body;

    let updated_by = req.user.id;


    if (!isValidId(permissionId)) {
      const response = { status: 400, message: "Invalid ID", data: [] };
      logger.error({ type: "UPDATE_PERMISSION", request: loggerInfo, response }, MODULE_NAME);
      return res.json(response);
    }

    if (name && !isNonEmptyString(name)) {
      const response = { status: 400, message: "Name must be non-empty", data: [] };
      logger.error({ type: "UPDATE_PERMISSION", request: loggerInfo, response }, MODULE_NAME);
      return res.json(response);
    }

    // UPDATE Permission
    if (module_id && !isValidId(module_id)) {
      const response = { status: 400, message: "module_id must be a valid ID", data: [] };
      logger.error({ type: "UPDATE_PERMISSION", request: loggerInfo, response }, MODULE_NAME);
      return res.json(response);
    }

    if (status && !isValidEnum(status, ['1', '0'])) {
      const response = { status: 400, message: "Invalid status value", data: [] };
      logger.error({ type: "UPDATE_PERMISSION", request: loggerInfo, response }, MODULE_NAME);
      return res.json(response);
    }

    const perm = await permissions.findByPk(permissionId);
    if (!perm) {
      const response = { status: 404, message: "Permission not found", data: [] };
      logger.error({ type: "UPDATE_PERMISSION", request: loggerInfo, response }, MODULE_NAME);
      return res.json(response);
    }

    const updateData = { description, status, updated_by };

    // Check if new name exists
    if (name) {
      const existingPermission = await permissions.findOne({ where: { name } });
      if (existingPermission && existingPermission.id !== parseInt(permissionId)) {
        const response = { status: 409, message: "Permission with this name already exists", data: [] };
        logger.error({ type: "UPDATE_PERMISSION", request: loggerInfo, response }, MODULE_NAME);
        return res.json(response);
      }
      const slug = formatNameToSlug(name);

      // Check existing slug
      const existingSlug = await permissions.findOne({ where: { slug } });
      if (existingSlug && existingSlug.id !== parseInt(permissionId)) {
        const response = { status: 409, message: "Permission with this slug already exists", data: [] };
        logger.error({ type: "UPDATE_PERMISSION", request: loggerInfo, response }, MODULE_NAME);
        return res.json(response);
      }

      updateData.name = name;
      updateData.slug = slug;
    }

    if (module_id) updateData.module_id = module_id;

    await perm.update(updateData);
    const response = { status: 200, message: "Permission updated successfully", data: [perm] };
    logger.success({ type: "UPDATE_PERMISSION", request: loggerInfo, response: response }, MODULE_NAME);
    return res.json(response);

  } catch (error) {
    return res.json({ status: 500, message: error.message, data: [] });
  }
};

// DELETE Permission
const deletePermission = async (req, res) => {
  try {
    const { permissionId } = req.params;

    let deleted_by = req.user.id;

    if (!isValidId(permissionId)) return res.json({ status: 400, message: "Invalid ID", data: [] });

    const perm = await permissions.findByPk(permissionId);
    if (!perm) return res.json({ status: 404, message: "Permission not found", data: [] });

    const user = await users.findByPk(deleted_by);
    if (!user) return res.json({ status: 404, message: `Deleter user not found with id ${deleted_by}`, data: [] });

    await perm.update({ deleted_by });
    await perm.destroy();

    return res.json({ status: 200, message: "Permission deleted successfully", data: [] });

  } catch (error) {
    return res.json({ status: 500, message: error.message, data: [] });
  }
};


//  Synchronizes the role's permissions(single module id) based on the provided list.

const syncPermissionsToRole = async (req, res) => {
  try {
    let { role_id, module_id, permission_ids } = req.body;
    const updated_by = req.user.id;

    // Convert CSV → Array of Numbers
    permission_ids = commaSeparatortoNumberArray(permission_ids);

    if (!role_id || !module_id || !Array.isArray(permission_ids)) {
      const response = {
        status: 400,
        message: "role_id, module_id and permission_ids are required",
        data: [],
      };
      logger.error({ type: "UPDATE_ROLE_PERMISSIONS", request: logger.getRequestInfo(req), response }, MODULE_NAME);
      return res.json(response);
    }

    // ✅ Fetch all permissions in that module
    const modulePermissions = await permissions.findAll({
      where: { module_id },
      attributes: ["id"],
    });
    const modulePermissionIds = modulePermissions.map((p) => p.id);

    // ✅ Fetch existing permissions for role in this module
    const existing = await role_permissions.findAll({
      where: { role_id, permission_id: modulePermissionIds },
      attributes: ["permission_id"],
    });
    const existingIds = existing.map((e) => e.permission_id);

    // ✅ Determine what to add/remove
    const toAdd = permission_ids.filter((id) => !existingIds.includes(id));
    const toRemove = existingIds.filter((id) => !permission_ids.includes(id));

    // ✅ Remove unwanted
    if (toRemove.length > 0) {
      await role_permissions.destroy({ where: { role_id, permission_id: toRemove } });
    }

    // ✅ Add new ones safely (no duplicates)
    for (const pid of toAdd) {
      const [record, created] = await role_permissions.findOrCreate({
        where: { role_id, permission_id: pid },
        defaults: { assigned_by: updated_by },
      });

      if (!created) {
        await record.update({ assigned_by: updated_by }); // refresh metadata if already exists
      }
    }

    const response = {
      status: 200,
      message: "Role permissions updated successfully",
      data: { added: toAdd, removed: toRemove },
    };

    logger.success({ type: "UPDATE_ROLE_PERMISSIONS", request: logger.getRequestInfo(req), response }, MODULE_NAME);
    return res.json(response);

  } catch (error) {
    const response = { status: 500, message: error.message, data: [] };
    logger.error({ type: "UPDATE_ROLE_PERMISSIONS", request: logger.getRequestInfo(req), response }, MODULE_NAME);
    return res.json(response);
  }
};

// Synchronizes the user's permissions based on the provided list.

const syncPermissionsToUser = async (req, res) => {
  const requestInfo = logger.getRequestInfo(req);
  try {
    let { user_id, permission_ids = "" } = req.body;
    const assigned_by = req.user.id;

    // Convert comma separated string to array of numbers
    permission_ids = commaSeparatortoNumberArray(permission_ids);

    if (!user_id || !Array.isArray(permission_ids)) {
      const response = { status: 400, message: "user_id and permission_ids are required", data: [] };
      logger.success({ type: "SYNC_USER_PERMISSION", request: requestInfo, response }, MODULE_NAME);
      return res.json(response);
    }

    // Fetch all existing user permissions
    const existing = await user_permissions.findAll({
      where: { user_id },
      attributes: ["permission_id"],
    });
    const existingIds = existing.map((e) => e.permission_id);

    // Separate new permissions to add and old ones to remove
    const toAdd = permission_ids.filter((id) => !existingIds.includes(id));
    const toRemove = existingIds.filter((id) => !permission_ids.includes(id));

    // Add new ones
    if (toAdd.length > 0) {
      const insertData = toAdd.map((pid) => ({ user_id, permission_id: pid, assigned_by }));
      await user_permissions.bulkCreate(insertData);
    }

    // Remove old ones
    if (toRemove.length > 0) {
      await user_permissions.destroy({
        where: { user_id, permission_id: toRemove },
      });
    }

    const data = {
      added_permissions: toAdd,
      removed_permissions: toRemove
    };

    const response = {
      status: 200,
      message: "User permissions synced successfully",
      data,
    };
    logger.success({ type: "SYNC_USER_PERMISSION", request: requestInfo, response }, MODULE_NAME);
    return res.json(response);

  } catch (error) {
    const response = { status: 500, message: error.message, data: [] };
    logger.error({ type: "SYNC_USER_PERMISSION", request: requestInfo, response }, MODULE_NAME);
    return res.json(response);
  }
};


//  Fetch all permissions (direct + via role) of a role 
const getAllPermissionsOfRole = async (req, res) => {

  const requestInfo = logger.getRequestInfo(req);

  try {
    const { role_id } = req.params;
    const { search = {} } = req.query;

    if (!role_id) {
      return res.json({ status: 400, message: "role_id is required", data: [] });
    }

    // ✅ Check if role exists
    const role = await roles.findOne({ where: { id: role_id } });
    if (!role) {
      return res.json({ status: 200, message: "Role not found", data: [] });
    }

    // ✅ Prepare where clause for search
    const whereCondition = { role_id };

    if (search.all && search.all.trim()) {
      const keyword = decodeURIComponent(search.all).replace(/\+/g, " ").trim();

      // ✅ Add search on permission and module
      whereCondition[Op.and] = [
        {
          [Op.or]: [
            { "$permission.name$": { [Op.like]: `%${keyword}%` } },
            { "$permission.slug$": { [Op.like]: `%${keyword}%` } },
            { "$permission.description$": { [Op.like]: `%${keyword}%` } },
            { "$permission.module.module_name$": { [Op.like]: `%${keyword}%` } }, // ✅ valid now
          ],
        },
      ];
    }

    // ✅ Fetch permissions with nested includes
    const rolePerms = await role_permissions.findAll({
      where: whereCondition,
      include: [
        {
          model: permissions,
          as: "permission",
          attributes: ["id", "name", "slug", "description", "status"],
          include: [
            {
              model: modules,
              as: "module",
              attributes: ["id", "module_name"],
              required: false,
            },
          ],
        },
      ],
      order: [[{ model: permissions, as: "permission" }, "id", "ASC"]],
      subQuery: false,
    });

    if (!rolePerms.length) {
      return res.json({
        status: 200,
        message: "No permissions found for this role",
        data: [],
      });
    }

    const uniquePerms = Object.values(
      rolePerms.reduce((acc, rp) => {
        const p = rp.permission;
        acc[p.id] = {
          id: p.id,
          name: p.name,
          slug: p.slug,
          description: p.description,
          status: p.status,
          module_id: p.module?.id || null,
          module_name: p.module?.module_name || null,
        };
        return acc;
      }, {})
    );


    const response = {
      status: 200,
      message: "Fetched role permissions successfully",
      data: uniquePerms,
    }

    logger.success({ type: "ROLE_PERMISSIONS", request: requestInfo, response },
      MODULE_NAME
    );
    return res.json(response);

  } catch (error) {
    return res.json({
      status: 500,
      message: error.message,
      data: [],
    });
  }
};

//  Fetch all permissions (direct + via role) of a user 
const getAllPermissionsOfUser = async (req, res) => {
  const requestInfo = logger.getRequestInfo(req);

  try {
    const { user_id } = req.params;
    const { search = {} } = req.query;

    if (!user_id) {
      return res.json({
        status: 400,
        message: "user_id is required",
        data: [],
      });
    }

    // ✅ Check if user exists
    const user = await users.findOne({ where: { id: user_id, deleted_at: null } });
    if (!user) {
      return res.json({
        status: 200,
        message: "User not found",
        data: [],
      });
    }

    // ✅ Base WHERE condition
    const whereCondition = { user_id };

    // ✅ Add global search (includes module_name)
    if (search.all && search.all.trim()) {
      const keyword = decodeURIComponent(search.all).replace(/\+/g, " ").trim();
      whereCondition[Op.and] = [
        {
          [Op.or]: [
            { "$permission.name$": { [Op.like]: `%${keyword}%` } },
            { "$permission.slug$": { [Op.like]: `%${keyword}%` } },
            { "$permission.description$": { [Op.like]: `%${keyword}%` } },
            { "$permission.module.module_name$": { [Op.like]: `%${keyword}%` } },
          ],
        },
      ];
    }

    // ✅ Direct user-specific permissions
    const userPerms = await user_permissions.findAll({
      where: whereCondition,
      include: [
        {
          model: permissions,
          as: "permission",
          attributes: ["id", "name", "slug"],
          include: [
            {
              model: modules,
              as: "module",
              attributes: ["id", "module_name"],
            },
          ],
        },
      ],
      subQuery: false, // ✅ prevents Sequelize from nesting JOINs
    });

    let finalPerms = [];

    if (userPerms.length > 0) {
      finalPerms = userPerms.map((p) => ({
        id: p.permission.id,
        name: p.permission.name,
        slug: p.permission.slug,
        module_id: p.permission.module?.id || null,
        module_name: p.permission.module?.module_name || "General",
      }));
    } else {
      // ✅ Fetch permissions via roles if user-specific not found
      const userRoles = await user_roles.findAll({ where: { user_id } });
      const roleIds = userRoles.map((r) => r.role_id);

      // ✅ Base WHERE condition
      const whereRolePerms = { role_id: roleIds };

      // ✅ Apply same search to role_permissions
      if (search.all && search.all.trim()) {
        const keyword = decodeURIComponent(search.all).replace(/\+/g, " ").trim();
        whereRolePerms[Op.and] = [
          {
            [Op.or]: [
              { "$permission.name$": { [Op.like]: `%${keyword}%` } },
              { "$permission.slug$": { [Op.like]: `%${keyword}%` } },
              { "$permission.description$": { [Op.like]: `%${keyword}%` } },
              { "$permission.module.module_name$": { [Op.like]: `%${keyword}%` } },
            ],
          },
        ];
      }

      if (roleIds.length > 0) {
        const rolePerms = await role_permissions.findAll({
          where: whereRolePerms,
          include: [
            {
              model: permissions,
              as: "permission",
              attributes: ["id", "name", "slug"],
              include: [
                {
                  model: modules,
                  as: "module",
                  attributes: ["id", "module_name"],
                },
              ],
            },
          ],
          subQuery: false, // ✅ prevents Sequelize from nesting JOINs
        });

        finalPerms = rolePerms.map((p) => ({
          id: p.permission.id,
          name: p.permission.name,
          slug: p.permission.slug,
          module_id: p.permission.module?.id || null,
          module_name: p.permission.module?.module_name || "General",
        }));
      }
    }

    // ✅ Remove duplicates (by permission ID)
    const uniquePerms = Object.values(
      finalPerms.reduce((acc, p) => {
        acc[p.id] = p;
        return acc;
      }, {})
    );

    logger.success(
      {
        type: "GET_USER_PERMISSIONS",
        request: requestInfo,
        response: { status: 200, message: "Fetched user permissions successfully", data: uniquePerms },
      },
      MODULE_NAME
    );

    return res.json({
      status: 200,
      message: "Fetched user permissions successfully",
      data: uniquePerms,
    });

  } catch (error) {
    logger.error(
      {
        type: "GET_USER_PERMISSIONS",
        request: requestInfo,
        response: { status: 500, message: error.message, data: [] },
      },
      MODULE_NAME
    );

    return res.json({
      status: 500,
      message: error.message,
      data: [],
    });
  }
};


module.exports = {
  createPermission,
  getAllPermissions,
  getAllPermissionsGrouped,
  getPermissionById,
  updatePermission,
  deletePermission,
  syncPermissionsToRole,
  syncPermissionsToUser,
  getAllPermissionsOfRole,
  getAllPermissionsOfUser,
};
