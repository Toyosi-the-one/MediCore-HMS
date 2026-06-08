// Single source of truth for appointment configuration.
// Both the receptionist and patient booking screens import from here
// so that adding a doctor or time slot only requires one change.

export const DEPARTMENTS: string[] = [
  'Cardiology',
  'General Medicine',
  'Neurology',
  'Orthopedics',
  'Pediatrics',
];

export const DOCTORS_BY_DEPT: Record<string, string[]> = {
  'Cardiology':       ['Dr. Balogun', 'Dr. Adeyemi'],
  'General Medicine': ['Dr. Chukwu', 'Dr. Osei'],
  'Neurology':        ['Dr. Ibrahim', 'Dr. Eze'],
  'Orthopedics':      ['Dr. Okafor', 'Dr. Nwosu'],
  'Pediatrics':       ['Dr. Adeleke', 'Dr. Akinlade'],
};

// Receptionist can book from 08:00 AM; patient self-service starts at 09:00 AM.
export const ALL_TIME_SLOTS: string[] = [
  '08:00 AM', '08:30 AM',
  '09:00 AM', '09:30 AM',
  '10:00 AM', '10:30 AM',
  '11:00 AM', '11:30 AM',
  '12:00 PM', '12:30 PM',
  '02:00 PM', '02:30 PM',
  '03:00 PM', '03:30 PM',
  '04:00 PM', '04:30 PM',
];

// Patient portal excludes the early 08:xx slots (receptionist-only hours)
export const PATIENT_TIME_SLOTS: string[] = ALL_TIME_SLOTS.filter(
  s => !s.startsWith('08')
);
