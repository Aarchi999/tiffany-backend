const { Op } = require('sequelize');

const { roles, users } = require('../../../../models');
const { isNonEmptyString, isValidId } = require('../../../../utils/validation.util');
const { formatNameToSlug } = require('../../../../utils/nameFormatter.utils');


const SYSTEM_ROLES = [
  // SUPER ADMIN variations
  "super_admin",
  "super-admin",
  "super admin",
  "SuperAdmin",
  "Super_Admin",
  "Super-Admin",
  "Super Admin",
  "SUPERADMIN",
  "SUPER_ADMIN",
  "SUPER-ADMIN",
  "SUPER ADMIN",

  // DEVELOPER ADMIN variations
  "developer_admin",
  "developer-admin",
  "developer admin",
  "DeveloperAdmin",
  "Developer_Admin",
  "Developer-Admin",
  "Developer Admin",
  "DEVELOPERADMIN",
  "DEVELOPER_ADMIN",
  "DEVELOPER-ADMIN",
  "DEVELOPER ADMIN",

  // RESTAURANT OWNER variations
  "restaurant_owner",
  "restaurant-owner",
  "restaurant owner",
  "RestaurantOwner",
  "Restaurant_Owner",
  "Restaurant-Owner",
  "Restaurant Owner",
  "RESTAURANTOWNER",
  "RESTAURANT_OWNER",
  "RESTAURANT-OWNER",
  "RESTAURANT OWNER"
];


// CREATE
// const createRole = async (req, res) => {
//   try {
//     let { name, description, status } = req.body;
//     let created_by = req.user.id;


//     if (!isNonEmptyString(name)) return res.json({ status: 400, message: "Role name is required", data: [] });

//     name = formatNameToSlug(name);

//     const existingRole = await roles.findOne({ where: { name } });
//     if (existingRole) return res.json({ status: 409, message: "Role already exists", data: [] });

//     const role = await roles.create({ name, description, status, created_by });
//     return res.json({ status: 200, message: "Role created successfully", data: role });

//   } catch (error) {
//     return res.json({ status: 500, message: error.message, data: [] });
//   }
// };

const createRole = async (req, res) => {
  try {
    let { name, description, status } = req.body;
    let created_by = req.user.id;

    if (!isNonEmptyString(name))
      return res.json({ status: 400, message: "Role name is required", data: [] });

    name = formatNameToSlug(name);

    // ❌ Prevent creating system roles
    if (SYSTEM_ROLES.includes(name)) {
      return res.json({ status: 403, message: "Cannot create system role", data: [] });
    }

    const existingRole = await roles.findOne({ where: { name } });
    if (existingRole)
      return res.json({ status: 409, message: "Role already exists", data: [] });

    const role = await roles.create({ name, description, status, created_by });
    return res.json({ status: 200, message: "Role created successfully", data: role });

  } catch (error) {
    return res.json({ status: 500, message: error.message, data: [] });
  }
};

