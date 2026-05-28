const express = require('express');
const router  = express.Router();
const https   = require('https');
const { body, validationResult } = require('express-validator');
const { upload }                 = require('../config/cloudinary');
const {
  registerPatient,
  getPatients,
  getPatientById,
  updatePatientStatus,
  updatePatientDetails,
  deletePatient,
  updatePatientDistrict,
} = require('../controllers/patientController');
const { protect } = require('../middleware/auth');

// Validation rules for registration
const registerValidation = [
  body('fullName').notEmpty().withMessage('Full name is required / പൂർണ്ണ നാമം ആവശ്യമാണ്'),
  body('age').isInt({ min: 1, max: 120 }).withMessage('Valid age is required / സാധുവായ പ്രായം ആവശ്യമാണ്'),
  body('gender').isIn(['male', 'female', 'other']).withMessage('Gender is required / ലിംഗം ആവശ്യമാണ്'),
  body('phone').notEmpty().withMessage('Phone number is required / ഫോൺ നമ്പർ ആവശ്യമാണ്'),
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

// Public — detailed form submission (registrationId as key, no auth)
router.patch('/patients/:registrationId/details', updatePatientDetails);

// Public — lookup by phone number or registrationId (must be before /status/:registrationId)
router.get('/status/lookup', async (req, res) => {
  const q = (req.query.q || '').trim();
  if (!q) return res.status(400).json({ success: false, message: 'Query required' });
  try {
    const Patient = require('../models/Patient');
    // For phone: strip non-digits, build regex allowing optional spaces between digits
    // handles "+91 97445 05415", "97445 05415", "9744505415" etc.
    const digits = q.replace(/\D/g, '');
    const orConditions = [{ registrationId: q }];
    if (digits.length >= 10) {
      const last10 = digits.slice(-10);
      const phonePattern = last10.split('').join('[\\s]?');
      orConditions.push({ phone: { $regex: phonePattern } });
    } else {
      orConditions.push({ phone: q });
    }
    const patient = await Patient.findOne(
      { $or: orConditions },
      'registrationId fullName status registeredAt updatedAt'
    );
    if (!patient) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({
      success: true,
      data: {
        registrationId: patient.registrationId,
        fullName:       patient.fullName,
        status:         patient.status,
        registeredAt:   patient.registeredAt,
        lastUpdatedAt:  patient.updatedAt,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Public — patient self-check status by registrationId (no auth, minimal data only)
router.get('/status/:registrationId', async (req, res) => {
  try {
    const patient = await require('../models/Patient').findOne(
      { registrationId: req.params.registrationId },
      'registrationId fullName status registeredAt updatedAt'
    );
    if (!patient) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({
      success: true,
      data: {
        registrationId: patient.registrationId,
        fullName:       patient.fullName,
        status:         patient.status,
        registeredAt:   patient.registeredAt,
        lastUpdatedAt:  patient.updatedAt,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Public — Malayalam transliteration proxy (avoids browser CORS)
router.get('/transliterate', (req, res) => {
  const word = (req.query.q || '').trim();
  if (!word) return res.json({ result: word });
  const url = `https://inputtools.google.com/request?text=${encodeURIComponent(word)}&itc=ml-t-i0-und&num=1&cp=0&cs=1&ie=utf-8&oe=utf-8&app=demopage`;
  https.get(url, (apiRes) => {
    let raw = '';
    apiRes.on('data', chunk => { raw += chunk; });
    apiRes.on('end', () => {
      try {
        const data = JSON.parse(raw);
        res.json({ result: data?.[1]?.[0]?.[1]?.[0] || word });
      } catch { res.json({ result: word }); }
    });
  }).on('error', () => res.json({ result: word }));
});

// Admin protected
router.get('/admin/patients',        protect, getPatients);
router.get('/admin/patients/:id',    protect, getPatientById);
router.patch('/admin/patients/:id/status',   protect, updatePatientStatus);
router.patch('/admin/patients/:id/district', protect, updatePatientDistrict);
router.delete('/admin/patients/:id',         protect, deletePatient);

module.exports = router;
