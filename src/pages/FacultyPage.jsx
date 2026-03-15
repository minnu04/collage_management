import { useEffect, useMemo, useState } from 'react';
import AppointmentCard from '../components/AppointmentCard';

function FacultyPage({
  facultyList,
  appointments,
  loggedInFacultyName,
  onUpdateAppointment,
  onSetFacultySlots,
}) {
  const matchedFacultyByLogin = useMemo(
    () =>
      facultyList.find(
        (faculty) => faculty.name.toLowerCase() === (loggedInFacultyName ?? '').trim().toLowerCase()
      ),
    [facultyList, loggedInFacultyName]
  );

  const [selectedFacultyId, setSelectedFacultyId] = useState(
    matchedFacultyByLogin?.id ?? facultyList[0]?.id ?? ''
  );
  const [newSlot, setNewSlot] = useState('');

  useEffect(() => {
    if (matchedFacultyByLogin) {
      setSelectedFacultyId(matchedFacultyByLogin.id);
      return;
    }

    if (!facultyList.some((faculty) => faculty.id === selectedFacultyId)) {
      setSelectedFacultyId(facultyList[0]?.id ?? '');
    }
  }, [facultyList, matchedFacultyByLogin, selectedFacultyId]);

  const selectedFaculty = useMemo(
    () => facultyList.find((faculty) => faculty.id === selectedFacultyId),
    [facultyList, selectedFacultyId]
  );

  const facultyAppointments = useMemo(
    () => appointments.filter((appointment) => appointment.facultyId === selectedFacultyId),
    [appointments, selectedFacultyId]
  );

  const pendingAppointments = facultyAppointments.filter((appointment) => appointment.status === 'pending');
  const historyAppointments = facultyAppointments.filter((appointment) => appointment.status !== 'pending');

  const addSlot = () => {
    if (!newSlot || !selectedFaculty) {
      return;
    }

    const nextSlots = Array.from(new Set([...selectedFaculty.slots, newSlot])).sort();
    onSetFacultySlots(selectedFaculty.id, nextSlots);
    setNewSlot('');
  };

  const takeAction = (appointmentId, status) => {
    const remarks =
      status === 'approved'
        ? 'Your appointment is confirmed.'
        : status === 'rejected'
          ? 'Please choose another slot.'
          : 'Appointment has been updated.';

    onUpdateAppointment(appointmentId, { status, remarks });
  };

  return (
    <div className="grid">
      <section className="card">
        <h2>Faculty Panel</h2>
        <label>Select Faculty</label>
        <select value={selectedFacultyId} onChange={(event) => setSelectedFacultyId(event.target.value)}>
          {facultyList.map((faculty) => (
            <option key={faculty.id} value={faculty.id}>
              {faculty.name} ({faculty.department})
            </option>
          ))}
        </select>

        <h3>Manage Availability</h3>
        <label>Add New Slot</label>
        <input
          type="datetime-local"
          value={newSlot}
          onChange={(event) => setNewSlot(event.target.value)}
        />
        <button onClick={addSlot} className="btn-primary" type="button">
          Add Slot
        </button>

        <div className="note">
          <strong>Current Slots:</strong>
          <ul>
            {(selectedFaculty?.slots ?? []).map((slot) => (
              <li key={slot}>{new Date(slot).toLocaleString()}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="card">
        <h2>Pending Requests</h2>
        {pendingAppointments.length === 0 ? (
          <p className="meta">No pending requests.</p>
        ) : (
          <div className="list">
            {pendingAppointments.map((appointment) => (
              <AppointmentCard
                key={appointment.id}
                appointment={appointment}
                actions={
                  <>
                    <button
                      type="button"
                      className="btn-primary"
                      onClick={() => takeAction(appointment.id, 'approved')}
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      className="btn-danger"
                      onClick={() => takeAction(appointment.id, 'rejected')}
                    >
                      Reject
                    </button>
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => takeAction(appointment.id, 'rescheduled')}
                    >
                      Reschedule
                    </button>
                  </>
                }
              />
            ))}
          </div>
        )}
      </section>

      <section className="card">
        <h2>Appointment History</h2>
        {historyAppointments.length === 0 ? (
          <p className="meta">No processed appointments yet.</p>
        ) : (
          <div className="list">
            {historyAppointments.map((appointment) => (
              <AppointmentCard key={appointment.id} appointment={appointment} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default FacultyPage;
