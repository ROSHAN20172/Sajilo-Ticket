import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Operator from '../../models/operator/operatorModel.js';

// Operator Registration
export const operatorRegister = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  try {
    const existingOperator = await Operator.findOne({ email });
    if (existingOperator) {
      return res.status(400).json({ success: false, message: 'Operator already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newOperator = new Operator({
      name,
      email,
      password: hashedPassword,
      isAccountVerified: true, // automatically verified for now
    });

    await newOperator.save();
    res.status(201).json({ success: true, message: 'Operator registered successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error. Try again later.' });
  }
};

// Operator Login
export const operatorLogin = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Please provide email and password.' });
  }

  try {
    const operator = await Operator.findOne({ email });
    if (!operator) {
      return res.status(404).json({ success: false, message: 'Operator not found' });
    }

    const isPasswordMatch = await bcrypt.compare(password, operator.password);
    if (!isPasswordMatch) {
      return res.status(400).json({ success: false, message: 'Invalid password' });
    }

    const token = jwt.sign(
      { id: operator._id, email: operator.email },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.cookie('operatorToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
    });

    res.status(200).json({ success: true, message: 'Operator logged in successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error. Try again later.' });
  }
};

// Operator Logout
export const operatorLogout = (req, res) => {
  res.clearCookie('operatorToken');
  res.status(200).json({ success: true, message: 'Operator logged out successfully.' });
};

// Check if Operator is Authenticated
export const isOperatorAuthenticated = (req, res) => {
  if (req.operator) {
    return res.status(200).json({ success: true, message: 'Operator is authenticated' });
  }
  return res.status(401).json({ success: false, message: 'Operator not authenticated' });
};
