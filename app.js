// Packages
require('dotenv').config();
const express = require("express"); //Web framework to build the API/server
const cookieParser = require("cookie-parser"); //Reads cookies from incoming requests
const cors = require("cors"); //Controls which domains can access your API
const qs = require("qs"); //Advanced query string parser (handles nested queries)
const db = require("./models"); //Your database models (likely Sequelize) 

// Routes
const MainRoute = require('./routes/index'); //This file defines all your API routes

// App
const app = express(); 

/* ---------------- MIDDLEWARES ---------------- */
app.set('query parser', str => qs.parse(str));

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); //Makes cookies available as req.cookies

app.use("/uploads", express.static("uploads"));
app.use(express.static("public"));

/* ---------------- ROUTES ---------------- */
app.use('/', MainRoute); //All routes defined in routes/index.js are attached

// In your main app.js or routes
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store'); // disable caching
  next();
});

// const customerInvoiceRoutes = require("./routes/customer_invoice.routes");

// app.use("/customer-invoice", customerInvoiceRoutes);

/* ---------------- START SERVER (ONLY ONCE) ---------------- */
app.listen(process.env.PORT, "0.0.0.0", () => {
  console.log("Server running http://0.0.0.0:3000"); //accessible from outside the machine (important for Docker / cloud)
});

/* ---------------- DB CONNECT (NON-BLOCKING) ---------------- */

(async () => {
  try {
    console.log('⏳ Connecting database...');

    await db.sequelize.authenticate();
    console.log('✅ Database Connected');

    await db.sequelize.sync();
    // console.log('✅ Database synced');

    // Start all cron jobs AFTER DB is ready
    // require("./cron/index"); 

  } catch (err) {
    console.error('❌ DB error:', err.message);
    // ❌ DO NOT EXIT
  }
})();

module.exports = app;




