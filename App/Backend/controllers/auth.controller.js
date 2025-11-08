import bcrypt from 'bcrypt';
import 'dotenv/config';
<<<<<<< HEAD
import User from '../models/user.model.js';
import jwt from 'jsonwebtoken';

const generateTokenAndSetCookie = (res, user) => {
  const token = jwt.sign({ id: user._id, username: user.username, role: user.role }, process.env.JWTKEY, {
=======
import User from './user.js';
import jwt from 'jsonwebtoken';

const generateTokenAndSetCookie = (res, user) => {
  const token = jwt.sign({ id: user._id, username: user.username }, process.env.JWTKEY, {
>>>>>>> authentication
    expiresIn: '7d',
  });

  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
<<<<<<< HEAD

  return token;
=======
>>>>>>> authentication
};

const register = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password || !role) {
      return res.status(400).json({ error: 'All fields are required' });
    }

<<<<<<< HEAD
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(409).json({ error: 'Username already in use' });
=======
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: 'Email already in use' });
>>>>>>> authentication
    }

    const passwordHash = await bcrypt.hash(password, Number(process.env.HASHROUND));

    const user = await User.create({ username, email, passwordHash, role });

<<<<<<< HEAD
    const token = generateTokenAndSetCookie(res, user);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
        email: user.email,
      },
    });
=======
    generateTokenAndSetCookie(res, user);

    res.status(201).json({ message: 'User registered successfully' });
>>>>>>> authentication
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const user = await User.findOne({ username });

    const isMatch = user ? await bcrypt.compare(password, user.passwordHash) : false;

    if (!user || !isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

<<<<<<< HEAD
    const token = generateTokenAndSetCookie(res, user);

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
        email: user.email,
      },
    });
=======
    generateTokenAndSetCookie(res, user);

    res.status(200).json({ message: 'Login successful' });
>>>>>>> authentication
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

export { register, login };