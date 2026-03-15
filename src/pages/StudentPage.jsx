import { useEffect, useMemo, useState } from 'react';
import AppointmentCard from '../components/AppointmentCard';

const BOOKING_WINDOW_HOURS = 48;
const REMINDER_WINDOW_HOURS = 24;

function StudentPage({ facultyList, appointments, loggedInStudentName, loggedInStudentId, onBook }) {
  const [regularForm, setRegularForm] = useState({
    studentName: (loggedInStudentName ?? '').trim(),
    studentId: (loggedInStudentId ?? '').trim(),
    facultyId: facultyList[0]?.id ?? '',
    slot: '',
    purpose: '',
    reminderEnabled: true,
  });
  const [emergencyForm, setEmergencyForm] = useState({
    studentName: (loggedInStudentName ?? '').trim(),
    studentId: (loggedInStudentId ?? '').trim(),
    facultyId: facultyList[0]?.id ?? '',
    slot: '',
    purpose: '',
    reminderEnabled: true,
  });
  const [regularError, setRegularError] = useState('');
  const [emergencyError, setEmergencyError] = useState('');

  useEffect(() => {
    setRegularForm((previous) => ({
      ...previous,
      studentName: (loggedInStudentName ?? '').trim(),
      studentId: (loggedInStudentId ?? '').trim(),
    }));
    setEmergencyForm((previous) => ({
      ...previous,
      studentName: (loggedInStudentName ?? '').trim(),
      studentId: (loggedInStudentId ?? '').trim(),
    }));
  }, [loggedInStudentId, loggedInStudentName]);

  const bookingThresholdTime = Date.now() + BOOKING_WINDOW_HOURS * 60 * 60 * 1000;

  const selectedRegularFaculty = useMemo(
    () => facultyList.find((faculty) => faculty.id === regularForm.facultyId),
    [facultyList, regularForm.facultyId]
  );

  const selectedEmergencyFaculty = useMemo(
    () => facultyList.find((faculty) => faculty.id === emergencyForm.facultyId),
    [facultyList, emergencyForm.facultyId]
  );

  const regularSlotOptions = (selectedRegularFaculty?.slots ?? []).filter(
    (slot) => new Date(slot).getTime() >= bookingThresholdTime
  );

  const emergencySlotOptions = (selectedEmergencyFaculty?.slots ?? []).filter(
    (slot) => new Date(slot).getTime() < bookingThresholdTime
  );

  const bookedByStudent = useMemo(() => {
    const normalizedStudentId = regularForm.studentId.trim().toLowerCase();
    const normalizedStudentName = regularForm.studentName.trim().toLowerCase();

    const filtered = appointments.filter((appointment) => {
      if (normalizedStudentId && appointment.studentId) {
        return appointment.studentId.toLowerCase() === normalizedStudentId;
      }

      return appointment.studentName.toLowerCase() === normalizedStudentName;
    });

    return filtered.sort((a, b) => new Date(b.slot).getTime() - new Date(a.slot).getTime());
  }, [appointments, regularForm.studentId, regularForm.studentName]);

  const reminderAppointments = useMemo(() => {
    const now = Date.now();
    const maxReminderTime = now + REMINDER_WINDOW_HOURS * 60 * 60 * 1000;
    return bookedByStudent.filter((appointment) => {
      if (appointment.reminderEnabled === false || appointment.status === 'rejected') {
        return false;
      }

      const slotTime = new Date(appointment.slot).getTime();
      return slotTime >= now && slotTime <= maxReminderTime;
    });
  }, [bookedByStudent]);

  const emergencyAppointments = bookedByStudent.filter((appointment) => appointment.isEmergency);

  const handleRegularSubmit = (event) => {
    event.preventDefault();
    setRegularError('');

    if (
      !regularForm.studentName ||
      !regularForm.studentId ||
      !regularForm.facultyId ||
      !regularForm.slot ||
      !regularForm.purpose
    ) {
      setRegularError('Please fill all required fields and select a valid slot.');
      return;
    }

    const selectedSlotTime = new Date(regularForm.slot).getTime();
    if (selectedSlotTime < bookingThresholdTime) {
      setRegularError('Regular appointments must be booked at least 48 hours in advance.');
      return;
    }

    const faculty = facultyList.find((item) => item.id === regularForm.facultyId);
    const newAppointment = {
      id: `a-${Date.now()}`,
      studentName: regularForm.studentName.trim(),
      studentId: regularForm.studentId.trim().toUpperCase(),
      facultyId: regularForm.facultyId,
      facultyName: faculty?.name ?? 'Unknown Faculty',
      purpose: regularForm.purpose.trim(),
      slot: regularForm.slot,
      isEmergency: false,
      reminderEnabled: regularForm.reminderEnabled,
      status: 'pending',
      remarks: '',
    };

    onBook(newAppointment);
    setRegularForm((previous) => ({
      ...previous,
      purpose: '',
      slot: '',
      reminderEnabled: true,
    }));
  };

  const handleEmergencySubmit = (event) => {
    event.preventDefault();
    setEmergencyError('');

    if (
      !emergencyForm.studentName ||
      !emergencyForm.studentId ||
      !emergencyForm.facultyId ||
      !emergencyForm.slot ||
      !emergencyForm.purpose
    ) {
      setEmergencyError('Please fill all required fields and select an emergency slot.');
      return;
    }

    const selectedSlotTime = new Date(emergencyForm.slot).getTime();
    if (selectedSlotTime >= bookingThresholdTime) {
      setEmergencyError('Emergency booking is only for slots within the next 48 hours.');
      return;
    }

    const faculty = facultyList.find((item) => item.id === emergencyForm.facultyId);
    const newAppointment = {
      id: `a-${Date.now()}`,
      studentName: emergencyForm.studentName.trim(),
      studentId: emergencyForm.studentId.trim().toUpperCase(),
      facultyId: emergencyForm.facultyId,
      facultyName: faculty?.name ?? 'Unknown Faculty',
      purpose: emergencyForm.purpose.trim(),
      slot: emergencyForm.slot,
      isEmergency: true,
      reminderEnabled: emergencyForm.reminderEnabled,
      status: 'pending',
      remarks: '',
    };

    onBook(newAppointment);
    setEmergencyForm((previous) => ({
      ...previous,
      purpose: '',
      slot: '',
      reminderEnabled: true,
    }));
  };

  return (
    <div className="grid">
      <section className="card">
        <h2>Regular Booking (48+ Hours)</h2>
        <form onSubmit={handleRegularSubmit}>
          <label>Student Name</label>
          <input value={regularForm.studentName} readOnly placeholder="Enter your name" />

          <label>Student ID</label>
          <input value={regularForm.studentId} readOnly placeholder="Enter student ID" />

          <label>Select Faculty</label>
          <select
            value={regularForm.facultyId}
            onChange={(event) =>
              setRegularForm((prev) => ({ ...prev, facultyId: event.target.value, slot: '' }))
            }
          >
            {facultyList.map((faculty) => (
              <option key={faculty.id} value={faculty.id}>
                {faculty.name} ({faculty.department})
              </option>
            ))}
          </select>

          <label>Available Slot</label>
          <select
            value={regularForm.slot}
            onChange={(event) => setRegularForm((prev) => ({ ...prev, slot: event.target.value }))}
          >
            <option value="">Choose a time slot</option>
            {regularSlotOptions.map((slot) => (
              <option key={slot} value={slot}>
                {new Date(slot).toLocaleString()}
              </option>
            ))}
          </select>
          {regularSlotOptions.length === 0 ? (
            <p className="meta">No regular slots available (48+ hours). Use emergency booking for urgent cases.</p>
          ) : null}

          <label className="inline-toggle">
            <input
              type="checkbox"
              checked={regularForm.reminderEnabled}
              onChange={(event) =>
                setRegularForm((previous) => ({ ...previous, reminderEnabled: event.target.checked }))
              }
            />
            Enable reminder
          </label>

          <label>Purpose</label>
          <textarea
            value={regularForm.purpose}
            onChange={(event) => setRegularForm((prev) => ({ ...prev, purpose: event.target.value }))}
            placeholder="Reason for appointment"
          />

          {regularError ? <p className="error-text">{regularError}</p> : null}

          <button type="submit" className="btn-primary">
            Submit Request
          </button>
        </form>
      </section>

      <section className="card">
        <h2>Emergency Booking (Less Than 48 Hours)</h2>
        <form onSubmit={handleEmergencySubmit}>
          <label>Student Name</label>
          <input value={emergencyForm.studentName} readOnly placeholder="Enter your name" />

          <label>Student ID</label>
          <input value={emergencyForm.studentId} readOnly placeholder="Enter student ID" />

          <label>Select Faculty</label>
          <select
            value={emergencyForm.facultyId}
            onChange={(event) =>
              setEmergencyForm((prev) => ({ ...prev, facultyId: event.target.value, slot: '' }))
            }
          >
            {facultyList.map((faculty) => (
              <option key={faculty.id} value={faculty.id}>
                {faculty.name} ({faculty.department})
              </option>
            ))}
          </select>

          <label>Emergency Slot</label>
          <select
            value={emergencyForm.slot}
            onChange={(event) => setEmergencyForm((prev) => ({ ...prev, slot: event.target.value }))}
          >
            <option value="">Choose an emergency slot</option>
            {emergencySlotOptions.map((slot) => (
              <option key={slot} value={slot}>
                {new Date(slot).toLocaleString()}
              </option>
            ))}
          </select>
          {emergencySlotOptions.length === 0 ? (
            <p className="meta">No emergency slots available in the next 48 hours.</p>
          ) : null}

          <label className="inline-toggle">
            <input
              type="checkbox"
              checked={emergencyForm.reminderEnabled}
              onChange={(event) =>
                setEmergencyForm((previous) => ({ ...previous, reminderEnabled: event.target.checked }))
              }
            />
            Enable reminder
          </label>

          <label>Emergency Purpose</label>
          <textarea
            value={emergencyForm.purpose}
            onChange={(event) => setEmergencyForm((prev) => ({ ...prev, purpose: event.target.value }))}
            placeholder="Explain the emergency reason"
          />

          {emergencyError ? <p className="error-text">{emergencyError}</p> : null}

          <button type="submit" className="btn-danger">
            Submit Emergency Request
          </button>
        </form>
      </section>

      <section className="card">
        <h2>Upcoming Reminders</h2>
        {reminderAppointments.length === 0 ? (
          <p className="meta">No reminders in the next 24 hours.</p>
        ) : (
          <div className="list">
            {reminderAppointments.map((appointment) => (
              <AppointmentCard key={appointment.id} appointment={appointment} />
            ))}
          </div>
        )}
      </section>

      <section className="card">
        <h2>Emergency Appointments</h2>
        {emergencyAppointments.length === 0 ? (
          <p className="meta">No emergency appointments.</p>
        ) : (
          <div className="list">
            {emergencyAppointments.map((appointment) => (
              <AppointmentCard key={appointment.id} appointment={appointment} />
            ))}
          </div>
        )}
      </section>

      <section className="card">
        <h2>My Appointments</h2>
        {!regularForm.studentId.trim() ? (
          <p className="meta">Enter your ID to view your appointment history.</p>
        ) : bookedByStudent.length === 0 ? (
          <p className="meta">No appointments found for this student.</p>
        ) : (
          <div className="list">
            {bookedByStudent.map((appointment) => (
              <AppointmentCard key={appointment.id} appointment={appointment} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default StudentPage;
