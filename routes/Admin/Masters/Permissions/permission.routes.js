const express = require("express");
const {
  createPermission,
  getAllPermissions,
  getAllPermissionsGrouped,
  getPermissionById,
  updatePermission,
  deletePermission,
  syncPermissionsToRole,
  syncPermissionsToUser,
  getAllPermissionsOfUser,
  getAllPermissionsOfRole
} = require("../../../../controllers/Admin/Masters/Permissions/permissions.controller");

const authGuard = require("../../../../middlewares/Admin/authMiddlewares/authGuard");
const checkPermission = require("../../../../middlewares/Admin/authMiddlewares/checkPermission");

const router = express.Router();

router.post("/", authGuard('admin'), checkPermission(['add-permission'], 'admin'), createPermission);

router.get("/", authGuard('admin'), getAllPermissions);
router.get("/module", authGuard('admin'), getAllPermissionsGrouped);
router.get("/:permissionId", authGuard('admin'), checkPermission(['view-permission'], 'admin'), getPermissionById);
router.get("/user/:user_id", authGuard('admin'), getAllPermissionsOfUser);
router.get("/role/:role_id", authGuard('admin'), getAllPermissionsOfRole);

router.post("/role/sync", authGuard('admin'), syncPermissionsToRole);
router.post("/user/sync", authGuard('admin'), syncPermissionsToUser);


router.put("/:permissionId", authGuard('admin'), checkPermission(['update-permission'], 'admin'), updatePermission);
router.delete("/:permissionId", authGuard('admin'), checkPermission(['delete-permission'], 'admin'), deletePermission);


module.exports = router;