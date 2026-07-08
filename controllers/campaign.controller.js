const { Op } = require("sequelize");
const db = require("../models");
const { Campaign, Prize, PrizeAllocation, Customer, Participant, Winner, Invoice, Coupon, sequelize } = db;
const { sendWinnerEmail } = require("../services/email.service"); 

/* ========================
   GET ALL CAMPAIGNS
   GET /campaigns-details
===========================*/

exports.campaignList = async (req, res) => {
  try {
    const data = await Campaign.findAll({
      attributes: ["id", "name", "start_date", "end_date", "max_winners"],
      limit:50,
      include: [
        {
          model: PrizeAllocation,
          as: "prize_allocations",
          attributes: ["id", "quantity"],
          include: [
            {
              model: Prize,
              as: "prize",
              attributes: ["name"],
            },
          ],
        },
      ],
      order: [["id", "ASC"]],
    });

    // Format data so frontend can directly use 'prizes' array
    const formatted = data.map(campaign => ({
      id: campaign.id,
      name: campaign.name,
      start_date: campaign.start_date,
      end_date: campaign.end_date,
      max_winners: campaign.max_winners,
      prizes: campaign.prize_allocations.map(pa => ({
        id: pa.id,
        prize_name: pa.prize?.name,
        quantity_allocated: pa.quantity,
      })),
    }));

    return res.json({ status: 200, data: formatted });
  } catch (err) {
    console.error("campaignList error:", err);
    return res.status(500).json({ status: 500, message: "Failed to fetch campaigns" });
  }
};

/* ===============================
   GET SINGLE CAMPAIGN WITH PRIZES
=================================== */

exports.campaignView = async (req, res) => {
  try {
    const { id } = req.params;

    const campaign = await Campaign.findOne({
      where: { id },
      attributes: ["id", "name", "start_date", "end_date", "max_winners", "status"],
      include: [
        {
          model: PrizeAllocation,
          as: "prize_allocations",
          attributes: ["id", "quantity"],
          include: [
            {
              model: Prize,
              as: "prize",
              attributes: ["name"],

            },
          ],
        },
      ],
    });

    if (!campaign)
      return res.status(404).json({ status: 404, message: "Campaign not found" });

    const formattedData = {
      id: campaign.id,
      name: campaign.name,
      start_date: campaign.start_date,
      end_date: campaign.end_date,
      max_winners: campaign.max_winners,
      status: campaign.status,
      prizes: campaign.prize_allocations.map((p) => ({
          id: p.id,
        prize_name: p.prize?.name,
        quantity_allocated: p.quantity 
      })),
    };

    res.status(200).json({ status: 200, data: formattedData });
  } catch (err) {
    console.error("campaignView error:", err);
    res.status(500).json({ status: 500, message: "Server error" });
  }
};

/* =====================================
   GET ALL PARTICIPANTS BY CAMPAIGN
===================================== */

