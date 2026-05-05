export type Gender = 'male' | 'female' | 'other';
export type PatientStatus = 'new' | 'review' | 'approved' | 'rejected';

export interface FormData {
  // Step 1
  fullName: string;
  age: string;
  gender: Gender | '';
  phone: string;
  email: string;
  district: string;
  injuryDesc: string;
  // Step 2
  patientPhoto: File | null;
  housePhoto: File | null;
  rationCard: File | null;
  aadhaarCard: File | null;
  medicalDocs: File | null;
}

export interface Patient {
  _id: string;
  fullName: string;
  age: number;
  gender: Gender;
  phone: string;
  email: string | null;
  district: string;
  address?: string;
  injuryDesc?: string;
  documents: {
    patientPhoto: string | null;
    housePhoto: string | null;
    rationCard: string | null;
    aadhaarCard: string | null;
    medicalDocs: string | null;
  };
  status: PatientStatus;
  registrationId: string;
  registeredAt: string;
  docCount?: number;
}

export interface AdminStats {
  new: number;
  review: number;
  approved: number;
  rejected: number;
}
