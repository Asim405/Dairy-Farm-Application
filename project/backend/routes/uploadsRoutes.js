const express = require('express');
const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');
const { authenticateToken } = require('../middleware/authMiddleware');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 8 * 1024 * 1024 } });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

router.post('/', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Image file is required' });
    }

    if (
      !process.env.CLOUDINARY_CLOUD_NAME ||
      !process.env.CLOUDINARY_API_KEY ||
      !process.env.CLOUDINARY_API_SECRET
    ) {
      return res.status(500).json({
        error: 'Cloudinary is not configured. Please add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in backend/.env',
      });
    }

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: 'dairy-farm-manager',
          resource_type: 'image',
          transformation: [{ quality: 'auto', fetch_format: 'auto' }],
        },
        (error, uploaded) => {
          if (error) {
            reject(error);
            return;
          }
          resolve(uploaded);
        }
      );

      stream.end(req.file.buffer);
    });

    res.status(201).json({
      url: result.secure_url,
      publicId: result.public_id,
      message: 'Image uploaded successfully',
    });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Image upload failed' });
  }
});

module.exports = router;