exports.getAllParticipants = async (req, res) => {
  try {
    const { id } = req.params;
    const { search = "", page = 1 } = req.query;
    const limit = 10;
    const offset = (page - 1) * limit;

    // ✅ define customer include separately to handle search
    const customerInclude = {
      model: Customer,
      as: "customer",
      attributes: ["id", "first_name", "last_name", "email", "mobile"],
       
    };
    if (search.trim()) {
      customerInclude.where = {
        [Op.or]: [
          { first_name: { [Op.like]: `%${search}%` } },
          { last_name: { [Op.like]: `%${search}%` } },
          { email: { [Op.like]: `%${search}%` } },
          { mobile: { [Op.like]: `%${search}%` } },
        ],
      };
    } 
// apply required = true ONLY when searching
customerInclude.required = !!search.trim();

const { count, rows } = await Participant.findAndCountAll({
  where: { campaign_id: id },
   include: [
  customerInclude, // ✅ use dynamic include with search
    
    {
      model: Invoice,
      as: "invoice",
      attributes: ["id"],
      include: [
        {
          model: Coupon,
          as: "coupon",
          attributes: ["coupon_code"],
          required: false,
        },
      ],
    },
  ], 
  //  group: ["customer.id"],
  limit,
  offset,
  order: [["id", "ASC"]],
  distinct: true,
    subQuery: false   // ✅ MUST ADD

});

    const formattedData = rows
  .filter(p => p.customer) // remove null rows
  .map((p) => ({
      id: p.customer?.id,
      first_name: p.customer?.first_name,
      last_name: p.customer?.last_name,
      email: p.customer?.email,
      mobile: p.customer?.mobile,
    coupon_code: p.invoice?.coupon?.coupon_code ?? "N/A"
    
    }));

    // const last_page = Math.ceil(count / limit);
  const last_page = Math.ceil(count / limit) || 1;
    const links = [
      { url: page > 1 ? `/all-participants/${id}?page=${page - 1}` : null, label: "Previous", active: false },
      ...Array.from({ length: last_page }, (_, i) => ({
        url: `/all-participants/${id}?page=${i + 1}`,
        label: `${i + 1}`,
        active: i + 1 === Number(page),
      })),
      { url: page < last_page ? `/all-participants/${id}?page=${Number(page) + 1}` : null, label: "Next", active: false },
    ];

    return res.status(200).json({
      status: 200,
      data: {
        data: formattedData,
        current_page: Number(page),
        last_page,
        links,
      },
    });
  } catch (error) {
    console.error("Participants Error:", error);
    return res.status(500).json({ status: 500, message: "Server error" });
  }
};

/* =====================================
   PARTICIPANTS LIST
===================================== */

exports.getParticipantsList = async (req, res) => {
  try {
    const { campaign_id, page = 1, limit = 50 } = req.body;

    if (!campaign_id) {
      return res.status(400).json({
        status: 400,
        message: "campaign_id is required",
      });
    }

    const offset = (page - 1) * limit;

    const { count, rows } = await Participant.findAndCountAll({
      where: { campaign_id },
      include: [
        {
          model: Customer,
          as: "customer",
          attributes: ["id", "first_name", "last_name", "email", "mobile"],
        },
        {
          model: Invoice,
          as: "invoice",
          attributes: ["id"],
          include: [
            {
              model: Coupon,
              as: "coupon",
              attributes: ["id", "coupon_code", "is_winner"],
              required: false,
            },
          ],
        },
      ],
      limit: Number(limit),
      offset: Number(offset),
      order: [["id", "ASC"]],
      distinct: true,
    });

    const formattedData = rows.map((r) => {
      const coupon = Array.isArray(r.invoice?.coupon)
        ? r.invoice.coupon[0]
        : r.invoice?.coupon;

      return {
        participant_id: r.id,
        customer: r.customer,
        invoice_id: r.invoice?.id || null,
        coupon_id: coupon?.id || null,
        coupon_code: coupon?.coupon_code || "N/A",
        is_winner: coupon?.is_winner || 0,
      };
    });

    return res.status(200).json({
      status: 200,
      data: {
        coupons: formattedData,
        pagination: {
          total_pages: Math.ceil(count / limit),
          current_page: Number(page),
        },
      },
    });
  } catch (err) {
    console.error("getParticipantsList error:", err);
    return res.status(500).json({
      status: 500,
      message: err.message,
    });
  }
};

/* =====================================
   SELECT WINNER
===================================== */

exports.selectWinner = async (req, res) => {
  try {
    const { campaign_id } = req.body;

    const participants = await Participant.findAll({
      where: { campaign_id },
      include: [
        {
          model: Invoice,
          as: "invoice",
          include: [
            {
              model: Coupon,
              as: "coupon",
              required: false,
            },
          ],
        },
      ],
    });

    const eligible = participants.filter(
      (p) => !p.invoice?.coupon || p.invoice.coupon.is_winner === 0
    );

    if (!eligible.length) {
      return res.status(400).json({ message: "No participants left" });
    }

    const random = eligible[Math.floor(Math.random() * eligible.length)];

    return res.status(200).json({
      status: 200,
      participant_id: random.id,
      coupon_id: random.invoice?.coupon?.id || null,
      coupon_code: random.invoice?.coupon?.coupon_code || null,
    });
  } catch (err) {
    console.error("selectWinner error:", err);
    return res.status(500).json({
      status: 500,
      message: "Server error",
    });
  }
};
/* =====================================
   PICK WINNER
===================================== */

