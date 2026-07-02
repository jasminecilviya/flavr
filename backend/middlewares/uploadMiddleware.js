const { upload } = require('../config/cloudinary');

// Single image upload — field name "image"
const uploadImage = upload.single('image');

module.exports = uploadImage;
