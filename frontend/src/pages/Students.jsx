import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';

export default function Students() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.getStudentStats().then(setStats).catch(() => {});
  }, []);

  return (
    <section className="section narrow">
      <h1 className="page-title">Student Life & Records</h1>
      <p>
        Radiant College maintains a secure, centralized student management system that tracks
        enrollment, attendance, academic performance and personal records for every student
        across all departments. This ensures accurate reporting to students, parents and
        accreditation bodies.
      </p>

      {stats && (
        <div className="stats-cards">
          <div className="stat-card">
            <h3>{stats.total}</h3>
            <p>Total Enrolled Students</p>
          </div>
          <div className="stat-card">
            <h3>{stats.avgCgpa}</h3>
            <p>Average CGPA</p>
          </div>
          <div className="stat-card">
            <h3>{stats.byDept.length}</h3>
            <p>Active Departments</p>
          </div>
        </div>
      )}

      <h2>What the System Manages</h2>
      <ul className="bullet-list">
        <li>Student enrollment records (roll number, department, year)</li>
        <li>Attendance percentage tracking per semester</li>
        <li>Academic performance (CGPA) and progress history</li>
        <li>Contact details for students and guardians</li>
        <li>Status tracking (active, on leave, graduated)</li>
      </ul>

      <div className="callout">
        <p>
          Detailed student records are confidential and accessible only to authorized
          college staff through the <Link to="/admin/login">Admin Portal</Link>.
        </p>
      </div>
    </section>
  );
}