exports.pickWinner = async (req, res) => {
  const transaction = await sequelize.transaction();
  const { coupon_id } = req.body;

  try {
    const coupon = await Coupon.findOne({
      where: { id: coupon_id },
      include: [
        {
          model: Invoice,
          as: "invoice",
          include: [
            {
              model: Participant,
              as: "participant",
              include: [
                { model: Customer, as: "customer" },
                { model: Campaign, as: "campaign" },
              ],
            },
          ],
        },
      ],
      transaction,
    });

    if (!coupon) {
      await transaction.rollback();
      return res.status(404).json({ status: 404, message: "Coupon not found" });
    }

    const participant = coupon.invoice?.participant;

    if (!participant) {
      await transaction.rollback();
      return res.status(400).json({
        status: 400,
        message: "Participant not found for this coupon",
      });
    }

    if (coupon.is_winner) {
      await transaction.rollback();
      return res.status(400).json({
        status: 400,
        message: "Coupon already marked as winner",
      });
    }

//     // ✅ Get prize allocation for campaign
//     const prizeAllocation = await PrizeAllocation.findOne({
//       where: { campaign_id: participant.campaign_id },
//        order: [["id", "DESC"]],
//       transaction,
//     });

//     if (!prizeAllocation) {
//       await transaction.rollback();
//       return res.status(400).json({
//         status: 400,
//         message: "Prize allocation not found for this campaign",
//       });
//     }

//     // count existing winners for this prize allocation
// const winnerCount = await Winner.count({
//   where: {
//     prize_allocation_id: prizeAllocation.id
//   },
//   transaction
// });

// if (winnerCount >= prizeAllocation.quantity) {
//   await transaction.rollback();

//   return res.status(400).json({
//     status: 400,
//     message: "All prizes already distributed"
//   });
// }

const allocations = await PrizeAllocation.findAll({
  where: { campaign_id: participant.campaign_id },
  order: [["id", "DESC"]], // gift voucher last me hai to pehle wahi milega
  transaction
});

let prizeAllocation = null;

for (const allocation of allocations) {

  const winnerCount = await Winner.count({
    where: { prize_allocation_id: allocation.id },
    transaction
  });

  if (winnerCount < allocation.quantity) {
    prizeAllocation = allocation;
    break;
  }
}

if (!prizeAllocation) {
  await transaction.rollback();

  return res.status(400).json({
    status: 400,
    message: "All prizes are distributed"
  });
}
    // mark coupon
    coupon.is_winner = 1;
    coupon.is_used = 1;
    await coupon.save({ transaction });

    // create winner
    const winner = await Winner.create(
      {
        campaign_id: participant.campaign_id,
        prize_id: prizeAllocation.prize_id,
        prize_allocation_id: prizeAllocation.id,
        coupon_id: coupon.id,
        winner_date: new Date(),
      },
      { transaction }
    );

    await transaction.commit();

let emailStatus = "failed";

    // ✅ Send email after winner is saved
try {
  const customer = participant.customer;
  const campaign = participant.campaign;
  
  // get prize
  const prize = await Prize.findByPk(prizeAllocation.prize_id);

  if (customer?.email) {
    await sendWinnerEmail({
      to: customer.email,
      name: `${customer.first_name} ${customer.last_name}`,
      campaign: campaign.name,
      prize: prize?.name || "Prize",
      coupon: coupon.coupon_code
    });

    await winner.update({
      email_sent: 1,
      email_sent_at: new Date(),
      email_failed: 0
    });

    emailStatus = "success";
  }
} 
catch (err) {

  console.log("=================================");
  console.log("EMAIL SENDING FAILED");
  console.log(err);
  console.log(err.message);
  console.log("=================================");

  await winner.update({
    email_sent: 0,
    email_failed: 1
  });

  emailStatus = "failed";
}

    return res.status(200).json({
      status: 200,
      message: "Winner picked successfully",
      data: {
    ...winner.toJSON(),
     email_status: winner.email_sent ? "success" : "failed"    
     }
    });
  } catch (err) {
    await transaction.rollback();
    console.error("pickWinner error:", err);

    return res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: err,
    });
  }
};


