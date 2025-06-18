const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User");
require('dotenv').config();

// ======= SIGNUP STRATEGY =======
passport.use('google-signup', new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLEINT_SECRET,
  callbackURL: process.env.CALLBACK_SIGNUP_URL,
}, async (accessToken, refreshToken, profile, cb) => {
  try {
    const email = profile.emails[0].value;
    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        googleId: profile.id,
        displayName: profile.displayName,
        email,
        photo: profile.photos[0].value,
        firstName: profile.name.givenName || 'Google',
        lastName: profile.name.familyName || 'User',
        password: 'google_oauth_dummy_password',
        isGoogleUser: true
      });
    } else if (!user.googleId) {
      user.googleId = profile.id;
      await user.save();
    }

    return cb(null, user);
  } catch (err) {
    return cb(err, null);
  }
}));

// ======= LOGIN STRATEGY =======
passport.use('google-login', new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLEINT_SECRET,
  callbackURL: process.env.CALLBACK_LOGIN_URL,
}, async (accessToken, refreshToken, profile, cb) => {
  try {
    const email = profile.emails[0].value;
    const user = await User.findOne({ email });

    if (!user) {
      return cb(null, false, { message: 'No account exists with this Google email' });
    }

    if (!user.googleId) {
      user.googleId = profile.id;
      await user.save();
    }

    return cb(null, user);
  } catch (err) {
    return cb(err, null);
  }
}));

// ======= SERIALIZE / DESERIALIZE =======
passport.serializeUser((user, done) => done(null, user._id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});
