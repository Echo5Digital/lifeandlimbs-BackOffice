export type Gender = 'male' | 'female' | 'other';

export type PatientStatus =
  | 'new'
  | 'ready_for_evaluation'
  | 'scheduling'
  | 'evaluated_pending'
  | 'evaluated'
  | 'rejected'
  | 'approved'
  | 'completed'
  | 'follow_up'
  | 'repairs'
  | 'on_hold'
  | 'incomplete';

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

// Stats are dynamic — any PatientStatus key may appear
export type AdminStats = Partial<Record<PatientStatus, number>>;