/* =====================================
   WINNER LIST
===================================== */

exports.winnerList = async (req, res) => {
  try {

    const search = req.query?.search || ""
    const campaign_id = req.body?.campaign_id || req.query?.campaign_id || null;
    const limit = parseInt(req.body?.limit || req.query?.limit || 50);
    const offset = parseInt(req.body?.offset || req.query?.offset || 0);

    const whereCondition = {};

    if (campaign_id) {
      whereCondition.campaign_id = campaign_id;
    }

 const winners = await Winner.findAndCountAll({
  where: whereCondition,
  limit,
  offset,
  order: [["id", "DESC"]],
  include: [
    {
      model: Campaign,
      as: "campaign",
      attributes: ["id", "name", "start_date", "end_date"],
    },
    {
      model: Prize,
      as: "prize",
      attributes: ["id", "name"],
    },
    {
      model: Coupon,
      as: "coupon",
      attributes: ["id", "coupon_code", "is_winner"],
      include: [
        {
          model: Invoice,
          as: "invoice",
          attributes: ["id", "customer_id"],
          include: [
            {
  model: Customer,
  as: "customer",
  attributes: ["id", "first_name", "last_name", "email", "mobile"],
  where: search
    ? {
        [Op.or]: [
          { first_name: { [Op.like]: `%${search}%` } },
          { last_name: { [Op.like]: `%${search}%` } },
          { email: { [Op.like]: `%${search}%` } },
          { mobile: { [Op.like]: `%${search}%` } },
        ],
      }
    : undefined,
  required: !!search, // 🔥 VERY IMPORTANT
}
          ],
        },
      ],
    },
  ],
});

  const formatted = winners.rows
  .filter(w => w.coupon?.invoice?.customer) // ✅ REMOVE EMPTY ROWS
  .map((w) => ({
    winner_id: w.id,

    campaign: {
      id: w.campaign?.id,
      name: w.campaign?.name,
      start_date: w.campaign?.start_date,
      end_date: w.campaign?.end_date,
    },

    coupon_code: w.coupon?.coupon_code || "N/A",

    customer: w.coupon?.invoice?.customer || {},

    prize: {
      name: w.prize?.name || "N/A",
    },

    winner_date: w.winner_date,
  }));

    return res.status(200).json({
      status: 200,
      total: winners.count,
      data: formatted,
      limit,
      offset,
    });

  } catch (error) {

    console.error("winnerList error:", error);

    return res.status(500).json({
      status: 500,
      message: "Something went wrong fetching winners",
      error: error.message,
    });

  }
};




// exports.winnerList = async (req, res) => {
//   try {
//     const { campaign_id, limit = 50, offset = 0 } = req.body;

//     if (!campaign_id) {
//       return res.status(400).json({ message: "campaign_id is required" });
//     }

//     const winners = await Winner.findAndCountAll({
//       where: { campaign_id },
//       limit: parseInt(limit),
//       offset: parseInt(offset),
//       order: [["id", "DESC"]],
//       include: [
//         {
//           model: Prize,
//           as: "prize",
//           attributes: ["id", "name"],
//         },
//         {
//           model: Coupon,
//           as: "coupon",
//           attributes: ["id", "coupon_code", "is_winner"],
//           include: [
//             {
//               model: Invoice,
//               as: "invoice",
//               attributes: ["id", "customer_id"],
//               include: [
//                 {
//                   model: Customer,
//                   as: "customer",
//                   attributes: ["id", "first_name", "last_name", "email", "mobile"],
//                 },
//               ],
//             },
//           ],
//         },
//       ],
//     });

