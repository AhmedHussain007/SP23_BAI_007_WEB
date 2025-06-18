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


module.exports = router;
