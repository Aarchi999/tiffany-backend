const express = require('express');
const router = express.Router();
const {
  createRole,
  getAllRoles,
  getRoleById,
  updateRole,
  deleteRole
} = require('../../../../controllers/Admin/Masters/Roles/roles.controller');

const authGuard = require('../../../../middlewares/Admin/authMiddlewares/authGuard');
const checkPermission = require('../../../../middlewares/Admin/authMiddlewares/checkPermission');

// CRUD routes
router.post('/', authGuard('admin'), checkPermission(['add-role'], 'admin'), createRole);
router.get('/', authGuard('admin'), getAllRoles);
router.get('/:id', authGuard('admin'), getRoleById);
// router.get('/', authGuard('admin'), checkPermission(['view-role'], 'admin'), getAllRoles);
// router.get('/:id', authGuard('admin'), checkPermission(['view-role'], 'admin'), getRoleById);
router.put('/:id', authGuard('admin'), checkPermission(['update-role'], 'admin'), updateRole);
router.delete('/:id', authGuard('admin'), checkPermission(['delete-role'], 'admin'), deleteRole);

module.exports = router;
