const db = require("../../models");
const Customer = db.Customer;
const Invoice = db.Invoice;
const Coupon = db.Coupon;   // ✅ ADD THIS
const { Op } = db.Sequelize;


// async function generateCouponCode() {
//   let code;
//   let exists = true;

//   while (exists) {
//     code = "TIFF" + Math.floor(100000 + Math.random() * 900000);

//     const coupon = await Coupon.findOne({
//       where: { coupon_code: code }
//     });

//     if (!coupon) exists = false;
//   }

//   return code;
// }
async function generateCouponCode() {
  const lastCoupon = await Coupon.findOne({
    order: [["id", "DESC"]],
    attributes: ["id"]
  });

  const nextId = lastCoupon ? lastCoupon.id + 1 : 1;

  const code = "TIFF-" + String(nextId).padStart(4, "0");

  return code;
}
/* =========================================================
   SUBMIT CUSTOMER + INVOICE
   ========================================================= */
// const submitInvoice = async (req, res) => {
//   try {
//     const { first_name, last_name, email, mobile, invoice_date } = req.body;

//     // Validate required fields
//     if (!first_name || !last_name || !email || !mobile || !req.file) {
//       return res.status(400).json({
//         status: 400,
//         message: "All fields including invoice file are required",
//         data: { customer: [], invoice: [] }
//       });
//     }

//     // Find or create customer
//     let customer = await Customer.findOne({
//       where: { [Op.or]: [{ email }, { mobile }] }
//     });

//       // Create customer if not exists
//     if (!customer) {
//       customer = await Customer.create({ first_name, last_name, email, mobile });
//     }

//     // Create invoice
//     const invoice = await Invoice.create({
//       customer_id: customer.id,
//       invoice_date: invoice_date || new Date().toISOString().split("T")[0],
//       invoice_file: req.file.filename
//     });

//     return res.status(200).json({
//       status: 200,
//       message: "Customer and Invoice submitted successfully",
//       data: {
//         customer: [{
//           id: customer.id,
//           first_name: customer.first_name,
//           last_name: customer.last_name,
//           email: customer.email,
//           mobile: customer.mobile
//         }],
//         invoice: [{
//           id: invoice.id,
//           invoice_date: invoice.invoice_date,
//           invoice_file: invoice.invoice_file,
//           file_url: `${req.protocol}://${req.get("host")}/uploads/invoices/${invoice.invoice_file}`
//         }]
//       }
//     });
//   } catch (error) {
//     console.error("Submit Invoice Error:", error);
//     return res.status(500).json({
//       status: 500,
//       message: "Server error: " + error.message,
//       data: { customer: [], invoice: [] }
//     });
//   }
// };

const submitInvoice = async (req, res) => {
  try {
    const { first_name, last_name, email, mobile, invoice_date } = req.body;

    // ✅ Get all uploaded files
    const files = req.files || [];

    // Validate required fields
    if (!first_name || !last_name || !email || !mobile || files.length === 0) {
      return res.status(400).json({
        status: 400,
        message: "All fields including invoice file are required",
        data: { customer: [], invoice: [] }
      });
    }

     // Find or create customer
    let customer = await Customer.findOne({
      where: { [Op.or]: [{ email }, { mobile }] }
    });

    if (!customer) {
      customer = await Customer.create({
        first_name,
        last_name,
        email,
        mobile
      });
    }

        // Get active campaign
   const invoiceDate = invoice_date || new Date().toISOString().split("T")[0];

const campaign = await db.Campaign.findOne({
  where: {
    start_date: { [Op.lte]: invoiceDate },
    end_date: { [Op.gte]: invoiceDate },
    status: "active"
  }
});

if (!campaign) {
  return res.status(400).json({
    status: 400,
    message: "No active campaign for this date"
  });
}


    // ✅ Create one invoice per uploaded file
    const invoices = [];
    for (const file of files) {
    const invoice = await Invoice.create({
      customer_id: customer.id,
      invoice_date: invoice_date || new Date().toISOString().split("T")[0],
      invoice_file: file.filename
    });

    // ✅ CREATE COUPON HERE (FIX)
const code = await generateCouponCode();

await db.Coupon.create({
  invoice_id: invoice.id,
  coupon_code: code
});

       invoices.push(invoice);

        // ✅ CREATE PARTICIPANT ENTRY
  await db.Participant.create({
    customer_id: customer.id,
    campaign_id: campaign.id, // active campaign
    invoice_id: invoice.id
  });

    }

     // Respond with customer and all invoices
    return res.status(200).json({
      status: 200,
      message: "Customer and Invoice submitted successfully",
      data: {
        customer: [customer],
        invoice: invoices
      }
    });

  } catch (error) {
    console.error("Submit Invoice Error:", error);
    return res.status(500).json({
      status: 500,
      message: error.message,
        data: { customer: [], invoice: [] }
    });
  }
};

/* =========================================================
   GET CUSTOMER INVOICES (FRONTEND COMPATIBLE)
   ========================================================= */

const getCustomerInvoices = async (req, res) => {
  try {
        
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || "";

    const where = search
      ? {
          [Op.or]: [
            { first_name: { [Op.like]: `%${search}%` } },
            { last_name: { [Op.like]: `%${search}%` } },
            { email: { [Op.like]: `%${search}%` } },
            { mobile: { [Op.like]: `%${search}%` } }
          ]
        }
      : {};

    const { count, rows } = await Customer.findAndCountAll({
      where,
      include: [
        {
          model: Invoice,
          as: "invoices",
          attributes: []
        }
      ],
      attributes: {
        include: [
          [
            db.Sequelize.fn("COUNT", db.Sequelize.col("invoices.id")),
            "invoices_count"
          ]
        ]
      },
      group: ["customers.id"],
      limit,
      offset,
      subQuery: false
    });

    const total = count.length ;
    const totalPages = Math.ceil(total / limit);

    // ✅ FRONTEND EXPECTED FORMAT
    return res.status(200).json({
      status: 200,
      message: "Participants fetched successfully",
      // data: {
        data: { data: rows } ,              // ← MUST be nested
        total: total,
        current_page: page,
        last_page: totalPages,
        links: []
      // }
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: 500,
      message: error.message,
      data: { data: [] }
    });
  }
};


/* =========================================================
   UPDATE INVOICE
   ========================================================= */
const updateInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const { invoice_date } = req.body;

    const invoice = await Invoice.findByPk(id);
    if (!invoice) {
      return res.status(404).json({ status: 404, message: "Invoice not found" });
    }

    await invoice.update({ invoice_date });
    return res.status(200).json({ status: 200, message: "Invoice updated successfully", data: invoice });
  } catch (error) {
    console.error("Update Invoice Error:", error);
    return res.status(500).json({ status: 500, message: error.message });
  }
};

/* =========================================================
   DELETE INVOICE (SOFT DELETE)
   ========================================================= */
const deleteInvoice = async (req, res) => {
  try {
    const { id } = req.params;

    const invoice = await Invoice.findByPk(id);
    if (!invoice) {
      return res.status(404).json({ status: 404, message: "Invoice not found" });
    }

    await invoice.destroy(); // soft delete if paranoid = true
    return res.status(200).json({ status: 200, message: "Invoice deleted successfully" });
  } catch (error) {
    console.error("Delete Invoice Error:", error);
    return res.status(500).json({ status: 500, message: error.message });
  }
};

// ✅ Export all controllers properly
module.exports = {
  submitInvoice,
  getCustomerInvoices,
  updateInvoice,
  deleteInvoice
};
