const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema(
    {
        name: {
            type: String,
            required: [true, 'Please enter your name!'],
        },
        email: {
            type: String,
            required: [true, 'Please enter your email!'],
        },
        password: {
            type: String,
            required: [true, 'Please enter your password!'],
            minLength: [4, 'Password should be greater than 4 characters!'],
            select: false,
        },
        phoneNumber: String,
        address: {
            country: String,
            city: String,
            address1: String,
            address2: String,
            zipCode: Number,
            addressType: String,
        },
        role: {
            type: 'String',
            default: 'user',
        },
        avatar: {
            type: String,
            required: true,
        },
        resetPasswordToken: String,
        resetPasswordTime: String,
    },
    {
        timestamps: true,
    }
);

// Hash password
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    this.password = await bcrypt.hash(this.password, 10);
});

// Get jwt token
userSchema.methods.getJwtToken = async function () {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET_KEY, {
        expiresIn: process.env.JWT_EXPIRES,
    });
};

// Compare password
userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
