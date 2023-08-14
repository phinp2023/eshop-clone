const jwt = require('jsonwebtoken');

const User = require('../models/user');
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
    isAdmin,
};

// catchAsyncErrors
