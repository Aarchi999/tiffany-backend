const express = require("express");
const {
  createModule,
  getAllModules,
  getModuleById,
  updateModule,
  deleteModule
} = require("../../../controllers/Admin/Module/modules.controller");

const authGuard = require("../../../middlewares/Admin/authMiddlewares/authGuard");
const checkPermission = require("../../../middlewares/Admin/authMiddlewares/checkPermission");

const router = express.Router();

router.post("/", authGuard('admin'), checkPermission(['add-role'], 'admin'), createModule);
router.get("/", authGuard('admin'), checkPermission(['view-role'], 'admin'), getAllModules);
router.get("/:moduleId", authGuard('admin'), checkPermission(['view-role'], 'admin'), getModuleById);
router.put("/:moduleId", authGuard('admin'), checkPermission(['update-role'], 'admin'), updateModule);
router.delete("/:moduleId", authGuard('admin'), checkPermission(['delete-role'], 'admin'), deleteModule);

module.exports = router; 

