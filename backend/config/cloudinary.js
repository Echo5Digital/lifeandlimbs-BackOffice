const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const phone = (req.body.phone || 'unknown').replace(/\D/g, '');
    const fieldMap = {
      patientPhoto: 'patientPhoto',
      housePhoto:   'housePhoto',
      rationCard:   'rationCard',
      aadhaarCard:  'aadhaarCard',
      medicalDocs:  'medicalDocs',
    };
    const docType = fieldMap[file.fieldname] || file.fieldname;
    return {
      folder:          `lifeandlimbs/patients/${phone}/${docType}`,
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      transformation:  [{ quality: 'auto', fetch_format: 'auto' }],
    };
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPG, PNG, WEBP images are allowed'), false);
    }
  },
});

module.exports = { cloudinary, upload };
