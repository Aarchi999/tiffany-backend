const { Op } = require('sequelize');
const { modules, users } = require('../../../models');
const { isNonEmptyString, isValidEnum, isValidId } = require('../../../utils/validation.util');

const MODULE_NAME = 'admin';

// Create Module
const createModule = async (req, res) => {
  try {
    if (req.user?.role !== 'developer_admin')
      return res.json({ status: 403, message: "Access denied", data: [] });

    const { module_name, level } = req.body;
    const created_by = req.user.id;

    if (!isNonEmptyString(module_name))
      return res.json({ status: 400, message: "Module name must be non-empty", data: [] });

    if (level && !isValidEnum(level, ['1', '2', '3']))
      return res.json({ status: 400, message: "Invalid level value", data: [] });

    const existing = await modules.findOne({ where: { module_name } });
    if (existing)
      return res.json({ status: 409, message: "Module with this name already exists", data: [] });

    const moduleData = await modules.create({ module_name, level, created_by });
    return res.json({ status: 200, message: "Module created successfully", data: moduleData });
  } catch (error) {
    return res.json({ status: 500, message: error.message, data: [] });
  }
};

// Get All Modules (with search, pagination, sorting)
const getAllModules = async (req, res) => {
  try {
    // if (req.user?.role !== 'developer_admin')
    //   return res.json({ status: 403, message: "Access denied", data: [] });

    let {
      search = {},
      page,
      per_page,
      sort_by = 'id',
      sort_order = 'asc'
    } = req.query;

    page = parseInt(page) || null;
    per_page = parseInt(per_page) || null;
    const offset = (page - 1) * per_page;

    const whereCondition = {};

    // Individual search filters
    if (search.module_name) {
      const value = decodeURIComponent(search.module_name).replace(/\+/g,
        " ");
      whereCondition.module_name = { [Op.like]: `%${value}%` };
    }

    if (search.level) {
      const value = decodeURIComponent(search.level).replace(/\+/g, " ");
      whereCondition.level = { [Op.like]: `%${value}%` };
    }

    // Combined "search.all" (matches either module_name OR level)
    if (search.all) {
      const value = decodeURIComponent(search.all).replace(/\+/g, " ");
      whereCondition[Op.or] = [
        { module_name: { [Op.like]: `%${value}%` } },
        { level: { [Op.like]: `%${value}%` } },
      ];
    }

    const { count, rows } = await modules.findAndCountAll({
      where: whereCondition,
      limit: per_page,
      offset,
      order: [[sort_by, sort_order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC']],
      distinct: true,
    });

    return res.json({
      status: 200,
      message: "Modules fetched successfully",
      data: rows,
      current_page: page,
      total_pages: Math.ceil(count / per_page),
      total_items: count,
      items_per_page: per_page,
    });
  } catch (error) {
    return res.json({ status: 500, message: error.message, data: [] });
  }
};

// Get Module By ID
const getModuleById = async (req, res) => {
  try {
    // if (req.user?.role !== 'developer_admin')
    //   return res.json({ status: 403, message: "Access denied", data: [] });

    const { moduleId } = req.params;
    if (!isValidId(moduleId))
      return res.json({ status: 400, message: "Invalid ID", data: [] });

    const moduleData = await modules.findByPk(moduleId);
    if (!moduleData)
      return res.json({ status: 404, message: "Module not found", data: [] });

    return res.json({ status: 200, message: "Module fetched successfully", data: moduleData });
  } catch (error) {
    return res.json({ status: 500, message: error.message, data: [] });
  }
};

// Update Module
const updateModule = async (req, res) => {
  try {
    if (req.user?.role !== 'developer_admin')
      return res.json({ status: 403, message: "Access denied", data: [] });

    const { moduleId } = req.params;
    const { module_name, level } = req.body;
    const updated_by = req.user.id;

    if (!isValidId(moduleId))
      return res.json({ status: 400, message: "Invalid ID", data: [] });

    const moduleData = await modules.findByPk(moduleId);
    if (!moduleData)
      return res.json({ status: 404, message: "Module not found", data: [] });

    const updateData = { updated_by };

    if (module_name) {
      if (!isNonEmptyString(module_name))
        return res.json({ status: 400, message: "Module name must be non-empty", data: [] });

      const existing = await modules.findOne({ where: { module_name } });
      if (existing && existing.id !== parseInt(moduleId))
        return res.json({ status: 409, message: "Module name already exists", data: [] });

      updateData.module_name = module_name;
    }

    if (level && !isValidEnum(level, ['1', '2', '3']))
      return res.json({ status: 400, message: "Invalid level value", data: [] });

    if (level) updateData.level = level;

    await moduleData.update(updateData);
    return res.json({ status: 200, message: "Module updated successfully", data: moduleData });
  } catch (error) {
    return res.json({ status: 500, message: error.message, data: [] });
  }
};

// Delete Module (soft delete)
const deleteModule = async (req, res) => {
  try {
    if (req.user?.role !== 'developer_admin')
      return res.json({ status: 403, message: "Access denied", data: [] });

    const { moduleId } = req.params;
    const deleted_by = req.user.id;

    if (!isValidId(moduleId))
      return res.json({ status: 400, message: "Invalid ID", data: [] });

    const moduleData = await modules.findByPk(moduleId);
    if (!moduleData)
      return res.json({ status: 404, message: "Module not found", data: [] });

    const user = await users.findByPk(deleted_by);
    if (!user)
      return res.json({ status: 404, message: `Deleter user not found with id ${deleted_by}`, data: [] });

    await moduleData.update({ deleted_by });
    await moduleData.destroy();

    return res.json({ status: 200, message: "Module deleted successfully", data: [] });
  } catch (error) {
    return res.json({ status: 500, message: error.message, data: [] });
  }
};

module.exports = {
  createModule,
  getAllModules,
  getModuleById,
  updateModule,
  deleteModule,
};
