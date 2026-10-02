import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { api } from '../api';

export default function Home() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.getStudentStats().then(setStats).catch(() => {});
  }, []);

  return (
    <>
      <section className="hero">
        <div className="hero-content">
          <h1>Shaping Futures at Radiant College</h1>
          <p>
            A center of academic excellence offering engineering and management programs,
            backed by modern infrastructure, experienced faculty, and a robust
            student management system.
          </p>
          <div className="hero-actions">
            <Link to="/admissions" className="btn btn-primary">Apply for Admission</Link>
            <Link to="/courses" className="btn btn-outline-light">Explore Courses</Link>
          </div>
        </div>
      </section>

      <section className="stats-strip">
        <div className="stat"><strong>27+</strong><span>Years of Excellence</span></div>
        <div className="stat"><strong>{stats ? stats.total : '—'}</strong><span>Enrolled Students</span></div>
        <div className="stat"><strong>6</strong><span>Degree Programs</span></div>
        <div className="stat"><strong>{stats ? stats.avgCgpa : '—'}</strong><span>Avg. CGPA</span></div>
      </section>

      <section className="section">
        <h2 className="section-title">Why Choose Radiant College?</h2>
        <div className="card-grid">
          <div className="card">
            <h3>Experienced Faculty</h3>
            <p>Learn from PhD holders and industry veterans dedicated to student success.</p>
          </div>
          <div className="card">
            <h3>Modern Infrastructure</h3>
            <p>Smart classrooms, research labs, and a 24x7 digital library on campus.</p>
          </div>
          <div className="card">
            <h3>Student Management System</h3>
            <p>Transparent tracking of attendance, academic performance and records for every student.</p>
          </div>
          <div className="card">
            <h3>Placement Support</h3>
            <p>Dedicated training & placement cell with strong industry partnerships.</p>
          </div>
        </div>
      </section>

      <section className="section alt">
        <h2 className="section-title">Our Students, By Department</h2>
        <div className="dept-grid">
          {stats && stats.byDept.map((d) => (
            <div key={d.department} className="dept-pill">
              <span className="dept-name">{d.department}</span>
              <span className="dept-count">{d.count} students</span>
            </div>
          ))}
          {!stats && <p>Loading student data…</p>}
        </div>
        <p className="muted center">
          Full student records (attendance, CGPA, contact info) are managed securely by
          college staff via the <Link to="/admin/login">Admin Portal</Link>.
        </p>
      </section>
    </>
  );
}
