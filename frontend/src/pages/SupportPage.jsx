/**
 * pages/SupportPage.jsx — Donation Page (conversion-focused)
 */

import { useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { pageSeo } from '../data/pageSeo';
import { RevealSection } from '../components/RevealSection';
import './SupportPage.css';

const ACCOUNT_DETAILS_PK = [
  { icon: '📱', label: 'SadaPay Account ID', value: '03201494772' },
  { icon: '👤', label: 'Account Holder Name', value: 'Subhan Naeem' },
];

const IBAN_DETAIL = { icon: '🏦', label: 'IBAN (Bank Transfer)', value: 'PK35SADA0000003201494772' };

const HOW_TO_STEPS = [
  { text: <>Open the <strong>SadaPay</strong> app or any mobile banking app that supports IBFT.</> },
  { text: <>Go to <strong>"Send Money"</strong> and enter Account ID: <strong>03201494772</strong></> },
  { text: <>Always verify the recipient name shows as <strong>"Subhan Naeem"</strong> before confirming.</> },
  { text: <>Done! May Allah multiply your reward. <strong>✨ Ameen</strong></> },
];

const STATS = [
  { number: '114', label: 'Surahs Available' },
  { number: '30', label: 'Juz Covered' },
  { number: '100%', label: 'Free Forever' },
];

const TRUST_ITEMS = [
  { icon: '🔒', text: 'Direct transfer' },
  { icon: '🚫', text: 'No middleman' },
  { icon: '✅', text: 'Verified account' },
];

/* SadaPay official logo from user */
const SadaPayLogo = () => (
  <img
    src="https://crystalpng.com/wp-content/uploads/2025/09/Sadapay-Logo.png"
    alt="SadaPay Logo"
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

const TABS = [
  { id: 'pk', label: 'In Pakistan', icon: '🇵🇰' },
  { id: 'intl', label: 'International', icon: '🌍' },
];

export default function SupportPage() {
  // Always defaults to "In Pakistan" — no persistence across sessions, most traffic is local.
  const [activeTab, setActiveTab] = useState('pk');
  const tabRefs = useRef({});

  function handleTabKeyDown(e) {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault();
    const currentIndex = TABS.findIndex((t) => t.id === activeTab);
    const dir = e.key === 'ArrowRight' ? 1 : -1;
    const nextTab = TABS[(currentIndex + dir + TABS.length) % TABS.length];
    setActiveTab(nextTab.id);
    tabRefs.current[nextTab.id]?.focus();
  }

  return (
    <div className="support-page page-enter">
      <Helmet>
        <title>{pageSeo.support.title}</title>
        <meta name="description" content={pageSeo.support.description} />
        <meta name="keywords" content={pageSeo.support.keywords} />
        <link rel="canonical" href={`https://alquranhub.org${pageSeo.support.path}`} />
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

      {/* ── Impact Stats (trimmed to donation-relevant signals) ── */}
      <RevealSection as="div" className="support-stats">
        <div className="support-stats-inner">
          {STATS.map(({ number, label }) => (
            <div key={label} className="stat-item">
              <div className="stat-number">{number}</div>
              <div className="stat-label">{label}</div>
            </div>
          ))}
        </div>
      </RevealSection>

      {/* ── Main Body — single focused donation flow ── */}
      <div className="support-body">
        <div className="support-body-inner">
          <RevealSection className="support-section">
            <span className="support-eyebrow">🏦 Payment Details</span>
            <h2>Send Your Donation</h2>

            {/* ── Tabs ── */}
            <div
              className="payment-tabs"
              role="tablist"
              aria-label="Choose your donation method"
              onKeyDown={handleTabKeyDown}
            >
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  ref={(el) => (tabRefs.current[tab.id] = el)}
                  role="tab"
                  id={`tab-${tab.id}`}
                  aria-selected={activeTab === tab.id}
                  aria-controls={`panel-${tab.id}`}
                  tabIndex={activeTab === tab.id ? 0 : -1}
                  className={`payment-tab ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <span aria-hidden="true">{tab.icon}</span> {tab.label}
                </button>
              ))}
            </div>

            {/* ── "In Pakistan" panel ── */}
            {activeTab === 'pk' && (
              <div
                id="panel-pk"
                role="tabpanel"
                aria-labelledby="tab-pk"
                tabIndex={0}
              >
                <div className="donation-card card">
                  <div className="donation-card-top">
                    <div className="donation-bank-avatar">
                      <SadaPayLogo />
                    </div>
                    <div className="donation-bank-info">
                      <h3>SadaPay Account</h3>
                      <p>Pakistan · Digital Wallet · Instant Transfer</p>
                      <span className="verified-badge">
                        <svg viewBox="0 0 24 24" width="10" height="10" fill="currentColor">
                          <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" />
                        </svg>
                        Verified Account
                      </span>
                    </div>
                  </div>
                  <div className="donation-fields">
                    {ACCOUNT_DETAILS_PK.map((field) => (
                      <CopyField key={field.label} {...field} />
                    ))}
                  </div>
                </div>

                <span className="support-eyebrow" style={{ marginTop: '2rem' }}>📋 Instructions</span>
                <h3>How to Send Money</h3>

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
            )}

            {/* ── "International" panel ── */}
            {activeTab === 'intl' && (
              <div
                id="panel-intl"
                role="tabpanel"
                aria-labelledby="tab-intl"
                tabIndex={0}
              >
                <div className="donation-card card">
                  <div className="donation-card-top">
                    <div className="donation-bank-avatar donation-bank-avatar-emoji">🌍</div>
                    <div className="donation-bank-info">
                      <h3>International Transfer</h3>
                      <p>Works from any country · Same account</p>
                      <span className="verified-badge">
                        <svg viewBox="0 0 24 24" width="10" height="10" fill="currentColor">
                          <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" />
                        </svg>
                        Verified Account
                      </span>
                    </div>
                  </div>
                  <div className="donation-fields">
                    <CopyField {...IBAN_DETAIL} />
                  </div>
                  <div className="intl-notes">
                    <p>💸 Send via your own Wise account for the lowest fees.</p>
                    <p>🏦 Or use a standard SWIFT bank wire — ask your bank to send to this IBAN.</p>
                  </div>
                </div>
              </div>
            )}
          </RevealSection>

          {/* ── Trust row ── */}
          <RevealSection as="div" className="trust-row">
            {TRUST_ITEMS.map(({ icon, text }) => (
              <div key={text} className="trust-row-item">
                <span aria-hidden="true">{icon}</span>
                <span>{text}</span>
              </div>
            ))}
          </RevealSection>

          {/* ── Bottom Banner ── */}
          <RevealSection as="div" className="support-bottom-banner">
            <div className="support-bottom-banner-icon">
              <svg viewBox="0 0 24 24" width="36" height="36" fill="none">
                <path d="M6 2v6l2 2-2 2v8l6-2 6 2v-8l-2-2 2-2V2H6z" stroke="var(--accent-gold)" strokeWidth="1.5" strokeLinejoin="round" fill="rgba(201,168,76,0.1)" />
                <path d="M10 8h4M10 12h4" stroke="var(--accent-gold)" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <p>
              Built for the Ummah, sustained by the Ummah. Every rupee is Sadaqah Jariyah — JazakAllah Khair. 🤍
            </p>
          </RevealSection>
        </div>
      </div>
    </div>
  );
}
