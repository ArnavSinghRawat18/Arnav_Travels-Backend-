/*
db-counts.js
- Connects to MongoDB and prints counts per category from the Hotel collection.
- Usage:
  1) Create .env with DATABASE_URL
  2) node scripts/db-counts.js
*/

const mongoose = require('mongoose');
require('dotenv').config();
const Hotel = require('../model/hotel.model');

const uri = process.env.DATABASE_URL || process.env.MONGODB_URI;
if (!uri) {
  console.error('DATABASE_URL or MONGODB_URI is not set. Create a .env with DATABASE_URL and try again.');
  process.exit(1);
}

async function counts() {
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 30000, socketTimeoutMS: 45000 });
  const agg = await Hotel.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]);
  console.log('Counts per category (from DB):');
  let total = 0;
  for (const a of agg) { console.log(a._id + ': ' + a.count); total += a.count; }
  console.log('Total:', total);
  await mongoose.disconnect();
}

counts().catch(err => { console.error('Failed:', err && err.message ? err.message : err); mongoose.disconnect().finally(()=>process.exit(1)); });
