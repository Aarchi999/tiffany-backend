const express = require('express');
const router = express.Router();

const userRoutes = require('./authRoutes/auth.routes');

const moduleRoutes = require('./Module/modules.routes');

const roleRoutes = require('./Masters/Roles/roles.routes');
const permissionRoutes = require('./Masters/Permissions/permission.routes');


// Mount each module under its subpath
router.use('/', userRoutes);           // /admin/login
router.use('/module', moduleRoutes);           // /admin/module

router.use('/role', roleRoutes); // /admin/role
router.use('/permission', permissionRoutes); // /admin/permission

module.exports = router; 
