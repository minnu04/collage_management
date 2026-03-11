function AppointmentCard({ appointment, actions }) {
  return (
    <article className="card">
      <div className={`badge ${appointment.status}`}>{appointment.status}</div>
      <h3>{appointment.studentName}</h3>
      <p className="meta">Faculty: {appointment.facultyName}</p>
      <p className="meta">Time: {new Date(appointment.slot).toLocaleString()}</p>
      <p className="meta">Purpose: {appointment.purpose}</p>
      {appointment.remarks ? <p className="note">Remarks: {appointment.remarks}</p> : null}
      {actions ? <div className="row-actions">{actions}</div> : null}
    </article>
  );
}

export default AppointmentCard;
