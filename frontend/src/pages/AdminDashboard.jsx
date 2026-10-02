import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';

const emptyForm = { roll_no: '', name: '', department: 'Computer Science', year: 1, email: '', phone: '', attendance: 0, cgpa: 0, status: 'Active' };
const departments = ['Computer Science', 'Electronics', 'Mechanical', 'Civil', 'Management'];

const roleLabels = {
  super_admin: 'Super Admin',
  registrar: 'Registrar',
  exam_cell: 'Exam Cell',
};

export default function AdminDashboard() {
  const { admin } = useAuth();
  const isSuperAdmin = admin?.role === 'super_admin';
  const canManageStudents = admin?.role === 'super_admin' || admin?.role === 'registrar';
  const canViewMessages = admin?.role === 'super_admin' || admin?.role === 'registrar';

  const [tab, setTab] = useState('students');
  const [students, setStudents] = useState([]);
  const [messages, setMessages] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [query, setQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [adminForm, setAdminForm] = useState({ username: '', password: '', name: '', role: 'registrar', department: '' });
  const [adminError, setAdminError] = useState('');

  const loadStudents = () => {
    setLoading(true);
    api.getStudents({ q: query, department: deptFilter })
      .then(setStudents)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (tab === 'students') loadStudents();
    if (tab === 'messages') api.getMessages().then(setMessages).catch((e) => setError(e.message));
    if (tab === 'admins') api.getAdmins().then(setAdmins).catch((e) => setError(e.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  useEffect(() => {
    if (tab === 'students') {
      const t = setTimeout(loadStudents, 300);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, deptFilter]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: name === 'year' || name === 'attendance' || name === 'cgpa' ? Number(value) : value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editingId) {
        if (canManageStudents) {
          await api.updateStudent(editingId, form);
        } else {
          // exam_cell: academic-only update
          await api.updateStudentAcademic(editingId, { attendance: form.attendance, cgpa: form.cgpa, status: form.status });
        }
      } else {
        await api.createStudent(form);
      }
      resetForm();
      loadStudents();
    } catch (err) {
      setError(err.message);
    }
  };

  const onEdit = (s) => {
    setForm({
      roll_no: s.roll_no, name: s.name, department: s.department, year: s.year,
      email: s.email || '', phone: s.phone || '', attendance: s.attendance, cgpa: s.cgpa, status: s.status,
    });
    setEditingId(s.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const onDelete = async (id) => {
    if (!confirm('Delete this student record?')) return;
    try {
      await api.deleteStudent(id);
      loadStudents();
    } catch (err) {
      setError(err.message);
    }
  };

  const onAdminSubmit = async (e) => {
    e.preventDefault();
    setAdminError('');
    try {
      await api.createAdmin(adminForm);
      setAdminForm({ username: '', password: '', name: '', role: 'registrar', department: '' });
      api.getAdmins().then(setAdmins);
    } catch (err) {
      setAdminError(err.message);
    }
  };

  const onDeleteAdmin = async (id) => {
    if (!confirm('Remove this admin account?')) return;
    try {
      await api.deleteAdmin(id);
      api.getAdmins().then(setAdmins);
    } catch (err) {
      setAdminError(err.message);
    }
  };

  const summary = useMemo(() => ({
    count: students.length,
    avgCgpa: students.length ? (students.reduce((a, s) => a + s.cgpa, 0) / students.length).toFixed(2) : '0.00',
  }), [students]);

  return (
    <section className="section">
      <div className="dash-header">
        <div>
          <h1 className="page-title left">Admin Dashboard</h1>
          <p className="muted">
            Welcome back, {admin?.name || 'Administrator'} ·{' '}
            <span className="pill pill-active">{roleLabels[admin?.role] || admin?.role}</span>
          </p>
        </div>
        <div className="tabs">
          <button className={tab === 'students' ? 'tab active' : 'tab'} onClick={() => setTab('students')}>Student Records</button>
          {canViewMessages && (
            <button className={tab === 'messages' ? 'tab active' : 'tab'} onClick={() => setTab('messages')}>Contact Messages</button>
          )}
          {isSuperAdmin && (
            <button className={tab === 'admins' ? 'tab active' : 'tab'} onClick={() => setTab('admins')}>Manage Admins</button>
          )}
        </div>
      </div>

      {error && <p className="error">{error}</p>}

      {tab === 'students' && (
        <>
          <form className="student-form" onSubmit={onSubmit}>
            <h3>
              {editingId
                ? (canManageStudents ? 'Edit Student' : 'Update Attendance / CGPA / Status')
                : 'Add New Student'}
            </h3>
            {!canManageStudents && !editingId && (
              <p className="muted">Your role (Exam Cell) can update attendance, CGPA and status for existing students. Select "Edit" on a student below to proceed.</p>
            )}
            {(canManageStudents || editingId) && (
              <div className="form-grid">
                <input name="roll_no" placeholder="Roll No." value={form.roll_no} onChange={onChange} required disabled={!!editingId || !canManageStudents} />
                <input name="name" placeholder="Full Name" value={form.name} onChange={onChange} required disabled={!canManageStudents} />
                <select name="department" value={form.department} onChange={onChange} disabled={!canManageStudents}>
                  {departments.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
                <input name="year" type="number" min="1" max="5" placeholder="Year" value={form.year} onChange={onChange} required disabled={!canManageStudents} />
                <input name="email" type="email" placeholder="Email" value={form.email} onChange={onChange} disabled={!canManageStudents} />
                <input name="phone" placeholder="Phone" value={form.phone} onChange={onChange} disabled={!canManageStudents} />
                <input name="attendance" type="number" step="0.1" min="0" max="100" placeholder="Attendance %" value={form.attendance} onChange={onChange} />
                <input name="cgpa" type="number" step="0.01" min="0" max="10" placeholder="CGPA" value={form.cgpa} onChange={onChange} />
                <select name="status" value={form.status} onChange={onChange}>
                  <option>Active</option>
                  <option>On Leave</option>
                  <option>Graduated</option>
                </select>
              </div>
            )}
            {(canManageStudents || editingId) && (
              <div className="form-actions">
                <button className="btn btn-primary" type="submit">{editingId ? 'Save Changes' : 'Add Student'}</button>
                {editingId && <button className="btn btn-outline" type="button" onClick={resetForm}>Cancel</button>}
              </div>
            )}
          </form>

          <div className="table-toolbar">
            <input placeholder="Search by name or roll no." value={query} onChange={(e) => setQuery(e.target.value)} />
            <select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)}>
              <option value="">All Departments</option>
              {departments.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
            <span className="muted">{summary.count} students · Avg CGPA {summary.avgCgpa}</span>
          </div>

          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Roll No.</th><th>Name</th><th>Dept</th><th>Year</th>
                  <th>Attendance</th><th>CGPA</th><th>Status</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s.id}>
                    <td>{s.roll_no}</td>
                    <td>{s.name}</td>
                    <td>{s.department}</td>
                    <td>{s.year}</td>
                    <td>{s.attendance}%</td>
                    <td>{s.cgpa}</td>
                    <td><span className={`pill pill-${s.status.replace(' ', '-').toLowerCase()}`}>{s.status}</span></td>
                    <td className="row-actions">
                      <button className="link-btn" onClick={() => onEdit(s)}>Edit</button>
                      {canManageStudents && <button className="link-btn danger" onClick={() => onDelete(s.id)}>Delete</button>}
                    </td>
                  </tr>
                ))}
                {!loading && students.length === 0 && (
                  <tr><td colSpan={8} className="muted center">No students found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === 'messages' && canViewMessages && (
        <div className="table-wrap">
          <table className="data-table">
            <thead><tr><th>From</th><th>Email</th><th>Subject</th><th>Message</th><th>Received</th></tr></thead>
            <tbody>
              {messages.map((m) => (
                <tr key={m.id}>
                  <td>{m.name}</td>
                  <td>{m.email}</td>
                  <td>{m.subject || '—'}</td>
                  <td>{m.message}</td>
                  <td>{new Date(m.created_at).toLocaleString()}</td>
                </tr>
              ))}
              {messages.length === 0 && <tr><td colSpan={5} className="muted center">No messages yet.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'admins' && isSuperAdmin && (
        <>
          <form className="student-form" onSubmit={onAdminSubmit}>
            <h3>Add Admin Account</h3>
            <div className="form-grid">
              <input placeholder="Username" value={adminForm.username} onChange={(e) => setAdminForm({ ...adminForm, username: e.target.value })} required />
              <input placeholder="Password" type="password" value={adminForm.password} onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })} required />
              <input placeholder="Full Name" value={adminForm.name} onChange={(e) => setAdminForm({ ...adminForm, name: e.target.value })} required />
              <select value={adminForm.role} onChange={(e) => setAdminForm({ ...adminForm, role: e.target.value })}>
                <option value="registrar">Registrar</option>
                <option value="exam_cell">Exam Cell</option>
                <option value="super_admin">Super Admin</option>
              </select>
              <input placeholder="Department (optional)" value={adminForm.department} onChange={(e) => setAdminForm({ ...adminForm, department: e.target.value })} />
            </div>
            <div className="form-actions">
              <button className="btn btn-primary" type="submit">Create Account</button>
            </div>
            {adminError && <p className="error">{adminError}</p>}
          </form>

          <div className="table-wrap">
            <table className="data-table">
              <thead><tr><th>Username</th><th>Name</th><th>Role</th><th>Department</th><th>Actions</th></tr></thead>
              <tbody>
                {admins.map((a) => (
                  <tr key={a.id}>
                    <td>{a.username}</td>
                    <td>{a.name}</td>
                    <td>{roleLabels[a.role] || a.role}</td>
                    <td>{a.department || '—'}</td>
                    <td>
                      <button className="link-btn danger" onClick={() => onDeleteAdmin(a.id)}>Remove</button>
                    </td>
                  </tr>
                ))}
                {admins.length === 0 && <tr><td colSpan={5} className="muted center">No admin accounts found.</td></tr>}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}
