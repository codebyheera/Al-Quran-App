// Chronological revelation order of each Surah, indexed by Surah number
// (index 0 = Surah 1). Follows the standard Egyptian (Al-Azhar / Tanzil)
// chronology — scholarly orderings differ slightly, so this is presented as
// "the traditional order of revelation", not an absolute fact.
// The API/cache doesn't carry this field, hence the static table.

const REVELATION_ORDER = [
  5, 87, 89, 92, 112, 55, 39, 88, 113, 51,      // 1-10
  52, 53, 96, 72, 54, 70, 50, 69, 44, 45,       // 11-20
  73, 103, 74, 102, 42, 47, 48, 49, 85, 84,     // 21-30
  57, 75, 90, 58, 43, 41, 56, 38, 59, 60,       // 31-40
  61, 62, 63, 64, 65, 66, 95, 111, 106, 34,     // 41-50
  67, 76, 23, 37, 97, 46, 94, 105, 101, 91,     // 51-60
  109, 110, 104, 108, 99, 107, 77, 2, 78, 79,   // 61-70
  71, 40, 3, 4, 31, 98, 33, 80, 81, 24,         // 71-80
  7, 82, 86, 83, 27, 36, 8, 68, 10, 35,         // 81-90
  26, 9, 11, 12, 28, 1, 25, 100, 93, 14,        // 91-100
  30, 16, 13, 32, 19, 29, 17, 15, 18, 114,      // 101-110
  6, 22, 20, 21,                                // 111-114
];

export function getRevelationOrder(surahNumber) {
  return REVELATION_ORDER[surahNumber - 1] ?? null;
}
