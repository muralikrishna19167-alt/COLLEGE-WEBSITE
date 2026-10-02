import { useState } from 'react';
import { api } from '../api';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState(null);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setStatus('sending');
    try {
      await api.sendContact(form);
      setStatus('success');
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      setStatus('error');
    }
  };

  return (
    <section className="section narrow">
      <h1 className="page-title">Contact Us</h1>
      <div className="two-col">
        <div>
          <h2>Get in Touch</h2>
          <p><strong>Address:</strong> Radiant College Campus, NH-44, Anantapur, Andhra Pradesh, India - 515001</p>
          <p><strong>Phone:</strong> +91 98765 00000</p>
          <p><strong>Email:</strong> info@radiantcollege.edu</p>
          <p><strong>Office Hours:</strong> Mon – Sat, 9:00 AM – 5:00 PM</p>
        </div>
        <div>
          <h2>Send a Message</h2>
          <form className="form" onSubmit={onSubmit}>
            <input name="name" placeholder="Your Name" value={form.name} onChange={onChange} required />
            <input name="email" type="email" placeholder="Your Email" value={form.email} onChange={onChange} required />
            <input name="subject" placeholder="Subject" value={form.subject} onChange={onChange} />
            <textarea name="message" placeholder="Your Message" rows={5} value={form.message} onChange={onChange} required />
            <button className="btn btn-primary" type="submit" disabled={status === 'sending'}>
              {status === 'sending' ? 'Sending…' : 'Send Message'}
            </button>
            {status === 'success' && <p className="success">Thank you! Your message has been sent.</p>}
            {status === 'error' && <p className="error">Something went wrong. Please try again.</p>}
          </form>
        </div>
      </div>
    </section>
  );
}
