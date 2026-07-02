// // utils/fileMapper.js
// const path = require("path");

// const mapUploadFileUrl = (filePath) => {
//   if (!filePath) return null;

//   const baseUrl = process.env.BASE_URL;
//   const ext = path.extname(filePath).toLowerCase();
//   const fileName = path.basename(filePath);

//   const fileUrl = `${baseUrl}${filePath.replace(/\\/g, "/")}`;

//   let thUrl = null;
//   let bigUrl = null;

//   if (['.png', '.jpg', '.jpeg'].includes(ext)) {
//     let dir = path.dirname(filePath).replace(/\\/g, "/");
//     if (dir.startsWith("/")) dir = dir.slice(1);
//     thUrl = `${baseUrl}/${dir}/th/${fileName}`;
//     bigUrl = `${baseUrl}/${dir}/big/${fileName}`;    
//   }

//   return {
//     file: fileName,
//     file_url: fileUrl,
//     th_url: thUrl,
//     big_url: bigUrl
//   };
// };

// module.exports = { mapUploadFileUrl };
