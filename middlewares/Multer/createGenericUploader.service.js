// const multer = require("multer");
// const path = require("path");
// const fs = require("fs");

// // const sharp = require("sharp");
// const { Jimp } = require("jimp");


// // Base uploads folder
// const UPLOAD_FOLDER = "uploads";
// if (!fs.existsSync(UPLOAD_FOLDER)) fs.mkdirSync(UPLOAD_FOLDER, { recursive: true });

// const baseUploads = path.join(__dirname, '../../uploads');

// const createGenericUploader = (documentsConfig, moduleName, subFolder) => {
//   const modulePath = path.join(UPLOAD_FOLDER, moduleName);
//   if (!fs.existsSync(modulePath)) fs.mkdirSync(modulePath, { recursive: true });

//   const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//       let dest;
//       if (file.fieldname.toLowerCase().includes("doc")) {
//         dest = path.join(modulePath, subFolder, "docs");
//       } else if (file.fieldname.toLowerCase().includes("image") || file.mimetype.startsWith("image/")) {
//         dest = path.join(modulePath, subFolder, "images");
//       } else {
//         dest = path.join(modulePath, subFolder);
//       }
//       if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
//       cb(null, dest);
//     },
//     filename: (req, file, cb) => {
//       const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, "");
//       const safeName = file.originalname.split(".")[0].replace(/\s+/g, "_");
//       cb(null, `${safeName}${timestamp}${path.extname(file.originalname)}`);
//     }
//   });

//   const fileFilter = (req, file, cb) => {
//     const docConfig = documentsConfig.find(d => d.field === file.fieldname);
//     if (!docConfig) return cb(new Error(`Unexpected file field: ${file.fieldname}`), false);

//     const ext = path.extname(file.originalname).toLowerCase();

//     // const allowedTypes = docConfig.extensions.flatMap(ext => {
//     //   if (['.jpg', '.jpeg', '.png'].includes(ext)) return ['image/jpeg', 'image/png'];
//     //   if (ext === '.pdf') return ['application/pdf'];
//     //   if (ext === '.ico') return ['image/x-icon'];
//     //   return [];
//     // });

//     const allowedTypes = docConfig.extensions.flatMap(ext => {
//       if (['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
//         return ['image/jpeg', 'image/png', 'image/webp'];
//       }
//       if (ext === '.pdf') return ['application/pdf'];
//       if (ext === '.ico') return ['image/x-icon'];
//       return [];
//     });



//     // Invalid mimetype
//     if (!allowedTypes.includes(file.mimetype)) {
//       return cb(
//         new Error(
//           `${docConfig.docTypeName} must be one of: ${allowedTypes.join(", ")}`
//         ),
//         false
//       );
//     }

//     // Invalid extension
//     if (!docConfig.extensions.includes(ext)) {
//       return cb(
//         new Error(
//           `${docConfig.docTypeName} only accepts files of type: ${docConfig.extensions.join(", ")}`
//         ),
//         false
//       );
//     }

//     cb(null, true);
//   };

//   const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100 MB in bytes

//   const upload = multer({
//     storage,
//     fileFilter,
//     limits: { fileSize: MAX_FILE_SIZE }
//   });

//   // Resize images after upload
//   const processFiles = async (req) => {
//     const uploadedFiles = req.files || {};

//     for (const field in uploadedFiles) {
//       for (const file of uploadedFiles[field]) {

//         const relativePath = path.relative(path.join(__dirname, '../../uploads'), file.path).replace(/\\/g, '/');
//         file.publicUrl = `/uploads/${relativePath}`;


//         // Check if file is image
//         // if (file.mimetype.startsWith("image/")) {
//         //   const imagesPath = path.join(modulePath, subFolder, "images");
//         //   console.log("🚀 ~ processFiles ~ imagesPath:", imagesPath)
//         //   const thPath = path.join(imagesPath, "th");   // thumbnails
//         //   const bigPath = path.join(imagesPath, "big"); // big resized

