import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import userModel from '../models/userModel.js';
import transporter from '../config/nodemailer.js'
import { EMAIL_VERIFY_TEMPLATE, PASSWORD_RESET_TEMPLATE } from '../config/emailTemplates.js';
import tempUserModel from '../models/tempUserModel.js';

// export const register = async (req, res) => {
//     const { name, email, password } = req.body;

//     if (!name || !email || !password) {
//         return res.json({ success: false, message: 'Missing Details' });
//     }

//     try {
//         const existingUser = await userModel.findOne({ email });
//         if (existingUser) {
//             return res.json({ success: false, message: "User Already Exists" });
//         }

//         const existingTempUser = await tempUserModel.findOne({ email });
//         if (existingTempUser) {
//             return res.json({ success: false, message: "Verification in Progress. Check Your Email." });
//         }

//         const hashedPassword = await bcrypt.hash(password, 10);
//         const otp = String(Math.floor(100000 + Math.random() * 900000)); // Generate OTP

//         const tempUser = new tempUserModel({ name, email, password: hashedPassword, verifyOtp: otp });
//         await tempUser.save();

//         // Send OTP Email
//         const mailOptions = {
//             from: process.env.SENDER_EMAIL,
//             to: email,
//             subject: 'Verify Your Email - Sajilo Ticket',
//             text: `Your OTP for verifying your Sajilo Ticket account is ${otp}. It will expire in 15 minutes.`,
//         };

//         await transporter.sendMail(mailOptions);

//         res.json({ success: true, message: "OTP Sent to Email. Verify to Complete Signup." });

//     } catch (error) {
//         res.json({ success: false, message: error.message });
//     }
// };

// export const verifyEmail = async (req, res) => {
//     const { email, otp } = req.body;

//     if (!email || !otp) {
//         return res.json({ success: false, message: "Missing Details" });
//     }

//     try {
//         const tempUser = await tempUserModel.findOne({ email });

//         if (!tempUser) {
//             return res.json({ success: false, message: "No Verification Request Found." });
//         }

//         if (tempUser.verifyOtp !== otp) {
//             return res.json({ success: false, message: "Invalid OTP" });
//         }

//         // Move user to main collection
//         const newUser = new userModel({
//             name: tempUser.name,
//             email: tempUser.email,
//             password: tempUser.password,
//             isAccountVerified: true
//         });

//         await newUser.save();
//         await tempUserModel.deleteOne({ email }); // Remove temp data

//         // Send Welcome Email
//         const mailOptions = {
//             from: process.env.SENDER_EMAIL,
//             to: email,
//             subject: 'Welcome to Sajilo Ticket!',
//             text: `Hello ${tempUser.name},\n\nWelcome to Sajilo Ticket! 🎉\n\nYour account has been successfully verified. You can now log in and start booking tickets easily.\n\nEnjoy your journey with us!\n\nBest Regards,\nSajilo Ticket Team`
//         };

//         await transporter.sendMail(mailOptions);

//         // Create JWT token for the new user
//         const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

//         // Set token in cookie
//         res.cookie('token', token, {
//             httpOnly: true,
//             secure: process.env.NODE_ENV === 'production',
//             sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
//             maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
//         });

//         res.json({ success: true, message: "Email Verified Successfully. Welcome email sent. You are now logged in." });

//     } catch (error) {
//         res.json({ success: false, message: error.message });
//     }
// };



export const register = async (req, res) => {
    const { name, email, password } = req.body;

    // Check for missing fields
    if (!name || !email || !password) {
        return res.status(400).json({ success: false, message: 'Missing required fields (name, email, password)' });
    }

    try {
        // Check if the user already exists
        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'User already exists with this email.' });
        }

        // Check if there's an ongoing verification for this email
        const existingTempUser = await tempUserModel.findOne({ email });
        if (existingTempUser) {
            return res.status(400).json({ success: false, message: 'Verification in progress. Please try again after 15 minutes.' });
        }

        // Hash the password and generate OTP
        const hashedPassword = await bcrypt.hash(password, 10);
        const otp = String(Math.floor(100000 + Math.random() * 900000)); // Generate OTP

        // Set OTP expiration time (15 minutes from now)
        const otpExpireAt = Date.now() + 15 * 60 * 1000; // 15 minutes in milliseconds

        // Create a temporary user entry for verification
        const tempUser = new tempUserModel({ name, email, password: hashedPassword, verifyOtp: otp, verifyOtpExpireAt: otpExpireAt });
        await tempUser.save();

        // Send OTP email
        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: 'Verify Your Email - Sajilo Ticket',
            text: `Your OTP for verifying your Sajilo Ticket account is ${otp}. It will expire in 15 minutes.`,
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({ success: true, message: 'OTP sent to email. Please verify to complete signup.' });

    } catch (error) {
        console.error('Registration Error:', error); // Log error for debugging purposes
        res.status(500).json({ success: false, message: 'Internal server error. Please try again later.' });
    }
};

