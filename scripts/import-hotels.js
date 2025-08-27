/*
import-hotels.js
- Upserts entries from data/hotels.js into MongoDB using the Hotel model.
- Upsert key: { name, city } (safe for repeated runs).
- Usage:
  1) Create a .env in the backend root with DATABASE_URL=<your_mongo_uri>
  2) From backend folder run: node scripts/import-hotels.js
*/

const mongoose = require('mongoose');
require('dotenv').config();
const path = require('path');
const Hotel = require('../model/hotel.model');

const hotelsFile = require('../data/hotels.js');
const hotels = Array.isArray(hotelsFile) ? hotelsFile : (hotelsFile && hotelsFile.data ? hotelsFile.data : []);

const uri = process.env.DATABASE_URL || process.env.MONGODB_URI;
if (!uri) {
  console.error('DATABASE_URL or MONGODB_URI is not set. Create a .env with DATABASE_URL and try again.');
  process.exit(1);
}

async function importHotels() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 30000,
    socketTimeoutMS: 45000,
    retryWrites: true,
    maxPoolSize: 10,
  });
  console.log('Connected. Upserting', hotels.length, 'hotels (this may take a while).');

  let processed = 0;
  for (let idx = 0; idx < hotels.length; idx++) {
    const h = hotels[idx];
    if (!h || typeof h !== 'object') {
      console.warn('Skipping invalid hotel entry at index', idx);
      continue;
    }
    const doc = {
      name: h.name || `UNKNOWN-${idx}`,
      category: h.category,
      image: h.image,
      imageArr: h.imageArr || [],
      address: h.address || '',
      city: h.city || '',
      state: h.state || 'Himachal Pradesh',
      country: h.country || 'India',
      price: h.price || 2999,
      rating: h.rating || 3.7,
      numberOfBathrooms: h.numberOfBathrooms || 1,
      numberOfBeds: h.numberOfBeds || 1,
      numberOfguest: h.numberOfguest || 1,
      numberOfBedrooms: h.numberOfBedrooms || 1,
      numberOfStudies: h.numberOfStudies || 0,
      hostName: h.hostName || 'Host',
      hostJoinedOn: h.hostJoinedOn || 'Jan 2020',
      ameneties: h.ameneties || [],
      healthAndSafety: h.healthAndSafety || [],
      houseRules: h.houseRules || [],
      propertyType: h.propertyType || 'Hotel',
      isCancelable: typeof h.isCancelable === 'boolean' ? h.isCancelable : true,
    };

    try {
      await Hotel.findOneAndUpdate(
        { name: doc.name, city: doc.city }, // upsert key
        { $set: doc },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      processed++;
      if (processed % 20 === 0) process.stdout.write(`.${processed}`);
    } catch (err) {
      console.error('\nFailed to upsert (index ' + idx + '):', doc.name, doc.city, err && err.message ? err.message : err);
    }
  }

  console.log('\nUpsert finished. Verifying counts...');
  const agg = await Hotel.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]);
  for (const a of agg) console.log(a._id + ': ' + a.count);

  await mongoose.disconnect();
  console.log('Disconnected. Done.');
}

importHotels().catch(err => {
  console.error('Import failed:', err && err.message ? err.message : err);
  mongoose.disconnect().finally(() => process.exit(1));
});
