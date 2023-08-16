const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const shopSchema = new Schema(
    {
        name: {
            type: String,
            required: [true, 'Please enter your shop name!'],
        },
        email: {
            type: String,
            required: [true, 'Please enter your shop email address!'],
        },
        password: {
            type: String,
            required: [true, 'Please enter your password!'],
            minLength: [6, 'Password should be greater than 6 characters!'],
            select: false,
        },
        description: {
            type: String,
        },
        address: {
            type: String,
            required: true,
        },
        phoneNumber: {
            type: Number,
            required: true,
        },
        zipCode: {
            type: Number,
            required: true,
        },
        avatar: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            default: 'Seller',
        },
        withdrawMethod: {
            //
            type: Object,
        },
        availableBalance: {
            //
            type: Number,
            default: 0,
        },
        transections: [
            //
            {
                amount: {
                    type: Number,
                    required: true,
                },
                status: {
                    type: String,
                    default: 'Processing',
                },
                createdAt: {
                    type: Date,
                    default: Date.now(),
                },
                updatedAt: {
                    type: Date,
                },
            },
        ],
        resetPasswordToken: String,
        resetPasswordTime: Date,
    },
    {
        timestamps: true,
    }
);

// Hash password
shopSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }

    this.password = await bcrypt.hash(this.password, 10);
});

// Get jwt token
shopSchema.methods.getJwtToken = async function () {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET_KEY, {
        expiresIn: process.env.JWT_EXPIRES,
    });
};

// Compare password
shopSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Shop', shopSchema);
