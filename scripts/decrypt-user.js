// scripts/decrypt-user.js
// One-off local utility: find a user by number or username and print decrypted password to console.
// WARNING: This prints plaintext passwords. Only run locally on a trusted machine for debugging.
// Usage: node scripts/decrypt-user.js --number=123456789

require('dotenv').config();
const mongoose = require('mongoose');
const CryptoJS = require('crypto-js');
const User = require('../model/user.model.js');

function parseArgs() {
  const args = {};
  process.argv.slice(2).forEach(a => {
    const m = a.match(/^--([^=]+)=(.*)$/);
    if (m) args[m[1]] = m[2];
  });
  return args;
}

async function run() {
  const args = parseArgs();
  const { number, username } = args;
  if (!number && !username) {
    console.error('Provide --number= or --username=');
    process.exit(2);
  }
  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI not set in .env');
    process.exit(2);
  }

  await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  const user = await User.findOne({ $or: [{ number: number }, { username: username }] });
  if (!user) {
    console.error('User not found');
    await mongoose.disconnect();
    process.exit(1);
  }

  let decrypted = '';
  try {
    const bytes = CryptoJS.AES.decrypt(user.password, process.env.PASSWORD_SECRET_KEY);
    decrypted = bytes.toString(CryptoJS.enc.Utf8);
  } catch (e) {
    decrypted = '';
  }
  // If decryption failed, treat stored value as plaintext
  const plain = decrypted || user.password || '';

  console.log(JSON.stringify({
    _id: user._id.toString(),
    username: user.username,
    number: user.number,
    email: user.email,
    password: plain
  }, null, 2));

  await mongoose.disconnect();
  process.exit(0);
}

run().catch(err => { console.error(err); process.exit(1); });
