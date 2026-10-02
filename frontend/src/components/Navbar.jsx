import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const links = [
  { to: '/', label: 'Home', end: true },
  { to: '/about', label: 'About' },
  { to: '/courses', label: 'Courses' },
  { to: '/admissions', label: 'Admissions' },
  { to: '/faculty', label: 'Faculty' },
  { to: '/students', label: 'Students' },
  { to: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <NavLink to="/" className="brand">
          <span className="brand-badge">RC</span>
          <span className="brand-text">
            Radiant College <small>of Engineering &amp; Management</small>
          </span>
        </NavLink>
        <nav className="nav-links">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={({ isActive }) => (isActive ? 'active' : '')}>
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="nav-admin">
          {admin ? (
            <>
              <NavLink to="/admin" className="btn btn-ghost">Dashboard</NavLink>
              <button
                className="btn btn-outline"
                onClick={() => {
                  logout();
                  navigate('/');
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <NavLink to="/admin/login" className="btn btn-outline">Admin Login</NavLink>
          )}
        </div>
      </div>
    </header>
  );
}
