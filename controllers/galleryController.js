const Gallery = require('../models/Gallery');
const path = require('path');
const fs = require('fs');

// @route   GET /api/gallery
// @desc    Get all gallery items
// @access  Public
exports.getGalleryItems = async (req, res) => {
    try {
        const galleryItems = await Gallery.find().sort({ date: -1 });
        res.json(galleryItems);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @route   POST /api/gallery
// @desc    Add a new gallery item
// @access  Private (Admin only)
exports.addGalleryItem = async (req, res) => {
    try {
        // Multer puts the file info on req.file
        if (!req.file) {
            return res.status(400).json({ msg: 'No image uploaded' });
        }

        const { title = '', category = '', description = '' } = req.body;

        const newGalleryItem = new Gallery({
            title,
            category,
            image: `/uploads/${req.file.filename}`, // Store the path to the image
            description
        });

        const galleryItem = await newGalleryItem.save();
        res.json({ msg: 'Gallery item added successfully', galleryItem });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @route   PUT /api/gallery/:id
// @desc    Update a gallery item
// @access  Private (Admin only)
exports.updateGalleryItem = async (req, res) => {
    const { title = '', category = '', description = '' } = req.body;
    let imagePath = '';

    try {
        let galleryItem = await Gallery.findById(req.params.id);

        if (!galleryItem) {
            return res.status(404).json({ msg: 'Gallery item not found' });
        }

        // If a new image is uploaded, delete the old one
        if (req.file) {
            const oldImagePath = path.join(__dirname, '..', 'public', galleryItem.image);
            if (fs.existsSync(oldImagePath)) {
                fs.unlinkSync(oldImagePath);
            }
            imagePath = `/uploads/${req.file.filename}`;
        } else {
            imagePath = galleryItem.image; // Keep the old image if no new one is uploaded
        }

        galleryItem.title = title;
        galleryItem.category = category;
        galleryItem.description = description;
        galleryItem.image = imagePath;

        await galleryItem.save();
        res.json({ msg: 'Gallery item updated successfully', galleryItem });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @route   DELETE /api/gallery/:id
// @desc    Delete a gallery item
// @access  Private (Admin only)
exports.deleteGalleryItem = async (req, res) => {
    try {
        const galleryItem = await Gallery.findById(req.params.id);

        if (!galleryItem) {
            return res.status(404).json({ msg: 'Gallery item not found' });
        }

        // Delete the image file from the server
        const imagePath = path.join(__dirname, '..', 'public', galleryItem.image);
        if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
        }

        await Gallery.deleteOne({ _id: req.params.id });

        res.json({ msg: 'Gallery item removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};