// READ ALL
const getAllRoles = async (req, res) => {
  try {
    let {
      search = {},        // search by role name
      page,
      per_page,
      sort_by = "id",
      sort_order = "asc"
    } = req.query;

    page = parseInt(page) || null;
    per_page = parseInt(per_page) || null;
    const offset = (page - 1) * per_page;

    const whereCondition = {};

    // Restrict non-developer_admin users
    if (req.user.role !== "developer_admin") {
      whereCondition.name = { [Op.ne]: "developer_admin" };
    }

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
    const { count, rows } = await roles.findAndCountAll({
      where: whereCondition,
      limit: per_page,
      offset,
      order,
      distinct: true,
    });

    if (!rows || rows.length === 0) {
      return res.json({
        status: 404,
        message: "No roles found",
        data: [],
        current_page: page,
        total_pages: 0,
        total_items: 0,
        items_per_page: per_page,
      });
    }

    return res.json({
      status: 200,
      message: "Roles fetched successfully",
      data: rows,
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

// READ ONE
const getRoleById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return res.json({ status: 400, message: "Invalid ID", data: [] });

    const role = await roles.findByPk(id);

    if (!role) return res.json({ status: 404, message: "Role not found", data: [] });

    // Hide developer_admin role for non-developer_admin users
    if (req.user.role !== "developer_admin" && role.name === "developer_admin") {
      return res.json({ status: 404, message: "Role not found", data: [] });
    }

    return res.json({ status: 200, message: "Role fetched successfully", data: role });

  } catch (error) {
    return res.json({ status: 500, message: error.message, data: [] });
  }
};

// UPDATE
// const updateRole = async (req, res) => {
//   try {
//     const { id } = req.params;
//     let { name, description, status } = req.body;
//     let updated_by = req.user.id;



//     if (!isValidId(id)) return res.json({ status: 400, message: "Invalid ID", data: [] });

//     const role = await roles.findByPk(id);
//     if (!role) return res.json({ status: 404, message: "Role not found", data: [] });

//     if (name) {
//       const existingRole = await roles.findOne({ where: { name, id: { [Op.ne]: id } } });
//       if (existingRole) return res.json({ status: 409, message: "Role name already exists", data: [] });
//       name = formatNameToSlug(name);
//     }

//     if (status && !isValidEnum(status, ['1', '0'])) {
//       return res.json({ status: 400, message: "Invalid status value", data: [] });
//     }

//     await role.update({ name, description, status, updated_by });
//     return res.json({ status: 200, message: "Role updated successfully", data: role });

//   } catch (error) {
//     return res.json({ status: 500, message: error.message, data: [] });
//   }
// };
const updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    let { name, description, status } = req.body;
    let updated_by = req.user.id;

    if (!isValidId(id))
      return res.json({ status: 400, message: "Invalid ID", data: [] });

    const role = await roles.findByPk(id);
    if (!role)
      return res.json({ status: 404, message: "Role not found", data: [] });

    // ❌ Prevent update of system roles
    if (SYSTEM_ROLES.includes(role.name)) {
      return res.json({ status: 403, message: "Cannot modify a system role", data: [] });
    }

    if (name) {
      name = formatNameToSlug(name);

      if (SYSTEM_ROLES.includes(name)) {
        return res.json({ status: 403, message: "Cannot rename role to a system role", data: [] });
      }

      const existingRole = await roles.findOne({
        where: { name, id: { [Op.ne]: id } }
      });
      if (existingRole)
        return res.json({ status: 409, message: "Role name already exists", data: [] });
    }

    await role.update({ name, description, status, updated_by });
    return res.json({ status: 200, message: "Role updated successfully", data: role });

  } catch (error) {
    return res.json({ status: 500, message: error.message, data: [] });
  }
};


// DELETE (soft delete)
// const deleteRole = async (req, res) => {
//   try {
//     const { id } = req.params;
//     let deleted_by = req.user.id;

//     if (!isValidId(id)) return res.json({ status: 400, message: "Invalid ID", data: [] });


//     const role = await roles.findByPk(id);
//     if (!role) return res.json({ status: 404, message: "Role not found", data: [] });

//     await role.update({ deleted_by });
//     await role.destroy(); // soft delete
//     return res.json({ status: 200, message: "Role deleted successfully", data: [] });

//   } catch (error) {
//     return res.json({ status: 500, message: error.message, data: [] });
//   }
// };
const deleteRole = async (req, res) => {
  try {
    const { id } = req.params;
    let deleted_by = req.user.id;

    if (!isValidId(id))
      return res.json({ status: 400, message: "Invalid ID", data: [] });

    const role = await roles.findByPk(id);
    if (!role)
      return res.json({ status: 404, message: "Role not found", data: [] });

    // ❌ Prevent deletion of system roles
    if (SYSTEM_ROLES.includes(role.name)) {
      return res.json({ status: 403, message: "Cannot delete a system role", data: [] });
    }

    await role.update({ deleted_by });
    await role.destroy(); // soft delete
    return res.json({ status: 200, message: "Role deleted successfully", data: [] });

  } catch (error) {
    return res.json({ status: 500, message: error.message, data: [] });
  }
};

module.exports = { createRole, getAllRoles, getRoleById, updateRole, deleteRole };
