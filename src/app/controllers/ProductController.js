const fs = require('fs');

const Product = require('../models/product');
const Shop = require('../models/shop');
const ErrorHandler = require('../../utils/ErrorHandler');

class ProductController {
    // [POST] /product/create-product
    async createProduct(req, res, next) {
        try {
            const { shopId } = req.body;
            const shop = await Shop.findById(shopId);

            if (!shop) {
                return next(new ErrorHandler('Shop Id is invalid!', 400));
            }

            const files = req.files;
            const imageUrls = files.map((f) => f.filename);
            const product = { ...req.body };
            product.images = imageUrls;
            product.shop = shopId;

            await Product.create(product);

            res.status(201).json({
                success: true,
                message: 'Product created successfully!',
                product,
            });
        } catch (error) {
            return next(new ErrorHandler(error.message, 500));
        }
    }

    // [GET] /product/get-all-products
    async getProducts(req, res, next) {
        try {
            const products = await Product.find()
                .populate('shop')
                .sort({ createdAt: -1 });

            res.status(200).json({
                success: true,
                products,
            });
        } catch (error) {
            return next(new ErrorHandler(error.message, 500));
        }
    }

    // [GET] /product/get-all-products-shop/:id
    async getProductsByShop(req, res, next) {
        try {
            const { id } = req.params;
            const shop = await Shop.findById(id);

            if (!shop) {
                return next(new ErrorHandler('Shop Id is invalid!', 400));
            }

            const products = await Product.find({ shopId: id })
                .populate('shop')
                .sort({ createdAt: -1 });

            res.status(200).json({
                success: true,
                products,
            });
        } catch (error) {
            return next(new ErrorHandler(error.message, 500));
        }
    }

    // [DELETE] /product/delete-shop-product/:id
    async deleteProductByShop(req, res, next) {
        try {
            const { id } = req.params;
            const productData = await Product.findById(id);

            productData.images.map((image) => {
                const filePath = `src/upload/${image}`;
                fs.unlink(filePath, (err) => {
                    if (err) console.log(err);
                });
            });

            const product = await Product.findByIdAndDelete(id);
            if (!product) {
                return next(
                    new ErrorHandler('Product not found with this id!', 500)
                );
            }

            res.status(200).json({
                success: true,
                message: 'Product deleted successfully!',
            });
        } catch (error) {
            return next(new ErrorHandler(error.message, 500));
        }
    }

    // [GET] /product/admin-all-products
    async getProductsByAdmin(req, res, next) {
        try {
            const products = await Product.find().sort({
                createdAt: -1,
            });
            res.status(201).json({
                success: true,
                products,
            });
        } catch (error) {
            return next(new ErrorHandler(error.message, 500));
        }
    }

    // [PUT] /product/create-new-review
    /* async createReview(req, res, next) {
        try {
            const { user, rating, comment, productId, orderId } = req.body;

            const product = await Product.findById(productId);

            const review = {
                user,
                rating,
                comment,
                productId,
            };

            const isReviewed = product.reviews.find(
                (rev) => rev.user._id === req.user._id
            );

            if (isReviewed) {
                product.reviews.forEach((rev) => {
                    if (rev.user._id === req.user._id) {
                        (rev.rating = rating),
                            (rev.comment = comment),
                            (rev.user = user);
                    }
                });
            } else {
                product.reviews.push(review);
            }

            let avg = 0;

            product.reviews.forEach((rev) => {
                avg += rev.rating;
            });

            product.ratings = avg / product.reviews.length;

            await product.save({ validateBeforeSave: false });

            await Order.findByIdAndUpdate(
                orderId,
                { $set: { 'cart.$[elem].isReviewed': true } },
                { arrayFilters: [{ 'elem._id': productId }], new: true }
            );

            res.status(200).json({
                success: true,
                message: 'Reviewed succesfully!',
            });
        } catch (error) {
            return next(new ErrorHandler(error, 400));
        }
    } */
}

module.exports = new ProductController();
