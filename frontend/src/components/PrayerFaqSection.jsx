/**
 * PrayerFaqSection.jsx
 *
 * Accordion FAQ for prayer time pages.
 * Accepts { city } prop to insert city name into questions dynamically.
 * When city is provided, also injects FAQPage JSON-LD schema via <Helmet>.
 */

import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import './PrayerFaqSection.css';

const BASE_FAQS = [
  {
    q: (city) =>
      city
        ? `What time is Fajr prayer in ${city} today?`
        : 'What time is Fajr prayer today?',
    a: (city) =>
      `Fajr time in ${city ? city + ' ' : ''}changes daily based on the position of the sun. Our prayer times are calculated using the University of Islamic Sciences, Karachi method (Hanafi) and updated automatically every day. Check the prayer cards above for today's exact Fajr time.`,
  },
  {
    q: (city) =>
      city
        ? `What is the Qibla direction from ${city}?`
        : 'What is the Qibla direction?',
    a: (city) =>
      `The Qibla direction from ${city || 'your location'} is displayed on the compass above, calculated using the great-circle bearing formula toward the Masjid al-Haram in Mecca (21.4225°N, 39.8262°E). The degree shown is measured clockwise from true North.`,
  },
  {
    q: (city) =>
      city
        ? `Which calculation method is used for prayer times in ${city}?`
        : 'Which calculation method is used?',
    a: () =>
      'We use the University of Islamic Sciences, Karachi method with the Hanafi school for Asr time calculation. This is the standard method followed in Pakistan, India, and Bangladesh.',
  },
  {
    q: () => 'Do prayer times change daily?',
    a: () =>
      "Yes — prayer times shift slightly each day as the sun's position changes throughout the year. Our times are generated daily based on precise astronomical calculations to ensure accuracy with minimal load.",
  },
  {
    q: () => 'What is the difference between Sunrise and Fajr time?',
    a: () =>
      'Fajr marks the beginning of the pre-dawn twilight — this is the start of the obligatory Fajr prayer. Sunrise (Shuruq) marks when the sun actually appears above the horizon. Prayer time ends at Sunrise, so Fajr must be prayed between Fajr time and Sunrise.',
  },
  {
    q: () => 'How accurate are these prayer timings?',
    a: () =>
      'Our times are generated using precise astronomical calculations with the exact latitude and longitude of each city. They are as accurate as any printed timetable using the same calculation method.',
  },
];

export default function PrayerFaqSection({ city = null }) {
  const [openIndex, setOpenIndex] = useState(0);

  const items = BASE_FAQS.map((faq) => ({
    question: faq.q(city),
    answer:   faq.a(city),
  }));

  // Build FAQPage JSON-LD schema
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map(({ question, answer }) => ({
      '@type': 'Question',
      name: question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: answer,
      },
    })),
  };

  return (
    <>
      <Helmet>
        <script type="application/ld+json" id="faq-schema">{JSON.stringify(faqSchema)}</script>
      </Helmet>

      <section className="pt-faq" aria-label="Frequently asked questions about prayer times">
        <div className="pt-faq__header">
          <h2 className="pt-faq__title">
            Common Questions{city ? ` About Prayer Times in ${city}` : ' About Prayer Times'}
          </h2>
        </div>

        <div className="pt-faq__list">
          {items.map(({ question, answer }, index) => {
            const isOpen   = openIndex === index;
            const panelId  = `pt-faq-panel-${index}`;
            const buttonId = `pt-faq-btn-${index}`;

            return (
              <article
                key={index}
                className={`pt-faq__item${isOpen ? ' is-open' : ''}`}
              >
                <h3 className="pt-faq__question">
                  <button
                    id={buttonId}
                    type="button"
                    className="pt-faq__trigger"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                  >
                    <span className="pt-faq__qmark" aria-hidden="true">Q.</span>
                    <span className="pt-faq__question-text">{question}</span>
                    <span className="pt-faq__icon" aria-hidden="true">
                      {isOpen ? '−' : '+'}
                    </span>
                  </button>
                </h3>

                <div
                  id={panelId}
                  className="pt-faq__answer-wrap"
                  role="region"
                  aria-labelledby={buttonId}
                  hidden={!isOpen}
                >
                  <p className="pt-faq__answer">{answer}</p>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </>
  );
}
