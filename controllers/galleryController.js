// controllers/galleryController.js
const Gallery = require('../models/Gallery');
const cloudinary = require('../config/cloudinary'); // Import Cloudinary config
// const path = require('path'); // No longer needed
// const fs = require('fs');     // No longer needed

// Helper function to extract public ID from Cloudinary URL
const getPublicIdFromUrl = (url) => {
    if (!url) return null;
    const parts = url.split('/');
    const filename = parts[parts.length - 1];
    const publicIdWithExtension = filename.split('.')[0];
    // Cloudinary URLs often include a folder structure, e.g., 'my_folder/image_name.jpg'
    // We need to capture that as well.
    // Example: https://res.cloudinary.com/cloud_name/image/upload/v1678888888/folder/public_id.jpg
    const publicIdMatch = url.match(/\/v\d+\/(.+)\.\w+$/);
    if (publicIdMatch && publicIdMatch[1]) {
        return publicIdMatch[1];
    }
    return publicIdWithExtension; // Fallback for simpler URLs
};


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
        if (!req.file) {
            return res.status(400).json({ msg: 'No image uploaded' });
        }

        const { title = '', category = '', description = '' } = req.body;

        // Upload image to Cloudinary
        const result = await cloudinary.uploader.upload(req.file.path || `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`, {
            folder: 'gallery_images', // Optional: specify a folder in Cloudinary
            resource_type: 'image' // Ensure it's treated as an image
        });

        const newGalleryItem = new Gallery({
            title,
            category,
            image: result.secure_url, // Store the Cloudinary URL
            description
        });

        const galleryItem = await newGalleryItem.save();
        res.json({ msg: 'Gallery item added successfully', galleryItem });

    } catch (err) {
        console.error("Error adding gallery item:", err.message);
        res.status(500).send('Server Error');
    }
};

// @route   PUT /api/gallery/:id
// @desc    Update a gallery item
// @access  Private (Admin only)
exports.updateGalleryItem = async (req, res) => {
    const { title = '', category = '', description = '' } = req.body;
    let newImageUrl = '';

    try {
        let galleryItem = await Gallery.findById(req.params.id);

        if (!galleryItem) {
            return res.status(404).json({ msg: 'Gallery item not found' });
        }

        // If a new image is uploaded
        if (req.file) {
            // Delete old image from Cloudinary if it exists
            if (galleryItem.image) {
                const publicId = getPublicIdFromUrl(galleryItem.image);
                if (publicId) {
                    await cloudinary.uploader.destroy(publicId);
                    console.log(`Cloudinary: Deleted old image with public ID: ${publicId}`);
                }
            }

            // Upload new image to Cloudinary
            const result = await cloudinary.uploader.upload(req.file.path || `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`, {
                folder: 'gallery_images',
                resource_type: 'image'
            });
            newImageUrl = result.secure_url;
        } else {
            newImageUrl = galleryItem.image; // Keep the old image if no new one is uploaded
        }

        galleryItem.title = title;
        galleryItem.category = category;
        galleryItem.description = description;
        galleryItem.image = newImageUrl; // Update with new or old URL

        await galleryItem.save();
        res.json({ msg: 'Gallery item updated successfully', galleryItem });

    } catch (err) {
        console.error("Error updating gallery item:", err.message);
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

        // Delete image from Cloudinary
        if (galleryItem.image) {
            const publicId = getPublicIdFromUrl(galleryItem.image);
            if (publicId) {
                await cloudinary.uploader.destroy(publicId);
                console.log(`Cloudinary: Deleted image with public ID: ${publicId}`);
            }
        }

        await Gallery.deleteOne({ _id: galleryItem._id }); // Use galleryItem._id for clarity

        res.json({ msg: 'Gallery item removed' });
    } catch (err) {
        console.error("Error deleting gallery item:", err.message);
        res.status(500).send('Server Error');
    }
};