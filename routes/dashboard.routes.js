const express = require("express");
const router = express.Router();
const dashboard = require("../controllers/dashboard.controller");

router.get("/customer", dashboard.customerCount);
router.get("/dashboard-count", dashboard.getDashboardCount);

module.exports = router;




