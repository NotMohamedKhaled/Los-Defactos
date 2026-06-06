const multer = require('multer');
const path = require('path');
const cloudinary = require('../config/cloudinary.config');

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const allowed = ['.jpg', '.png', '.jpeg', '.avif', '.webp'];
  if (!allowed.includes(ext)) {
    return cb(new Error('only images are allowed (png, jpg, jpeg, avif, webp)'), false);
  }
  cb(null, true);
};

const MB = 1024 * 1024;
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * MB },
});

async function uploadToCloudinary(req, res, next) {
  if (!req.file) return next();

  try {
    const folder = process.env.CLOUDINARY_FOLDER || 'nti-commerce';
    const result = await cloudinary.uploader.upload(
      `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`,
      {
        folder,
        resource_type: 'image',
      }
    );

    req.file.cloudinaryUrl = result.secure_url;
    req.file.publicId = result.public_id;
    next();
  } catch (error) {
    next(error);
  }
}

function getUploadedImageUrl(file) {
  return file?.cloudinaryUrl || null;
}

module.exports = upload;
module.exports.uploadToCloudinary = uploadToCloudinary;
module.exports.getUploadedImageUrl = getUploadedImageUrl;
