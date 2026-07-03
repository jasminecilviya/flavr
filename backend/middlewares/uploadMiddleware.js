const { upload } = require('../config/cloudinary');

// ponytail: optional image upload — works with JSON or multipart
const uploadImage = (req, res, next) => {
  const contentType = req.headers['content-type'] || '';
  if (contentType.includes('multipart')) {
    upload.single('image')(req, res, (err) => {
      if (err) {
        console.error('Upload error:', err.message);
        // Don't block the request — proceed without image
        return next();
      }
      next();
    });
  } else {
    next();
  }
};

module.exports = uploadImage;
