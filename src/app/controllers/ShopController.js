const fs = require('fs');
const jwt = require('jsonwebtoken');

const Shop = require('../models/shop');
const path = require('path');
const ErrorHandler = require('../../utils/ErrorHandler');
const { createActivationToken, sendToken } = require('../../utils/Token');
const { sendMail } = require('../../utils/Mail');

class ShopController {
    // [POST] /shop/create-shop
    async create(req, res, next) {
        try {
            const { name, email, password, address, phoneNumber, zipCode } =
                req.body;
            const sellerEmail = await Shop.findOne({ email });
            const filename = req.file.filename;

            if (sellerEmail) {
                const filePath = `src/uploads/${filename}`;
                fs.unlink(filePath, (err) => {
                    if (err) {
                        console.log(err);
                        res.status(500).json({
                            message: 'Error deleting file',
                        });
                    }
                });
                return next(new ErrorHandler('Seller already exists', 400));
            }

            const fileUrl = path.join(filename);
            const seller = {
                name,
                email,
                password,
                avatar: fileUrl,
                address,
                phoneNumber,
                zipCode,
            };

            const activationToken = createActivationToken(seller);

            const activationUrl = `http://localhost:3000/seller/activation/${activationToken}`;

            try {
                await sendMail({
                    email: seller.email,
                    subject: 'Activate your shop!',
                    message: `Hello ${seller.name}, please click on this link to activate your shop: ${activationUrl}!`,
                });

                res.status(201).json({
                    success: true,
                    message: `Please check your email:- ${seller.email} to activate your shop!`,
                });
            } catch (error) {
                return next(new ErrorHandler(error.message, 500));
            }
        } catch (error) {
            return next(new ErrorHandler(error.message, 400));
        }
    }

    // [POST] /shop/activation
    async activation(req, res, next) {
        try {
            const { activation_token } = req.body;

            const newSeller = jwt.verify(
                activation_token,
                process.env.ACTIVATION_SECRET
            );
            if (!newSeller) {
                return next(new ErrorHandler('Invalid token!', 400));
            }

            const { email } = newSeller;
            let seller = await Shop.findOne({ email });
            if (seller) {
                return next(new ErrorHandler('Seller already exists', 400));
            }
            seller = await Shop.create(newSeller);

            sendToken(seller, 201, res, false);
        } catch (error) {
            return next(new ErrorHandler(error.message, 500));
        }
    }

    // [POST] /shop/login-shop
    async login(req, res, next) {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return next(
                    new ErrorHandler('Please provide the all fields!', 400)
                );
            }

            const seller = await Shop.findOne({ email }).select('+password');

            if (!seller) {
                return next(new ErrorHandler("Seller doesn't exists!", 400));
            }

            const isPasswordValid = await seller.comparePassword(password);

            if (!isPasswordValid) {
                return next(
                    new ErrorHandler(
                        'Please provide the correct information!',
                        400
                    )
                );
            }

            sendToken(seller, 201, res, false);
        } catch (error) {
            return next(new ErrorHandler(error.message, 500));
        }
    }

    // [GET] /shop/getseller
    async get(req, res, next) {
        try {
            const seller = await Shop.findById(req.seller.id);

            if (!seller) {
                return next(new ErrorHandler("Seller doesn't exists!", 400));
            }

            res.status(200).json({
                success: true,
                seller,
            });
        } catch (error) {
            return next(new ErrorHandler(error.message, 500));
        }
    }

    // [GET] /shop/logout
    async logout(req, res, next) {
        try {
            res.cookie('seller_token', null, {
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

    // [PUT] /shop/update-seller-info

    async updateSellerInfo(req, res, next) {
        try {
            const { name, description, address, phoneNumber, zipCode } = req.body;

            const seller = await Shop.findOne(req.seller._id).select('+password');

            if (!seller) {
                return next(new ErrorHandler('Seller not found!', 400));
            }

            seller.name = name;
            seller.description = description;
            seller.address = address;
            seller.phoneNumber = phoneNumber;
            seller.zipCode = zipCode;

            await seller.save();

            res.status(201).json({
                success: true,
                message: 'Update information successful!',
                seller,
            });
        } catch (error) {
            return next(new ErrorHandler(error.message, 500));
        }
    }

    // [PUT] /shop/update-shop-avatar

    async updateAvatar(req, res, next) {
        try {
            const existsSeller = await Shop.findById(req.seller._id);

            const existAvatarPath = `src/uploads/${existsSeller.avatar}`;

            fs.unlinkSync(existAvatarPath);

            const fileUrl = path.join(req.file.filename);

            const seller = await Shop.findByIdAndUpdate(req.seller._id, {
                avatar: fileUrl,
            });

            res.status(200).json({
                success: true,
                message: 'Update avatar successful!',
                seller,
            });
        } catch (error) {
            return next(new ErrorHandler(error.message, 500));
        }
    }

    // [GET] /shop/get-shop-info/:id

    async getSellerInfo(req, res, next) {
        try {
            const seller = await Shop.findById(req.params.id);

            res.status(201).json({
                success: true,
                seller,
            });
        } catch (error) {
            return next(new ErrorHandler(error.message, 500));
        }
    }

    // [GET] /shop/admin-all-seller

    async getAllSeller(req, res, next) {
        try {
            const sellers = await Shop.find().sort({ createdAt: -1 });

            res.status(201).json({
                success: true,
                sellers,
            });
        } catch (error) {
            return next(new ErrorHandler(error.message, 500));
        }
    }

    // [DELETE] /shop/delete-seller/:id
    async deleteSeller(req, res, next) {
        try {
            const seller = await Shop.findById(req.params.id);

            if (!seller) {
                return next(
                    new ErrorHandler('Seller is not available with this id', 400)
                );
            }

            await Shop.findByIdAndDelete(req.params.id);

            res.status(201).json({
                success: true,
                message: 'Seller deleted successfully!',
            });
        } catch (error) {
            return next(new ErrorHandler(error.message, 500));
        }
    }
}

module.exports = new ShopController();
