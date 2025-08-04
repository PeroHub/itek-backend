// routes/gallery.js
const express = require('express');
const router = express.Router();
const galleryController = require('../controllers/galleryController');
const authMiddleware = require('../middleware/auth');
// multer is no longer needed because the frontend uploads directly to Cloudinary

// @route   GET /api/gallery
// @desc    Get all gallery items
// @access  Public
router.get('/', galleryController.getGalleryItems);

// @route   POST /api/gallery
// @desc    Add a new gallery item
// @access  Private (Admin only)
router.post('/', authMiddleware, galleryController.addGalleryItem);

// @route   PUT /api/gallery/:id
// @desc    Update a gallery item
// @access  Private (Admin only)
router.put('/:id', authMiddleware, galleryController.updateGalleryItem);

// @route   DELETE /api/gallery/:id
// @desc    Delete a gallery item
// @access  Private (Admin only)
router.delete('/:id', authMiddleware, galleryController.deleteGalleryItem);

module.exports = router;