/**
 * backend/data/surahMapping.js
 * Static mapping of Surah English names (slugified) to their numeric IDs.
 * This ensures we can resolve URLs like /surah/Al-Faatiha to ID 1.
 */

const surahMapping = {
  "al-faatiha": 1,
  "al-baqara": 2,
  "aal-i-imraan": 3,
  "an-nisaa": 4,
  "al-maaida": 5,
  "al-anaam": 6,
  "al-araaf": 7,
  "al-anfaal": 8,
  "at-tawba": 9,
  "yunus": 10,
  "hud": 11,
  "yusuf": 12,
  "ar-raad": 13,
  "ibrahim": 14,
  "al-hijr": 15,
  "an-nahl": 16,
  "al-israa": 17,
  "al-kahf": 18,
  "maryam": 19,
  "ta-ha": 20,
  "al-anbiyaa": 21,
  "al-hajj": 22,
  "al-muminoon": 23,
  "an-noor": 24,
  "al-furqaan": 25,
  "ash-shuaraa": 26,
  "an-naml": 27,
  "al-qasas": 28,
  "al-ankaboot": 29,
  "ar-room": 30,
  "luqman": 31,
  "as-sajda": 32,
  "al-ahzaab": 33,
  "saba": 34,
  "faatir": 35,
  "ya-seen": 36,
  "as-saaffaat": 37,
  "saad": 38,
  "az-zumar": 39,
  "ghaafir": 40,
  "fussilat": 41,
  "ash-shura": 42,
  "az-zukhruf": 43,
  "ad-dukhaan": 44,
  "al-jaathiya": 45,
  "al-ahqaaf": 46,
  "muhammad": 47,
  "al-fath": 48,
  "al-hujuraat": 49,
  "qaaf": 50,
  "adh-dhaariyaat": 51,
  "at-toor": 52,
  "an-najm": 53,
  "al-qamar": 54,
  "ar-rahmaan": 55,
  "al-waaqia": 56,
  "al-hadid": 57,
  "al-mujaadila": 58,
  "al-hashr": 59,
  "al-mumtahina": 60,
  "as-saff": 61,
  "al-jumuwa": 62,
  "al-munaafiqoon": 63,
  "at-taghaabun": 64,
  "at-talaaq": 65,
  "at-tahreem": 66,
  "al-mulk": 67,
  "al-qalam": 68,
  "al-haaqqa": 69,
  "al-maarij": 70,
  "nooh": 71,
  "al-jinn": 72,
  "al-muzammil": 73,
  "al-muddaththir": 74,
  "al-qiyaama": 75,
  "al-insaan": 76,
  "al-mursalaat": 77,
  "an-naba": 78,
  "an-naaziaat": 79,
  "abasa": 80,
  "at-takweer": 81,
  "al-infitaar": 82,
  "al-mutaffifeen": 83,
  "al-inshiqaaq": 84,
  "al-burooj": 85,
  "at-taariq": 86,
  "al-aalaa": 87,
  "al-ghaashiya": 88,
  "al-fajr": 89,
  "al-balad": 90,
  "ash-shams": 91,
  "al-layl": 92,
  "ad-duhaa": 93,
  "ash-sharh": 94,
  "at-tin": 95,
  "al-alaq": 96,
  "al-qadr": 97,
  "al-bayyina": 98,
  "az-zalzala": 99,
  "al-aadiyaat": 100,
  "al-qaaria": 101,
  "at-takaathur": 102,
  "al-asr": 103,
  "al-humaza": 104,
  "al-feel": 105,
  "quraish": 106,
  "al-maaoon": 107,
  "al-kawthar": 108,
  "al-kaafiroon": 109,
  "an-nasr": 110,
  "al-masad": 111,
  "al-ikhlaas": 112,
  "al-falaq": 113,
  "an-naas": 114
};

