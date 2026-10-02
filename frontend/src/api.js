const BASE = `${import.meta.env.VITE_API_URL || ''}/api`;

function authHeaders() {
  const token = localStorage.getItem('rc_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handle(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const api = {
  login: (username, password) =>
    fetch(`${BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    }).then(handle),

  getCourses: () => fetch(`${BASE}/courses`).then(handle),
  getFaculty: () => fetch(`${BASE}/faculty`).then(handle),
  getStudentStats: () => fetch(`${BASE}/students/stats`).then(handle),

  sendContact: (payload) =>
    fetch(`${BASE}/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).then(handle),

  getStudents: (params = {}) => {
    const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v)).toString();
    return fetch(`${BASE}/students${qs ? `?${qs}` : ''}`, { headers: authHeaders() }).then(handle);
  },
  createStudent: (payload) =>
    fetch(`${BASE}/students`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(payload),
    }).then(handle),
  updateStudent: (id, payload) =>
    fetch(`${BASE}/students/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(payload),
    }).then(handle),
  updateStudentAcademic: (id, payload) =>
    fetch(`${BASE}/students/${id}/academic`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(payload),
    }).then(handle),
  deleteStudent: (id) =>
    fetch(`${BASE}/students/${id}`, { method: 'DELETE', headers: authHeaders() }).then(handle),

  getMessages: () => fetch(`${BASE}/messages`, { headers: authHeaders() }).then(handle),

  getAdmins: () => fetch(`${BASE}/auth/admins`, { headers: authHeaders() }).then(handle),
  createAdmin: (payload) =>
    fetch(`${BASE}/auth/admins`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(payload),
    }).then(handle),
  deleteAdmin: (id) =>
    fetch(`${BASE}/auth/admins/${id}`, { method: 'DELETE', headers: authHeaders() }).then(handle),
};
