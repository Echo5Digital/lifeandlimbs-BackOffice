const Patient = require('../models/Patient');

// POST /api/register
const registerPatient = async (req, res) => {
  try {
    const {
      fullName, age, gender, phone, email,
      district, address, injuryDesc,
    } = req.body;

    // Build documents object from uploaded files
    const documents = {};
    const fields = ['patientPhoto', 'housePhoto', 'rationCard', 'aadhaarCard', 'medicalDocs'];
    fields.forEach((field) => {
      if (req.files && req.files[field] && req.files[field][0]) {
        documents[field] = req.files[field][0].path; // Cloudinary URL
      }
    });

    const patient = new Patient({
      fullName,
      age:        Number(age),
      gender,
      phone,
      email:      email || null,
      district,
      address,
      injuryDesc,
      documents,
    });

    await patient.save();

    res.status(201).json({
      success:        true,
      registrationId: patient.registrationId,
      registeredAt:   patient.registeredAt,
    });
  } catch (err) {
    console.error('registerPatient error:', err);
    res.status(500).json({ success: false, message: 'Registration failed. Please try again.' });
  }
};

// GET /api/admin/patients
const getPatients = async (req, res) => {
  try {
    const { status, district, search, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (status && status !== 'all')  filter.status   = status;
    if (district && district !== 'all') filter.district = district;
    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { phone:    { $regex: search, $options: 'i' } },
      ];
    }

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await Patient.countDocuments(filter);
    const patients = await Patient.find(filter)
      .sort({ registeredAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    // Add docCount to each patient
    const data = patients.map((p) => ({
      ...p,
      docCount: Object.values(p.documents || {}).filter(Boolean).length,
    }));

    // Get distinct districts for dropdown
    const districts = await Patient.distinct('district');

    // Stats
    const [newCount, reviewCount, approvedCount, rejectedCount] = await Promise.all([
      Patient.countDocuments({ status: 'new' }),
      Patient.countDocuments({ status: 'review' }),
      Patient.countDocuments({ status: 'approved' }),
      Patient.countDocuments({ status: 'rejected' }),
    ]);

    res.json({
      success: true,
      data,
      total,
      page:    Number(page),
      limit:   Number(limit),
      pages:   Math.ceil(total / Number(limit)),
      districts,
      stats: {
        new:      newCount,
        review:   reviewCount,
        approved: approvedCount,
        rejected: rejectedCount,
      },
    });
  } catch (err) {
    console.error('getPatients error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch patients.' });
  }
};

// GET /api/admin/patients/:id
const getPatientById = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id).lean();
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found.' });
    }
    res.json({ success: true, data: patient });
  } catch (err) {
    console.error('getPatientById error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch patient.' });
  }
};

// PATCH /api/admin/patients/:id/status
const updatePatientStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['new', 'review', 'approved', 'rejected'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value.' });
    }

    const patient = await Patient.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found.' });
    }

    res.json({ success: true, data: patient });
  } catch (err) {
    console.error('updatePatientStatus error:', err);
    res.status(500).json({ success: false, message: 'Failed to update status.' });
  }
};

module.exports = { registerPatient, getPatients, getPatientById, updatePatientStatus };
