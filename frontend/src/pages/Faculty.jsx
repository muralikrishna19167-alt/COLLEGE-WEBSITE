import { useEffect, useState } from 'react';
import { api } from '../api';

export default function Faculty() {
  const [faculty, setFaculty] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getFaculty().then(setFaculty).catch((e) => setError(e.message));
  }, []);

  return (
    <section className="section">
      <h1 className="page-title">Our Faculty</h1>
      <p className="muted center">Experienced educators guiding the next generation.</p>
      {error && <p className="error">{error}</p>}
      <div className="card-grid">
        {faculty.map((f) => (
          <div className="card faculty-card" key={f.id}>
            <div className="avatar">{f.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}</div>
            <h3>{f.name}</h3>
            <p className="designation">{f.designation}</p>
            <p className="muted">{f.department}</p>
            <p>{f.qualification}</p>
            <p className="email">{f.email}</p>
          </div>
        ))}
        {faculty.length === 0 && !error && <p>Loading faculty…</p>}
      </div>
    </section>
  );
}
