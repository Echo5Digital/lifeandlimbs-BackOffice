/**
 * Run once to seed admin accounts into MongoDB.
 * Usage: node backend/scripts/seedAdmins.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
const Admin    = require('../models/Admin');

const ADMINS = [
  {
    email:    'admin@lifeandlimbs.org',
    password: null,                          // keep existing hash from env
    hash:     process.env.ADMIN_PASSWORD_HASH,
    name:     'Life and Limbs Admin',
  },
  {
    email:    'sony@echo5digital.com',
    password: 'Sony@Echo2026!',              // temp password — share with Sony
    hash:     null,
    name:     'Sony (Echo5 Digital)',
  },
];

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  for (const a of ADMINS) {
    const passwordHash = a.hash || await bcrypt.hash(a.password, 10);

    const existing = await Admin.findOne({ email: a.email });
    if (existing) {
      // Update hash and name in case they changed
      existing.passwordHash = passwordHash;
      existing.name         = a.name;
      await existing.save();
      console.log(`✔ Updated: ${a.email}`);
    } else {
      await Admin.create({ email: a.email, passwordHash, name: a.name });
      console.log(`✔ Created: ${a.email}`);
    }
  }

  await mongoose.disconnect();
  console.log('Done.');
}

seed().catch(err => { console.error(err); process.exit(1); });
