/**
 * lib/socialLinks.js — Profile social links: allowed platforms + validation.
 *
 * Only https links to each platform's own domain are accepted, so a profile
 * can never hold a javascript: / data: link or point "Instagram" elsewhere.
 * Users may type "instagram.com/name" — https:// is added for them.
 */

export const SOCIAL_FIELDS = [
  { key: 'website',   label: 'Website',     placeholder: 'https://yourwebsite.com', domains: null },
  { key: 'x',         label: 'X (Twitter)', placeholder: 'https://x.com/username',         domains: ['x.com', 'twitter.com'] },
  { key: 'instagram', label: 'Instagram',   placeholder: 'https://instagram.com/username', domains: ['instagram.com'] },
  { key: 'facebook',  label: 'Facebook',    placeholder: 'https://facebook.com/username',  domains: ['facebook.com', 'fb.com'] },
  { key: 'youtube',   label: 'YouTube',     placeholder: 'https://youtube.com/@channel',   domains: ['youtube.com', 'youtu.be'] },
  { key: 'tiktok',    label: 'TikTok',      placeholder: 'https://tiktok.com/@username',   domains: ['tiktok.com'] },
  { key: 'linkedin',  label: 'LinkedIn',    placeholder: 'https://linkedin.com/in/username', domains: ['linkedin.com'] },
  { key: 'github',    label: 'GitHub',      placeholder: 'https://github.com/username',    domains: ['github.com'] },
];

const MAX_URL_LENGTH = 200;

function hostMatches(host, domain) {
  return host === domain || host.endsWith(`.${domain}`);
}

/**
 * @returns {{ value: string, error: string|null }} cleaned URL ('' = empty)
 */
export function validateSocial(field, raw) {
  const input = (raw || '').trim();
  if (!input) return { value: '', error: null };
  if (input.length > MAX_URL_LENGTH) return { value: input, error: 'Link is too long.' };

  const withScheme = /^[a-z][a-z0-9+.-]*:/i.test(input) ? input : `https://${input}`;
  let url;
  try {
    url = new URL(withScheme);
  } catch {
    return { value: input, error: 'This is not a valid link.' };
  }
  if (url.protocol !== 'https:') return { value: input, error: 'Link must start with https://' };
  if (url.username || url.password) return { value: input, error: 'This is not a valid link.' };

  const host = url.hostname.toLowerCase();
  if (!host.includes('.')) return { value: input, error: 'This is not a valid link.' };
  if (field.domains && !field.domains.some((d) => hostMatches(host, d))) {
    return { value: input, error: `Please enter a ${field.label} link (${field.domains[0]}).` };
  }
  return { value: url.toString(), error: null };
}

/** Keeps only known platforms with valid links — what gets saved. */
export function cleanSocials(socials) {
  const out = {};
  for (const field of SOCIAL_FIELDS) {
    const { value, error } = validateSocial(field, socials?.[field.key]);
    if (value && !error) out[field.key] = value;
  }
  return out;
}
