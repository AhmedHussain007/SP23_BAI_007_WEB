const fs = require('fs');
const Product = require('../models/Product');
const Review = require('../models/Review');
const User = require('../models/User');
const Order = require('../models/Order');
const path = require('path');
const Complaint = require('../models/Complaint'); // your complaint model


exports.getProfile = async (req, res) => {
  try {
    const user = req.user;

    const wishlistProducts = await Promise.all(
      user.wishlist.map(async (productId) => {
        const product = await Product.findById(productId).lean();
        const reviews = await Review.find({ productId });
        const avgRating =
          reviews.length > 0
            ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
            : 0;

        return { product, avgRating };
      })
    );

    const userOrders = await Order.find({ userId: req.user._id }).populate('items.productId');

    const userReviews = await Review.find({ userId: req.user._id })
      .populate('productId')  // so you can access title and author in EJS
      .lean();

    const userComplaints = await Complaint.find({ userId: req.user._id }) // 🔥 Add this line
    .sort({ timestamp: -1 })
    .lean();

    res.render('user/profile', {
      user: req.user,
      orders: userOrders,
      wishlistProducts,
      reviews: userReviews,
      complaints: userComplaints
    });
  } catch (err) {
    console.log(err);
    res.status(500).send('Server Error');
  }
}

exports.getOrder = async (req , res) => {
  const userOrders = await Order.find({ userId: req.user._id }).populate('items.productId');
  res.render('user/order' , {req , user : req.user , Order : userOrders })
}

exports.updateBio = async (req, res) => {
  try {
    const newBio = req.body.bio?.trim() || '';
    await User.findByIdAndUpdate(req.user._id, { description: newBio });
    res.redirect('/user/profile');
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
}

exports.updatePicture = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).send('User not found');
    }

    // Delete previous picture if exists
    if (user.profileImageUrl) {
      const oldPath = path.join(__dirname, '..', 'public', user.profileImageUrl);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    // Update profileImageUrl with relative path for public folder
    user.profileImageUrl = `/images/users/${req.file.filename}`;
    await user.save();

    res.redirect('/user/profile');
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
}

exports.addGenre = async (req, res) => {
  try {
    const genre = req.body.genre?.trim();
    if (!genre) return res.status(400).send('Genre is required');

    const userId = req.user._id;

    await User.findByIdAndUpdate(userId, {
      $addToSet: { genres: genre }
    });

    res.redirect('/user/profile');
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
}

exports.AboutUs = (req , res)=>{
  res.render('user/aboutus' , {req , user : req.user});
}

exports.contactUs = (req , res)=>{
  if(req.user){
    res.render('user/contactus' , {req , user : req.user});
  }else{
    res.redirect('/auth/login');
  }
}

exports.submitForm = async (req, res) => {
  const userId = req.user._id;
  const { orderId, message } = req.body;

  try {
    const order = await Order.findOne({ _id: orderId, userId });

    if (!order) {
      return res.status(404).send('❌ Order not found or does not belong to you.');
    }

    const complaint = new Complaint({
      userId,
      orderId,
      message,
      timestamp: new Date()
    });

    await complaint.save();
    res.send('✅ Complaint submitted successfully.');
  } catch (err) {
    console.error(err);
    res.status(500).send('🚨 Server error. Please try again later.');
  }
};
