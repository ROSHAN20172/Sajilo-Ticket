import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Admin from '../models/adminModel.js';

// Manual Admin Registration (Developer/Admin Only)
export const manualAdminRegister = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Missing required fields (name, email, password)' });
  }

  try {
    // Check if the admin already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ success: false, message: 'Admin already exists with this email.' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new admin user
    const newAdmin = new Admin({
      name,
      email,
      password: hashedPassword,
      isAccountVerified: true, // Automatically verify account for manual admins
    });

    await newAdmin.save();

    res.status(200).json({ success: true, message: 'Admin registered successfully.' });

  } catch (error) {
    console.error('Manual Admin Registration Error:', error);
    res.status(500).json({ success: false, message: 'Internal server error. Please try again later.' });
  }
};

// Admin Login
export const adminLogin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Please provide email and password.' });
  }

  try {
    // Check if the admin exists
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(400).json({ success: false, message: 'Admin not found' });
    }

    // Check if the password is correct
    const isPasswordMatch = await bcrypt.compare(password, admin.password);
    if (!isPasswordMatch) {
      return res.status(400).json({ success: false, message: 'Invalid password' });
    }

    // Create JWT token for the admin
    const token = jwt.sign(
      { id: admin._id, email: admin.email },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.cookie('adminToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Set secure flag for production
    });

    res.status(200).json({ success: true, message: 'Admin logged in successfully.' });
  } catch (error) {
    console.error('Admin Login Error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Admin Logout
export const adminLogout = async (req, res) => {
  try {
    res.clearCookie('adminToken'); // Clear the admin's token from the cookie
    res.status(200).json({ success: true, message: 'Admin logged out successfully.' });
  } catch (error) {
    console.error('Admin Logout Error:', error);
    res.status(500).json({ success: false, message: 'Error while logging out' });
  }
};
