import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import userModel from '../models/userModel.js';
import transporter from '../config/nodemailer.js'
import { EMAIL_VERIFY_TEMPLATE, PASSWORD_RESET_TEMPLATE } from '../config/emailTemplates.js';

export const register = async (req, res) => {
    const { name, email, password } = req.body;

    // Validate input fields
    if (!name || !email || !password) {
        return res.json({ success: false, message: 'Missing Details' });
    }

    // Validate email format
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailRegex.test(email)) {
        return res.json({ success: false, message: 'Invalid Email Format' });
    }

    // Validate password: Minimum 6 characters, at least one special character
    const passwordRegex = /^(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{6,}$/;
    if (!passwordRegex.test(password)) {
        return res.json({ success: false, message: 'Password must be at least 6 characters long and contain at least one special character.' });
    }

    try {
        const existingUser = await userModel.findOne({ email });

        if (existingUser) {
            return res.json({ success: false, message: "User Already Exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new userModel({ name, email, password: hashedPassword });
        await user.save();

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        // Sending Welcome email
        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: 'Welcome to Sajilo Ticket',
            text: `Welcome to Sajilo Ticket. Your Account has been Successfully Created with email id: ${email}. Now you can Book your Bus Ticket Online easily from anywhere without visiting the Operator Counter.`
        };

        await transporter.sendMail(mailOptions);

        return res.json({ success: true });

    } catch (error) {
        res.json({ success: false, message: error.message });
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

// Verify the Email using OTP
export const verifyEmail = async (req, res) => {
    const { userId, otp } = req.body;

    if (!userId || !otp) {
        return res.json({ success: false, message: "Missing Details" })
    }

    try {

        const user = await userModel.findById(userId);

        if (!user) {
            return res.json({ success: false, message: "User not Found" });
        }

        if (user.verifyOtp === '' || user.verifyOtp !== otp) {
            return res.json({ success: false, message: "Invaild OTP" });
        }

        if (user.verifyOtpExpireAt < Date.now()) {
            return res.json({ success: false, message: "OTP Expired" });
        }

        user.isAccountVerified = true;
        user.verifyOtp = '';
        user.verifyOtpExpireAt = 0;

        await user.save();
        return res.json({ success: true, message: "Email Verified Successfully" })

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