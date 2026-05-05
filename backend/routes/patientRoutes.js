const express = require('express');
const router  = express.Router();
const { body, validationResult } = require('express-validator');
const { upload }                 = require('../config/cloudinary');
const {
  registerPatient,
  getPatients,
  getPatientById,
  updatePatientStatus,
} = require('../controllers/patientController');
const { protect } = require('../middleware/auth');

// Validation rules for registration
const registerValidation = [
  body('fullName').notEmpty().withMessage('Full name is required / പൂർണ്ണ നാമം ആവശ്യമാണ്'),
  body('age').isInt({ min: 1, max: 120 }).withMessage('Valid age is required / സാധുവായ പ്രായം ആവശ്യമാണ്'),
  body('gender').isIn(['male', 'female', 'other']).withMessage('Gender is required / ലിംഗം ആവശ്യമാണ്'),
  body('phone').notEmpty().withMessage('Phone number is required / ഫോൺ നമ്പർ ആവശ്യമാണ്'),
  body('district').notEmpty().withMessage('District is required / ജില്ല ആവശ്യമാണ്'),
  body('injuryDesc').notEmpty().withMessage('Injury description is required / പരിക്കിന്റെ വിവരണം ആവശ്യമാണ്'),
];

// Multer fields for file uploads
const uploadFields = upload.fields([
  { name: 'patientPhoto', maxCount: 1 },
  { name: 'housePhoto',   maxCount: 1 },
  { name: 'rationCard',   maxCount: 1 },
  { name: 'aadhaarCard',  maxCount: 1 },
  { name: 'medicalDocs',  maxCount: 1 },
]);

// Public
router.post(
  '/register',
  uploadFields,
  registerValidation,
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    next();
  },
  registerPatient
);

// Admin protected
router.get('/admin/patients',        protect, getPatients);
router.get('/admin/patients/:id',    protect, getPatientById);
router.patch('/admin/patients/:id/status', protect, updatePatientStatus);

module.exports = router;
