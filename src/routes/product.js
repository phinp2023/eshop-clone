const express = require('express');

const ProductController = require('../app/controllers/ProductController');
const { upload } = require('../app/middlewares/multer');
const catchAsyncErrors = require('../app/middlewares/catchAsyncErrors');
const {
    isSeller,
    isAuthenticated,
    isAdmin,
} = require('../app/middlewares/auth');

const router = express.Router();

router.post(
    '/create-product',
    upload.array('images'),
    catchAsyncErrors(ProductController.createProduct)
);
router.get(
    '/get-all-products',
    catchAsyncErrors(ProductController.getProducts)
);
router.get(
    '/get-all-products-shop/:id',
    catchAsyncErrors(ProductController.getProductsByShop)
);
router.delete(
    '/delete-shop-product/:id',
    isSeller,
    catchAsyncErrors(ProductController.deleteProductByShop)
);
router.get(
    '/admin-all-products',
    isAuthenticated,
    isAdmin('Admin'),
    catchAsyncErrors(ProductController.getProductsByAdmin)
);
/* router.put(
    '/create-new-review',
    isAuthenticated,
    catchAsyncErrors(ProductController.createReview)
); */
module.exports = router;
