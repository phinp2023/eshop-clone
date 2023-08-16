const jwt = require('jsonwebtoken');

const User = require('../models/user');
const Shop = require('../models/shop');
const catchAsyncErrors = require('./catchAsyncErrors');
const ErrorHandler = require('../../utils/ErrorHandler');

const isAuthenticated = catchAsyncErrors(async (req, res, next) => {
    const { token } = req.cookies;

    if (!token) {
        return next(new ErrorHandler('Please login to continue!', 400));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    req.user = await User.findById(decoded.id);

    next();
});

const isSeller = catchAsyncErrors(async (req, res, next) => {
    const { seller_token } = req.cookies;

    if (!seller_token) {
        return next(new ErrorHandler('Please login to continue!', 400));
    }

    const decoded = jwt.verify(seller_token, process.env.JWT_SECRET_KEY);

    req.seller = await Shop.findById(decoded.id);

    next();
});

const isAdmin = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(
                new ErrorHandler(
                    `${req.user.role} can not access this resources!`
                )
            );
        }
        next();
    };
};

module.exports = {
    isAuthenticated,
    isSeller,
    isAdmin,
};

// catchAsyncErrors
