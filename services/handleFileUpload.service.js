const multer = require("multer");
// const createGenericUploader = require("../../middlewares/Multer/createGenericUploader.service");


module.exports = {
  handleFileUpload: (req, res, next) => {
    next(); // skip upload handling
  }
};

const handleFileUpload = (documentsConfig = [], moduleName, subFolder) => {
  let upload, processFiles;

  if (documentsConfig.length > 0) {
    // File upload case (step-3, step-4)
    const fields = documentsConfig.map(d => ({
      name: d.field,
      maxCount: d.maxCount || 1,
    }));

    ({ upload, processFiles } = createGenericUploader(documentsConfig, moduleName, subFolder));

    return async (req, res, next) => {
      upload.fields(fields)(req, res, async (err) => {
        if (err) {
          if (err.code === "LIMIT_FILE_SIZE") {
            const field = err.field || "file";
            const docConfig = documentsConfig.find(d => d.field === field);
            const message = docConfig?.errorMessage || `${docConfig.docTypeName} File too large. Max allowed size is 100 MB.`;
            return res.json({ status: 422, message, data: [] });
          }
          return res.json({ status: 422, message: err.message, data: [] });
        }

        try {
          if (processFiles) await processFiles(req); // resize/compress etc.
          next();
        } catch (imgErr) {
          next(imgErr);
        }
      });
    };
  } else {
    // Text-only case (step-5 and similar)
    const textOnly = multer().none();

    return (req, res, next) => {
      textOnly(req, res, (err) => {
        if (err) {
          return res.json({ status: 422, message: err.message, data: [] });
        }
        next();
      });
    };
  }
};

module.exports = handleFileUpload;
