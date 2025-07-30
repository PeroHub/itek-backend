const mongoose = require('mongoose');

const GallerySchema = new mongoose.Schema({
    title: {
        type: String,
        default: '' // Optional, defaults to empty string
    },
    category: {
        type: String,
        default: '' // Optional, defaults to empty string
    },
    image: {
        type: String,
        required: true // Mandatory, path to the image
    },
    description: {
        type: String,
        default: '' // Optional, defaults to empty string
    },
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Gallery', GallerySchema);