//     // Flatten winners for React
//     const formatted = winners.rows.map((w) => ({
//       winner_id: w.id,
//       coupon_code: w.coupon?.coupon_code || "N/A",
//       customer: w.coupon?.invoice?.customer || {},
//       prize: { name: w.prize?.name || "N/A" },
//       winner_date: w.winner_date,
//     }));

//     return res.status(200).json({
//       status: 200,
//       total: winners.count,
//       data: formatted,
//       limit: parseInt(limit),
//       offset: parseInt(offset),
//     });
//   } catch (error) {
//     console.error("winnerList error:", error);
//     return res.status(500).json({
//       status: 500,
//       message: "Something went wrong fetching winners",
//       error: error.message,
//     });
//   }
// };

/* =====================================
   DELETE WINNER
===================================== */

exports.deleteWinner = async (req, res) => {
  try {
    const { winner_id } = req.body;
    await Winner.destroy({ where: { id: winner_id } });
    res.status(200).json({ status: 200, message: "Winner deleted successfully" });
  } catch (error) {
    console.error("deleteWinner error:", error);
    res.status(500).json({ status: 500, message: "Server error" });
  }
};

/* =====================================
  ADD NEW CAMPAIGN
===================================== */

// exports.createCampaign = async (req, res) => {
//   try {
//     const { name, start_date, max_winners } = req.body;

//     if (!name || !start_date || !max_winners) {
//       return res.status(400).json({
//         status: 400,
//         message: "All fields are required",
//       });
//     }

//     const campaign = await Campaign.create({
//       name,
//       start_date,
//        end_date: start_date, // ✅ end_date same as start_date
//       max_winners,
//     });

//     return res.status(200).json({
//       status: 200,
//       message: "Campaign created successfully",
//       data: campaign,
//     });

//   } catch (error) {
//     console.error("createCampaign error:", error);
//     res.status(500).json({
//       status: 500,
//       message: "Server error",
//     });
//   }
// };

exports.createCampaign = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { name, start_date, max_winners } = req.body;

    if (!name || !start_date || !max_winners) {
      return res.status(400).json({
        status: 400,
        message: "All fields are required",
      });
    }

    // 1️⃣ Create campaign
    const campaign = await Campaign.create({
      name,
      start_date,
      end_date: start_date,
      max_winners,
    }, { transaction });

    // 2️⃣ Copy prizes from Campaign 1
    const basePrizes = await PrizeAllocation.findAll({
      where: { campaign_id: 1 },
      include: [
        {
          model: Prize,
          as: "prize",
        },
      ],
      transaction
    });

    for (const p of basePrizes) {

      // create new prize
      const newPrize = await Prize.create({
        name: p.prize.name,
        total_quantity: p.quantity,
        campaign_id: campaign.id
      }, { transaction });

      // create allocation
      await PrizeAllocation.create({
        campaign_id: campaign.id,
        prize_id: newPrize.id,
        quantity: p.quantity
      }, { transaction });

    }

    await transaction.commit();

    return res.status(200).json({
      status: 200,
      message: "Campaign created with default prizes",
      data: campaign,
    });

  } catch (error) {

    await transaction.rollback();

    console.error("createCampaign error:", error);

    return res.status(500).json({
      status: 500,
      message: "Server error",
    });
  }
};


/* =====================================
   DELETE CAMPAIGN
   DELETE /delete-campaign/:id
===================================== */

exports.deleteCampaign = async (req, res) => {
  try {
    const { id } = req.params;

    console.log("Trying to delete campaign ID:", id);

    // Ignore paranoid to find even soft-deleted campaigns
    const campaign = await Campaign.findOne({ where: { id }, paranoid: false });
    if (!campaign) {
      return res.status(404).json({ status: 404, message: "Campaign not found" });
    }

    // Delete related data first
    await Prize.destroy({ where: { campaign_id: id }, force: true });
    await Participant.destroy({ where: { campaign_id: id }, force: true });
    await Winner.destroy({ where: { campaign_id: id }, force: true });
    await PrizeAllocation.destroy({ where: { campaign_id: id }, force: true });

    // Delete the campaign itself permanently
    await campaign.destroy({ force: true });

    return res.status(200).json({ status: 200, message: "Campaign deleted successfully" });
  } catch (error) {
    console.error("deleteCampaign error:", error);
    return res.status(500).json({ status: 500, message: "Server error" });
  }
};


