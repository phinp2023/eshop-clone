const fs = require('fs');
const jwt = require('jsonwebtoken');

const User = require('../models/user');
const path = require('path');
const ErrorHandler = require('../../utils/ErrorHandler');
const { createActivationToken, sendToken } = require('../../utils/Token');
const { sendMail } = require('../../utils/Mail');

class UserController {
    // [POST] /user/create-user
    async create(req, res, next) {
        try {
            const { name, email, password } = req.body;
            const userEmail = await User.findOne({ email });
            const filename = req.file.filename;

            if (userEmail) {
                const filePath = `src/uploads/${filename}`;
                fs.unlink(filePath, (err) => {
                    if (err) {
                        console.log(err);
                        res.status(500).json({
                            message: 'Error deleting file',
                        });
                    }
                });
                return next(new ErrorHandler('User already exists', 400));
            }

            const fileUrl = path.join(filename);
            const user = {
                name,
                email,
                password,
                avatar: fileUrl,
            };

            const activationToken = createActivationToken(user);

            const activationUrl = `http://localhost:3000/activation/${activationToken}`;

            try {
                await sendMail({
                    email: user.email,
                    subject: 'Activate your account!',
                    message: `Hello ${user.name}, please click on the link to activate your account: ${activationUrl}!`,
                });

                res.status(201).json({
                    success: true,
                    message: `Please check your email:- ${user.email} to activate your account!`,
                });
            } catch (error) {
                return next(new ErrorHandler(error.message, 500));
            }
        } catch (error) {
            return next(new ErrorHandler(error.message, 400));
        }
    }

    // [POST] /user/activation
    async activation(req, res, next) {
        try {
            const { activation_token } = req.body;

            const newUser = jwt.verify(
                activation_token,
                process.env.ACTIVATION_SECRET
            );
            if (!newUser) {
                return next(new ErrorHandler('Invalid token!', 400));
            }

            const { email } = newUser;
            let user = await User.findOne({ email });
            if (user) {
                return next(new ErrorHandler('User already exists', 400));
            }
            user = await User.create(newUser);

            sendToken(user, 201, res);
        } catch (error) {
            return next(new ErrorHandler(error.message, 500));
        }
    }

    // [POST] /user/login-user
    async login(req, res, next) {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return next(
                    new ErrorHandler('Please provide the all fields!', 400)
                );
            }

            const user = await User.findOne({ email }).select('+password');

            if (!user) {
                return next(new ErrorHandler("User doesn't exists!", 400));
            }

            const isPasswordValid = await user.comparePassword(password);

            if (!isPasswordValid) {
                return next(
                    new ErrorHandler(
                        'Please provide the correct information!',
                        400
                    )
                );
            }

            sendToken(user, 201, res);
        } catch (error) {
            return next(new ErrorHandler(error.message, 500));
        }
    }

    // [GET] /user/getuser
    async get(req, res, next) {
        try {
            const user = await User.findById(req.user.id);

            if (!user) {
                return next(new ErrorHandler("User doesn't exists!", 400));
            }

            res.status(201).json({
                success: true,
                user,
            });
        } catch (error) {
            return next(new ErrorHandler(error.message, 500));
        }
    }

    // [GET] /user/logout
    async logout(req, res, next) {
        try {
            res.cookie('token', null, {
                expires: new Date(Date.now()),
                httpOnly: true,
            });
            res.status(201).json({
                success: true,
                message: 'Log out successful!',
            });
        } catch (error) {
            return next(new ErrorHandler(error.message, 500));
        }
    }

    // [PUT] /user/update-user-info

    async updateUserInfo(req, res, next) {
        try {
            res.json({
                success: true,
                message: 'Update user successful!',
            });
        } catch (error) {
            return next(new ErrorHandler(error.message, 500));
        }
    }

    // [PUT] /user/update-avatar

    // [PUT] /user/update-user-addresses

    // [DELETE] /user/delete-user-address/:id

    // [PUT] /user/update-user-password

    // [GET] /user/user-info/:id

    // [GET] /user/admin-all-users

    // [DELETE] /user/delete-user/:id
}

module.exports = new UserController();
