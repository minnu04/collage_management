import { useState } from 'react';

function LoginPage({ onLogin }) {
  const [name, setName] = useState('');
  const [role, setRole] = useState('student');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const submitLogin = (event) => {
    event.preventDefault();
    const trimmedName = name.trim();

    if (!trimmedName) {
      setError('Please enter your name.');
      return;
    }

    if (role === 'admin' && password !== 'admin123') {
      setError('Invalid admin password.');
      return;
    }

    setError('');
    onLogin({ name: trimmedName, role });
  };

  return (
    <div className="auth-wrap">
      <section className="card auth-card">
        <h2>Login</h2>
        <p className="meta">Select role to continue.</p>

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
          <button type="submit" className="btn-primary full-btn">
            Login
          </button>
        </form>
      </section>
    </div>
  );
}

export default LoginPage;
