const fs = require('fs');
const jwt = require('jsonwebtoken');
const path = require('path');

const User = require('../models/user');
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
                    message: `Hello ${user.name}, please click on this link to activate your account: ${activationUrl}!`,
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

            res.status(200).json({
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
            const { email, password, phoneNumber, name } = req.body;

            const user = await User.findOne({ email }).select('+password');

            if (!user) {
                return next(new ErrorHandler('User not found!', 400));
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

            user.name = name;
            user.email = email;
            user.phoneNumber = phoneNumber;

            await user.save();

            res.status(201).json({
                success: true,
                message: 'Update information successful!',
                user,
            });
        } catch (error) {
            return next(new ErrorHandler(error.message, 500));
        }
    }

    // [PUT] /user/update-avatar

    async updateAvatar(req, res, next) {
        try {
            const existsUser = await User.findById(req.user.id);

            const existAvatarPath = `src/uploads/${existsUser.avatar}`;

            fs.unlinkSync(existAvatarPath);

            const fileUrl = path.join(req.file.filename);

            const user = await User.findByIdAndUpdate(req.user.id, {
                avatar: fileUrl,
            });

            res.status(200).json({
                success: true,
                message: 'Update avatar successful!',
                user,
            });
        } catch (error) {
            return next(new ErrorHandler(error.message, 500));
        }
    }

    // [PUT] /user/update-user-addresses

    async updateUserAddress(req, res, next) {
        try {
            const user = await User.findById(req.user.id);

            const sameTypeAddress = user.addresses.find(
                (address) => address.addressType === req.body.addressType
            );

            if (sameTypeAddress) {
                return next(
                    new ErrorHandler(
                        `${req.body.addressType} address already exists`
                    )
                );
            }

            const existAddress = user.addresses.find(
                (address) => address._id === req.body._id
            );

            if (existAddress) {
                Object.assign(existAddress, req.body);
            } else {
                user.addresses.push(req.body);
            }

            await user.save();

            res.status(200).json({
                success: true,
                message: 'Update information successful!',
                user,
            });
        } catch (error) {
            return next(new ErrorHandler(error.message, 500));
        }
    }

    // [DELETE] /user/delete-user-address/:id

    async deleteUserAddress(req, res, next) {
        try {
            const { _id: userId } = req.user;
            const { id: addressId } = req.params;

            const user = await User.findOneAndUpdate(
                { _id: userId },
                {
                    $pull: {
                        addresses: { _id: addressId },
                    },
                },
                {
                    new: true,
                }
            );

            res.status(200).json({
                success: true,
                message: 'Delete address successful!',
                user,
            });
        } catch (error) {
            return next(new ErrorHandler(error.message, 500));
        }
    }

    // [PUT] /user/update-user-password

    async updateUserPassword(req, res, next) {
        try {
            const { oldPassword, newPassword, confirmPassword } = req.body;

            if (newPassword !== confirmPassword) {
                return next(
                    new ErrorHandler(
                        `Password doesn't matched with each other!`,
                        400
                    )
                );
            }

            const user = await User.findById(req.user._id).select('+password');

            const isPasswordMatched = await user.comparePassword(oldPassword);

            if (!isPasswordMatched) {
                return next(
                    new ErrorHandler('Old password is incorrect!', 400)
                );
            }

            user.password = newPassword;

            await user.save();

            res.status(200).json({
                success: true,
                message: 'Password updated successfully!',
            });
        } catch (error) {
            return next(new ErrorHandler(error.message, 500));
        }
    }

    // [GET] /user/user-info/:id

    async getUserInfo(req, res, next) {
        try {
            const user = await User.findById(req.params.id);

            res.status(201).json({
                success: true,
                user,
            });
        } catch (error) {
            return next(new ErrorHandler(error.message, 500));
        }
    }

    // [GET] /user/admin-all-users

    async getAllUsers(req, res, next) {
        try {
            const users = await User.find().sort({ createdAt: -1 });

            res.status(201).json({
                success: true,
                users,
            });
        } catch (error) {
            return next(new ErrorHandler(error.message, 500));
        }
    }

    // [DELETE] /user/delete-user/:id
    async deleteUser(req, res, next) {
        try {
            const user = await User.findById(req.params.id);

            if (!user) {
                return next(
                    new ErrorHandler('User is not available with this id', 400)
                );
            }

            await User.findByIdAndDelete(req.params.id);

            res.status(201).json({
                success: true,
                message: 'User deleted successfully!',
            });
        } catch (error) {
            return next(new ErrorHandler(error.message, 500));
        }
    }
}

module.exports = new UserController();
