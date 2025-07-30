const express = require('express');
const router = express.Router();
const galleryController = require('../controllers/galleryController');
const authMiddleware = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Set up multer for file uploads
const storage = multer.diskStorage({
    destination: './public/uploads/', // Images will be saved here
    filename: function(req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: function(req, file, cb) {
        checkFileType(file, cb);
    }
}).single('image'); // 'image' is the field name for the file in the form

// Check file type
function checkFileType(file, cb) {
    // Allowed ext
    const filetypes = /jpeg|jpg|png|gif/;
    // Check ext
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    // Check mime
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb('Error: Images Only!');
    }
}


// @route   GET /api/gallery
// @desc    Get all gallery items
// @access  Public
router.get('/', galleryController.getGalleryItems);

// @route   POST /api/gallery
// @desc    Add a new gallery item
// @access  Private (Admin only)
router.post('/', authMiddleware, (req, res) => {
    upload(req, res, (err) => {
        if (err) {
            return res.status(400).json({ msg: err });
        }
        galleryController.addGalleryItem(req, res);
    });
});

// @route   PUT /api/gallery/:id
// @desc    Update a gallery item
// @access  Private (Admin only)
router.put('/:id', authMiddleware, (req, res) => {
    upload(req, res, (err) => {
        if (err) {
            return res.status(400).json({ msg: err });
        }
        galleryController.updateGalleryItem(req, res);
    });
});


// @route   DELETE /api/gallery/:id
// @desc    Delete a gallery item
// @access  Private (Admin only)
router.delete('/:id', authMiddleware, galleryController.deleteGalleryItem);

module.exports = router;