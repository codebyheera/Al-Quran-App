/**
 * pages/ContactPage.jsx — Feedback / Contact Form
 */

import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { pageSeo } from '../data/pageSeo';
import './ContactPage.css';

const WEB3FORMS_ACCESS_KEY = 'f51c5806-f4da-413d-8a76-948846582654';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.message.trim()) return;
    setSending(true);

    try {
      const formData = new FormData();
      formData.append('access_key', WEB3FORMS_ACCESS_KEY);
      formData.append('subject', 'New message from Al-Quran Hub contact form');
      formData.append('name', form.name);
      formData.append('email', form.email);
      formData.append('message', form.message);

      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: formData,
      });

      const data = await response.json();
      if (!data.success) throw new Error(data.message || 'Submission failed');

      setSubmitted(true);
      setForm({ name: '', email: '', message: '' });
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message. Please try again later.');
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="contact-page page-enter">
      <Helmet>
        <title>{pageSeo.contact.title}</title>
        <meta name="description" content={pageSeo.contact.description} />
        <link rel="canonical" href={`https://alquranhub.org${pageSeo.contact.path}`} />
      </Helmet>

      <div className="contact-body">
        <div className="contact-inner">
          <div className="support-section-label">✉️ Get in Touch</div>
          <h1 className="contact-h1">Send Us a Message</h1>
          <p className="contact-sub">
            Feedback, suggestions, or just a dua — we'd love to hear from you.
          </p>

          <div className="support-form-card">
            {submitted ? (
              <div className="form-success">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" style={{ flexShrink: 0, marginTop: 2 }}>
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
                <span>JazakAllah Khair! Your message was received. We'll get back to you soon. ✨</span>
              </div>
            ) : (
              <form className="support-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label" htmlFor="contact-name">Your Name *</label>
                  <input
                    id="contact-name"
                    className="form-input"
                    type="text"
                    name="name"
                    placeholder="e.g. Muhammad Ali"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="contact-email">Email (optional)</label>
                  <input
                    id="contact-email"
                    className="form-input"
                    type="email"
                    name="email"
                    placeholder="your@email.com"
                    value={form.email}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="contact-message">Message *</label>
                  <textarea
                    id="contact-message"
                    className="form-textarea"
                    name="message"
                    placeholder="Share your thoughts, feedback, or make a dua for us…"
                    value={form.message}
                    onChange={handleChange}
                    required
                  />
                </div>
                <button
                  id="contact-submit"
                  type="submit"
                  className="btn btn-primary contact-submit-btn"
                  disabled={sending}
                >
                  {sending ? (
                    <>
                      <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                      Sending…
                    </>
                  ) : (
                    <>
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                        <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                      </svg>
                      Send Message
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
