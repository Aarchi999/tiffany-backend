const db = require("../models");
const Coupon = db.Coupon;

async function generateNextCouponCode() {
  const last = await Coupon.findOne({
    order: [["id", "DESC"]],
    attributes: ["id"]
  });

  const nextNumber = last ? last.id + 1 : 1;

  return "TIFF" + String(nextNumber).padStart(4, "0");
}

module.exports = generateNextCouponCode;
