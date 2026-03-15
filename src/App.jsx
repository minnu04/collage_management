import { NavLink, Navigate, Route, Routes } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { initialAppointments, initialFaculty, initialPendingFaculty } from './data';
import StudentPage from './pages/StudentPage';
import FacultyPage from './pages/FacultyPage';
import AdminPage from './pages/AdminPage';
import LoginPage from './pages/LoginPage';

const STORAGE_KEYS = {
  facultyList: 'college_app_faculty_list',
  appointments: 'college_app_appointments',
  pendingFaculty: 'college_app_pending_faculty',
  session: 'college_app_session',
};

const loadStoredValue = (key, fallbackValue) => {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) {
      return fallbackValue;
    }

    return JSON.parse(raw);
  } catch {
    return fallbackValue;
  }
};

function App() {
  const [facultyList, setFacultyList] = useState(() =>
    loadStoredValue(STORAGE_KEYS.facultyList, initialFaculty)
  );
  const [appointments, setAppointments] = useState(() =>
    loadStoredValue(STORAGE_KEYS.appointments, initialAppointments)
  );
  const [pendingFaculty, setPendingFaculty] = useState(() =>
    loadStoredValue(STORAGE_KEYS.pendingFaculty, initialPendingFaculty)
  );
  const [session, setSession] = useState(() => loadStoredValue(STORAGE_KEYS.session, null));

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.facultyList, JSON.stringify(facultyList));
  }, [facultyList]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.appointments, JSON.stringify(appointments));
  }, [appointments]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.pendingFaculty, JSON.stringify(pendingFaculty));
  }, [pendingFaculty]);

  useEffect(() => {
    if (session) {
      localStorage.setItem(STORAGE_KEYS.session, JSON.stringify(session));
      return;
    }

    localStorage.removeItem(STORAGE_KEYS.session);
  }, [session]);

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

  const requestFacultySignup = ({ name, department }) => {
    const normalizedName = name.trim().toLowerCase();
    const normalizedDepartment = department.trim();

    if (!normalizedName || !normalizedDepartment) {
      return { ok: false, message: 'Name and department are required.' };
    }

    const alreadyApproved = facultyList.some(
      (faculty) => faculty.name.toLowerCase() === normalizedName
    );
    if (alreadyApproved) {
      return { ok: false, message: 'Faculty already approved. Please use Faculty login.' };
    }

    const alreadyPending = pendingFaculty.some(
      (faculty) => faculty.name.toLowerCase() === normalizedName
    );
    if (alreadyPending) {
      return { ok: false, message: 'Request already pending admin approval.' };
    }

    addPendingFacultyRequest({ name: name.trim(), department: normalizedDepartment });
    return { ok: true, message: 'Request submitted. Wait for admin approval.' };
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
    return (
      <LoginPage
        onLogin={handleLogin}
        facultyList={facultyList}
        onRequestFacultySignup={requestFacultySignup}
      />
    );
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
                  loggedInStudentName={session.name}
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
                  loggedInFacultyName={session.name}
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
