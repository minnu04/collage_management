import { useEffect, useMemo, useState } from 'react';
import AppointmentCard from '../components/AppointmentCard';

const REMINDER_WINDOW_HOURS = 24;

function FacultyPage({
  facultyList,
  appointments,
  loggedInFacultyId,
  onUpdateAppointment,
  onSetFacultySlots,
}) {
  const matchedFacultyByLogin = useMemo(
    () =>
      facultyList.find(
        (faculty) => faculty.loginId.toLowerCase() === (loggedInFacultyId ?? '').trim().toLowerCase()
      ),
    [facultyList, loggedInFacultyId]
  );

  const [selectedFacultyId, setSelectedFacultyId] = useState(
    matchedFacultyByLogin?.id ?? facultyList[0]?.id ?? ''
  );
  const [newSlot, setNewSlot] = useState('');
  const [editingSlot, setEditingSlot] = useState('');
  const [replacementSlot, setReplacementSlot] = useState('');
  const [slotError, setSlotError] = useState('');

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
  const emergencyAppointments = facultyAppointments.filter((appointment) => appointment.isEmergency);
  const reminderAppointments = useMemo(() => {
    const now = Date.now();
    const maxTime = now + REMINDER_WINDOW_HOURS * 60 * 60 * 1000;
    return facultyAppointments.filter((appointment) => {
      if (appointment.reminderEnabled === false || appointment.status === 'rejected') {
        return false;
      }

      const slotTime = new Date(appointment.slot).getTime();
      return slotTime >= now && slotTime <= maxTime;
    });
  }, [facultyAppointments]);

  const addSlot = () => {
    if (!newSlot || !selectedFaculty) {
      return;
    }

    setSlotError('');
    const nextSlots = Array.from(new Set([...selectedFaculty.slots, newSlot])).sort();
    onSetFacultySlots(selectedFaculty.id, nextSlots);
    setNewSlot('');
  };

  const removeSlot = (slotToRemove) => {
    if (!selectedFaculty) {
      return;
    }

    const nextSlots = selectedFaculty.slots.filter((slot) => slot !== slotToRemove);
    onSetFacultySlots(selectedFaculty.id, nextSlots);
    if (editingSlot === slotToRemove) {
      setEditingSlot('');
      setReplacementSlot('');
    }
  };

  const saveSlotChange = () => {
    if (!selectedFaculty || !editingSlot || !replacementSlot) {
      return;
    }

    if (selectedFaculty.slots.includes(replacementSlot) && replacementSlot !== editingSlot) {
      setSlotError('This slot already exists. Please choose another time.');
      return;
    }

    setSlotError('');
    const nextSlots = selectedFaculty.slots
      .map((slot) => (slot === editingSlot ? replacementSlot : slot))
      .sort();
    onSetFacultySlots(selectedFaculty.id, nextSlots);
    setEditingSlot('');
    setReplacementSlot('');
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
        {!matchedFacultyByLogin ? (
          <p className="error-text">Faculty profile mapping not found for this login. Please logout and login again.</p>
        ) : null}
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
        {slotError ? <p className="error-text">{slotError}</p> : null}

        <div className="note">
          <strong>Current Slots:</strong>
          <ul className="slot-list">
            {(selectedFaculty?.slots ?? []).map((slot) => (
              <li key={slot}>
                <span>{new Date(slot).toLocaleString()}</span>
                <div className="row-actions">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => {
                      setEditingSlot(slot);
                      setReplacementSlot(slot);
                      setSlotError('');
                    }}
                  >
                    Change Time
                  </button>
                  <button type="button" className="btn-danger" onClick={() => removeSlot(slot)}>
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>

          {editingSlot ? (
            <div className="slot-editor">
              <label>Update Slot Time</label>
              <input
                type="datetime-local"
                value={replacementSlot}
                onChange={(event) => setReplacementSlot(event.target.value)}
              />
              <div className="row-actions">
                <button type="button" className="btn-primary" onClick={saveSlotChange}>
                  Save Slot
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    setEditingSlot('');
                    setReplacementSlot('');
                    setSlotError('');
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : null}
        </div>
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
