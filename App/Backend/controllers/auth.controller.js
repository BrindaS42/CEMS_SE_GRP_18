import bcrypt from 'bcrypt';
import 'dotenv/config';
import User from '../models/user.model.js';
import jwt from 'jsonwebtoken';
import transporter from '../config/nodemailer.js';
import { randomInt } from 'crypto';
import mongoose from 'mongoose';

const generateTokenAndSetCookie = (res, user) => {
  const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, process.env.JWTKEY, {
    expiresIn: '7d',
  });

  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  return token;
};

export const register = async (req, res) => {
  try {
    const { username, email, password, college, role } = req.body;

    if (!username || !email || !password || !role) {
      return res.status(400).json({ success: false, message: 'Username, email, password, and role are required' });
    }

    if ((role === 'student' || role === 'organizer') && !college) {
      return res.status(400).json({ success: false, message: 'College is required for student and organizer roles' });
    }

    if (college && !mongoose.Types.ObjectId.isValid(college)) {
      return res.status(400).json({ success: false, message: 'Invalid college selection' });
    }

    const existingUser = await User.findOne({ email, role });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'User with this email and role already exists' });
    }

    const passwordHash = await bcrypt.hash(password, Number(process.env.HASHROUND));

    const userData = {
      email,
      passwordHash,
      role,
      profile: {
        name: username
      }
    };

    if (role === 'student' || role === 'organizer') {
      userData.college = college;
    }

    const user = await User.create(userData);
    const token = generateTokenAndSetCookie(res, user);

    const userObject = user.toObject();
    userObject.id = userObject._id;
    delete userObject._id;
    delete userObject.passwordHash;
    delete userObject.__v;

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: userObject,
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    if (!email || !password || !role) {
      return res.status(400).json({ success: false, message: 'Email, password, and role are required' });
    }

    const user = await User.findOne({ email, role });
    const isMatch = user ? await bcrypt.compare(password, user.passwordHash) : false;

    if (!user || !isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const userObject = user.toObject();
    userObject.id = userObject._id;
    delete userObject._id;
    delete userObject.passwordHash;
    delete userObject.__v;

    const token = generateTokenAndSetCookie(res, user);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: userObject,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });

    res.json({ success: true, message: "logout succsefully" });
  }
  catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export const requestPasswordReset = async (req, res) => {
  try {

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const toEmail = user.email;
    if (!toEmail) {
      return res.status(400).json({ success: false, message: "User email does not exist" });
    }

    const now = Date.now();
    if (user.passwordResetToken && user.passwordResetTokenExpires && now < user.passwordResetTokenExpires.getTime()) {
      return res.status(400).json({ success: false, message: "An OTP has already been sent. Please check your email." });
    }

    const otp = randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.passwordResetToken = otp;
    user.passwordResetTokenExpires = expiresAt;
    await user.save();

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: toEmail,
      subject: 'Password Reset OTP - Campus Event Manager',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Password Reset Request</h1>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <p style="font-size: 16px; color: #333; margin-bottom: 20px;">Hello ${user.profile.name},</p>
            
            <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
              You have requested to reset your password. Please use the following OTP to proceed:
            </p>
            
            <div style="background: #f8f9fa; border: 2px dashed #667eea; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
              <h2 style="color: #667eea; font-size: 32px; margin: 0; letter-spacing: 5px;">${otp}</h2>
              <p style="color: #666; margin: 10px 0 0 0; font-size: 14px;">This OTP will expire in 10 minutes</p>
            </div>
            
            <p style="font-size: 14px; color: #666; margin-top: 20px;">
              If you didn't request this password reset, please ignore this email or contact support if you have concerns.
            </p>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #999; font-size: 12px;">
              © ${new Date().getFullYear()} Campus Event Manager. All rights reserved.
            </div>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ success: true, message: "OTP sent to your email successfully" });

  } catch (err) {
    console.error("Error in requestPasswordReset:", err);
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

export const verifyOtpAndResetPassword = async (req, res) => {
  try {
    const { otp, newPassword} = req.body;
    const { email, role } = req.user;

    if (!otp || !newPassword) {
      return res.status(400).json({ success: false, message: "OTP and new password are required" });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(400).json({ success: false, message: "User not found" });
    }

    const now = Date.now();

    if (!user.passwordResetToken || !user.passwordResetTokenExpires || user.passwordResetTokenExpires.getTime() < now) {
      user.passwordResetToken = undefined;
      user.passwordResetTokenExpires = undefined;
      await user.save();
      return res.status(400).json({ success: false, message: "OTP is invalid or has expired. Please request another." });
    }

    if (otp !== user.passwordResetToken) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    const passwordHash = await bcrypt.hash(newPassword, Number(process.env.HASHROUND));

    user.passwordHash = passwordHash;
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpires = undefined;

    await user.save();

    res.status(200).json({ success: true, message: "Password reset successfully" });

  } catch (err) {
    console.error("Error in verifyOtpAndResetPassword:", err);
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

export const generateOtpForAcc = async (req, res) => {
  try {
    const userid = req.user.id;
    const user = await User.findById(userid);

    if (!user) {
      return res.status(404).json({ success: false, message: "User does not exist" });
    }

    if (user.isVerified) {
      return res.status(400).json({ success: false, message: "Account is already verified" });
    }

    const now = Date.now();

    if (user.verificationToken && user.verificationTokenExpires && user.verificationTokenExpires.getTime() > now) {
      return res.status(400).json({ success: false, message: "An OTP has already been sent. Please check your email." });
    }

    const otp = randomInt(100000, 1000000).toString();
    const otpExpires = new Date(now + 10 * 60 * 1000);

    user.verificationToken = otp;
    user.verificationTokenExpires = otpExpires;
    await user.save();

    const mailOptions = {
      from: `"Campus Event Manager" <${process.env.GMAIL_USER}>`,
      to: user.email,
      subject: "Verify Your Account - Campus Event Manager",
      html: `
        <div style="font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif; font-size: 16px; color: #333; background-color: #f4f4f4; padding: 20px; margin: 0;">
          <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
            <tr>
              <td style="padding: 40px 30px;">
                <h1 style="font-size: 24px; color: #222; margin-top: 0;">Welcome to Campus Event Manager!</h1>
                <p style="margin-bottom: 25px; line-height: 1.5;">
                  Thank you for registering. Please use the following One-Time Password (OTP) to verify your account and complete your registration.
                </p>
                <div style="text-align: center; margin: 30px 0;">
                  <span style="font-size: 42px; font-weight: bold; letter-spacing: 8px; color: #007bff; padding: 15px 25px; border: 2px dashed #007bff; border-radius: 8px;">
                    ${otp}
                  </span>
                </div>
                <p style="margin-top: 25px; margin-bottom: 25px; line-height: 1.5;">
                  This OTP is valid for <strong>10 minutes</strong>.
                </p>
                <p style="font-size: 14px; color: #777; line-height: 1.5;">
                  If you did not create this account, you can safely ignore this email.
                </p>
              </td>
            </tr>
          </table>
          <div style="text-align: center; font-size: 12px; color: #888; margin-top: 20px;">
            © ${new Date().getFullYear()} Campus Event Manager. All rights reserved.
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ success: true, message: "Email sent successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const verifyOtpForAcc = async (req, res) => {
  try {
    const userid = req.user.id;
    const { otp } = req.body;

    const user = await User.findById(userid);

    if (!user) {
      return res.status(404).json({ success: false, message: "User does not exist" });
    }

    if (user.isVerified) {
      return res.status(400).json({ success: false, message: "Account is already verified" });
    }

    const now = Date.now();

    if (!user.verificationToken || (user.verificationTokenExpires && user.verificationTokenExpires.getTime() < now)) {
      user.verificationToken = undefined;
      user.verificationTokenExpires = undefined;
      await user.save();

      return res.status(400).json({ success: false, message: "OTP has expired. Please generate a new one." });
    }

    if (otp !== user.verificationToken) {
      return res.status(400).json({ success: false, message: "OTP is invalid." });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;

    await user.save();
    res.status(200).json({ success: true, message: "Account verified successfully." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


export const requestForgotPassword = async (req, res) => {
  try {
    const { email, role } = req.body;
    if (!email || !role) {
      return res.status(400).json({ success: false, message: "Email and role are required." });
    }

    const user = await User.findOne({ email, role });

    if (!user) {
      return res.status(200).json({ success: true, message: "If an account with that email and role exists, a reset link has been sent." });
    }

    const now = Date.now();
    if (user.passwordForgotToken && user.passwordForgotTokenExpires && now < user.passwordForgotTokenExpires.getTime()) {
      return res.status(400).json({ success: false, message: "An OTP has already been sent. Please check your email." });
    }

    const otp = randomInt(100000, 1000000).toString();
    const otpExpires = new Date(now + 10 * 60 * 1000);

    user.passwordForgotToken = otp;
    user.passwordForgotTokenExpires = otpExpires;
    await user.save();

    const mailOptions = {
      from: `"Campus Event Manager" <${process.env.GMAIL_USER}>`,
      to: user.email,
      subject: `Password Reset for ${user.role} Account - Campus Event Manager`,
      html: `
        <div style="font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif; font-size: 16px; color: #333; background-color: #f4f4f4; padding: 20px; margin: 0;">
          <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
            <tr>
              <td style="padding: 40px 30px;">
                <h1 style="font-size: 24px; color: #222; margin-top: 0;">Password Reset Request</h1>
                <p style="margin-bottom: 25px; line-height: 1.5;">
                  You (or someone else) requested a password reset for your <strong>${user.role}</strong> account. Please use the following One-Time Password (OTP) to proceed.
                </p>
                <div style="text-align: center; margin: 30px 0;">
                  <span style="font-size: 42px; font-weight: bold; letter-spacing: 8px; color: #007bff; padding: 15px 25px; border: 2px dashed #007bff; border-radius: 8px;">
                    ${otp}
                  </span>
                </div>
                <p style="margin-top: 25px; margin-bottom: 25px; line-height: 1.5;">
                  This OTP is valid for <strong>10 minutes</strong>.
                </p>
                <p style="font-size: 14px; color: #777; line-height: 1.5;">
                  If you did not request this, you can safely ignore this email.
                </p>
              </td>
            </tr>
          </table>
          <div style="text-align: center; font-size: 12px; color: #888; margin-top: 20px;">
            © ${new Date().getFullYear()} Campus Event Manager. All rights reserved.
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ success: true, message: "If an account with that email and role exists, a reset link has been sent." });

  } catch (err) {
    console.error("Error in requestForgotPassword:", err);
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

export const verifyForgotPassword = async (req, res) => {
  try {
    const { email, role, otp, newPassword } = req.body;

    if (!email || !role || !otp || !newPassword) {
      return res.status(400).json({ success: false, message: "Email, role, OTP, and new password are required." });
    }

    const user = await User.findOne({ email, role });

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid OTP, email, or role." });
    }

    const now = Date.now();

    if (!user.passwordForgotToken || !user.passwordForgotTokenExpires || user.passwordForgotTokenExpires.getTime() < now) {
      user.passwordForgotToken = undefined;
      user.passwordForgotTokenExpires = undefined;
      await user.save();
      return res.status(400).json({ success: false, message: "OTP is invalid or has expired. Please request another." });
    }

    if (otp !== user.passwordForgotToken) {
      return res.status(400).json({ success: false, message: "Invalid OTP." });
    }

    const passwordHash = await bcrypt.hash(newPassword, Number(process.env.HASHROUND));

    user.passwordHash = passwordHash;
    user.passwordForgotToken = undefined;
    user.passwordForgotTokenExpires = undefined;

    await user.save();

    res.status(200).json({ success: true, message: "Password reset successfully. You can now log in." });

  } catch (err) {
    console.error("Error in verifyForgotPassword:", err);
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};