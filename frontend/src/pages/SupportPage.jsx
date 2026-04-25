/**
 * pages/SupportPage.jsx — Premium Donation / Support Page
 */

import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import emailjs from '@emailjs/browser';
import './SupportPage.css';

const ACCOUNT_DETAILS = [
  { icon: '📱', label: 'SadaPay Account ID', value: '03201494772' },
  { icon: '🏦', label: 'IBAN (Bank Transfer)', value: 'PK35SADA0000003201494772' },
  { icon: '👤', label: 'Account Holder Name', value: 'Subhan Naeem' },
];

const HOW_TO_STEPS = [
  { text: <>Open the <strong>SadaPay</strong> app or any mobile banking app that supports IBFT.</> },
  { text: <>Go to <strong>"Send Money"</strong> and enter Account ID: <strong>03201494772</strong></> },
  { text: <>For bank transfers, copy the <strong>IBAN</strong> number and paste it in your bank app.</> },
  { text: <>Always verify the recipient name shows as <strong>"Subhan Naeem"</strong> before confirming.</> },
  { text: <>Done! May Allah multiply your reward. <strong>✨ Ameen</strong></> },
];

const STATS = [
  { number: '114', label: 'Surahs Available' },
  { number: '30', label: 'Juz Covered' },
  { number: '100%', label: 'Free Forever' },
  { number: '6,236', label: 'Total Ayahs' },
];

/* SadaPay official logo from user */
const SadaPayLogo = () => (
  <img 
    src="https://crystalpng.com/wp-content/uploads/2025/09/Sadapay-Logo.png" 
    alt="SadaPay Logo"
    width="120"
    height="120"
    loading="lazy"
    decoding="async"
    style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '4px' }}
  />
);

function CopyField({ icon, label, value }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    });
  };

  return (
    <div className="donation-field">
      <div className="donation-field-icon">{icon}</div>
      <div className="donation-field-info">
        <div className="donation-field-label">{label}</div>
        <div className="donation-field-value">{value}</div>
      </div>
      <button
        className={`copy-btn ${copied ? 'copied' : ''}`}
        onClick={handleCopy}
        title="Copy to clipboard"
      >
        {copied ? (
          <>
            <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor">
              <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" />
            </svg>
            Copied!
          </>
        ) : (
          <>
            <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor">
              <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" />
            </svg>
            Copy
          </>
        )}
      </button>
    </div>
  );
}

