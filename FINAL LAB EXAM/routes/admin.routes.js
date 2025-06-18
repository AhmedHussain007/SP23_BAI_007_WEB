const express = require('express');
const router = express.Router();
const authenticateUser = require('../middlewares/auth');
const isAdmin = require('../middlewares/isAdmin')
const { getUsers, getOrders , getAdmin , getComplaints} = require('../controllers/admin.controller');

router.get('/' , authenticateUser , isAdmin , getAdmin)
router.get('/users', authenticateUser, isAdmin, getUsers);
router.get('/orders', authenticateUser, isAdmin, getOrders);
router.get('/complaints',authenticateUser , isAdmin, getComplaints)

module.exports = router;
