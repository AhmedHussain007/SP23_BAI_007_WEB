const express = require('express');
const router = express.Router();
const authenticateUser = require('../middlewares/auth');
const {getCartPage , addProduct , updateCart , placeOrder , checkOut , removeProduct} = require('../controllers/cart.controller')

const isAuthenticated = (req , res , next) =>{
  if(req.user !== null){
    next();
  }else{
    res.redirect('/auth/login')
  }
}

router.get('/', authenticateUser, isAuthenticated, getCartPage);
router.post('/add', authenticateUser, isAuthenticated, addProduct);
router.post('/remove/:productId', isAuthenticated, removeProduct);
router.post('/update-cart', authenticateUser, isAuthenticated, updateCart);
router.get('/place-order', authenticateUser, isAuthenticated, placeOrder);
router.post('/checkout', authenticateUser, isAuthenticated, checkOut);


module.exports = router;
