import express from 'express';
import adminAuth from '../../middleware/admin/adminAuth.js';
import { getAdminData } from '../../controllers/admin/adminController.js';
import User from '../../models/userModel.js';
import Operator from '../../models/operator/operatorModel.js';
import transporter from '../../config/nodemailer.js'

const router = express.Router();

router.get('/data', adminAuth, getAdminData);

// User Management Endpoints
router.get('/users', adminAuth, async (req, res) => {
  try {
    const { search, status } = req.query;
    const query = buildUserQuery(search, status);
    const users = await User.find(query).select('-password');
    res.json(users);
  } catch (error) {
    handleError(res, error);
  }
});

router.get('/operators', adminAuth, async (req, res) => {
  try {
    const { search, status } = req.query;
    const query = buildOperatorQuery(search, status);
    const operators = await Operator.find(query).select('-password');
    res.json(operators);
  } catch (error) {
    handleError(res, error);
  }
});

// Query Builders
const buildUserQuery = (search, status) => {
  const query = {};
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }
  if (status === 'verified') query.isAccountVerified = true;
  if (status === 'unverified') query.isAccountVerified = false;
  return query;
};

const buildOperatorQuery = (search, status) => {
  const query = {};
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { panNo: { $regex: search, $options: 'i' } }
    ];
  }
  if (status === 'verified') query.isAccountVerified = true;
  if (status === 'unverified') query.isAccountVerified = false;
  return query;
};

// Error Handler
const handleError = (res, error) => {
  res.status(500).json({
    success: false,
    message: 'Server error. Please try again later.'
  });
};

router.put('/users/:id/blocked', adminAuth, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isBlocked: req.body.isBlocked },
      { new: true }
    ).select('-password');
    res.json({ success: true, user });
  } catch (error) {
    handleError(res, error);
  }
});

// routes/admin/adminRoutes.js
router.put('/operators/:id/status', adminAuth, async (req, res) => {
  try {
    const operator = await Operator.findById(req.params.id);
    
    if (!operator) {
      return res.status(404).json({
        success: false,
        message: 'Operator not found'
      });
    }

    // Store previous verification status
    const wasVerified = operator.isAccountVerified;
    const newVerificationStatus = req.body.isAccountVerified;

    // Update operator fields
    operator.isAccountVerified = newVerificationStatus ?? operator.isAccountVerified;
    operator.isBlocked = req.body.isBlocked ?? operator.isBlocked;

    // Save updated operator
    const updatedOperator = await operator.save();

    // Send verification email only if newly verified
    if (!wasVerified && updatedOperator.isAccountVerified) {
      const mailOptions = {
        from: process.env.SENDER_EMAIL,
        to: updatedOperator.email,
        subject: 'Account Verification Complete - Sajilo Ticket',
        text: `Hello ${updatedOperator.name},\n\nWelcome to Sajilo Ticket, Your operator account has been successfully verified by our administration team. \nYou can now log in to your operator dashboard and start managing your bus services. \n\nHappy managing! 🚌 \nBest regards \nSajilo Ticket Team`
      };

      // Send email and handle potential errors
      transporter.sendMail(mailOptions).catch(error => {
      });
    }

    res.json({
      success: true,
      operator: updatedOperator.toObject({ virtuals: true })
    });

  } catch (error) {
    handleError(res, error);
  }
});

export default router;