// controllers/galleryController.js
const Gallery = require('../models/Gallery');
const cloudinary = require('../config/cloudinary');

// Helper function to extract public ID from Cloudinary URL
const getPublicIdFromUrl = (url, resourceType) => {
    if (!url) return null;
    const regex = new RegExp(`v\\d+\/(.+)\\.${resourceType === 'video' ? '(mp4|mov|avi|flv|webm)' : '(jpg|jpeg|png|gif)'}`);
    const match = url.match(regex);
    if (match && match[1]) {
        return match[1];
    }
    return null; // Return null if public ID cannot be extracted
};

exports.getGalleryItems = async (req, res) => {
    try {
        const galleryItems = await Gallery.find().sort({ date: -1 });
        res.json(galleryItems);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};


exports.addGalleryItem = async (req, res) => {
    // The frontend now sends the Cloudinary URL directly in the request body
    const { title, category, description, image, mediaType } = req.body;
    console.log("Adding gallery item with data:", { title, category, description, image, mediaType });
    // Basic validation to ensure all required fields are present
    if (!image || !mediaType) {
        return res.status(400).json({ msg: 'Image URL and media type are required.' });
    }

    try {
        const newGalleryItem = new Gallery({
            title: title || '',
            category: category || '',
            description: description || '',
            image, 
            mediaType,
        });

        const galleryItem = await newGalleryItem.save();
        res.json({ msg: 'Gallery item added successfully', galleryItem });

    } catch (err) {
        console.error("Error adding gallery item:", err.message);
        res.status(500).send('Server Error');
    }
};


exports.updateGalleryItem = async (req, res) => {
    const { title, category, description, image, mediaType } = req.body;
    
    try {
        let galleryItem = await Gallery.findById(req.params.id);

        if (!galleryItem) {
            return res.status(404).json({ msg: 'Gallery item not found' });
        }
        
        // Check if a new image URL was sent (meaning a new file was uploaded on the frontend)
        if (image && image !== galleryItem.image) {
            // A new file was uploaded, so delete the old one from Cloudinary
            if (galleryItem.image) {
                const publicId = getPublicIdFromUrl(galleryItem.image, galleryItem.mediaType);
                if (publicId) {
                    // Use resource_type to correctly target the asset
                    await cloudinary.uploader.destroy(publicId, { resource_type: galleryItem.mediaType });
                    console.log(`Cloudinary: Deleted old media with public ID: ${publicId}`);
                }
            }
            galleryItem.image = image; // Update to the new URL
            galleryItem.mediaType = mediaType; // Update to the new media type
        }

        // Update other fields
        galleryItem.title = title || '';
        galleryItem.category = category || '';
        galleryItem.description = description || '';

        await galleryItem.save();
        res.json({ msg: 'Gallery item updated successfully', galleryItem });

    } catch (err) {
        console.error("Error updating gallery item:", err.message);
        res.status(500).send('Server Error');
    }
};


exports.deleteGalleryItem = async (req, res) => {
    try {
        const galleryItem = await Gallery.findById(req.params.id);

        if (!galleryItem) {
            return res.status(404).json({ msg: 'Gallery item not found' });
        }

        // Delete media from Cloudinary
        if (galleryItem.image) {
            const publicId = getPublicIdFromUrl(galleryItem.image, galleryItem.mediaType);
            if (publicId) {
                // Use resource_type to correctly target the asset
                await cloudinary.uploader.destroy(publicId, { resource_type: galleryItem.mediaType });
                console.log(`Cloudinary: Deleted media with public ID: ${publicId}`);
            }
        }

        await Gallery.deleteOne({ _id: galleryItem._id });

        res.json({ msg: 'Gallery item removed' });
    } catch (err) {
        console.error("Error deleting gallery item:", err.message);
        res.status(500).send('Server Error');
    }
};