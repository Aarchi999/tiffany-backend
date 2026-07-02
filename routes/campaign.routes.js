const express = require("express");
const router = express.Router();

// const { route } = require("./auth.routes");

const controller = require("../controllers/campaign.controller");

// add new campaign
router.post("/create-campaign", controller.createCampaign);

// add prize to campaign
router.post("/add-prize/:campaign_id", controller.addPrize);

// UPDATE prize
router.put("/update-prize/:id", controller.updatePrize);

// DELETE prize
router.delete("/delete-prize/:id", controller.deletePrize);

// DELETE a campaign
router.delete("/delete-campaign/:id", controller.deleteCampaign);

// GET all campaigns    
  router.get("/campaigns-details", controller.campaignList);

// GET single campaign
  router.get("/campaign-view/:id", controller.campaignView);

// GET all participants list 
router.get("/all-participants/:id", controller.getAllParticipants);
router.post("/participants-list", controller.getParticipantsList);

// Winners

router.post("/select-winner", controller.selectWinner);
router.post("/pick-winner", controller.pickWinner);
router.post("/winner-list", controller.winnerList);
router.post("/delete-winner", controller.deleteWinner);

router.post("/close-campaign", controller.closeCampaign);

module.exports = router; 