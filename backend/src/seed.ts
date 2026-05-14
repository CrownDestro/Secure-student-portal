import 'dotenv/config';
import mongoose from 'mongoose';
import User from './models/User';

const USERS = [
  { name: 'Alice Student', email: 'student@demo.com', password: 'Student@123', role: 'student' as const },
  { name: 'Bob Teacher',   email: 'teacher@demo.com', password: 'Teacher@123', role: 'teacher' as const },
  { name: 'Carol Admin',   email: 'admin@demo.com',   password: 'Admin@1234',  role: 'admin'   as const },
];

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/secure_portal');
  console.log('Connected to MongoDB');

  await User.deleteMany({ email: { $in: USERS.map(u => u.email) } });
  console.log('🗑  Cleared existing demo users');

  for (const u of USERS) {
    const user = new User({
      name:         u.name,
      email:        u.email,
      passwordHash: u.password,   // ← plain text; pre('save') hook hashes it once
      role:         u.role,
    });
    await user.save();
    console.log(`✅ Created ${u.role}: ${u.email}  password: ${u.password}`);
  }

  await mongoose.disconnect();
  console.log('\nDone!');
}

seed().catch(err => { console.error(err); process.exit(1); });