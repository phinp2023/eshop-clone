const express = require('express');

const CategoryController = require('../app/controllers/CategoryController');
const { upload } = require('../app/middlewares/multer');
const catchAsyncErrors = require('../app/middlewares/catchAsyncErrors');
const { isSeller } = require('../app/middlewares/auth');

const router = express.Router();

router.get('/', catchAsyncErrors(CategoryController.getCategories));
router.get('/:id', catchAsyncErrors(CategoryController.getCategory));
router.post(
    '/',
    upload.single('image'),
    catchAsyncErrors(CategoryController.createCategory)
);
router.delete(
    '/:id',
    catchAsyncErrors(CategoryController.deleteCategory)
);

module.exports = router;
