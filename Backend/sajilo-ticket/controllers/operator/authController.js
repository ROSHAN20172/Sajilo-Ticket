import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Operator from '../../models/operator/operatorModel.js';
import transporter from '../../config/nodemailer.js';

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

    // Prepare welcome email options
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: 'Welcome to Sajilo Ticket!',
      text: `Hello ${name},\n\nWelcome to Sajilo Ticket! Your operator account has been successfully created.\n\nBest regards,\nThe Sajilo Ticket Team`,
    };

    // Send the welcome email
    await transporter.sendMail(mailOptions);

    res.status(201).json({ success: true, message: 'Operator registered successfully.' });
  } catch (error) {
    console.error('Operator Registration Error:', error);
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

// Send Operator Reset OTP
export const operatorSendResetOtp = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, message: "Email is required" });
  }
  try {
    const operator = await Operator.findOne({ email });
    if (!operator) {
      return res.status(404).json({ success: false, message: "Operator not found" });
    }
    // Check if 30 seconds have passed since last OTP request
    if (operator.resetOtpRequestedAt && Date.now() - operator.resetOtpRequestedAt < 30 * 1000) {
      return res.status(400).json({ success: false, message: "Please wait 30 seconds before requesting a new OTP" });
    }
    // Generate a new OTP
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    operator.resetOtp = otp;
    operator.resetOtpExpireAt = Date.now() + 15 * 60 * 1000; // valid for 15 minutes
    operator.resetOtpRequestedAt = Date.now();

    await operator.save();

    // Send OTP email
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: operator.email,
      subject: 'Operator Password Reset OTP',
      text: `Your OTP for resetting your operator account password is ${otp}.`
    };

    await transporter.sendMail(mailOptions);
    return res.status(200).json({ success: true, message: "OTP successfully sent to your email" });
  } catch (error) {
    console.error('sendOperatorResetOtp error:', error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Resend Operator Reset OTP
export const operatorResendResetOtp = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, message: "Email is required" });
  }
  try {
    const operator = await Operator.findOne({ email });
    if (!operator) {
      return res.status(404).json({ success: false, message: "Operator not found" });
    }
    // Check if 30 seconds have passed since last OTP request
    if (operator.resetOtpRequestedAt && Date.now() - operator.resetOtpRequestedAt < 30 * 1000) {
      return res.status(400).json({ success: false, message: "Please wait 30 seconds before requesting a new OTP" });
    }
    // Generate a new OTP
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    operator.resetOtp = otp;
    operator.resetOtpExpireAt = Date.now() + 15 * 60 * 1000;
    operator.resetOtpRequestedAt = Date.now();

    await operator.save();

    // Send OTP email
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: operator.email,
      subject: 'Resend: Operator Password Reset OTP',
      text: `Your new OTP for resetting your operator account password is ${otp}.`
    };

    await transporter.sendMail(mailOptions);
    return res.status(200).json({ success: true, message: "New OTP successfully sent to your email" });
  } catch (error) {
    console.error('resendOperatorResetOtp error:', error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Reset Operator Password
export const operatorResetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword) {
    return res.status(400).json({ success: false, message: "Email, OTP and new password are required" });
  }
  try {
    const operator = await Operator.findOne({ email });
    if (!operator) {
      return res.status(404).json({ success: false, message: "Operator not found" });
    }
    // Validate OTP
    if (!operator.resetOtp || operator.resetOtp !== otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }
    if (operator.resetOtpExpireAt < Date.now()) {
      return res.status(400).json({ success: false, message: "OTP expired" });
    }
    // Hash and update new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    operator.password = hashedPassword;
    operator.resetOtp = '';
    operator.resetOtpExpireAt = 0;

    await operator.save();
    return res.status(200).json({ success: true, message: "Password has been reset successfully" });
  } catch (error) {
    console.error('resetOperatorPassword error:', error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};
