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
  },
  { timestamps: true }
);

// Auto-generate Registration ID before first save
// Mongoose 8+: async pre hooks do not use next() — just return
patientSchema.pre('save', async function () {
  if (!this.registrationId) {
    const year  = new Date().getFullYear();
    const count = await mongoose.model('Patient').countDocuments();
    this.registrationId = `LNL-${year}-${String(count + 1).padStart(5, '0')}`;
  }
});

// Virtual: count of uploaded documents
patientSchema.virtual('docCount').get(function () {
  const docs = this.documents;
  return Object.values(docs).filter(Boolean).length;
});

module.exports = mongoose.model('Patient', patientSchema);
