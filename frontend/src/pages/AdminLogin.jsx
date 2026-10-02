import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminLogin() {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
      const dest = location.state?.from || '/admin';
      navigate(dest, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="section narrow">
      <div className="login-box">
        <h1 className="page-title">Admin Login</h1>
        <p className="muted center">Staff access only — manage student records securely.</p>
        <form className="form" onSubmit={onSubmit}>
          <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" required />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
          />
          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? 'Logging in…' : 'Login'}
          </button>
          {error && <p className="error">{error}</p>}
        </form>
        <div className="muted small">
          <p className="center"><strong>Demo credentials:</strong></p>
          <ul>
            <li>Super Admin — <code>admin</code> / <code>admin123</code></li>
            <li>Registrar — <code>registrar</code> / <code>registrar123</code></li>
            <li>Exam Cell — <code>examcell</code> / <code>exam123</code></li>
          </ul>
        </div>
      </div>
    </section>
  );
}
