const db = require("../../models");
const Sequelize = db.Sequelize;  // Sequelize instance from db
const { Op } = require("sequelize");

const Customer = db.Customer;
const Invoice = db.Invoice;
const Coupon = db.Coupon;

/* =========================
   COUPON CODE GENERATOR
   TIFF0001 style
========================= */

// async function generateCouponCode() {
//   const count = await Coupon.count();
//   const next = count + 1;
//   return "TIFF" + String(next).padStart(4, "0");
// }

/* =========================
   CUSTOMER LIST + INVOICE COUNT
========================= */
exports.customerInvoiceList = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const search = req.query.search || "";
    const offset = (page - 1) * limit;

    const where = {};

    if (search) {
      where[Op.or] = [
        { first_name: { [Op.like]: `%${search}%` } },
        { last_name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { mobile: { [Op.like]: `%${search}%` } }
      ];
    }

    const customers = await Customer.findAll({
      where,
      attributes: [
        "id",
        "first_name",
        "last_name",
        "email",
        "mobile",
        [
          Sequelize.literal(`(
            SELECT COUNT(*)
            FROM invoices AS i
            WHERE i.customer_id = Customer.id
          )`),
          "invoices_count"
        ]
      ],
      order: [["id", "DESC"]],
      limit,
      offset
    });

    const total = await Customer.count({ where });
    const lastPage = Math.ceil(total / limit) || 1;

    const links = [];

    links.push({
      url: page > 1 ? `?page=${page - 1}&search=${search}` : null,
      label: "&laquo; Previous",
      active: false
    });

    for (let i = 1; i <= lastPage; i++) {
      links.push({
        url: `?page=${i}&search=${search}`,
        label: `${i}`,
        active: i === page
      });
    }

    links.push({
      url: page < lastPage ? `?page=${page + 1}&search=${search}` : null,
      label: "Next &raquo;",
      active: false
    });

    return res.json({
      status: 200,
      data: customers,
      current_page: page,
      last_page: lastPage,
      links
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 500, message: "Failed" });
  }
};

/* =========================
   DELETE CUSTOMER
========================= */

exports.deleteCustomer = async (req, res) => {
  try {
    const customerId = req.params.id;

    // delete related data first
    // ✅ STEP 1: Get all invoice IDs
const invoices = await Invoice.findAll({
  where: { customer_id: customerId },
  attributes: ["id"]
});

const invoiceIds = invoices.map(inv => inv.id);

// ✅ STEP 2: Delete participants (IMPORTANT FIX)
await db.Participant.destroy({
  where: {
    [Op.or]: [
      { customer_id: customerId },
      { invoice_id: { [Op.in]: invoiceIds } }
    ]
  },
  force: true
});

// ✅ STEP 3: Delete coupons
await Coupon.destroy({
  where: {
    invoice_id: { [Op.in]: invoiceIds }
  }
});

    await Invoice.destroy({ where: { customer_id: customerId } });

    await Customer.destroy({ where: { id: customerId } });

    res.json({
      status: 200,
      message: "Customer and related data deleted"
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 500 });
  }
};

/* =========================
   CUSTOMER + INVOICES VIEW
   + AUTO COUPON CREATE
========================= */

exports.customerInvoices = async (req, res) => {
  try {
    const id = req.params.id;

    if (!id) {
      return res.status(400).json({ status: 400, message: "Customer id required" });
    }

    const customer = await Customer.findByPk(id, {
      attributes: ["id", "first_name", "last_name", "email", "mobile"]
    });

    if (!customer) {
      return res.status(404).json({ status: 404, message: "Customer not found" });
    }

    // Fetch all invoices
    // const invoicesRaw = await Invoice.findAll({
    //   where: { customer_id: id },
    //   order: [["id", "DESC"]]
    // });

    // Ensure coupon exists for each invoice
    // for (const inv of invoicesRaw) {
    //   const existing = await Coupon.findOne({ where: { invoice_id: inv.id } });
    //   if (!existing) {
    //     const code = await generateCouponCode();
    //     await Coupon.create({ invoice_id: inv.id, coupon_code: code });
    //   }
    // }

    // Fetch invoices with coupon join
    const invoices = await Invoice.findAll({
      where: { customer_id: id },
      attributes: [
        ["id", "invoice_id"],
        "invoice_date",
        "invoice_file", // ✅ use model attribute, not DB column
        [Sequelize.col("coupon.coupon_code"), "coupon_code"]
      ],
      include: [
        {
          model: Coupon,
          as: "coupon",
          attributes: [],
          required: false
        }
      ],
      order: [["id", "ASC"]]
    });

    // ✅ FIX FILE FORMAT
const formattedInvoices = invoices.map(inv => {
  let file = inv.invoice_file;

  if (typeof file === "string") {
    file = file.replace(/"/g, ""); // remove extra quotes
  }

  return {
    ...inv.toJSON(),
    invoice_file: file
  };
});

    return res.json({
      status: 200,
      data: {
        customer: {
          id: customer.id,
          name: customer.first_name + " " + customer.last_name,
          email: customer.email,
          mobile: customer.mobile
        },
        invoices : formattedInvoices
      }
    });

  } catch (err) {
    console.error("customerInvoices error:", err);
    return res.status(500).json({ status: 500, message: "Failed to fetch customer invoices" });
  }
};

/* =========================
   DELETE INVOICE
========================= */

exports.deleteInvoice = async (req, res) => {
  try {
    await Coupon.destroy({
      where: { invoice_id: req.body.invoice_id }
    });

    await Invoice.destroy({
      where: { id: req.body.invoice_id }
    });

    res.json({
      status: 200,
      message: "Invoice deleted"
    });

  } catch (err) {
    res.status(500).json({ status: 500 });
  }
};

