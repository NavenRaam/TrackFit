import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcrypt';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { username, email, password } = req.body;
  await dbConnect();

  const existingUser = await User.findOne({ email });
  if (existingUser) return res.status(400).json({ message: 'User already exists' });

  const hashed = await bcrypt.hash(password, 10);
  await User.create({ username, email, password: hashed });

  res.status(201).json({ message: 'User registered successfully' });
}
