const express = require("express");
const router = express.Router();
const upload = require("../../middlewares/upload.middleware");

const {
  submitInvoice,
  getCustomerInvoices,
  updateInvoice,
  deleteInvoice

} = require("../../controllers/Customer/customer_invoice.controller");

// Submit invoice (with file)
// router.post("/submit", upload.single("invoice_file"), submitInvoice);
// Submit invoice (with file)
router.post("/submit", upload, submitInvoice); 

// // Get all invoices / customer list
router.get("/", getCustomerInvoices);

// Update invoice
router.put("/update/:id", updateInvoice);

// Delete invoice
router.delete("/:id", deleteInvoice);


module.exports = router;
