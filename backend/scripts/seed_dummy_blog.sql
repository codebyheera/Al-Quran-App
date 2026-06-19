-- ============================================================
-- Dummy Blog Post — Insert into `blogs` table
-- Run this in the Supabase SQL Editor
-- ============================================================

INSERT INTO public.blogs (
  title,
  slug,
  excerpt,
  content,
  cover_image,
  category,
  tags,
  author,
  is_published,
  meta_title,
  meta_description,
  created_at
)
VALUES (
  -- Title
  'The Power of Surah Al-Fatiha: The Opening That Changes Everything',

  -- Slug (URL-friendly, must be unique)
  'power-of-surah-al-fatiha',

  -- Excerpt (shown on blog card)
  'Surah Al-Fatiha is not merely an introduction to the Quran — it is a complete conversation between a servant and his Lord, recited at least 17 times a day. Discover why the Prophet ﷺ called it the greatest Surah.',

  -- Content (HTML — this is what gets rendered in BlogPost.jsx)
  '<p>Of all the chapters in the Holy Quran, none is recited more frequently than <strong>Surah Al-Fatiha</strong>. Every Muslim who performs the five daily prayers recites it at least <strong>17 times a day</strong> — and for good reason. It is not merely an opening chapter; it is a <em>complete conversation between the servant and his Lord</em>.</p>

<blockquote>
  <p>"I have divided the prayer between Myself and My servant into two halves, and My servant shall have what he has asked for."</p>
  <footer>— Hadith Qudsi, Sahih Muslim</footer>
</blockquote>

<h2>A Surah Unlike Any Other</h2>

<p>The Prophet Muhammad ﷺ described Surah Al-Fatiha as <em>Umm al-Kitab</em> (أُمُّ الْكِتَاب) — the Mother of the Book. It carries many names:</p>

<ul>
  <li><strong>Al-Fatiha</strong> — The Opening</li>
  <li><strong>Al-Hamd</strong> — The Praise</li>
  <li><strong>Ash-Shifa</strong> — The Cure</li>
  <li><strong>As-Sab al-Mathani</strong> — The Seven Oft-Repeated Verses</li>
</ul>

<p>Each name reflects a dimension of its depth. It opens the Quran. It is built on praise. It carries healing. And it is repeated — by design — so that its meaning might settle into the heart, not just the tongue.</p>

<h2>The Structure: A Divine Dialogue</h2>

<p>What makes Al-Fatiha extraordinary is that Allah ﷻ revealed it as a two-way conversation. The first three ayahs belong to Allah — they are His praise, His description. The last three belong to us — our request, our du''a. The middle verse, <em>iyyaka na''budu wa iyyaka nasta''een</em>, is shared:</p>

<blockquote>
  <p>You alone we worship, and You alone we ask for help.</p>
</blockquote>

<p>This single verse demolishes two of the most dangerous spiritual diseases: <strong>showing off (riya)</strong> and <strong>relying on other than Allah</strong>. When you say "iyyaka" — "You alone" — you are excluding every other object of worship and every other source of help, in one breath.</p>

<h2>The Du''a at the End: Ihdinas-Sirat al-Mustaqeem</h2>

<p>The most powerful part of Al-Fatiha may be its final du''a:</p>

<blockquote>
  <p>Guide us to the Straight Path — the path of those You have blessed, not of those who earned anger, nor of those who went astray.</p>
</blockquote>

<p>Notice what we are asking for. Not wealth. Not health. Not success in the worldly sense. We are asking for <strong>guidance</strong> — to be kept on the right path. And then, immediately, we are shown what that path looks like through the people who walked it before us.</p>

<h3>Reflection</h3>

<p>Ibn al-Qayyim رحمه الله wrote that a person who truly understands Surah Al-Fatiha has understood the entire Quran — because all of the Quran is an elaboration of Al-Fatiha''s themes: Tawheed, worship, guidance, the hereafter, and the stories of those who were guided and those who went astray.</p>

<h2>Al-Fatiha as a Cure</h2>

<p>The Prophet ﷺ said that Al-Fatiha is a cure for every illness. One companion recited it over a man who had been stung, and he recovered. When he reported this to the Prophet ﷺ, he smiled and said:</p>

<blockquote>
  <p>"How did you know it was a ruqyah? You have spoken the truth."</p>
  <footer>— Sahih al-Bukhari</footer>
</blockquote>

<p>Scholars explain this healing is both <strong>spiritual</strong> — curing the heart of doubt, hypocrisy, and sin — and <strong>physical</strong>, when recited with sincere intention and reliance on Allah.</p>

<h2>How to Recite It With Presence</h2>

<p>The tragedy is that Al-Fatiha is the most recited chapter in the world — and possibly the least reflected upon. Here are three practical ways to reconnect with it:</p>

<ol>
  <li><strong>Pause after each verse</strong> — In Salah, the Imam pauses after each ayah so the congregation can respond silently with "Ameen." Use that pause to feel the meaning.</li>
  <li><strong>Learn its tafsir</strong> — Even a basic understanding of what each verse means transforms recitation from habit into worship.</li>
  <li><strong>Make du''a from its words</strong> — Outside of Salah, recite "Ihdinas-Sirat al-Mustaqeem" as a personal du''a. Ask Allah to keep you guided today.</li>
</ol>

<p>May Allah ﷻ make us among those who recite Al-Fatiha with full presence of heart, who are guided to the Straight Path, and who remain on it until we meet Him. Ameen.</p>',

  -- Cover image (high-quality Quran/Islamic image from Unsplash)
  'https://images.unsplash.com/photo-1585036156171-384164a8c675?w=1200&auto=format&fit=crop&q=80',

  -- Category
  'Tafsir',

  -- Tags (PostgreSQL array syntax)
  ARRAY['Al-Fatiha', 'Tafsir', 'Salah', 'Quran', 'Spirituality'],

  -- Author
  'Al-Quran Hub',

  -- is_published (set to true so it appears immediately)
  TRUE,

  -- Meta title (for SEO)
  'The Power of Surah Al-Fatiha | Al-Quran Hub Blog',

  -- Meta description (for SEO)
  'Discover why Surah Al-Fatiha — recited 17 times daily — is the Mother of the Quran. Explore its structure as a divine dialogue, its healing power, and how to recite it with a present heart.',

  -- created_at (set explicitly so we control the date)
  NOW()
);
