const express = require('express');
const mongoose = require('mongoose');
const hotelDataAddedToDBRouter = require("./routes/dataimport.router.js");
const categoryDataAddedToDBRouter = require("./routes/categoryimport.router.js");
const hotelRouter = require('./routes/hotel.router.js');
const categoryRouter=require("./routes/category.router.js");
const singleHotelRouter = require('./routes/singlehotel.router.js'); // Import the single hotel route 
const authRouter =require("./routes/auth.router.js"); // Import the auth route
const connectDB = require('./config/dbconfig.js');
const wishlistRouter=require("./routes/wishlist.router.js"); // Import the wishlist route
// category routes removed per request

const app = express();

// parse JSON bodies
app.use(express.json());

// handle invalid JSON errors from body-parser/express.json
app.use(function (err, req, res, next) {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    console.error('Invalid JSON in request body:', err.message);
    return res.status(400).json({ message: 'Invalid JSON in request body' });
  }
  next();
});

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
app.use("/api/hotels", singleHotelRouter); // Use the single hotel route
app.use("/api/auth", authRouter); // Use the auth route
// app.use("/api/wishlist", wishlistRouter); // Use the wishlist route
// Also accept wishlist requests under the auth prefix for clients hitting /api/auth/wishlist
// app.use("/api/auth/wishlist", wishlistRouter);

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
