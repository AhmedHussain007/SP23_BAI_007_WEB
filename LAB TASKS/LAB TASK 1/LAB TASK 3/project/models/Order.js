const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true,
    min: 0
  }
});

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [orderItemSchema],
  shippingAddress: {
    fullName: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true }
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['jazzcash', 'easypaisa', 'credit-card', 'paypal' , 'debit-card', 'cash on delivery'],
    trim: true
  },

  number: {
    type: String,
    required: function () {
      return this.paymentMethod === 'jazzcash' || this.paymentMethod === 'easypaisa';
    },
    trim: true
  },

  cardDetails: {
    cardHolderName: {
      type: String,
      required: function () {
        return this.paymentMethod === 'credit-card' || this.paymentMethod === 'debit-card';
      },
      trim: true
    },
    cardNumber: {
      type: String,
      required: function () {
        return this.paymentMethod === 'credit-card' || this.paymentMethod === 'debit-card';
      },
      trim: true
    },
    expiryDate: {
      type: String,
      required: function () {
        return this.paymentMethod === 'credit-card' || this.paymentMethod === 'debit-card';
      },
      trim: true
    },
    cvv: {
      type: String,
      required: function () {
        return this.paymentMethod === 'credit-card' || this.paymentMethod === 'debit-card';
      },
      trim: true
    }
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  },
  orderStatus: {
    type: String,
    enum: ['processing', 'shipped', 'delivered', 'cancelled'],
    default: 'processing'
  },
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  shipping: {
    type: Number,
    required: true,
    min: 0
  },
  discount: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  tax: {
    type: Number,
    required: true,
    min: 0
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    required: true,
    default: 'USD',
    uppercase: true,
    trim: true
  },
  isPaid: {
    type: Boolean,
    default: false
  },
  paidAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

orderSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Order', orderSchema);
