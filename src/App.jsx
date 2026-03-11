import { NavLink, Navigate, Route, Routes } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { initialAppointments, initialFaculty, initialPendingFaculty } from './data';
import StudentPage from './pages/StudentPage';
import FacultyPage from './pages/FacultyPage';
import AdminPage from './pages/AdminPage';
import LoginPage from './pages/LoginPage';

function App() {
  const [facultyList, setFacultyList] = useState(initialFaculty);
  const [appointments, setAppointments] = useState(initialAppointments);
  const [pendingFaculty, setPendingFaculty] = useState(initialPendingFaculty);
  const [session, setSession] = useState(null);

  const pendingCount = useMemo(
    () => appointments.filter((appointment) => appointment.status === 'pending').length,
    [appointments]
  );

  const addAppointment = (newAppointment) => {
    setAppointments((previous) => [newAppointment, ...previous]);
  };

  const updateAppointment = (appointmentId, changes) => {
    setAppointments((previous) =>
      previous.map((appointment) =>
        appointment.id === appointmentId ? { ...appointment, ...changes } : appointment
      )
    );
  };

  const setFacultySlots = (facultyId, slots) => {
    setFacultyList((previous) =>
      previous.map((faculty) => (faculty.id === facultyId ? { ...faculty, slots } : faculty))
    );
  };

  const addFaculty = ({ name, department }) => {
    const newFaculty = {
      id: `f-${Date.now()}`,
      name,
      department,
      slots: [],
    };

    setFacultyList((previous) => [newFaculty, ...previous]);
  };

  const addPendingFacultyRequest = ({ name, department }) => {
    const newRequest = {
      id: `pf-${Date.now()}`,
      name,
      department,
      requestedAt: new Date().toISOString(),
      status: 'pending',
    };

    setPendingFaculty((previous) => [newRequest, ...previous]);
  };

  const approvePendingFaculty = (requestId) => {
    const request = pendingFaculty.find((item) => item.id === requestId);
    if (!request) {
      return;
    }

    addFaculty({ name: request.name, department: request.department });
    setPendingFaculty((previous) => previous.filter((item) => item.id !== requestId));
  };

  const rejectPendingFaculty = (requestId) => {
    setPendingFaculty((previous) => previous.filter((item) => item.id !== requestId));
  };

  const handleLogin = (credentials) => {
    setSession(credentials);
  };

  const handleLogout = () => {
    setSession(null);
  };

  const defaultRouteByRole = {
    student: '/',
    faculty: '/faculty',
    admin: '/admin',
  };

  const defaultRoute = defaultRouteByRole[session?.role] ?? '/';

  if (!session) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="app-shell">
      <header className="header">
        <h1>College Appointment Management</h1>
        <nav className="nav">
          {session.role === 'student' ? (
            <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')}>
              Student
            </NavLink>
          ) : null}
          {session.role === 'faculty' ? (
            <NavLink to="/faculty" className={({ isActive }) => (isActive ? 'active' : '')}>
              Faculty ({pendingCount})
            </NavLink>
          ) : null}
          {session.role === 'admin' ? (
            <NavLink to="/admin" className={({ isActive }) => (isActive ? 'active' : '')}>
              Admin ({pendingFaculty.length})
            </NavLink>
          ) : null}
          <button type="button" className="btn-secondary" onClick={handleLogout}>
            Logout ({session.role})
          </button>
        </nav>
      </header>

      <main className="container">
        <Routes>
          <Route
            path="/"
            element={
              session.role === 'student' ? (
                <StudentPage
                  facultyList={facultyList}
                  appointments={appointments}
                  onBook={addAppointment}
                />
              ) : (
                <Navigate to={defaultRoute} replace />
              )
            }
          />
          <Route
            path="/faculty"
            element={
              session.role === 'faculty' ? (
                <FacultyPage
                  facultyList={facultyList}
                  appointments={appointments}
                  onUpdateAppointment={updateAppointment}
                  onSetFacultySlots={setFacultySlots}
                />
              ) : (
                <Navigate to={defaultRoute} replace />
              )
            }
          />
          <Route
            path="/admin"
            element={
              session.role === 'admin' ? (
                <AdminPage
                  facultyList={facultyList}
                  pendingFaculty={pendingFaculty}
                  onAddFaculty={addFaculty}
                  onAddPendingFacultyRequest={addPendingFacultyRequest}
                  onApproveFaculty={approvePendingFaculty}
                  onRejectFaculty={rejectPendingFaculty}
                />
              ) : (
                <Navigate to={defaultRoute} replace />
              )
            }
          />
          <Route path="*" element={<Navigate to={defaultRoute} replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
