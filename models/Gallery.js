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
        required: true // This will store the Cloudinary URL
    },
    mediaType: {
        type: String,
        enum: ['image', 'video'], // Added to differentiate between images and videos
        required: true
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