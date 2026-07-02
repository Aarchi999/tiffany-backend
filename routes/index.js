const express = require("express");
const router = express.Router();

//login authRoute
const authRoute = require("./auth.routes");
router.use("/", authRoute);

// dashboard route
const dashboardRoutes = require("../routes/dashboard.routes");
router.use("/", dashboardRoutes);     // ✅ gives /dashboard-count

// New Customer routes (separate from invoice routes)
const customerRoutes = require("../routes/Customer/customer.routes");
router.use("/", customerRoutes);

// Campaign route
const CampaignRoutes = require("./campaign.routes");
router.use("/", CampaignRoutes);

// require("./campaign.routes")(router);

// Customer–Invoice routes
const customerInvoiceRoutes = require("../routes/Customer/customer_invoice.routes");
router.use("/customer-invoice", customerInvoiceRoutes);

module.exports = router; 











































