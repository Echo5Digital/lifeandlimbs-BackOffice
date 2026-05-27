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
    const { status, district, search, dateFrom, dateTo, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (status && status !== 'all')  filter.status   = status;
    if (district && district !== 'all') filter.district = district;
    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { phone:    { $regex: search, $options: 'i' } },
      ];
    }

    // Date range filter
    if (dateFrom || dateTo) {
      const from = dateFrom ? new Date(dateFrom) : new Date('2000-01-01');
      const to   = dateTo   ? new Date(new Date(dateTo).setHours(23, 59, 59, 999)) : new Date();

      if (status && status !== 'all') {
        // Filter by when this specific status was set in statusHistory
        filter.statusHistory = {
          $elemMatch: {
            status:    status,
            changedAt: { $gte: from, $lte: to },
          },
        };
      } else {
        // No status filter — filter by registration date
        filter.registeredAt = { $gte: from, $lte: to };
      }
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

    // Stats — count every status in one aggregation pass
    const statusAgg = await Patient.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    const stats = {};
    statusAgg.forEach(({ _id, count }) => { stats[_id] = count; });

    res.json({
      success: true,
      data,
      total,
      page:    Number(page),
      limit:   Number(limit),
      pages:   Math.ceil(total / Number(limit)),
      districts,
      stats,
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
    const allowed = [
      'new', 'ready_for_evaluation', 'evaluated', 'approved', 'on_hold', 'rejected',
    ];
    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value.' });
    }

    const patient = await Patient.findByIdAndUpdate(
      req.params.id,
      {
        status,
        $push: { statusHistory: { status, changedAt: new Date() } },
      },
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

// PATCH /api/patients/:registrationId/details
const updatePatientDetails = async (req, res) => {
  try {
    const { registrationId } = req.params;

    // Duplicate check: block if another patient has the same fullName + dateOfBirth + zipcode
    const { firstName, lastName, dateOfBirth, zipcode } = req.body;
    if (firstName && dateOfBirth && zipcode) {
      const fullName = [firstName, lastName].filter(Boolean).join(' ').trim();
      const duplicate = await Patient.findOne({
        fullName:    { $regex: new RegExp(`^${fullName}$`, 'i') },
        dateOfBirth: dateOfBirth,
        zipcode:     zipcode,
        registrationId: { $ne: registrationId }, // exclude the current record
      }).lean();
      if (duplicate) {
        return res.status(409).json({
          success: false,
          duplicate: true,
          message: `A patient named "${fullName}" with the same date of birth and PIN code is already registered (${duplicate.registrationId}).`,
        });
      }
    }

    const allowed = [
      'firstName','lastName','dateOfBirth','maritalStatus',
      'addressHouse','addressPO','city','district','state','zipcode','country','homePhone',
      'fatherName','motherName','spouseName','spouseOccupation','spousePhone',
      'childrenCount','parentsPhone','yearsMarried',
      'height','weight','occupation','householdIncomeMonthly','householdAssets',
      'totalHouseholdAssetValue','ownsHouse',
      'howDidYouKnow','referredBy',
      'dateLostLimb','howLostLeg','yearsLost','legsLostCount','rightLeg','leftLeg','limbLossDetails',
      'hospitalName','doctorName','hospitalAddress','hospitalizedFrom','hospitalizedTo',
      'usedProsthetic','prostheticYears','whyNewProsthetic','prostheticSource','prostheticManufacturer',
    ];
    const update = { detailsSubmittedAt: new Date() };
    allowed.forEach(key => {
      if (req.body[key] !== undefined) update[key] = req.body[key];
    });

    const patient = await Patient.findOneAndUpdate(
      { registrationId },
      update,
      { new: true }
    );
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found.' });
    }
    res.json({ success: true, registrationId: patient.registrationId, submittedAt: patient.detailsSubmittedAt });
  } catch (err) {
    console.error('updatePatientDetails error:', err);
    res.status(500).json({ success: false, message: 'Failed to save details.' });
  }
};

// DELETE /api/admin/patients/:id
const deletePatient = async (req, res) => {
  try {
    const patient = await Patient.findByIdAndDelete(req.params.id);
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found.' });
    }
    res.json({ success: true, message: `Patient ${patient.registrationId} deleted.` });
  } catch (err) {
    console.error('deletePatient error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete patient.' });
  }
};

module.exports = { registerPatient, getPatients, getPatientById, updatePatientStatus, updatePatientDetails, deletePatient };
