const Product = require('../models/Product');
const User = require('../models/User');
const Cart = require('../models/Cart');
const Review = require('../models/Review');
const Order = require('../models/Order');

exports.getProducts = async (req, res) => {
  try {
    const { min_price = 1, max_price = 200, category = 'All', title } = req.query;

    const query = {
      price: { $gte: parseFloat(min_price), $lte: parseFloat(max_price) }
    };

    if (category && category !== 'All') {
      query.category = category;
    }

    if (title) {
      query.title = new RegExp('^' + title, 'i'); // starts with, case-insensitive
    }

    const products = await Product.find(query);
    res.render('products/products', { req, user: req.user, products });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


exports.getProduct = async (req, res) => {
  try {
    const sessionId = req.sessionID;
    const productId = req.params.id;

    let cart = await Cart.findOne({ sessionId });

    if (!cart) {
      cart = new Cart({
        sessionId,
        items: [],
        totalPrice: 0
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).render('404', { message: 'Product not found' });
    }

    const isInCart = cart.items.some(item => item.productId.toString() === productId);

    const reviews = await Review.find({ productId });

    const totalRatings = reviews.length;
    const averageRating = totalRatings ?
      reviews.reduce((sum, r) => sum + r.rating, 0) / totalRatings : 0;

    const ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach(r => ratingCounts[r.rating]++);

    const productReviews = await Review.find({ productId })
      .populate('userId', 'firstName lastName')
      .sort({ createdAt: -1 });
    console.log('Reviews : ' , productReviews)
    res.render('products/productdetails', {
      product,
      user: req.user,
      isInCart,
      averageRating: averageRating,
      totalRatings: totalRatings,
      ratingCounts: ratingCounts,
      reviews:productReviews,
      success: req.query.success,
      error: req.query.error
    });
  } catch (error) {
    console.error(error);
    res.status(500).render('500', { message: 'Server error' });
  }
};

exports.toggleWishlist = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId } = req.params;

    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ message: 'User not found' });

    const index = user.wishlist.indexOf(productId);

    if (index === -1) {
      user.wishlist.push(productId);
    } else {
      user.wishlist.splice(index, 1);
    }

    await user.save();

    res.redirect(req.get('Referer') || '/default-route');

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

exports.addReview = async (req, res) => {
  const { rating, review_text } = req.body;
  const productId = req.params.id;
  const userId = req.user._id;

  try {
    const hasPurchased = await Order.exists({
      userId,
      'items.productId': productId
    });

    if (!hasPurchased) {
      return res.redirect(`/products/${productId}?error=You can only review products you have purchased`);
    }

    const existingReview = await Review.findOne({ productId, userId });
    if (existingReview) {
      return res.redirect(`/products/${productId}?error=You have already submitted a review for this product`);
    }

    const review = new Review({
      productId,
      userId,
      rating,
      comment: review_text
    });

    await review.save();

    res.redirect(`/products/${productId}?success=Review submitted successfully`);
  } catch (err) {
    console.error('Error adding review:', err);
    res.redirect(`/products/${productId}?error=Something went wrong while submitting review`);
  }
};