export default function SupportPage() {
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
      await emailjs.send(
        'service_k4pzlpl',
        'template_ifzca7y',
        {
          from_name: form.name,
          from_email: form.email,
          message: form.message,
        },
        'PiQEcy-c6dhp-LwpR'
      );
      setSubmitted(true);
      setForm({ name: '', email: '', message: '' });
    } catch (error) {
      console.error('Failed to send email:', error);
      alert('Failed to send message. Please try again later.');
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="support-page page-enter">
      <Helmet>
        <title>Support Al-Quran Hub | Help Keep Quran Free for Everyone</title>
        <meta name="description" content="Support Al-Quran Hub with a donation. Help us keep the Holy Quran free and accessible online for Muslims worldwide." />
        <meta name="keywords" content="Quran, Al-Quran Hub, donate, support, sadaqah, Islamic app, free Quran online, sadaqah jariyah, Muslim community" />
        <link rel="canonical" href="https://alquranhub.org/support" />
      </Helmet>

      {/* ── Hero ── */}
      <section className="support-hero">
        <div className="support-hero-bg" />
        <div className="support-hero-content">
          <div className="support-hero-badge">
            <span style={{ display: 'flex', alignItems: 'center' }}>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </span>
            Support the Project
          </div>
          <h1>
            Keep the Quran <span className="text-gold">Free &amp; Accessible</span>
          </h1>
          <p className="support-hero-sub">
            Al-Quran Hub is built with love — no ads, no subscriptions, no paywalls.
            Your sadaqah helps us maintain servers, add features, and serve the Ummah.
          </p>
          <div className="support-hero-ayah">
            <span className="arabic">مَن ذَا الَّذِي يُقْرِضُ اللَّهَ قَرْضًا حَسَنًا فَيُضَاعِفَهُ لَهُ أَضْعَافًا كَثِيرَةً</span>
            <span className="ayah-translation">
              "Who will lend Allah a goodly loan so He may multiply it for him many times over?"
            </span>
            <span className="ayah-ref">— Al-Baqarah 2:245</span>
          </div>
        </div>
      </section>

      {/* ── Impact Stats ── */}
      <div className="support-stats">
        <div className="support-stats-inner">
          {STATS.map(({ number, label }) => (
            <div key={label} className="stat-item">
              <div className="stat-number">{number}</div>
              <div className="stat-label">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Main Body ── */}
      <div className="support-body">
        <div className="support-body-inner">
          <div className="support-layout">

            {/* ── LEFT COLUMN ── */}
            <div className="support-left">
              {/* Donation Card */}
              <div className="support-section-label">🏦 Payment Details</div>
              <h2 className="support-section-h2">Send Your Donation</h2>

              <div className="donation-card">
                <div className="donation-card-top">
                  <div className="donation-bank-avatar">
                    <SadaPayLogo />
                  </div>
                  <div className="donation-bank-info">
                    <h3>SadaPay Account</h3>
                    <p>Pakistan · Digital Wallet · Instant Transfer</p>
                    <span className="verified-badge">
                      <svg viewBox="0 0 24 24" width="10" height="10" fill="currentColor">
                        <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
                      </svg>
                      Verified Account
                    </span>
                  </div>
                </div>
                <div className="donation-fields">
                  {ACCOUNT_DETAILS.map((field) => (
                    <CopyField key={field.label} {...field} />
                  ))}
                </div>
              </div>

              {/* How to Steps */}
              <div className="support-section-label" style={{ marginTop: '2.5rem' }}>📋 Instructions</div>
              <h2 className="support-section-h2">How to Send Money</h2>

              <div className="steps-list">
                {HOW_TO_STEPS.map(({ text }, i) => (
                  <div key={i} className="step-item">
                    <div className="step-left">
                      <div className="step-number">{i + 1}</div>
                      {i < HOW_TO_STEPS.length - 1 && <div className="step-line" />}
                    </div>
                    <p className="step-text">{text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* ── RIGHT SIDEBAR ── */}
            <div className="support-sidebar">

              {/* Trust card */}
              <div className="trust-card">
                <div className="trust-card-header">
                  <div className="trust-card-icon-wrap">
                    <svg viewBox="0 0 24 24" width="26" height="26" fill="none">
                      <path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402z" fill="url(#heart-grad)" />
                      <defs>
                        <linearGradient id="heart-grad" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
                          <stop stopColor="#c9a84c"/>
                          <stop offset="1" stopColor="#7F77DD"/>
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                  <h3>Every Rupee Counts</h3>
                </div>
                <p>
                  Even a small sadaqah keeps this platform alive for thousands of
                  readers. Your contribution is a means of continuous reward
                  — <strong>Sadaqah Jariyah</strong>. May Allah accept it from you. Ameen.
                </p>
                <div className="trust-divider" />
                <div className="trust-features">
                  {[
                    { icon: '🔒', text: 'Secure direct bank transfer' },
                    { icon: '✅', text: 'No middleman, goes directly to developer' },
                    { icon: '📖', text: 'Keeps Quran free for the Ummah' },
                  ].map(({ icon, text }) => (
                    <div key={text} className="trust-feature">
                      <span>{icon}</span>
                      <span>{text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Contact Form */}
              <div className="support-form-card">
                <div className="support-section-label">✉️ Get in Touch</div>
                <h2 className="support-section-h2" style={{ fontSize: '1.2rem', marginBottom: '0.2rem' }}>
                  Send a Message
                </h2>
                <p style={{ fontSize: '0.83rem', color: 'var(--text-muted)', marginBottom: '0' }}>
                  Feedback, suggestions, or just a dua — we'd love to hear from you.
                </p>

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
                      <label className="form-label" htmlFor="support-name">Your Name *</label>
                      <input
                        id="support-name"
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
                      <label className="form-label" htmlFor="support-email">Email (optional)</label>
                      <input
                        id="support-email"
                        className="form-input"
                        type="email"
                        name="email"
                        placeholder="your@email.com"
                        value={form.email}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="support-message">Message *</label>
                      <textarea
                        id="support-message"
                        className="form-textarea"
                        name="message"
                        placeholder="Share your thoughts, feedback, or make a dua for us…"
                        value={form.message}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <button
                      id="support-submit"
                      type="submit"
                      className="btn btn-primary support-submit-btn"
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

          {/* ── Bottom Banner ── */}
          <div className="support-bottom-banner">
            <div className="support-bottom-banner-icon">
              <svg viewBox="0 0 24 24" width="44" height="44" fill="none">
                <path d="M6 2v6l2 2-2 2v8l6-2 6 2v-8l-2-2 2-2V2H6z" stroke="var(--accent-gold)" strokeWidth="1.5" strokeLinejoin="round" fill="rgba(201,168,76,0.1)"/>
                <path d="M10 8h4M10 12h4" stroke="var(--accent-gold)" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <div>
              <h3>Built for the Ummah — Sustained by the Ummah</h3>
              <p>
                Al-Quran Hub was created as a gift to the Muslim community — free access to the
                complete Quran with audio recitations, translations, and bookmarks. If this platform
                has benefited you in any way, consider supporting it so others can benefit too.
                Even sharing it with a friend is a form of sadaqah. JazakAllah Khair. 🤍
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
