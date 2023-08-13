const express = require('express');

const UserController = require('../app/controllers/UserController');
const { upload } = require('../app/middlewares/multer');
const catchAsyncErrors = require('../app/middlewares/catchAsyncErrors');
const { isAuthenticated } = require('../app/middlewares/auth');

const router = express.Router();

router.post('/create-user', upload.single('file'), UserController.create);
router.post('/activation', catchAsyncErrors(UserController.activation));
router.post('/login-user', catchAsyncErrors(UserController.login));
router.get('/getuser', isAuthenticated, catchAsyncErrors(UserController.get));
router.get('/logout', catchAsyncErrors(UserController.logout));

module.exports = router;