// Also support exact EnglishNames from AlQuran Cloud
const englishNamesToIds = {
  "Al-Faatiha": 1, "Al-Baqara": 2, "Aal-i-Imraan": 3, "An-Nisaa": 4, "Al-Maaida": 5,
  "Al-An'aam": 6, "Al-A'raaf": 7, "Al-Anfaal": 8, "At-Tawba": 9, "Yunus": 10,
  "Hud": 11, "Yusuf": 12, "Ar-Ra'd": 13, "Ibrahim": 14, "Al-Hijr": 15,
  "An-Nahl": 16, "Al-Israa": 17, "Al-Kahf": 18, "Maryam": 19, "Taa-Haa": 20,
  "Al-Anbiyaa": 21, "Al-Hajj": 22, "Al-Muminoon": 23, "An-Noor": 24, "Al-Furqaan": 25,
  "Ash-Shu'araa": 26, "An-Naml": 27, "Al-Qasas": 28, "Al-Ankaboot": 29, "Ar-Room": 30,
  "Luqman": 31, "As-Sajda": 32, "Al-Ahzaab": 33, "Saba": 34, "Faatir": 35,
  "Yaseen": 36, "As-Saaffaat": 37, "Saad": 38, "Az-Zumar": 39, "Ghafir": 40,
  "Fussilat": 41, "Ash-Shura": 42, "Az-Zukhruf": 43, "Ad-Dukhaan": 44, "Al-Jaathiya": 45,
  "Al-Ahqaf": 46, "Muhammad": 47, "Al-Fath": 48, "Al-Hujuraat": 49, "Qaaf": 50,
  "Adh-Dhaariyat": 51, "At-Tur": 52, "An-Najm": 53, "Al-Qamar": 54, "Ar-Rahmaan": 55,
  "Al-Waaqia": 56, "Al-Hadid": 57, "Al-Mujaadila": 58, "Al-Hashr": 59, "Al-Mumtahana": 60,
  "As-Saff": 61, "Al-Jumu'a": 62, "Al-Munaafiqoon": 63, "At-Taghaabun": 64, "At-Talaaq": 65,
  "At-Tahrim": 66, "Al-Mulk": 67, "Al-Qalam": 68, "Al-Haaqqa": 69, "Al-Ma'aarij": 70,
  "Nooh": 71, "Al-Jinn": 72, "Al-Muzzammil": 73, "Al-Muddaththir": 74, "Al-Qiyaama": 75,
  "Al-Insaan": 76, "Al-Mursalaat": 77, "An-Naba": 78, "An-Naazi'aat": 79, "Abasa": 80,
  "At-Takwir": 81, "Al-Infitaar": 82, "Al-Mutaffifin": 83, "Al-Inshiqaaq": 84, "Al-Burooj": 85,
  "At-Taariq": 86, "Al-A'laa": 87, "Al-Ghaashiya": 88, "Al-Fajr": 89, "Al-Balad": 90,
  "Ash-Shams": 91, "Al-Lail": 92, "Ad-Dhuhaa": 93, "Ash-Sharh": 94, "At-Tin": 95,
  "Al-Alaq": 96, "Al-Qadr": 97, "Al-Bayyina": 98, "Az-Zalzala": 99, "Al-Aadiyaat": 100,
  "Al-Qaari'a": 101, "At-Takaathur": 102, "Al-Asr": 103, "Al-Humaza": 104, "Al-Fil": 105,
  "Quraish": 106, "Al-Maa'un": 107, "Al-Kawthar": 108, "Al-Kaafiroon": 109, "An-Nasr": 110,
  "Al-Masad": 111, "Al-Ikhlaas": 112, "Al-Falaq": 113, "An-Naas": 114,
  // Add common variations/aliases found in audit
  "Al-Aala": 87,
  "Al-Aalaa": 87,
  "Al-Qaaria": 101,
  "Al-Qaari'ah": 101,
  "Al-Qariah": 101
};

// Create a normalized lookup map for robust matching
const normalizedSurahMapping = {};

// Step 1: Add all keys from surahMapping
Object.keys(surahMapping).forEach(key => {
  const norm = key.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (!normalizedSurahMapping[norm]) {
    normalizedSurahMapping[norm] = surahMapping[key];
  }
});

// Step 2: Add all keys from englishNamesToIds (higher precision)
Object.keys(englishNamesToIds).forEach(key => {
  const norm = key.toLowerCase().replace(/[^a-z0-9]/g, '');
  normalizedSurahMapping[norm] = englishNamesToIds[key];
});

export function getSurahId(slugOrId) {
  if (!slugOrId) return null;
  
  // 1. If it's already a number, return it
  const num = parseInt(slugOrId);
  if (!isNaN(num)) return num;
  
  // 2. Decode URI component (e.g. %27 -> ')
  let decoded;
  try {
    decoded = decodeURIComponent(slugOrId);
  } catch (e) {
    decoded = slugOrId;
  }
  
  // 3. Try exact EnglishName match
  if (englishNamesToIds[decoded]) return englishNamesToIds[decoded];
  
  // 4. Try normalized match (removes dashes, quotes, spaces, etc.)
  const normalized = decoded.toLowerCase().replace(/[^a-z0-9]/g, '');
  return normalizedSurahMapping[normalized] || null;
}
