import { useState } from 'react';

function AdminPage({
  facultyList,
  pendingFaculty,
  onAddFaculty,
  onApproveFaculty,
  onRejectFaculty,
}) {
  const [facultyForm, setFacultyForm] = useState({ name: '', department: '' });

  const submitAddFaculty = (event) => {
    event.preventDefault();
    const name = facultyForm.name.trim();
    const department = facultyForm.department.trim();
    if (!name || !department) {
      return;
    }

    onAddFaculty({ name, department });
    setFacultyForm({ name: '', department: '' });
  };

  return (
    <div className="grid">
      <section className="card">
        <h2>Add Faculty (Direct)</h2>
        <form onSubmit={submitAddFaculty}>
          <label>Faculty Name</label>
          <input
            value={facultyForm.name}
            onChange={(event) =>
              setFacultyForm((previous) => ({ ...previous, name: event.target.value }))
            }
            placeholder="Enter faculty name"
          />

          <label>Department</label>
          <input
            value={facultyForm.department}
            onChange={(event) =>
              setFacultyForm((previous) => ({ ...previous, department: event.target.value }))
            }
            placeholder="Enter department"
          />

          <button className="btn-primary" type="submit">
            Add Faculty
          </button>
        </form>
      </section>

      <section className="card">
        <h2>Faculty Approval Requests</h2>

        <div className="list">
          {pendingFaculty.length === 0 ? (
            <p className="meta">No pending faculty approvals.</p>
          ) : (
            pendingFaculty.map((request) => (
              <article key={request.id} className="card nested-card">
                <div className="badge pending">pending</div>
                <h3>{request.name}</h3>
                <p className="meta">Department: {request.department}</p>
                <p className="meta">Requested: {new Date(request.requestedAt).toLocaleString()}</p>
                <div className="row-actions">
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={() => onApproveFaculty(request.id)}
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    className="btn-danger"
                    onClick={() => onRejectFaculty(request.id)}
                  >
                    Reject
                  </button>
                </div>
              </article>
            ))
          )}
        </div>
      </section>

      <section className="card">
        <h2>Approved Faculty List</h2>
        <div className="list">
          {facultyList.map((faculty) => (
            <article key={faculty.id} className="card nested-card">
              <h3>{faculty.name}</h3>
              <p className="meta">Department: {faculty.department}</p>
              <p className="meta">Available Slots: {faculty.slots.length}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

export default AdminPage;
