const db = require("../models");

exports.customerCount = async (req, res) => {
  try {
    const total = await db.Customer.count();

    return res.json({
      status: 200,
      total
    });

  } catch (e) {
    console.error(e);
    return res.json({ status: 500, total: 0 });
  }
};

exports.getDashboardCount = async (req, res) => {
  try {
    const total = await db.Invoice.count();

    return res.json([
      { total_coupons: total }
    ]);

  } catch (e) {
    console.error(e);
    return res.json([
      { total_coupons: 0 }
    ]);
  }
};