export const verifyEmail = async (req, res) => {
    const { email, otp } = req.body;

    // Check for missing fields
    if (!email || !otp) {
        return res.status(400).json({ success: false, message: 'Missing required fields (email, otp)' });
    }

    try {
        // Find the temporary user record
        const tempUser = await tempUserModel.findOne({ email });

        if (!tempUser) {
            return res.status(404).json({ success: false, message: 'No verification request found for this email.' });
        }

        // Check if the OTP is valid
        if (tempUser.verifyOtp !== otp) {
            return res.status(400).json({ success: false, message: 'Invalid OTP.' });
        }

        // Move the temporary user to the main user collection
        const newUser = new userModel({
            name: tempUser.name,
            email: tempUser.email,
            password: tempUser.password,
            isAccountVerified: true
        });

        await newUser.save();
        await tempUserModel.deleteOne({ email }); // Remove temp data

        // Send welcome email
        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: 'Welcome to Sajilo Ticket!',
            text: `Hello ${tempUser.name},\n\nWelcome to Sajilo Ticket! 🎉\n\nYour account has been successfully verified. You can now log in and start booking tickets easily.\n\nEnjoy your journey with us!\n\nBest Regards,\nSajilo Ticket Team`
        };

        await transporter.sendMail(mailOptions);

        // Create JWT token for the new user
        const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        // Set token in cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        res.status(200).json({ success: true, message: 'Email verified successfully. You are now logged in.' });

    } catch (error) {
        console.error('Email Verification Error:', error); // Log error for debugging purposes
        res.status(500).json({ success: false, message: 'Internal server error. Please try again later.' });
    }
};

export const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.json({ success: false, message: "Email and Password are Required" })
    }

    try {

        const user = await userModel.findOne({ email });

        if (!user) {
            return res.json({ success: false, message: 'Invaild Email' })
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.json({ success: false, message: "Invalid Password" })
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.json({ success: true });

    } catch (error) {
        return res.json({ success: false, message: error.message })
    }
}

export const logout = async (req, res) => {
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        })

        return res.json({ success: true, message: "Logged Out" })

    } catch (error) {
        return res.json({ success: false, message: error.message })
    }
}

// Send verification OTP to user Email
export const sendVerifyOtp = async (req, res) => {
    try {

        const { userId } = req.body;

        const user = await userModel.findById(userId);

        if (user.isAccountVerified) {
            return res.json({ success: false, message: "Account Already Verified" })
        }

        const otp = String(Math.floor(100000 + Math.random() * 900000));

        user.verifyOtp = otp;
        user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000

        await user.save();


        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: 'Account Verification OTP',
            text: `Your OTP to verify Sajilo Ticket account is ${otp}. Verify your using this OTP.`,
            // html: EMAIL_VERIFY_TEMPLATE.replace('{{otp}}', otp).replace("{{email}}",user.email)
        }

        await transporter.sendMail(mailOptions);

        res.json({ success: true, message: "Verification OTP Sent in your Email Successfully" })

    } catch (error) {
        return res.json({ success: false, message: error.message })
    }
}

// Check if user is Authenticated
export const isAuthenticated = async (req, res) => {
    try {
        return res.json({ success: true});
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}

// Send Password Reset OTP
export const sendResetOtp = async (req, res) => {
    const {email} = req.body;

    if(!email){
        return res.json({ success: false, message: "Email is Required" })
    }

    try {
        
        const user = await userModel.findOne({email});
        if(!user){
            return res.json({success: false, message: "User not Found"})
        }

        const otp = String(Math.floor(100000 + Math.random() * 900000));

        user.resetOtp = otp;
        user.resetOtpExpireAt = Date.now() + 15 * 60 * 1000

        await user.save();


        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: 'Password Reset OTP',
            text: `Your OTP for Reseting your Sajilo Ticket account Password is ${otp}. Proceed to Resetting your Password using this OTP.`,
            // html: PASSWORD_RESET_TEMPLATE.replace('{{otp}}', otp).replace("{{email}}",user.email)
        };

        await transporter.sendMail(mailOptions);

        return res.json({ success: true, message: "OTP Successfully sent to your Email" });

    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}

//Reset User Password
export const resetPassword = async (req, res) => {
    const {email, otp, newPassword} = req.body;

    if(!email, !otp, !newPassword){
        return res.json({ success: false, message: "Email, OTP and New Password are Required" });
    }

    try {
        
        const user = await userModel.findOne({email});
        if(!user){
            return res.json({success: false, message: "User not Found"});
        }

        if(user.resetOtp === '' || user.resetOtp !== otp){
            return res.json({ success: false, message: "Invaild OTP" });
        }

        if(user.resetOtpExpireAt < Date.now()){
            return res.json({ success: false, message: "OTP Expired" });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        user.password = hashedPassword;
        user.resetOtp = '';
        user.resetOtpExpireAt = 0;

        await user.save();

        return res.json({ success: true, message: "Password has been Reset Successfully" });

    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}