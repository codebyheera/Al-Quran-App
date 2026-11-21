/**
 * pages/PrivacyPolicyPage.jsx — /privacy-policy route
 *
 * Static legal content page. No form, no data fetch — content is inline
 * since it's a one-off page, not something reused elsewhere.
 */

import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import Breadcrumb from '../components/Breadcrumb';
import { pageSeo } from '../data/pageSeo';
import './LegalPage.css';

const PAGE_URL = `https://alquranhub.org${pageSeo.privacyPolicy.path}`;
const LAST_UPDATED = '21st November 2026';

export default function PrivacyPolicyPage() {
  return (
    <div className="legal-page page-enter">
      <Helmet>
        <title>{pageSeo.privacyPolicy.title}</title>
        <meta name="description" content={pageSeo.privacyPolicy.description} />
        <meta name="robots" content="noindex, follow" />
        <link rel="canonical" href={PAGE_URL} />
      </Helmet>

      <div className="legal-page-inner">
        <Breadcrumb crumbs={[
          { label: 'Home', href: '/' },
          { label: 'Privacy Policy', href: '/privacy-policy' },
        ]} />

        <h1>Privacy <span className="text-gold">Policy</span></h1>
        <p className="text-muted legal-page-subtitle">Al-Quran Hub</p>

        <section className="legal-content">
          <h2>Our Privacy Commitment</h2>
          <p>Assalamu Alaikum,</p>
          <p>
            At Al-Quran Hub, we believe that your privacy is sacred — just as much as the knowledge we share. This
            Privacy Policy explains how we collect information about you, what we do with it, and how we protect
            your rights when you visit our website.
          </p>
          <p>
            We keep things simple and transparent because you deserve to know exactly what&apos;s happening when
            you spend time with us.
          </p>

          <h2>What Information We Automatically Collect</h2>
          <p>
            You can use all of Al-Quran Hub without an account. Logging in is optional (see
            &ldquo;Optional Account &amp; Sync&rdquo; below). Like most websites, we do receive some
            information automatically:
          </p>

          <p><strong>Google Analytics 4 (GA4) collects:</strong></p>
          <ul>
            <li>Your IP address (your internet location)</li>
            <li>What device you&apos;re using (phone, laptop, tablet)</li>
            <li>Your browser type (Chrome, Firefox, Safari, etc.)</li>
            <li>How long you stay on our site</li>
            <li>Which pages you read</li>
            <li>When you visit us</li>
          </ul>

          <p><strong>Google Search Console tells us:</strong></p>
          <ul>
            <li>Search queries that brought you to us</li>
            <li>How often our site appears in Google search results</li>
            <li>Which of our pages people click on</li>
          </ul>

          <p><strong>Cookies (small tracking files):</strong></p>
          <ul>
            <li>Google Analytics uses cookies to track your visits</li>
            <li>These help us understand if you&apos;re a new visitor or returning reader</li>
            <li>We don&apos;t use these cookies for advertising or selling your data</li>
          </ul>

          <h2>Why We Collect This Information</h2>
          <p>We collect this data for honest, simple reasons:</p>
          <ul>
            <li><strong>To Improve Your Experience</strong> — We want to know which Islamic topics interest you most so we can create better content.</li>
            <li><strong>To Understand Our Audience</strong> — We need to know how many people visit, where they&apos;re from, and what devices they use.</li>
            <li><strong>To Optimize Performance</strong> — If our site is slow or difficult to navigate, the data helps us fix problems.</li>
            <li><strong>To Measure Growth</strong> — As a non-profit, we need to show that Al-Quran Hub is actually helping people learn about Islam.</li>
            <li><strong>To Comply with Google&apos;s Requirements</strong> — Because we use Google Analytics and Search Console, Google requires us to have a Privacy Policy and be transparent.</li>
          </ul>

          <p><strong>What we DON&apos;T do:</strong></p>
          <ul>
            <li>We don&apos;t sell your data</li>
            <li>We don&apos;t share your information with advertisers</li>
            <li>We don&apos;t use your data to profile you</li>
            <li>We don&apos;t track you across other websites</li>
            <li>We don&apos;t create marketing lists from your visits</li>
          </ul>

          <h2>How Google Uses Your Data</h2>
          <p>
            Google Analytics and Search Console are run by Google LLC. When you visit us, Google collects data
            according to their own Privacy Policy.
          </p>
          <p>You should know:</p>
          <ul>
            <li>Google may use your data to show you ads on other websites (even though we don&apos;t have ads here)</li>
            <li>Google stores this data and may use it for their own purposes</li>
            <li>Your data is subject to Google&apos;s terms, not just ours</li>
          </ul>
          <p>
            To learn more, visit{' '}
            <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">
              Google&apos;s Privacy Policy
            </a>.
          </p>

          <h2>Optional Account &amp; Sync</h2>
          <p>
            If you choose to log in with Google or GitHub, you can keep your bookmarks, reading progress and
            settings the same on all your devices. We never see or store your Google or GitHub password.
          </p>
          <p><strong>When you log in, we store:</strong></p>
          <ul>
            <li>Your name and email address (from your Google or GitHub account)</li>
            <li>Your profile photo, if you upload one, plus the bio and social links you choose to add</li>
            <li>Your bookmarked verses (only the Surah and verse number)</li>
            <li>Your reading progress, reading streak and Tasbih / Durood counts</li>
            <li>Your reader settings (theme, fonts, reciter, translation language and similar)</li>
          </ul>
          <p>
            Your profile is <strong>private</strong>, so only you can see it. This data is stored securely with
            our database provider, Supabase, and is used only to run the sync feature. It is never sold, shown
            to other users, or used for advertising.
          </p>
          <p>
            <strong>Deleting your account:</strong> log in, open <em>My Profile</em> and choose{' '}
            <em>Delete my account</em>. Your profile, photo and all synced data are permanently removed from
            our servers straight away.
          </p>

          <h2>How We Protect Your Information</h2>
          <ul>
            <li>We use HTTPS encryption (the little lock icon in your browser) to protect data in transit</li>
            <li>
              If you don&apos;t log in, we don&apos;t store any of your personal information on our servers
              beyond what Google Analytics collects
            </li>
            <li>Account data is protected so that each user can only ever access their own data</li>
            <li>We don&apos;t sell or give access to your data</li>
          </ul>

          <h2>Cookies Explained Simply</h2>
          <p>
            A cookie is just a small text file that websites store on your device. Think of it like a bookmark
            that helps a website remember you.
          </p>
          <p><strong>Our cookies:</strong></p>
          <ul>
            <li>Google Analytics uses cookies to track visits</li>
            <li>These cookies help us see patterns (like how many unique visitors we get)</li>
            <li>Cookies expire after a certain time</li>
          </ul>
          <p><strong>To opt out of Google Analytics tracking:</strong></p>
          <ul>
            <li>
              Visit{' '}
              <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer">
                Google Analytics Opt-out Browser Add-on
              </a>
            </li>
            <li>Or use a privacy-focused browser</li>
            <li>Or disable cookies in your browser settings</li>
          </ul>

          <h2>Your Rights as a Visitor</h2>
          <p>Islamic values teach us that privacy is a fundamental right. Here&apos;s what you can do:</p>
          <ul>
            <li><strong>Right to Know</strong> — You can ask us what data we have about you</li>
            <li><strong>Right to Delete</strong> — You can request that your data be deleted</li>
            <li><strong>Right to Opt-Out</strong> — You can opt out of Google Analytics tracking</li>
            <li><strong>Right to Access</strong> — You can request a copy of the data we collect</li>
          </ul>
          <p>
            To exercise these rights, please reach out through our{' '}
            <Link to="/contact">Contact page</Link>.
          </p>

          <h2>Children&apos;s Privacy</h2>
          <p>
            Al-Quran Hub is designed for Islamic learning at all ages. However, we don&apos;t knowingly collect
            personal information from children under 18.
          </p>
          <p>If you&apos;re under 18, please ask your parent or guardian for permission before using this website.</p>
          <p>If we discover we&apos;ve collected data from a child under 18, we will delete it immediately.</p>

          <h2>Third-Party Links</h2>
          <p>
            Our website may link to other Islamic sites. We&apos;re not responsible for their privacy practices.
            When you click an external link, you&apos;re leaving Al-Quran Hub and their privacy policies apply.
          </p>

          <h2>Changes to This Policy</h2>
          <p>We may update this Privacy Policy from time to time as:</p>
          <ul>
            <li>Our services change</li>
            <li>Laws change</li>
            <li>Privacy best practices evolve</li>
          </ul>
          <p>
            We&apos;ll update the &ldquo;Last Updated&rdquo; date below. If changes are significant, we&apos;ll
            make it clear.
          </p>
          <p>Your continued use of Al-Quran Hub means you accept the updated policy.</p>

          <h2>How to Contact Us</h2>
          <p>
            If you have questions about this Privacy Policy or concerns about your privacy, we want to hear from
            you — visit our <Link to="/contact">Contact page</Link> and send us a message.
          </p>
          <p>We&apos;ll respond to privacy requests within 30 days.</p>

          <h2>Our Islamic Values</h2>
          <p>
            We believe in the Quran, Surah Al-Hujurat (49:12), which teaches not to spy on or investigate others.
            Your online privacy aligns with this Islamic principle of respecting personal boundaries. We take
            that seriously.
          </p>

          <p className="legal-last-updated"><strong>Last Updated:</strong> {LAST_UPDATED}</p>
          <p className="legal-last-updated" style={{ marginTop: '0.5rem', paddingTop: 0, borderTop: 'none' }}>
            <strong>Effective Date:</strong> {LAST_UPDATED}
          </p>
          <p className="legal-agreement">By using Al-Quran Hub, you agree to this Privacy Policy.</p>
        </section>
      </div>
    </div>
  );
}
