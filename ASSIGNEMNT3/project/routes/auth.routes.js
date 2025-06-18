const express = require('express');
const passport = require('passport')

const { getRegister, getLogin, postRegister, postLogin, logout ,generatePhoneOtp, generateEmailOtp} = require('../controllers/auth.controller.js');
const upload = require('../middlewares/multer.userProfile.js')
const loginLimiter = require('../middlewares/rateLimiter.js');
const router = express.Router();

router.get('/register', getRegister);
router.get('/login', getLogin);
router.post('/register', upload.single('profileImage'), postRegister);
router.post('/login', loginLimiter, postLogin);
router.get('/logout', logout);
const jwt = require('jsonwebtoken');
router.post('/send-phone-otp' , generatePhoneOtp);
router.post('/send-email-otp' , generateEmailOtp);
// ======= SIGNUP =======

router.get('/google/signup', passport.authenticate('google-signup', {
  scope: ['profile', 'email']
}));

router.get('/google/signup/callback',
  passport.authenticate('google-signup', {
    failureRedirect: '/auth/login'
  }),
  (req, res) => {
    const user = req.user;

    const token = jwt.sign(
      { userId: user._id, isAdmin: user.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res
      .cookie('token', token, {
        httpOnly: true,
        maxAge: 3600000,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      })
      .redirect('/');
  }
);

// ======= LOGIN =======

router.get('/google/login', passport.authenticate('google-login', {
  scope: ['profile', 'email']
}));

router.get('/google/login/callback',
  passport.authenticate('google-login', {
    failureRedirect: '/auth/login?error=user_not_found',
    failureMessage: true
  }),
  (req, res) => {
    if (!req.user) {
      return res.redirect('/auth/login?error=user_not_found');
    }

    const user = req.user;

    const token = jwt.sign(
      { userId: user._id, isAdmin: user.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res
      .cookie('token', token, {
        httpOnly: true,
        maxAge: 3600000,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      })
      .redirect('/');
  }
);

module.exports = router;
