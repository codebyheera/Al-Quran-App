/**
 * lib/compressAvatar.js — Turn any picked photo into a small square avatar.
 *
 * Center-crops to a square, resizes to 320×320 and encodes as WebP (JPEG on
 * browsers that can't encode WebP). Result is ~15–30 kB, sharp on retina
 * screens at the sizes avatars are shown, and keeps 10k users' avatars well
 * inside Supabase's free 1 GB storage.
 */

export const AVATAR_MAX_INPUT_BYTES = 2 * 1024 * 1024; // what the user may pick
export const AVATAR_MAX_OUTPUT_BYTES = 100 * 1024;     // bucket limit (auth_setup.sql)
const SIZE = 320;
const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp'];

export class AvatarError extends Error {}

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new AvatarError('This image could not be opened. Try a JPG or PNG.')); };
    img.src = url;
  });
}

function toBlob(canvas, type, quality) {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

/**
 * @param {File} file  picked by the user
 * @returns {Promise<Blob>} image/webp (or image/jpeg) ≤ 100 kB
 */
export async function compressAvatar(file) {
  if (!file) throw new AvatarError('No image selected.');
  if (!ACCEPTED.includes(file.type)) throw new AvatarError('Please choose a JPG, PNG or WebP image.');
  if (file.size > AVATAR_MAX_INPUT_BYTES) throw new AvatarError('Image is too large. Maximum size is 2 MB.');

  const img = await loadImage(file);
  const side = Math.min(img.naturalWidth, img.naturalHeight);
  if (!side) throw new AvatarError('This image looks empty.');
  const sx = (img.naturalWidth - side) / 2;
  const sy = (img.naturalHeight - side) / 2;
  const out = Math.min(SIZE, side); // never upscale small photos

  const canvas = document.createElement('canvas');
  canvas.width = out;
  canvas.height = out;
  const ctx = canvas.getContext('2d');
  // Transparent PNGs would turn black as JPEG — paint a white backdrop first.
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, out, out);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, sx, sy, side, side, 0, 0, out, out);

  // Try good quality first, step down only if needed to fit the limit.
  for (const quality of [0.85, 0.75, 0.6]) {
    let blob = await toBlob(canvas, 'image/webp', quality);
    if (!blob || blob.type !== 'image/webp') blob = await toBlob(canvas, 'image/jpeg', quality);
    if (blob && blob.size <= AVATAR_MAX_OUTPUT_BYTES) return blob;
  }
  throw new AvatarError('Could not compress this image. Please try another one.');
}
