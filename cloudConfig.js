const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');  //parse the file data from the req.body for proper response from uploaded file data

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
});
//create a store
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'wanderlust_DEV',  //cloud folder name
      allowedFormats: [ "jpeg", "jpg", "png"],
    },
  });

  module.exports = {
    cloudinary,
    storage,
  };