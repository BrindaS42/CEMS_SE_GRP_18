import bcrypt from 'bcrypt';
import 'dotenv/config';
import User from '../models/user.model.js';
import jwt from 'jsonwebtoken';
import transporter from '../config/nodemailer.js';
import { randomInt } from 'crypto';

const generateTokenAndSetCookie = (res, user) => {
  const token = jwt.sign({ id: user._id, username: user.username, role: user.role }, process.env.JWTKEY, {
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
    const { username, email, password, role } = req.body;

    if (!username || !email || !password || !role) {
      return res.status(400).json({ success: false , message: 'All fields are required' });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(409).json({ success: false ,message: 'Username already in use' });
    }

    const passwordHash = await bcrypt.hash(password, Number(process.env.HASHROUND));

    const user = await User.create({ username, email, passwordHash, role });

    const token = generateTokenAndSetCookie(res, user);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
        email: user.email,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username and password are required' });
    }

    const user = await User.findOne({ username });

    const isMatch = user ? await bcrypt.compare(password, user.passwordHash) : false;

    if (!user || !isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = generateTokenAndSetCookie(res, user);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
        email: user.email,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie('token',{
       httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });

    res.json({success:true,message:"logout succsefully"});
  }
  catch (err) {
    res.status(500).json({success:false, message: err.message });
  }
}

export const requestPasswordReset = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

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

    const otp = randomInt(100000, 1000000).toString();
    const otpExpires = new Date(now + 10 * 60 * 1000); // 10 minutes from now

    user.passwordResetToken = otp;
    user.passwordResetTokenExpires = otpExpires;
    await user.save();

    const mailOptions = {
      from: `"Campus Event Manager" <${process.env.GMAIL_USER}>`,
      to: toEmail,
      subject: "Password Reset OTP - Campus Event Manager",
      html: `
        <div style="font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif; font-size: 16px; color: #333; background-color: #f4f4f4; padding: 20px; margin: 0;">
          <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
            <tr>
              <td style="padding: 40px 30px;">
                <h1 style="font-size: 24px; color: #222; margin-top: 0;">Password Reset Request</h1>
                <p style="margin-bottom: 25px; line-height: 1.5;">
                  You requested a password reset. Please use the following One-Time Password (OTP) to proceed.
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

    res.status(200).json({ success: true, message: "OTP sent to your email successfully." });

  } catch (err) {
    console.error("Error in requestPasswordReset:", err);
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

export const verifyOtpAndResetPassword = async (req , res) =>{
  try{
    const {otp , newPassword} = req.body;
    const userid = req.user.id;

    if(!otp || !newPassword){
      return res.json({success:false , message : "fill details"});
    }
    
    const user = await User.findById(userid);
    
    if(!user){
      return res.json({success:false , message : "user does not exist"});
    }
    
    const now = Date.now();

    if(!user.passwordResetToken || !user.passwordResetTokenExpires || user.passwordResetTokenExpires.getTime() < now){
      user.passwordResetToken = undefined;
      user.passwordResetTokenExpires = undefined;
      await user.save();
      return res.json({success:false , message : "OTP is invalid or has expired. Please request another."});
    }

    if(otp !== user.passwordResetToken){
      return res.json({success:false , message : "otp is wrong"});
    }

    const passwordHash = await bcrypt.hash(newPassword, Number(process.env.HASHROUND));

    user.passwordHash = passwordHash;
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpires = undefined;
    
    await user.save();

    res.json({success:true, message: "Password reset successfully"});

  }
  catch (err) {
    res.json({success:false ,message : err.message});
  }
};