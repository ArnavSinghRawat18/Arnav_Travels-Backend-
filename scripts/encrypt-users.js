// One-time utility: encrypt plaintext user passwords in DB using same AES key as app
// Usage: node scripts/encrypt-users.js  (make sure .env has MONGODB_URI and PASSWORD_SECRET_KEY)
require('dotenv').config();
const mongoose = require('mongoose');
const CryptoJS = require('crypto-js');
const User = require('../model/user.model.js');

async function run() {
  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI not set in .env');
    process.exit(1);
  }
  if (!process.env.PASSWORD_SECRET_KEY) {
    console.error('PASSWORD_SECRET_KEY not set in .env');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to DB');

  const users = await User.find({});
  let converted = 0;
  for (const u of users) {
    // try to decrypt; if decryption yields an empty string, assume stored password is plaintext
    let decrypted = '';
    try {
      const bytes = CryptoJS.AES.decrypt(u.password, process.env.PASSWORD_SECRET_KEY);
      decrypted = bytes.toString(CryptoJS.enc.Utf8);
    } catch (e) {
      decrypted = '';
    }

    if (!decrypted) {
      // treat u.password as plaintext, encrypt it
      const encrypted = CryptoJS.AES.encrypt(u.password, process.env.PASSWORD_SECRET_KEY).toString();
      u.password = encrypted;
      await u.save();
      console.log(`Encrypted user: ${u.username || u.number}`);
      converted++;
    } else {
      console.log(`Skipping (already encrypted): ${u.username || u.number}`);
    }
  }

  console.log(`Done. Converted ${converted} users.`);
  await mongoose.disconnect();
  process.exit(0);
}

run().catch(err => { console.error('Script error:', err); process.exit(1); });
