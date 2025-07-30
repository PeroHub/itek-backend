// models/Gallery.js
const mongoose = require('mongoose');

const GallerySchema = new mongoose.Schema({
    title: {
        type: String,
        default: ''
    },
    category: {
        type: String,
        default: ''
    },
    image: {
        type: String,
        required: true // Will now store Cloudinary URL
    },
    description: {
        type: String,
        default: ''
    },
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Gallery', GallerySchema);