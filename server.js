const express = require('express');
const mongoose = require('mongoose');
const hotelDataAddedToDBRouter = require("./routes/dataimport.router.js");
const categoryDataAddedToDBRouter = require("./routes/categoryimport.router.js");
const hotelRouter = require('./routes/hotel.router.js');
const categoryRouter=require("./routes/category.router.js");
const connectDB = require('./config/dbconfig.js');
// category routes removed per request

const app = express();

app.use(express.json());

const PORT = 3500;

app.get('/', (req, res) => {
  res.send('hello geeks');
});
app.use("/api/hoteldata", hotelDataAddedToDBRouter);
app.use("/api/categorydata", categoryDataAddedToDBRouter);
app.use("/api/hotels", hotelRouter);
app.use("/api/categories", categoryRouter);
// also support singular path used in Postman: /api/category
app.use("/api/category", categoryRouter);

console.log('Attempting to connect to MongoDB...');
// Make DB connection non-fatal for development: try to connect, log result, but start server even if it fails.
connectDB()
  .then(() => {
    console.log('MongoDB connection promise resolved');
  })
  .catch((err) => {
    console.error('MongoDB connect failed (continuing without DB):', err && err.message ? err.message : err);
  });

mongoose.connection.once('open', () => {
  console.log('connected to Db');
});

app.listen(process.env.PORT || PORT, () => {
  console.log('Server is UP and running');
});
