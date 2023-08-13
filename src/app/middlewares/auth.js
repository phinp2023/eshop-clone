const jwt = require('jsonwebtoken');

const User = require('../models/user');
const catchAsyncErrors = require('./catchAsyncErrors');
const ErrorHandle = require('../../utils/ErrorHandler');

const isAuthenticated = catchAsyncErrors(async (req, res, next) => {
    const { token } = req.cookies;

    if (!token) {
        return next(new ErrorHandle('Please login to continue!', 400));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    req.user = await User.findById(decoded.id);

    next();
});

module.exports = {
    isAuthenticated,
};

// catchAsyncErrors
