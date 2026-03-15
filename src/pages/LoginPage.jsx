import { useState } from 'react';

function LoginPage({ onLogin, facultyList, onRequestFacultySignup }) {
  const [name, setName] = useState('');
  const [userId, setUserId] = useState('');
  const [role, setRole] = useState('student');
  const [department, setDepartment] = useState('');
  const [facultySignupId, setFacultySignupId] = useState('');
  const [mode, setMode] = useState('login');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const resetFeedback = () => {
    setError('');
    setMessage('');
  };

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setPassword('');
    setUserId('');
    setName('');
    setDepartment('');
    setFacultySignupId('');
    resetFeedback();
  };

  const submitLogin = (event) => {
    event.preventDefault();
    const trimmedName = name.trim();
    const trimmedUserId = userId.trim().toUpperCase();
    resetFeedback();

    if (!trimmedName && role !== 'admin') {
      setError('Please enter your name.');
      return;
    }

    if ((role === 'student' || role === 'faculty') && !trimmedUserId) {
      setError('Please enter your ID.');
      return;
    }

    if (role === 'admin' && password !== 'admin123') {
      setError('Invalid admin password.');
      return;
    }

    const facultyById = facultyList.find(
      (faculty) => faculty.loginId.toLowerCase() === trimmedUserId.toLowerCase()
    );

    if (role === 'faculty' && !facultyById) {
      setError('Faculty ID not found or not approved.');
      return;
    }

    if (
      role === 'faculty' &&
      facultyById.name.toLowerCase() !== trimmedName.toLowerCase()
    ) {
      setError('Faculty name does not match the given ID.');
      return;
    }

    setError('');
    onLogin({
      name: role === 'faculty' ? facultyById.name : trimmedName,
      role,
      userId: role === 'admin' ? 'ADMIN' : trimmedUserId,
    });
  };

  const submitFacultySignup = (event) => {
    event.preventDefault();
    resetFeedback();

    const response = onRequestFacultySignup({
      name,
      department,
      loginId: facultySignupId,
    });
    if (!response.ok) {
      setError(response.message);
      return;
    }

    setMessage(response.message);
    setName('');
    setDepartment('');
    setFacultySignupId('');
  };

  return (
    <div className="auth-wrap">
      <section className="card auth-card">
        <h2>{mode === 'login' ? 'Login' : 'New Faculty Sign Up'}</h2>
        <p className="meta">
          {mode === 'login'
            ? 'Select role to continue.'
            : 'Submit request. Admin must approve before faculty login.'}
        </p>

        <div className="row-actions">
          <button type="button" className="btn-secondary" onClick={() => switchMode('login')}>
            Login
          </button>
          <button type="button" className="btn-secondary" onClick={() => switchMode('faculty-signup')}>
            New Faculty Sign Up
          </button>
        </div>

        {mode === 'login' ? (
          <form onSubmit={submitLogin}>
            <label>Role</label>
            <select value={role} onChange={(event) => setRole(event.target.value)}>
              <option value="student">Student</option>
              <option value="faculty">Faculty</option>
              <option value="admin">Admin</option>
            </select>

            {role !== 'admin' ? (
              <>
                <label>{role === 'faculty' ? 'Faculty ID' : 'Student ID'}</label>
                <input
                  value={userId}
                  onChange={(event) => setUserId(event.target.value)}
                  placeholder={role === 'faculty' ? 'Enter faculty ID (e.g. FAC1001)' : 'Enter student ID'}
                />

                <label>Name</label>
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Your name"
                />
              </>
            ) : null}

            {role === 'admin' ? (
              <>
                <label>Admin Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter admin password"
                />
              </>
            ) : null}

            {error ? <p className="error-text">{error}</p> : null}
            {message ? <p className="success-text">{message}</p> : null}
            <button type="submit" className="btn-primary full-btn">
              Login
            </button>
          </form>
        ) : (
          <form onSubmit={submitFacultySignup}>
            <label>Faculty ID</label>
            <input
              value={facultySignupId}
              onChange={(event) => setFacultySignupId(event.target.value.toUpperCase())}
              placeholder="Enter faculty ID (e.g. FAC2001)"
            />

            <label>Faculty Name</label>
            <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Enter faculty name" />

            <label>Department</label>
            <input
              value={department}
              onChange={(event) => setDepartment(event.target.value)}
              placeholder="Enter department"
            />

            {error ? <p className="error-text">{error}</p> : null}
            {message ? <p className="success-text">{message}</p> : null}
            <button type="submit" className="btn-primary full-btn">
              Submit for Admin Approval
            </button>
          </form>
        )}
      </section>
    </div>
  );
}

export default LoginPage;
