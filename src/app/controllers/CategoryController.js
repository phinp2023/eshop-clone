const fs = require('fs');
const path = require('path');

const ErrorHandler = require('../../utils/ErrorHandler');
const Category = require('../models/category');

class CategoryController {
    // [GET] /category
    async getCategories(req, res, next) {
        try {
            const categories = await Category.find();

            if (!categories) {
                return next(new ErrorHandler('Categories not found!'), 400);
            }

            res.status(200).json({
                success: true,
                categories,
            });
        } catch (error) {
            return next(new ErrorHandler(error.message, 500));
        }
    }

    // [GET] /category/:id
    async getCategory(req, res, next) {
        try {
            const { id } = req.params;

            const category = await Category.findById(id);

            if (!category) {
                return next(new ErrorHandler('Category not found!'), 400);
            }

            res.status(200).json({
                success: true,
                category,
            });
        } catch (error) {
            return next(new ErrorHandler(error.message, 500));
        }
    }

    // [POST] /category
    async createCategory(req, res, next) {
        try {
            const { name, description } = req.body;

            if (!name || !description) {
                return next(
                    new ErrorHandler('Please provide the all fields!'),
                    400
                );
            }

            const existsCategory = await Category.findOne({ name });
            const filename = req.file.filename;

            if (existsCategory) {
                const filePath = `src/uploads/${filename}`;
                fs.unlink(filePath, (err) => {
                    if (err) {
                        console.log(err);
                        res.status(500).json({
                            message: 'Error deleting file',
                        });
                    }
                });
                return next(new ErrorHandler('Category already exists!'), 400);
            }

            const fileUrl = path.join(filename);
            const category = new Category({
                name,
                description,
                image: fileUrl,
            });

            await category.save();

            res.status(201).json({
                success: true,
                message: 'The category created successfully!',
                category,
            });
        } catch (error) {
            return next(new ErrorHandler(error.message, 500));
        }
    }

    // [DELETE] /category/:id
    async deleteCategory(req, res, next) {
        try {
            const { id } = req.params;
            const category = await Category.findById(id);

            if (!category) {
                return next(
                    new ErrorHandler(
                        'Category is not available with this id',
                        400
                    )
                );
            }

            await Category.findByIdAndRemove(id);

            res.status(201).json({
                success: true,
                message: 'The category deleted successfully!',
            });
        } catch (error) {
            return next(new ErrorHandler(error.message, 500));
        }
    }
}

module.exports = new CategoryController();
