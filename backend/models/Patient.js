const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema(
  {
    fullName:   { type: String, required: true, trim: true },
    age:        { type: Number, required: true },
    gender:     { type: String, enum: ['male', 'female', 'other'], required: true },
    phone:      { type: String, required: true, trim: true },
    email:      { type: String, default: null, trim: true },
    district:   { type: String, default: null, trim: true },
    address:    { type: String, default: null, trim: true },
    injuryDesc: { type: String, default: null, trim: true },
    documents: {
      patientPhoto: { type: String, default: null },
      housePhoto:   { type: String, default: null },
      rationCard:   { type: String, default: null },
      aadhaarCard:  { type: String, default: null },
      medicalDocs:  { type: String, default: null },
    },
    status: {
      type: String,
      enum: [
        'new',
        'ready_for_evaluation',
        'scheduling',
        'evaluated_pending',
        'evaluated',
        'rejected',
        'approved',
        'completed',
        'follow_up',
        'repairs',
        'on_hold',
        'incomplete',
      ],
      default: 'new',
    },
    registrationId: { type: String, unique: true },
    registeredAt:   { type: Date, default: Date.now },

    // ── Detailed Patient Registration Form ──────────────────────────────────
    // Personal
    firstName:      { type: String, default: null, trim: true },
    lastName:       { type: String, default: null, trim: true },
    dateOfBirth:    { type: String, default: null },
    maritalStatus:  { type: String, default: null },

    // Contact
    addressHouse:   { type: String, default: null, trim: true },
    addressPO:      { type: String, default: null, trim: true },
    city:           { type: String, default: null, trim: true },
    state:          { type: String, default: null, trim: true },
    zipcode:        { type: String, default: null, trim: true },
    country:        { type: String, default: null, trim: true },
    homePhone:      { type: String, default: null, trim: true },

    // Family
    fatherName:         { type: String, default: null, trim: true },
    motherName:         { type: String, default: null, trim: true },
    spouseName:         { type: String, default: null, trim: true },
    spouseOccupation:   { type: String, default: null, trim: true },
    spousePhone:        { type: String, default: null, trim: true },
    childrenCount:      { type: Number, default: null },
    parentsPhone:       { type: String, default: null, trim: true },
    yearsMarried:       { type: Number, default: null },

    // Physical & Financial
    height:                   { type: String, default: null },
    weight:                   { type: String, default: null },
    occupation:               { type: String, default: null, trim: true },
    householdIncomeMonthly:   { type: String, default: null },
    householdAssets:          { type: String, default: null },
    totalHouseholdAssetValue: { type: String, default: null },
    ownsHouse:                { type: String, default: null },

    // Referral
    howDidYouKnow: { type: String, default: null },
    referredBy:    { type: String, default: null, trim: true },

    // Medical History (Limb Loss)
    dateLostLimb:    { type: String, default: null },
    howLostLeg:      { type: String, default: null },
    yearsLost:       { type: Number, default: null },
    legsLostCount:   { type: Number, default: null },
    rightLeg:        { type: String, default: null },
    leftLeg:         { type: String, default: null },
    limbLossDetails: { type: String, default: null, trim: true },

    // Hospital
    hospitalName:    { type: String, default: null, trim: true },
    doctorName:      { type: String, default: null, trim: true },
    hospitalAddress: { type: String, default: null, trim: true },
    hospitalizedFrom:{ type: String, default: null },
    hospitalizedTo:  { type: String, default: null },

    // Prosthetic
    usedProsthetic:       { type: String, default: null },
    prostheticYears:      { type: Number, default: null },
    whyNewProsthetic:     { type: String, default: null, trim: true },
    prostheticSource:     { type: String, default: null, trim: true },
    prostheticManufacturer: { type: String, default: null, trim: true },

    // Meta
    detailsSubmittedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// Auto-generate Registration ID before first save
// Mongoose 8+: async pre hooks do not use next() — just return
patientSchema.pre('save', async function () {
  if (!this.registrationId) {
    const year = new Date().getFullYear();
    const last = await mongoose.model('Patient')
      .findOne({ registrationId: new RegExp(`^LNL-${year}-`) })
      .sort({ registrationId: -1 })
      .select('registrationId')
      .lean();
    const next = last?.registrationId
      ? parseInt(last.registrationId.split('-')[2], 10) + 1
      : 1;
    this.registrationId = `LNL-${year}-${String(next).padStart(5, '0')}`;
  }
});

// Virtual: count of uploaded documents
patientSchema.virtual('docCount').get(function () {
  const docs = this.documents;
  return Object.values(docs).filter(Boolean).length;
});

module.exports = mongoose.model('Patient', patientSchema);
