import { useMemo, useState } from 'react';
import AppointmentCard from '../components/AppointmentCard';

function StudentPage({ facultyList, appointments, onBook }) {
  const [form, setForm] = useState({
    studentName: '',
    facultyId: facultyList[0]?.id ?? '',
    slot: '',
    purpose: '',
  });

  const selectedFaculty = useMemo(
    () => facultyList.find((faculty) => faculty.id === form.facultyId),
    [facultyList, form.facultyId]
  );

  const availableSlots = selectedFaculty?.slots ?? [];

  const bookedByStudent = appointments.filter(
    (appointment) => appointment.studentName.toLowerCase() === form.studentName.trim().toLowerCase()
  );

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!form.studentName || !form.facultyId || !form.slot || !form.purpose) {
      return;
    }

    const faculty = facultyList.find((item) => item.id === form.facultyId);
    const newAppointment = {
      id: `a-${Date.now()}`,
      studentName: form.studentName.trim(),
      facultyId: form.facultyId,
      facultyName: faculty?.name ?? 'Unknown Faculty',
      purpose: form.purpose.trim(),
      slot: form.slot,
      status: 'pending',
      remarks: '',
    };

    onBook(newAppointment);
    setForm((previous) => ({ ...previous, purpose: '', slot: '' }));
  };

  return (
    <div className="grid">
      <section className="card">
        <h2>Book Appointment</h2>
        <form onSubmit={handleSubmit}>
          <label>Student Name</label>
          <input
            value={form.studentName}
            onChange={(event) => setForm((prev) => ({ ...prev, studentName: event.target.value }))}
            placeholder="Enter your name"
          />

          <label>Select Faculty</label>
          <select
            value={form.facultyId}
            onChange={(event) => setForm((prev) => ({ ...prev, facultyId: event.target.value, slot: '' }))}
          >
            {facultyList.map((faculty) => (
              <option key={faculty.id} value={faculty.id}>
                {faculty.name} ({faculty.department})
              </option>
            ))}
          </select>

          <label>Available Slot</label>
          <select
            value={form.slot}
            onChange={(event) => setForm((prev) => ({ ...prev, slot: event.target.value }))}
          >
            <option value="">Choose a time slot</option>
            {availableSlots.map((slot) => (
              <option key={slot} value={slot}>
                {new Date(slot).toLocaleString()}
              </option>
            ))}
          </select>

          <label>Purpose</label>
          <textarea
            value={form.purpose}
            onChange={(event) => setForm((prev) => ({ ...prev, purpose: event.target.value }))}
            placeholder="Reason for appointment"
          />

          <button type="submit" className="btn-primary">
            Submit Request
          </button>
        </form>
      </section>

      <section className="card">
        <h2>My Appointments</h2>
        {!form.studentName.trim() ? (
          <p className="meta">Enter your name to view your appointment history.</p>
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
