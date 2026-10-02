import { useEffect, useState } from 'react';
import { api } from '../api';

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getCourses().then(setCourses).catch((e) => setError(e.message));
  }, []);

  return (
    <section className="section">
      <h1 className="page-title">Our Courses</h1>
      <p className="muted center">Undergraduate programs designed for industry readiness.</p>
      {error && <p className="error">{error}</p>}
      <div className="card-grid">
        {courses.map((c) => (
          <div className="card course-card" key={c.id}>
            <h3>{c.title}</h3>
            <div className="badges">
              <span className="badge">{c.department}</span>
              <span className="badge">{c.duration}</span>
              <span className="badge">{c.seats} seats</span>
            </div>
            <p>{c.description}</p>
          </div>
        ))}
        {courses.length === 0 && !error && <p>Loading courses…</p>}
      </div>
    </section>
  );
}
