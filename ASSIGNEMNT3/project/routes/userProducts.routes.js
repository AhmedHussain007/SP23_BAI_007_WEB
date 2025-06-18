const express = require('express')
const router = express.Router();
const authenticateUser = require('../middlewares/auth');
const {getProducts , getProduct , toggleWishlist , addReview} = require('../controllers/userProducts.controller')

router.get('/', authenticateUser , getProducts);
router.get('/:id', authenticateUser, getProduct);
router.post('/review/:id' , authenticateUser , addReview);
router.post('/wishlist/:productId' , authenticateUser , toggleWishlist);

module.exports = router;
