// routes/menuRoutes.js
const express = require("express");
const {
  getMenus,
  getAccessibleModulesByRole
} = require("../../../controllers/Config/SidebarMenuConfig/sidebarMenuConfig.controller");
const authGuard = require("../../../middlewares/Admin/authMiddlewares/authGuard");

const router = express.Router();

// GET /api/menus
router.get("/", authGuard("admin"), getMenus);

module.exports = router;
