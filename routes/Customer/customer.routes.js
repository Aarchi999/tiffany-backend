const express = require("express");
const router = express.Router();
const controller = require("../../controllers/Customer/customerController");
// console.log("Controller loaded:", controller);


// Customers list with search and pagination
// GET /customer
// router.get("/customer-invoice", controller.customerInvoiceList);
router.get("/customer-invoice", controller.customerInvoiceList);

// Delete a customer
// DELETE /customer/delete/:id
router.delete("/customer-delete/:id", controller.deleteCustomer);

// Fetch single customer + invoices
// POST /customer/invoices/:id
// router.post("/customers-invoices/:id", controller.customerInvoices);
router.post("/customers-invoices/:id", controller.customerInvoices);
// Delete a single invoice
// POST /customer/delete-invoice
router.post("/delete-invoice", controller.deleteInvoice);

module.exports = router;
