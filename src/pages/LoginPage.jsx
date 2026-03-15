import { useState } from 'react';

function LoginPage({ onLogin, facultyList, onRequestFacultySignup }) {
  const [name, setName] = useState('');
  const [role, setRole] = useState('student');
  const [department, setDepartment] = useState('');
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
    resetFeedback();
  };

  const submitLogin = (event) => {
    event.preventDefault();
    const trimmedName = name.trim();
    resetFeedback();

    if (!trimmedName) {
      setError('Please enter your name.');
      return;
    }

    if (role === 'admin' && password !== 'admin123') {
      setError('Invalid admin password.');
      return;
    }

    if (
      role === 'faculty' &&
      !facultyList.some(
        (faculty) => faculty.name.toLowerCase() === trimmedName.toLowerCase()
      )
    ) {
      setError('Faculty name not found. Use an approved faculty name.');
      return;
    }

    setError('');
    onLogin({ name: trimmedName, role });
  };

  const submitFacultySignup = (event) => {
    event.preventDefault();
    resetFeedback();

    const response = onRequestFacultySignup({ name, department });
    if (!response.ok) {
      setError(response.message);
      return;
    }

    setMessage(response.message);
    setName('');
    setDepartment('');
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
            <label>Name</label>
            <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Your name" />

            <label>Role</label>
            <select value={role} onChange={(event) => setRole(event.target.value)}>
              <option value="student">Student</option>
              <option value="faculty">Faculty</option>
              <option value="admin">Admin</option>
            </select>

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
