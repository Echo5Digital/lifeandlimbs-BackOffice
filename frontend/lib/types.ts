export type Gender = 'male' | 'female' | 'other';

export type PatientStatus =
  | 'new'
  | 'ready_for_evaluation'
  | 'evaluated'
  | 'approved'
  | 'on_hold'
  | 'rejected'
  | 'completed';

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
    aadhaarCard: string | null;
  };
  status: PatientStatus;
  registrationId: string;
  registeredAt: string;
  docCount?: number;
  // Detailed registration form fields (all optional)
  firstName?: string; lastName?: string; dateOfBirth?: string; maritalStatus?: string;
  addressHouse?: string; addressPO?: string; city?: string; state?: string;
  zipcode?: string; country?: string; homePhone?: string;
  fatherName?: string; motherName?: string; spouseName?: string;
  spouseOccupation?: string; spousePhone?: string; childrenCount?: number;
  parentsPhone?: string; yearsMarried?: number;
  height?: string; weight?: string; occupation?: string;
  householdIncomeMonthly?: string; householdAssets?: string;
  totalHouseholdAssetValue?: string; ownsHouse?: string;
  howDidYouKnow?: string; referredBy?: string;
  dateLostLimb?: string; howLostLeg?: string; yearsLost?: number;
  legsLostCount?: string; rightLeg?: string; leftLeg?: string; limbLossDetails?: string;
  hospitalName?: string; doctorName?: string; hospitalAddress?: string;
  hospitalizedFrom?: string; hospitalizedTo?: string;
  usedProsthetic?: string; prostheticYears?: string;
  whyNewProsthetic?: string; prostheticSource?: string; prostheticManufacturer?: string;
  detailsSubmittedAt?: string;
  statusHistory?: { status: string; changedAt: string }[];
}

// Stats are dynamic — any PatientStatus key may appear
export type AdminStats = Partial<Record<PatientStatus, number>>;
