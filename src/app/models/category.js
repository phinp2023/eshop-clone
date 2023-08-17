const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const categorySchema = new Schema({
    name: {
        type: String,
        required: [true, 'Please enter your category name!'],
    },
    description: {
        type: String,
        required: [true, 'Please enter your category description!'],
    },
    image: {
        type: String,
        required: [true, 'Please enter your category image!'],
    },
});

module.exports = mongoose.model('Category', categorySchema);
