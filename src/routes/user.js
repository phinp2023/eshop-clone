const express = require('express');

const UserController = require('../app/controllers/UserController');
const { upload } = require('../app/middlewares/multer');
const catchAsyncErrors = require('../app/middlewares/catchAsyncErrors');
const { isAuthenticated, isAdmin } = require('../app/middlewares/auth');

const router = express.Router();

router.post('/create-user', upload.single('file'), UserController.create);
router.post('/activation', catchAsyncErrors(UserController.activation));
router.post('/login-user', catchAsyncErrors(UserController.login));
router.get('/getuser', isAuthenticated, catchAsyncErrors(UserController.get));
router.get('/logout', catchAsyncErrors(UserController.logout));
router.put(
    '/update-user-info',
    isAuthenticated,
    catchAsyncErrors(UserController.updateUserInfo)
);
router.put(
    '/update-avatar',
    isAuthenticated,
    upload.single('image'),
    catchAsyncErrors(UserController.updateAvatar)
);
router.put(
    '/update-user-addresses',
    isAuthenticated,
    catchAsyncErrors(UserController.updateUserAddress)
);
router.delete(
    '/delete-user-address/:id',
    isAuthenticated,
    catchAsyncErrors(UserController.deleteUserAddress)
);
router.put(
    '/update-user-password',
    isAuthenticated,
    catchAsyncErrors(UserController.updateUserPassword)
);
router.get('/user-info/:id', catchAsyncErrors(UserController.getUserInfo));
router.get(
    '/admin-all-users',
    isAuthenticated,
    isAdmin('Admin'),
    catchAsyncErrors(UserController.getAllUsers)
);
router.delete(
    '/delete-user/:id',
    isAuthenticated,
    isAdmin('Admin'),
    catchAsyncErrors(UserController.deleteUser)
);

module.exports = router;
