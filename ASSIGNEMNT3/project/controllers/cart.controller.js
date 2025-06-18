const Cart = require('../models/Cart');
const Order = require('../models/Order');
const Product = require('../models/Product');
const authenticateUser = require('../middlewares/auth');

exports.getCartPage = async (req, res) => {
  try {
    const sessionId = req.sessionID;
    let cart = await Cart.findOne({ sessionId }).populate('items.productId');
    if (!cart) {
      return res.render('user/cart', {
        cartItems: [],
        subtotal: 0,
        shipping: 0,
        discount: 0,
        tax: 0,
        estimatedTotal: 0,
        user:req.user
      });
    }

    const cartItems = cart.items.map(item => ({
      productId: item.productId._id,
      product: item.productId,
      quantity: item.quantity,
      price: item.price
    }));

    const subtotal = cart.totalPrice;
    const shipping = subtotal >= 50 ? 0 : 5;
    const discount = subtotal >= 100 ? +(subtotal * 0.1).toFixed(2) : 0;
    const tax = +(subtotal * 0.05).toFixed(2); // 10% tax
    const estimatedTotal = +(subtotal + shipping + tax - discount).toFixed(2);

    res.render('user/cart', {
      cartItems,
      subtotal,
      shipping,
      discount,
      tax,
      estimatedTotal,
      user:req.user
    });

  } catch (err) {
    console.error(err);
    res.render('user/cart', {
      cartItems: [],
      subtotal: 0,
      shipping: 0,
      discount: 0,
      tax: 0,
      estimatedTotal: 0,
      user:req.user
    });
  }
};

exports.addProduct = async (req, res) => {
  const { productId, price } = req.body;
  const sessionId = req.sessionID;

  try {
    let cart = await Cart.findOne({ sessionId });

    if (!cart) {
      cart = new Cart({
        sessionId,
        items: [],
        totalPrice: 0
      });
    }

    const existingItem = cart.items.find(item => item.productId.toString() === productId);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.items.push({
        productId,
        quantity: 1,
        price
      });
    }

    cart.totalPrice += parseFloat(price);
    await cart.save();
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal server error');
  }
};

exports.removeProduct = async (req, res) => {
  const { productId } = req.params;
  const sessionId = req.sessionID;

  try {
    const cart = await Cart.findOne({ sessionId });

    if (!cart) return res.redirect('/cart');

    const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);

    if (itemIndex !== -1) {
      const item = cart.items[itemIndex];
      cart.totalPrice -= item.price * item.quantity;
      cart.items.splice(itemIndex, 1);
      await cart.save();
    }

    res.redirect('/cart');
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal server error');
  }
};

exports.updateCart =  async (req, res) => {
  const { productId, quantity } = req.body;
  const sessionId = req.sessionID;

  try {
    let cart = await Cart.findOne({ sessionId });
    if (!cart) return res.redirect('/cart');

    const item = cart.items.find(item => item.productId.toString() === productId);
    if (!item) return res.redirect('/cart');

    // Update totalPrice before changing quantity
    cart.totalPrice -= item.price * item.quantity;
    item.quantity = parseInt(quantity);
    cart.totalPrice += item.price * item.quantity;

    await cart.save();
    res.redirect('/cart');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error updating cart');
  }
};

exports.placeOrder = async (req, res) => {
  try {
    const sessionId = req.sessionID;
    const cart = await Cart.findOne({ sessionId }).populate('items.productId');

    if (!cart) {
      return res.render('/user/checkout', {
        cartItems: [], subtotal: 0, shipping: 0, discount: 0, tax: 0, estimatedTotal: 0, user: req.user
      });
    }

    const cartItems = cart.items.map(item => ({
      productId: item.productId._id, product: item.productId,
      quantity: item.quantity, price: item.price
    }));

    const subtotal = cart.totalPrice;
    const shipping = subtotal >= 50 ? 0 : 5;
    const discount = subtotal >= 100 ? +(subtotal * 0.1).toFixed(2) : 0;
    const tax = +(subtotal * 0.05).toFixed(2);
    const estimatedTotal = +(subtotal + shipping + tax - discount).toFixed(2);

    res.render('user/checkout', {
      cartItems, subtotal, shipping, discount, tax, estimatedTotal, user: req.user
    });
  } catch (err) {
    console.error(err);
    res.render('/user/checkout', {
      cartItems: [], subtotal: 0, shipping: 0, discount: 0, tax: 0, estimatedTotal: 0, user: req.user
    });
  }
};

exports.checkOut = async (req, res) => {
  const sessionId = req.sessionID;
  const userId = req.user._id;
  const { fullName, address, city, postalCode, country, paymentMethod, mobileNumber, cardHolderName, cardNumber, expiryDate, cvv, paypalEmail } = req.body;
  try {
    const cart = await Cart.findOne({ sessionId }).populate('items.productId');
    if (!cart || cart.items.length === 0) {
      return res.status(400).send('Cart is empty');
    }

    const subtotal = cart.totalPrice;
    const shipping = subtotal >= 50 ? 0 : 5;
    const discount = subtotal >= 100 ? +(subtotal * 0.1).toFixed(2) : 0;
    const tax = +(subtotal * 0.05).toFixed(2);
    const totalAmount = +(subtotal + shipping + tax - discount).toFixed(2);

    const orderItems = cart.items.map(item => ({
      productId: item.productId._id,
      quantity: item.quantity,
      price: item.price
    }));

    const paymentStatus = (paymentMethod !== 'cash on delivery') ? 'paid' : 'pending';

    const newOrder = new Order({
      userId, items: orderItems, shippingAddress: { fullName, address, city, postalCode, country },
      paymentMethod, number: (paymentMethod === 'jazzcash' || paymentMethod === 'easypaisa') ? mobileNumber : undefined,
      cardDetails: (paymentMethod === 'credit-card' || paymentMethod === 'debit-card') ? {
      cardHolderName, cardNumber, expiryDate, cvv } : undefined,
      subtotal, shipping, discount, tax, totalAmount, currency: 'USD',paymentStatus
    });


    await newOrder.save();

    cart.items = [];
    cart.totalPrice = 0;
    await cart.save();

    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.status(500).send('Checkout failed');
  }
};
