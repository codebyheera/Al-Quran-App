/**
 * pages/TermsPage.jsx — /terms-and-conditions route
 *
 * Static legal content page, styled via the shared LegalPage.css (also used
 * by PrivacyPolicyPage.jsx). Content sources (APIs, translations, reciters)
 * below are pulled from what the backend actually uses — see:
 *   backend/routes/surah.js, backend/routes/juz.js   (Al Quran Cloud editions,
 *     Quran.com word-by-word API, reciter mapping, everyayah.com CDN)
 *   backend/routes/prayerTimes.js                     (Aladhan API)
 *   backend/scripts/upload-urdu-audio.js               (Urdu audio mirror)
 *   frontend/src/lib/audioSource.js                    (Durood audio source)
 * Keep this in sync if any of those sources/providers ever change.
 */

import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import Breadcrumb from '../components/Breadcrumb';
import { pageSeo } from '../data/pageSeo';
import './LegalPage.css';

const PAGE_URL = `https://alquranhub.org${pageSeo.terms.path}`;
const LAST_UPDATED = '20th September 2026';

export default function TermsPage() {
  return (
    <div className="legal-page page-enter">
      <Helmet>
        <title>{pageSeo.terms.title}</title>
        <meta name="description" content={pageSeo.terms.description} />
        <meta name="robots" content="noindex, follow" />
        <link rel="canonical" href={PAGE_URL} />
      </Helmet>

      <div className="legal-page-inner">
        <Breadcrumb crumbs={[
          { label: 'Home', href: '/' },
          { label: 'Terms & Conditions', href: '/terms-and-conditions' },
        ]} />

        <h1>Terms & <span className="text-gold">Conditions</span></h1>
        <p className="text-muted legal-page-subtitle">Al-Quran Hub</p>

        <section className="legal-content">
          <h2>Welcome to Al-Quran Hub</h2>
          <p>Assalamu Alaikum,</p>
          <p>
            These Terms &amp; Conditions establish the rules for using Al-Quran Hub. By accessing and using our
            website, you agree to follow these terms. Please read them carefully.
          </p>
          <p>We&apos;ve kept them simple and clear because we believe transparency builds trust.</p>

          <h2>1. What Al-Quran Hub Is</h2>
          <p>
            Al-Quran Hub is a free, non-profit educational platform dedicated to helping people learn and
            understand the Quran and Islamic knowledge. We provide:
          </p>
          <ul>
            <li>Quranic text, word-by-word breakdowns, and translations</li>
            <li>Prayer (Salah) times and an Islamic (Hijri) calendar</li>
            <li>Educational resources, including a blog</li>
            <li>Audio recitations (Tilawat) and Urdu translation audio</li>
            <li>Tools like a digital Tasbih counter and Durood Sharif counter</li>
          </ul>
          <p><strong>What we are NOT:</strong></p>
          <ul>
            <li>We are not a fatwa (religious ruling) service</li>
            <li>We are not replacing qualified Islamic scholars</li>
            <li>We do not provide personal religious counseling</li>
            <li>We do not issue religious advice for specific situations</li>
          </ul>

          <h2>2. How You Can Use This Website</h2>
          <p>When you visit Al-Quran Hub, you agree to the following:</p>

          <p><strong>✅ You CAN:</strong></p>
          <ul>
            <li>Read and learn from all content freely</li>
            <li>Share content with family and friends for educational purposes</li>
            <li>Take notes for personal study</li>
            <li>Discuss topics with others</li>
            <li>Use content for educational purposes</li>
            <li>Share individual Quranic verses with proper attribution</li>
            <li>Listen to audio for personal learning</li>
          </ul>

          <p><strong>❌ You CANNOT:</strong></p>
          <ul>
            <li>Republish our website layout or design without permission</li>
            <li>Scrape or download large portions of the website using automated tools</li>
            <li>Use bots, scrapers, or automation to access the site</li>
            <li>Claim our website design or original content as your own</li>
            <li>Modify our content and represent it as original</li>
            <li>Use our website design or layout for commercial purposes without permission</li>
            <li>Clone or create competing sites using our exact structure</li>
            <li>Remove attribution or source credits</li>
            <li>Sell access to our content</li>
          </ul>

          <h2>3. Intellectual Property &amp; Attribution</h2>
          <p>Al-Quran Hub contains content from multiple sources. Here&apos;s what belongs to whom and how you can use it:</p>

          <h3>A. Quranic Text &amp; Translations</h3>
          <p><strong>Arabic Quranic Text</strong></p>
          <ul>
            <li>Status: Public Domain</li>
            <li>The Quran&apos;s Arabic text is not copyrighted</li>
            <li>You can freely use, share, and study it</li>
            <li>Text is sourced via the Al Quran Cloud API (Uthmani script) and the Quran.com API (word-by-word breakdown)</li>
          </ul>

          <p><strong>Translations</strong></p>
          <ul>
            <li>Our English translation is <strong>Saheeh International</strong>, and our Urdu translation is by <strong>Fateh Muhammad Jalandhry</strong> — both sourced via the Al Quran Cloud API</li>
            <li>We do NOT claim ownership of these translations</li>
            <li>Credit belongs to the original translators</li>
            <li>We present these translations for educational purposes under fair use</li>
          </ul>

          <p><strong>Your Rights:</strong></p>
          <ul>
            <li>Read and learn from translations</li>
            <li>Share Quranic verses for educational and personal purposes</li>
            <li>Cite translations with proper attribution</li>
          </ul>

          <p><strong>You Cannot:</strong></p>
          <ul>
            <li>Republish our entire collection of translations as your own work</li>
            <li>Claim translations as your creation</li>
            <li>Use translations for commercial purposes without the translator&apos;s permission</li>
            <li>Modify translations and present them as original</li>
          </ul>

          <p><strong>Attribution Format (when sharing):</strong></p>
          <div className="legal-example">
            Surah Al-Fatiha, Verse 1<br />
            Arabic: [verse]<br />
            Translation: Saheeh International<br />
            Source: Al-Quran Hub (alquranhub.org)
          </div>

          <h3>B. Audio Content (Tilawat &amp; Urdu Audio)</h3>
          <p><strong>Quranic Recitations (Tilawat)</strong></p>
          <ul>
            <li>Streamed from third-party sources — the Al Quran Cloud audio API (via the Islamic Network CDN) and everyayah.com — not stored on our own servers</li>
            <li>Available reciters: Abdul Basit Abdul Samad, Abdul Rahman Al-Sudais, Saad Al-Ghamidi, Mishary Rashid Alafasy, and Yasser Al-Dossari</li>
            <li>Reciter credit is shown wherever audio plays</li>
            <li>Recordings belong to the original reciters/rights holders; we use them for educational purposes</li>
          </ul>

          <p><strong>Urdu Translation Audio</strong></p>
          <ul>
            <li>Narrated by Shamshad Ali Khan (Al Quran Cloud&apos;s &ldquo;ur.khan&rdquo; edition)</li>
            <li>We host a mirrored copy of this audio on our own storage for faster, more reliable playback</li>
          </ul>

          <p><strong>Durood Sharif Audio</strong></p>
          <ul>
            <li>Sourced from NooreSunnat.com, whose content is explicitly published as free to use for Dawah (Islamic educational) purposes</li>
            <li>We host a copy of this specific clip on our own storage</li>
          </ul>

          <p><strong>Your Rights:</strong></p>
          <ul>
            <li>Listen for personal learning</li>
            <li>Share audio links for educational purposes</li>
            <li>Cite the reciter&apos;s name and source</li>
          </ul>

          <p><strong>You Cannot:</strong></p>
          <ul>
            <li>Download and republish audio without attribution</li>
            <li>Use audio commercially</li>
            <li>Remove reciter credits</li>
            <li>Claim audio as your own creation</li>
          </ul>

          <p><strong>Attribution for Audio:</strong></p>
          <div className="legal-example">
            &ldquo;Surah [Name], recited by [Reciter Name]<br />
            Source: Al-Quran Hub (alquranhub.org)&rdquo;
          </div>

          <h3>C. Prayer Times &amp; Islamic Calendar</h3>
          <p>
            Prayer times and the Hijri (Islamic) calendar date are calculated via the Aladhan API, using the
            University of Islamic Sciences, Karachi calculation method and the Hanafi school for Asr timing.
            These are third-party calculations, not our own religious rulings.
          </p>

          <h3>D. AI Chatbot</h3>
          <p>
            Where available, our AI-assisted chatbot is powered by a third-party AI service (Groq). Its answers
            are generated automatically and are not a substitute for a qualified Islamic scholar — see Section 4
            below.
          </p>

          <h3>E. Website Design &amp; Original Content (OUR COPYRIGHT)</h3>
          <p>Our original work IS copyrighted:</p>
          <ul>
            <li>Website layout, design, and user interface</li>
            <li>Original commentary, blog articles, and explanations we&apos;ve written</li>
            <li>Custom educational features (Tasbih counter, Durood counter, prayer times pages, etc.)</li>
          </ul>
          <p>Copyright Notice: © Al-Quran Hub. All rights reserved.</p>

          <p><strong>Your Rights:</strong></p>
          <ul>
            <li>Access for personal learning</li>
            <li>Share individual pages with proper attribution</li>
            <li>Quote small sections (1–2 sentences) with attribution</li>
          </ul>

          <p><strong>You Cannot:</strong></p>
          <ul>
            <li>Copy, clone, or recreate our website design</li>
            <li>Republish our original commentary as your own work</li>
            <li>Use our layout commercially</li>
            <li>Scrape or bulk download our original content</li>
            <li>Create competing sites using our structure</li>
          </ul>

          <h3>F. How to Properly Attribute Content</h3>
          <p><strong>Online:</strong></p>
          <div className="legal-example">
            &ldquo;Source: Al-Quran Hub (alquranhub.org)&rdquo;
          </div>
          <p><strong>Full example:</strong></p>
          <div className="legal-example">
            &ldquo;This Quranic verse is from Al-Quran Hub.<br />
            Translation: Saheeh International<br />
            Learn more at: alquranhub.org&rdquo;
          </div>
          <p><strong>In print:</strong></p>
          <div className="legal-example">
            &ldquo;Quranic text and translation from Al-Quran Hub — alquranhub.org&rdquo;
          </div>

          <h3>G. For Publishers, Educators &amp; Content Creators</h3>
          <p>If you want to use Al-Quran Hub content beyond personal use:</p>
          <ol>
            <li>Reach out through our <Link to="/contact">Contact page</Link></li>
            <li>Describe your intended use</li>
            <li>Explain scope (audience, platform, commercial/non-commercial)</li>
            <li>Wait for our response (5–7 business days)</li>
          </ol>
          <p><strong>We may grant permission for:</strong></p>
          <ul>
            <li>Educational institutions (schools, universities)</li>
            <li>Non-profit organizations</li>
            <li>Research and academic purposes</li>
            <li>Limited commercial use (with proper attribution)</li>
          </ul>
          <p><strong>We typically decline:</strong></p>
          <ul>
            <li>Direct competition or site cloning</li>
            <li>Using our content to replace us</li>
            <li>Removing our attribution or credits</li>
          </ul>

          <h2>4. Important Disclaimer</h2>
          <p>This is critical to understand, especially for Islamic content:</p>

          <h3>A. Islamic Jurisprudence Varies</h3>
          <p>The Islamic world has multiple schools of thought (madhabs): Hanafi, Maliki, Shafi&apos;i, Hanbali, and others.</p>
          <p>Content on Al-Quran Hub reflects Islamic knowledge, but:</p>
          <ul>
            <li>Different scholars may have different interpretations</li>
            <li>Islamic law varies by region and school of thought</li>
            <li>We do not claim our interpretations are the only valid ones</li>
            <li>We respect all legitimate Islamic perspectives</li>
          </ul>

          <h3>B. Not a Substitute for Qualified Scholars</h3>
          <p>For personal religious matters, you MUST consult qualified Islamic scholars such as:</p>
          <ul>
            <li>Your local imam</li>
            <li>Islamic scholars in your community</li>
            <li>Recognized Islamic institutions</li>
            <li>A qualified Mufti or Islamic legal expert</li>
            <li>Established religious authorities</li>
          </ul>
          <p>Do NOT use Al-Quran Hub content as your sole source for:</p>
          <ul>
            <li>Personal fatwa (religious rulings)</li>
            <li>Medical decisions with Islamic implications</li>
            <li>Legal/financial matters with Islamic aspects</li>
            <li>Family issues requiring Islamic guidance</li>
            <li>Business decisions with Islamic concerns</li>
            <li>Sensitive religious or personal matters</li>
          </ul>

          <h3>C. Accuracy Disclaimer</h3>
          <p>While we strive for accuracy:</p>
          <ul>
            <li>We make no guarantee that all content is 100% accurate</li>
            <li>Islamic knowledge is complex and interpretations can vary</li>
            <li>Errors may exist despite our efforts</li>
            <li>We are not responsible for consequences of using this information</li>
            <li>Translation accuracy depends on the individual translators</li>
          </ul>
          <p>
            If you find an error or have concerns, please let us know through our{' '}
            <Link to="/contact">Contact page</Link>. We appreciate corrections and will investigate.
          </p>

          <h2>5. What We&apos;re NOT Responsible For</h2>
          <p>Al-Quran Hub is provided &ldquo;as-is&rdquo; without any guarantees.</p>
          <p><strong>❌ We are NOT responsible for:</strong></p>
          <ul>
            <li>Consequences of decisions made based on our content</li>
            <li>Personal religious rulings or fatwas you derive from our site</li>
            <li>Medical decisions influenced by Islamic content</li>
            <li>Business or financial decisions</li>
            <li>Family or personal matters</li>
            <li>How you interpret or apply Islamic knowledge</li>
            <li>Harm or loss from using our website</li>
            <li>Third-party websites we link to</li>
            <li>Accuracy of external sources or APIs we use (Al Quran Cloud, Quran.com, Aladhan, and others)</li>
            <li>Your own actions or decisions</li>
            <li>Misuse of our content by others</li>
            <li>Issues with audio playback or streaming</li>
            <li>Internet connection problems</li>
          </ul>
          <p>By using Al-Quran Hub, you accept full responsibility for your decisions and use of the content.</p>

          <h2>6. Your Behavior on Our Website</h2>
          <p>You agree to use Al-Quran Hub responsibly:</p>

          <p><strong>✅ Respectful behavior:</strong></p>
          <ul>
            <li>Treat Islam and Islamic scholars with respect</li>
            <li>Don&apos;t mock or disrespect Islamic teachings</li>
            <li>Be civil in any comments or discussions</li>
            <li>Respect other users</li>
            <li>Appreciate the sacred nature of Quranic content</li>
          </ul>

          <p><strong>❌ Prohibited behavior:</strong></p>
          <ul>
            <li>Hateful content toward any religion or group</li>
            <li>Disrespect toward the Quran or Islamic teachings</li>
            <li>Spam or repeated off-topic posts</li>
            <li>Attempting to hack or damage the website</li>
            <li>Posting false information or misinformation</li>
            <li>Harassment of other users</li>
            <li>Vulgar or abusive language</li>
            <li>Promoting harmful activities</li>
            <li>Using automated tools to scrape content</li>
            <li>Commercial use without permission</li>
          </ul>

          <p><strong>If you violate these rules:</strong></p>
          <ul>
            <li>We may remove your comments or content</li>
            <li>We may block your access to the website</li>
            <li>We may report illegal activity to authorities</li>
            <li>We are not responsible for any consequences</li>
          </ul>

          <h2>7. Third-Party Links &amp; Services</h2>
          <p><strong>External Websites:</strong></p>
          <ul>
            <li>We don&apos;t control external websites</li>
            <li>We don&apos;t endorse everything on linked sites</li>
            <li>Their privacy policies and terms apply, not ours</li>
            <li>We&apos;re not responsible for their content or practices</li>
            <li>Click external links at your own risk</li>
          </ul>
          <p><strong>Third-Party APIs &amp; Services:</strong></p>
          <ul>
            <li>We use third-party APIs to provide content: Al Quran Cloud and Quran.com (Quranic text, translations, and audio), and Aladhan (prayer times and the Hijri calendar)</li>
            <li>These services have their own terms and policies</li>
            <li>We are not responsible for their availability or accuracy</li>
            <li>Service interruptions on their end may affect Al-Quran Hub&apos;s availability</li>
          </ul>

          <h2>8. Changes to Our Website</h2>
          <p>Al-Quran Hub may:</p>
          <ul>
            <li>Add, remove, or modify content anytime</li>
            <li>Change website features or design</li>
            <li>Update or discontinue services</li>
            <li>Take the site offline for maintenance</li>
            <li>Update which APIs or sources we use</li>
          </ul>
          <p>We&apos;ll try to give notice for major changes, but we&apos;re not obligated to.</p>

          <h2>9. Website Availability</h2>
          <p>We try to keep Al-Quran Hub available 24/7, but:</p>
          <ul>
            <li>We don&apos;t guarantee the site will always be online</li>
            <li>We may need maintenance or updates (downtime possible)</li>
            <li>Technical problems may occur</li>
            <li>Third-party API issues may cause unavailability</li>
            <li>We&apos;re not responsible if the site is temporarily unavailable</li>
          </ul>

          <h2>10. Limitation of Liability</h2>
          <p>To the maximum extent allowed by law, Al-Quran Hub is not liable for:</p>
          <ul>
            <li>Indirect or consequential damages</li>
            <li>Loss of profits, data, or business</li>
            <li>Emotional distress or upset</li>
            <li>Any damages from using the website</li>
            <li>Any damages from NOT being able to use the website</li>
            <li>Third-party actions or content</li>
            <li>Issues with third-party services or APIs</li>
          </ul>
          <p>This applies even if we know harm could occur.</p>

          <h2>11. Intellectual Property Claims</h2>
          <p>If you believe we&apos;ve violated your copyright or intellectual property rights, please reach out through our <Link to="/contact">Contact page</Link> with:</p>
          <ul>
            <li>Your name and contact information</li>
            <li>Description of the copyrighted work</li>
            <li>Location on our website where the violation occurs</li>
            <li>Explanation of why you believe we violated your rights</li>
            <li>Your statement that the information is accurate</li>
            <li>Your signature (physical or digital)</li>
          </ul>
          <p>We&apos;ll investigate and respond within 30 days.</p>

          <h2>12. Children &amp; Young Users</h2>
          <p>Al-Quran Hub is designed for all ages, but:</p>
          <ul>
            <li>If you&apos;re under 18, get parental permission before using the site</li>
            <li>Parents/guardians are responsible for monitoring their children&apos;s use</li>
            <li>We don&apos;t knowingly collect personal data from children</li>
            <li>If we discover a child&apos;s personal data, we&apos;ll delete it immediately</li>
            <li>We encourage parents to supervise children&apos;s learning</li>
          </ul>

          <h2>13. Modifications to Terms</h2>
          <p>We may update these Terms &amp; Conditions anytime:</p>
          <ul>
            <li>Changes will be posted on this page</li>
            <li>The &ldquo;Last Updated&rdquo; date will be updated</li>
            <li>Continued use means you accept changes</li>
          </ul>
          <p>Major changes: we&apos;ll try to notify users, but you&apos;re responsible for checking updates regularly.</p>

          <h2>14. Termination of Access</h2>
          <p>We may restrict or terminate your access if:</p>
          <ul>
            <li>You violate these Terms &amp; Conditions</li>
            <li>You engage in illegal activity</li>
            <li>You harm the website or other users</li>
            <li>You violate our content policies</li>
            <li>You use automated scraping or bots</li>
            <li>At our sole discretion</li>
          </ul>
          <p>We&apos;re not required to warn you or explain the reason.</p>

          <h2>15. Governing Law &amp; Jurisdiction</h2>
          <p>These Terms are governed by:</p>
          <ul>
            <li>Islamic principles (as the primary ethical framework)</li>
            <li>Laws of Pakistan (as the jurisdictional authority)</li>
          </ul>
          <p>Any disputes will be handled through:</p>
          <ol>
            <li>First: Direct communication and resolution</li>
            <li>Second: Mediation (if possible)</li>
            <li>Third: Legal proceedings in Pakistan (if necessary)</li>
          </ol>

          <h2>16. Our Islamic Values</h2>
          <p>Al-Quran Hub is built on Islamic principles:</p>
          <div className="legal-example">
            📖 Quran 5:2 — &ldquo;Help one another in righteousness and piety, but do not help one another in sin
            and transgression.&rdquo;
          </div>
          <div className="legal-example">
            📖 Quran 49:12 — &ldquo;Do not spy on one another, nor backbite one another.&rdquo;
          </div>
          <p><strong>Our commitment:</strong></p>
          <ul>
            <li>We promote ethical use of our platform</li>
            <li>We discourage misuse of Islamic knowledge</li>
            <li>We respect Islamic scholarship and scholars</li>
            <li>We value honesty and transparency in all content and operations</li>
            <li>We protect user privacy as an Islamic value</li>
            <li>We maintain the sanctity of Quranic content</li>
          </ul>

          <h2>17. Severability</h2>
          <p>If any part of these Terms is found invalid or unenforceable:</p>
          <ul>
            <li>The rest of the Terms remain in effect</li>
            <li>The invalid part will be removed</li>
            <li>We&apos;ll update these Terms accordingly</li>
          </ul>

          <h2>18. Entire Agreement</h2>
          <p>These Terms &amp; Conditions, along with our <Link to="/privacy-policy">Privacy Policy</Link>, make up the entire agreement between you and Al-Quran Hub:</p>
          <ul>
            <li>They replace any previous agreements</li>
            <li>No other conversations or promises apply</li>
            <li>Both documents together form the complete agreement</li>
          </ul>

          <h2>19. Contact Us</h2>
          <p>
            Questions about these Terms &amp; Conditions or our content policies? Reach out through our{' '}
            <Link to="/contact">Contact page</Link>.
          </p>
          <p><strong>Response Time:</strong> We&apos;ll respond within 7 business days.</p>
          <p><strong>For Copyright or IP Issues:</strong> Use the process described in Section 11.</p>
          <p><strong>For Content Corrections:</strong> Reach out with specific details about the error.</p>

          <h2>20. Last Words</h2>
          <p>Al-Quran Hub exists to serve knowledge, faith, and the Islamic community. We ask that you:</p>
          <ul>
            <li>✅ Use this resource wisely and respectfully</li>
            <li>✅ Respect Islamic teachings and the Quran</li>
            <li>✅ Consult qualified scholars for personal matters</li>
            <li>✅ Share this knowledge responsibly with attribution</li>
            <li>✅ Help us keep the platform respectful and constructive</li>
            <li>✅ Report errors or concerns so we can improve</li>
          </ul>

          <h2>21. Fair Use &amp; Educational Purposes</h2>
          <p>We believe in educational access while respecting intellectual property.</p>
          <p><strong>Our Fair Use Principles:</strong></p>
          <ul>
            <li>We provide Quranic content for learning and research</li>
            <li>We credit translators and reciters</li>
            <li>We do not compete with or replace copyright holders</li>
            <li>We direct users to original sources where appropriate</li>
            <li>We respect all copyright and licensing requirements</li>
          </ul>
          <p><strong>If a copyright holder objects:</strong></p>
          <ul>
            <li>We will work to resolve the issue promptly</li>
            <li>We may remove or modify content as required</li>
            <li>We appreciate notification of any concerns through our <Link to="/contact">Contact page</Link></li>
          </ul>

          <p className="legal-last-updated"><strong>Last Updated:</strong> {LAST_UPDATED}</p>
          <p className="legal-last-updated" style={{ marginTop: '0.5rem', paddingTop: 0, borderTop: 'none' }}>
            <strong>Effective Date:</strong> {LAST_UPDATED}
          </p>
          <p className="legal-agreement">By using Al-Quran Hub, you agree to these Terms &amp; Conditions.</p>
          <p className="legal-agreement">Assalamu Alaikum wa Rahmatullahi wa Barakatuh 🕌</p>
        </section>
      </div>
    </div>
  );
}
