const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const passport = require('passport')

const transporter = nodemailer.createTransport({
  host:"smtp.gmail.com",
  port:587,
  secure:false,
  auth:{
    user:process.env.EMAIL_USER,
    pass:process.env.EMAIL_PASSWORD
  }
})

exports.getRegister = (req, res) => {
  res.render('auth/register', { user: null, req });
};

exports.getLogin = (req, res) => {
  res.render('auth/login', { user: null, req });
};

exports.postRegister = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      phone,
    } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Email already registered' });

    const hashedPassword = await bcrypt.hash(password, 10);


    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      phone,
      address : "",
      description:"",
      wishlist:[],
      profileImageUrl: req.file ? `/images/users/${req.file.filename}` : undefined
    });

    await newUser.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.postLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid email or password' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid email or password' });

    const token = jwt.sign( { userId: user._id, isAdmin: user.isAdmin }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.cookie('token', token, { httpOnly: true, maxAge: 3600000, }) .json({ message: 'Login successful' , isadmin:user.isAdmin });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.logout = (req , res) => {
  res.clearCookie('token');
  res.redirect('/');
}

exports.generateEmailOtp = async (req, res) => {
    const { email } = req.body;

    if (!email || !/\S+@\S+\.\S+/.test(email)) {
        return res.status(400).json({ message: 'Invalid or missing email.' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000);
    const info = await transporter.sendMail({
      from : `'Ecommerce Project' <${process.env.EMAIL_USER}>`,
      to:email,
      subject:`Here is your one time password(otp) that you can use to create account. ${otp}`
    })
    console.log(`Generated Email OTP for ${email}: ${otp}`);

    return res.json({
        otp,
        message: 'OTP generated and logged to console for email.'
    });
};

exports.generatePhoneOtp = (req, res) => {
    const { phone } = req.body;

    if (!phone || phone.length <= 10) {
        return res.status(400).json({ message: 'Invalid or missing phone number.' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000); // 6-digit OTP
    console.log(`Generated Phone OTP for ${phone}: ${otp}`);

    return res.json({
        otp,
        message: 'OTP generated and logged to console for phone.'
    });
};
