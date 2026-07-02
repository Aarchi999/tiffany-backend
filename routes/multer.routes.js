const express = require("express");
const upload = require("../multer");

const router = express.Router();

// Single file upload
router.post("/single", upload.single("profileImage"), (req, res) => {
  res.json({
    message: "File uploaded successfully",
    file: req.file,
  });
}, UserProfile);

// Multiple files upload
router.post("/multiple", upload.array("files", 5), (req, res) => {
  res.json({
    message: "Files uploaded successfully",
    files: req.files,
  });
});

module.exports = router;
