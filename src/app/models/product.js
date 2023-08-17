const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productSchema = new Schema(
    {
        name: {
            type: String,
            required: [true, 'Please enter your product name!'],
        },
        description: {
            type: String,
            required: [true, 'Please enter your product description!'],
        },
        category: {
            // type: Schema.Types.ObjectId,
            // ref: 'Category',
            type: String,
            required: [true, 'Please enter your product category!'],
        },
        tags: {
            type: String,
        },
        originalPrice: {
            type: String,
        },
        discountPrice: {
            type: Number,
            required: [true, 'Please enter your product price!'],
        },
        stock: {
            type: Number,
            required: [true, 'Please enter your product stock!'],
            min: 0,
            max: 255,
        },
        images: [
            {
                type: String,
            },
        ],
        reviews: [
            {
                user: {
                    type: Object,
                },
                rating: {
                    type: Number,
                },
                comment: {
                    type: String,
                },
                productId: {
                    type: String,
                },
                createdAt: {
                    type: Date,
                    default: Date.now(),
                },
            },
        ],
        ratings: {
            type: Number,
        },
        shopId: {
            type: String,
            required: true,
        },
        shop: {
            type: Schema.Types.ObjectId,
            ref: 'Shop',
        },
        sold_out: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Product', productSchema);