/* =====================================
   ADD PRIZE TO CAMPAIGN
===================================== */
  
exports.addPrize = async (req, res) => {
  try {

    const campaign_id = parseInt(req.params.campaign_id);
    const { prize_name, quantity_allocated } = req.body;

    if (!prize_name || !quantity_allocated) {
      return res.status(400).json({
        status: 400,
        message: "Prize name and quantity required"
      });
    }

    // create prize
    const prize = await Prize.create({
      name: prize_name,
       campaign_id: campaign_id,
        total_quantity: Number(quantity_allocated)
    });

    // allocate prize
    const allocation = await PrizeAllocation.create({
      campaign_id: campaign_id,
      prize_id: prize.id,
      quantity: Number(quantity_allocated)
    });

// update total prizes
    const total = await PrizeAllocation.sum("quantity", {
  where: { campaign_id }
});

await Campaign.update(
  { max_winners: total },
  { where: { id: campaign_id } }
);

  return res.status(200).json({
  status: 200,
  message: "Prize added successfully",
  data: {
    id: allocation.id,
    prize_name: prize.name,
    quantity_allocated: allocation.quantity
  }
});

  } catch (error) {
    console.error("addPrize error:", error);

    return res.status(500).json({
      status: 500,
      message: error.message
    });
  }
};
exports.updatePrize = async (req, res) => {
  try {
    const { id } = req.params;
    const { prize_name, quantity_allocated } = req.body;

    const allocation = await PrizeAllocation.findOne({
      where: { id },
    });

    if (!allocation) {
      return res.status(404).json({
        status: 404,
        message: "Prize allocation not found",
      });
    }

    // update prize name
    await Prize.update(
      { name: prize_name ,
         total_quantity: Number(quantity_allocated)
      },
      { where: { id: allocation.prize_id } }
    );

    // update quantity
    await allocation.update({
      quantity: Number(quantity_allocated),
    });

    // recalc campaign winners
    const total = await PrizeAllocation.sum("quantity", {
      where: { campaign_id: allocation.campaign_id },
    });

    await Campaign.update(
      { max_winners: total || 0 },
      { where: { id: allocation.campaign_id } }
    );

    return res.status(200).json({
      status: 200,
      message: "Prize updated successfully",
    });

  } catch (error) {
    console.error("updatePrize error:", error);

    return res.status(500).json({
      status: 500,
      message: "Server error",
    });
  }
};



exports.deletePrize = async (req, res) => {
  try {
    const { id } = req.params;

    const allocation = await PrizeAllocation.findOne({
      where: { id },
    });

    if (!allocation) {
      return res.status(404).json({
        status: 404,
        message: "Prize not found",
      });
    }

    const campaign_id = allocation.campaign_id;

    // permanent delete
    await allocation.destroy({ force: true });

    await Prize.destroy({
      where: { id: allocation.prize_id },
      force: true
    });

    const total = await PrizeAllocation.sum("quantity", {
      where: { campaign_id },
    });

    await Campaign.update(
      { max_winners: total || 0 },
      { where: { id: campaign_id } }
    );

    return res.status(200).json({
      status: 200,
      message: "Prize deleted successfully",
    });

  } catch (error) {
    console.error("deletePrize error:", error);

    return res.status(500).json({
      status: 500,
      message: "Server error",
    });
  }
};



exports.closeCampaign = async (req, res) => {
  try {
    const { campaign_id } = req.body;

    await Campaign.update(
      { status: "closed" },
      { where: { id: campaign_id } }
    );

    return res.status(200).json({
      status: 200,
      message: "Campaign closed successfully",
    });

  } catch (error) {
    console.error("closeCampaign error:", error);
    return res.status(500).json({
      status: 500,
      message: "Server error",
    });
  }
};
