/**
 * Seed script — run once to create demo users
 * Usage: ts-node src/seed.ts
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User';

const USERS = [
  { name: 'Alice Student',  email: 'student@demo.com', password: 'Student@123', role: 'student' as const },
  { name: 'Bob Teacher',    email: 'teacher@demo.com', password: 'Teacher@123', role: 'teacher' as const },
  { name: 'Carol Admin',    email: 'admin@demo.com',   password: 'Admin@1234',  role: 'admin'   as const },
];

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/secure_portal');
  console.log('Connected to MongoDB');

  for (const u of USERS) {
    const exists = await User.findOne({ email: u.email });
    if (exists) { console.log(`⏭  Skip ${u.email} (already exists)`); continue; }
    const hash = await bcrypt.hash(u.password, 12);
    await User.create({ name: u.name, email: u.email, passwordHash: hash, role: u.role });
    console.log(`✅ Created ${u.role}: ${u.email}`);
  }

  await mongoose.disconnect();
  console.log('Seeding complete!');
}

seed().catch(err => { console.error(err); process.exit(1); });
