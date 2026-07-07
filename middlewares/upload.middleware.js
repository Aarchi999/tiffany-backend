// const multer = require("multer");
// const path = require("path");

// // Storage configuration
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "uploads/invoices");
//   },
//   filename: (req, file, cb) => {
//     const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
//     cb(null, uniqueSuffix + path.extname(file.originalname));
//   },
// });

// // File filter
// const fileFilter = (req, file, cb) => {
//   const allowedTypes = /pdf|jpg|jpeg|png/;

//   const extname = allowedTypes.test(
//     path.extname(file.originalname).toLowerCase()
//   );

//   const mimetype = allowedTypes.test(file.mimetype);

//   if (extname && mimetype) {
//     cb(null, true);
//   } else {
//     cb(new Error("Only PDF or image files are allowed"));
//   }
// };

// // ✅ For multiple files
// const upload = multer({ storage, fileFilter }).array("invoice_file_path", 10);

// module.exports = upload;

const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ✅ Create upload folder automatically
const uploadDir = path.join(process.cwd(), "uploads", "invoices");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },

  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = /pdf|jpg|jpeg|png/;

  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );

  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF or image files are allowed"));
  }
};

const upload = multer({
  storage,
  fileFilter,
}).array("invoice_file_path", 10);

module.exports = upload;