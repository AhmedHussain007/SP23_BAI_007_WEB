const express = require('express')
const router = express.Router();
const authenticateUser = require('../middlewares/auth');
const isAuthenticated = require('../middlewares/isAuthenticated');
const uploadUserPicture = require('../middlewares/multer.userProfile');
const {getProfile, getOrder, updateBio, updatePicture, addGenre, AboutUs , contactUs, submitForm} = require('../controllers/user.controller')

router.get('/profile', authenticateUser, getProfile);

router.get('/my-orders' ,  authenticateUser, isAuthenticated, getOrder)

router.post('/update-bio', authenticateUser, updateBio);

router.post('/update-picture', authenticateUser, uploadUserPicture.single('profile_picture'), updatePicture);

router.post('/add-genre', authenticateUser, addGenre);

router.get('/about-us' , authenticateUser, AboutUs);

router.get('/contact-us' , authenticateUser , contactUs);
router.post('/submit-complaint' , authenticateUser , submitForm);

module.exports = router;