//         //   // if (!fs.existsSync(imagesPath)) fs.mkdirSync(imagesPath, { recursive: true });
//         //   if (!fs.existsSync(thPath)) fs.mkdirSync(thPath, { recursive: true });
//         //   if (!fs.existsSync(bigPath)) fs.mkdirSync(bigPath, { recursive: true });

//         //   await sharp(file.path)
//         //     .resize(80, 80, { fit: 'inside', withoutEnlargement: true })
//         //     .toFile(path.join(thPath, file.filename));

//         //   await sharp(file.path)
//         //     .resize(250, 250, { fit: 'inside', withoutEnlargement: true })
//         //     .toFile(path.join(bigPath, file.filename));

//         //   file.thUrl = `/uploads/${path.relative(baseUploads, path.join(thPath, file.filename)).replace(/\\/g, '/')}`;
//         //   console.log("🚀 ~ processFiles ~ file.thUrl:", file.thUrl)
//         //   file.bigUrl = `/uploads/${path.relative(baseUploads, path.join(bigPath, file.filename)).replace(/\\/g, '/')}`;
//         //   console.log("🚀 ~ processFiles ~ file.bigUrl:", file.bigUrl)
//         // }



//         if (file.mimetype.startsWith("image/")) {
//           const imagesPath = path.join(modulePath, subFolder, "images");

//           const thPath = path.join(imagesPath, "th");
//           const bigPath = path.join(imagesPath, "big");

//           if (!fs.existsSync(thPath)) fs.mkdirSync(thPath, { recursive: true });
//           if (!fs.existsSync(bigPath)) fs.mkdirSync(bigPath, { recursive: true });

//           // 🔥 BACKGROUND resize (NON-BLOCKING)
//           setImmediate(async () => {
//             try {
//               const image = await Jimp.read(file.path);

//               // THUMB (80px width)
//               await image
//                 .clone()
//                 .resize({ w: 80 })
//                 .write(path.join(thPath, file.filename));

//               // BIG (250px width)
//               await image
//                 .clone()
//                 .resize({ w: 250 })
//                 .write(path.join(bigPath, file.filename));
//             } catch (err) {
//               console.error("❌ Resize error:", err);
//             }
//           });

//           // URLs returned immediately
//           file.thUrl = `/uploads/${moduleName}/${subFolder}/images/th/${file.filename}`;
//           file.bigUrl = `/uploads/${moduleName}/${subFolder}/images/big/${file.filename}`;
//         }




//         // Documents go to docs/ folder
//         else {
//           const docsPath = path.join(modulePath, subFolder, "docs");
//           if (!fs.existsSync(docsPath)) fs.mkdirSync(docsPath, { recursive: true });

//           const destPath = path.join(docsPath, file.filename);
//           if (file.path !== destPath) fs.renameSync(file.path, destPath);

//           const newRelativePath = path.relative(baseUploads, destPath).replace(/\\/g, '/');
//           file.publicUrl = `/uploads/${newRelativePath}`;
//         }
//       }
//     }
//   };



//   return { upload, processFiles };
// };

// module.exports = createGenericUploader;


// // const multer = require("multer");
// // const path = require("path");

// // // Storage configuration
// // const storage = multer.diskStorage({
// //   destination: (req, file, cb) => {
// //     cb(null, "uploads/"); // make sure this folder exists
// //   },
// //   filename: (req, file, cb) => {
// //     const uniqueName =
// //       Date.now() + "-" + Math.round(Math.random() * 1e9);
// //     cb(null, uniqueName + path.extname(file.originalname));
// //   },
// // });

// // // File filter (optional)
// // const fileFilter = (req, file, cb) => {
// //   if (file.mimetype.startsWith("image/jepeg image/jpg")) {
// //     cb(null, true);
// //   } else {
// //     cb(new Error("Only image files are allowed!"), false);
// //   }
// // };

// // // Multer instance
// // const upload = multer({
// //   storage,
// //   limits: { fileSize: 100 * 1024 * 1024 }, // 5MB
// //   fileFilter,
// // });

// // module.exports = upload;
