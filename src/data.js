export const initialFaculty = [
  {
    id: 'f1',
    name: 'Dr. Priya Sharma',
    department: 'Computer Science',
    slots: ['2026-03-12T10:00', '2026-03-12T11:30', '2026-03-13T14:00'],
  },
  {
    id: 'f2',
    name: 'Prof. Arjun Verma',
    department: 'Mathematics',
    slots: ['2026-03-12T09:30', '2026-03-13T10:30', '2026-03-14T12:00'],
  },
  {
    id: 'f3',
    name: 'Dr. Neha Singh',
    department: 'Electronics',
    slots: ['2026-03-12T13:00', '2026-03-13T09:00', '2026-03-14T11:00'],
  },
];

export const initialAppointments = [
  {
    id: 'a1',
    studentName: 'Rahul Kumar',
    facultyId: 'f1',
    facultyName: 'Dr. Priya Sharma',
    purpose: 'Project guidance',
    slot: '2026-03-12T10:00',
    status: 'approved',
    remarks: 'Bring your draft report.',
  },
  {
    id: 'a2',
    studentName: 'Ananya Gupta',
    facultyId: 'f2',
    facultyName: 'Prof. Arjun Verma',
    purpose: 'Doubt clarification',
    slot: '2026-03-13T10:30',
    status: 'pending',
    remarks: '',
  },
];

export const initialPendingFaculty = [
  {
    id: 'pf1',
    name: 'Dr. Karan Mehta',
    department: 'Physics',
    requestedAt: '2026-03-11T09:00',
    status: 'pending',
  },
  {
    id: 'pf2',
    name: 'Prof. Sneha Rao',
    department: 'Chemistry',
    requestedAt: '2026-03-11T10:15',
    status: 'pending',
  },
];
