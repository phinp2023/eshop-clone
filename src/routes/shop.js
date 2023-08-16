const express = require('express');

const ShopController = require('../app/controllers/ShopController');
const { upload } = require('../app/middlewares/multer');
const catchAsyncErrors = require('../app/middlewares/catchAsyncErrors');
const { isSeller, isAdmin } = require('../app/middlewares/auth');

const router = express.Router();

router.post('/create-shop', upload.single('file'), ShopController.create);
router.post('/activation', catchAsyncErrors(ShopController.activation));
router.post('/login-shop', catchAsyncErrors(ShopController.login));
router.get('/getSeller', isSeller, catchAsyncErrors(ShopController.get));
router.get('/logout', catchAsyncErrors(ShopController.logout));
router.put(
    '/update-seller-info',
    isSeller,
    catchAsyncErrors(ShopController.updateSellerInfo)
);
router.put(
    '/update-shop-avatar',
    isSeller,
    upload.single('image'),
    catchAsyncErrors(ShopController.updateAvatar)
);
router.get('/get-shop-info/:id', catchAsyncErrors(ShopController.getSellerInfo));
router.get(
    '/admin-all-sellers',
    isSeller,
    isAdmin('Admin'),
    catchAsyncErrors(ShopController.getAllSeller)
);
router.delete(
    '/delete-seller/:id',
    isSeller,
    isAdmin('Admin'),
    catchAsyncErrors(ShopController.deleteSeller)
);
// update seller withdraw methods --- sellers
// delete seller withdraw merthods --- only seller

module.exports = router;