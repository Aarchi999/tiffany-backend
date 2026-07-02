// const fs = require("fs");
// const path = require("path");
// const { Sequelize, DataTypes } = require("sequelize");

// const env = process.env.NODE_ENV || "development";
// const config = require("../config/database")[env];

// const db = {};

// // ✅ Sequelize instance
// const sequelize = new Sequelize(
//   config.database,
//   config.username,
//   config.password,
//   {
//     host: config.host,
//     port: config.port,
//     dialect: config.dialect,
//     logging: config.logging,
//   }
// );

// /* =========================
//    LOAD MODELS RECURSIVELY
// ========================= */

// function loadModels(dir) {
//   fs.readdirSync(dir).forEach((file) => {

//     const fullPath = path.join(dir, file);
       
//      // if folder → go inside
//     if (fs.statSync(fullPath).isDirectory()) {
//       loadModels(fullPath);
//       return;
//     }
    
//         // if model file → load it
//     if (file.endsWith(".model.js")) {
//       const model = require(fullPath)(sequelize, DataTypes);
//       db[model.name] = model;
//       console.log("✅ Loaded model:", model.name);
//     }
//   });
// }

// loadModels(__dirname);

// /* =========================
//    SET ASSOCIATIONS
// ========================= */

// Object.keys(db).forEach((modelName) => {
//   if (db[modelName].associate) {
//     db[modelName].associate(db);
//   }
// });

// /* =========================
//    TEST CONNECTION
// ========================= */

// sequelize.authenticate()
//   .then(() => console.log("✅ Database connected"))
//   .catch(err => console.error("❌ DB error:", err.message));

//   db.sequelize = sequelize;
//   db.Sequelize = Sequelize;
  

// module.exports = db;


const fs = require("fs");
const path = require("path");
const { Sequelize, DataTypes } = require("sequelize");

const env = process.env.NODE_ENV || "development";
const config = require("../config/database")[env];

const db = {};

// Create Sequelize instance
const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.host,
    port: config.port,
    dialect: config.dialect,
    logging: config.logging,

     // ✅ ADD THIS
    pool: {
      max: 15,        // increase connections
      min: 0,
      acquire: 120000, // wait 60s before timeout
      idle: 10000
    }
  }
);

// Attach Sequelize to db early
db.sequelize = sequelize;
db.Sequelize = Sequelize;

// Load models recursively
function loadModels(dir) {
  fs.readdirSync(dir).forEach((file) => {
    const fullPath = path.join(dir, file);

    if (fs.statSync(fullPath).isDirectory()) {
      loadModels(fullPath);
      return;
    }

    if (file.endsWith(".model.js")) {
      try {
        const model = require(fullPath)(sequelize, DataTypes);
        db[model.name] = model;
        console.log("✅ Loaded model:", model.name);
      } catch (err) {
        console.error("❌ Failed to load model:", file, err.message);
      }
    }
  });
}

loadModels(__dirname);

// Setup associations
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// Test DB connection
(async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected");
  } catch (err) {
    console.error("❌ DB error:", err.message);
  }
})();

console.log("All loaded models:", Object.keys(db));

module.exports = db;