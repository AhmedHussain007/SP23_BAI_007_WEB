const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 30
  },

  lastName: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 30
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },

  password: {
    type: String,
    required: true,
    minlength: 6
  },
  isGoogleUser:{
    type:Boolean,
    default:false
  },
  phone: {
    type: String,
    validate: {
      validator: v => /^[0-9]{10,15}$/.test(v),
      message: 'Phone number must be 10 to 15 digits.'
    }
  },

  address: {
    type: String
  },

  genres: {
    type: [String],
    default: []
  },
  wishlist: {
    type: [mongoose.Schema.Types.ObjectId],
    default: []
  },
  description: {
    type: String,
    maxlength: 500
  },

  profileImageUrl: {
    type: String,
    trim: true
  },

  isAdmin: {
    type: Boolean,
    default: false
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', userSchema);
