const express = require('express')
const router = express.Router();
const authenticateUser = require('../middlewares/auth');
const isAdmin = require('../middlewares/isAdmin')
const upload = require('../middlewares/multer.product');
const { getProducts, getAddProduct, postAddProduct, getEditProduct, postEditProduct, postDeleteProduct } = require('../controllers/adminProducts.controller');

router.get('/products' , authenticateUser, isAdmin, getProducts);
router.get('/products/add' , authenticateUser, isAdmin, getAddProduct);
router.post('/products/add' , authenticateUser, isAdmin, upload.single('image'), postAddProduct);
router.get('/products/edit/:id', authenticateUser, isAdmin, getEditProduct);
router.post('/products/update', authenticateUser, isAdmin, upload.single('image'), postEditProduct);
router.delete('/products/:id', postDeleteProduct);

module.exports = router;
