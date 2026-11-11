/**
 * data/duaPrompts.js — Curated "make dua for…" prompts for the daily dua
 * popup (components/DuaPill.jsx). Frontend-only, no user input.
 *
 * Every dua is from the Qur'an so it can link straight to its ayah.
 * `arabic` is a short excerpt shown in the site's default Arabic font.
 * `title`/`meaning`/`surahName` are English; the `…Ur` fields are shown to
 * visitors whose translation language is Urdu.
 * Please verify any new/edited Arabic and translations before shipping.
 */

const DUA_PROMPTS = [
  {
    id: 'parents-mercy',
    title: 'Make dua for your parents',
    titleUr: 'اپنے والدین کے لیے دعا کریں',
    arabic: 'رَّبِّ ارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا',
    meaning: 'My Lord, have mercy upon them as they brought me up when I was small.',
    meaningUr: 'اے میرے رب! ان دونوں پر رحم فرما جیسے انہوں نے بچپن میں میری پرورش کی۔',
    surah: 17, ayah: 24, surahName: 'Al-Isra', surahNameUr: 'سورۃ الاسراء',
  },
  {
    id: 'deceased',
    title: 'Make dua for those who have passed away',
    titleUr: 'دنیا سے رخصت ہو جانے والوں کے لیے دعا کریں',
    arabic: 'رَبَّنَا اغْفِرْ لَنَا وَلِإِخْوَانِنَا الَّذِينَ سَبَقُونَا بِالْإِيمَانِ',
    meaning: 'Our Lord, forgive us and our brothers who preceded us in faith.',
    meaningUr: 'اے ہمارے رب! ہمیں اور ہمارے ان بھائیوں کو بخش دے جو ہم سے پہلے ایمان لائے۔',
    surah: 59, ayah: 10, surahName: 'Al-Hashr', surahNameUr: 'سورۃ الحشر',
  },
  {
    id: 'sick',
    title: 'Make dua for those who are sick',
    titleUr: 'بیماروں کے لیے دعا کریں',
    arabic: 'وَإِذَا مَرِضْتُ فَهُوَ يَشْفِينِ',
    meaning: 'And when I am ill, it is He who cures me.',
    meaningUr: 'اور جب میں بیمار ہوتا ہوں تو وہی مجھے شفا دیتا ہے۔',
    surah: 26, ayah: 80, surahName: "Ash-Shu'ara", surahNameUr: 'سورۃ الشعراء',
  },
  {
    id: 'students',
    title: 'Make dua for students preparing for exams',
    titleUr: 'امتحان کی تیاری کرنے والے طلبہ کے لیے دعا کریں',
    arabic: 'رَّبِّ زِدْنِي عِلْمًا',
    meaning: 'My Lord, increase me in knowledge.',
    meaningUr: 'اے میرے رب! میرے علم میں اضافہ فرما۔',
    surah: 20, ayah: 114, surahName: 'Taha', surahNameUr: 'سورۃ طٰہٰ',
  },
  {
    id: 'anxious',
    title: 'Make dua for someone feeling anxious',
    titleUr: 'پریشان دلوں کے لیے دعا کریں',
    arabic: 'رَبِّ اشْرَحْ لِي صَدْرِي وَيَسِّرْ لِي أَمْرِي',
    meaning: 'My Lord, expand for me my chest and ease for me my task.',
    meaningUr: 'اے میرے رب! میرا سینہ کھول دے اور میرا کام آسان کر دے۔',
    surah: 20, ayah: 25, surahName: 'Taha', surahNameUr: 'سورۃ طٰہٰ',
  },
  {
    id: 'work',
    title: 'Make dua for those looking for work',
    titleUr: 'روزگار کی تلاش کرنے والوں کے لیے دعا کریں',
    arabic: 'رَبِّ إِنِّي لِمَا أَنزَلْتَ إِلَيَّ مِنْ خَيْرٍ فَقِيرٌ',
    meaning: 'My Lord, indeed I am in need of whatever good You send down to me.',
    meaningUr: 'اے میرے رب! جو بھلائی بھی تو میری طرف نازل فرمائے، میں اس کا محتاج ہوں۔',
    surah: 28, ayah: 24, surahName: 'Al-Qasas', surahNameUr: 'سورۃ القصص',
  },
  {
    id: 'families',
    title: 'Make dua for families and children',
    titleUr: 'گھر والوں اور بچوں کے لیے دعا کریں',
    arabic: 'رَبَّنَا هَبْ لَنَا مِنْ أَزْوَاجِنَا وَذُرِّيَّاتِنَا قُرَّةَ أَعْيُنٍ',
    meaning: 'Our Lord, grant us from among our spouses and offspring comfort to our eyes.',
    meaningUr: 'اے ہمارے رب! ہمیں ہماری بیویوں اور اولاد سے آنکھوں کی ٹھنڈک عطا فرما۔',
    surah: 25, ayah: 74, surahName: 'Al-Furqan', surahNameUr: 'سورۃ الفرقان',
  },
  {
    id: 'hardship',
    title: 'Make dua for those going through hardship',
    titleUr: 'مشکل میں گھرے لوگوں کے لیے دعا کریں',
    arabic: 'لَّا إِلَٰهَ إِلَّا أَنتَ سُبْحَانَكَ إِنِّي كُنتُ مِنَ الظَّالِمِينَ',
    meaning: 'There is no deity except You; exalted are You. Indeed, I have been of the wrongdoers.',
    meaningUr: 'تیرے سوا کوئی معبود نہیں، تو پاک ہے، بے شک میں ہی ظالموں میں سے تھا۔',
    surah: 21, ayah: 87, surahName: 'Al-Anbiya', surahNameUr: 'سورۃ الانبیاء',
  },
  {
    id: 'ummah',
    title: 'Make dua for the whole Ummah',
    titleUr: 'پوری امت کے لیے دعا کریں',
    arabic: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ',
    meaning: 'Our Lord, give us good in this world and good in the Hereafter, and save us from the punishment of the Fire.',
    meaningUr: 'اے ہمارے رب! ہمیں دنیا میں بھی بھلائی عطا فرما اور آخرت میں بھی بھلائی عطا فرما، اور ہمیں آگ کے عذاب سے بچا۔',
    surah: 2, ayah: 201, surahName: 'Al-Baqarah', surahNameUr: 'سورۃ البقرہ',
  },
  {
    id: 'oppressed',
    title: 'Make dua for those living through war and oppression',
    titleUr: 'جنگ اور ظلم کا شکار لوگوں کے لیے دعا کریں',
    arabic: 'رَبَّنَا أَفْرِغْ عَلَيْنَا صَبْرًا وَثَبِّتْ أَقْدَامَنَا',
    meaning: 'Our Lord, pour upon us patience and plant firmly our feet.',
    meaningUr: 'اے ہمارے رب! ہم پر صبر نازل فرما اور ہمارے قدم جما دے۔',
    surah: 2, ayah: 250, surahName: 'Al-Baqarah', surahNameUr: 'سورۃ البقرہ',
  },
  {
    id: 'steadfast',
    title: 'Make dua for hearts to stay firm in faith',
    titleUr: 'ایمان پر ثابت قدمی کے لیے دعا کریں',
    arabic: 'رَبَّنَا لَا تُزِغْ قُلُوبَنَا بَعْدَ إِذْ هَدَيْتَنَا',
    meaning: 'Our Lord, let not our hearts deviate after You have guided us.',
    meaningUr: 'اے ہمارے رب! ہدایت دینے کے بعد ہمارے دلوں کو ٹیڑھا نہ ہونے دے۔',
    surah: 3, ayah: 8, surahName: "Ali 'Imran", surahNameUr: 'سورۃ آل عمران',
  },
  {
    id: 'believers',
    title: 'Make dua for your parents and all believers',
    titleUr: 'والدین اور تمام مومنوں کے لیے دعا کریں',
    arabic: 'رَبَّنَا اغْفِرْ لِي وَلِوَالِدَيَّ وَلِلْمُؤْمِنِينَ يَوْمَ يَقُومُ الْحِسَابُ',
    meaning: 'Our Lord, forgive me and my parents and the believers on the Day the account is established.',
    meaningUr: 'اے ہمارے رب! مجھے، میرے والدین کو اور تمام مومنوں کو اس دن بخش دے جب حساب قائم ہوگا۔',
    surah: 14, ayah: 41, surahName: 'Ibrahim', surahNameUr: 'سورۃ ابراہیم',
  },
  {
    id: 'salah',
    title: 'Make dua for children to love their salah',
    titleUr: 'بچوں کے نمازی بننے کے لیے دعا کریں',
    arabic: 'رَبِّ اجْعَلْنِي مُقِيمَ الصَّلَاةِ وَمِن ذُرِّيَّتِي',
    meaning: 'My Lord, make me an establisher of prayer, and from my descendants.',
    meaningUr: 'اے میرے رب! مجھے اور میری اولاد کو نماز قائم کرنے والا بنا۔',
    surah: 14, ayah: 40, surahName: 'Ibrahim', surahNameUr: 'سورۃ ابراہیم',
  },
  {
    id: 'guidance',
    title: 'Make dua for someone who feels lost',
    titleUr: 'راہ بھٹکے لوگوں کے لیے دعا کریں',
    arabic: 'اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ',
    meaning: 'Guide us to the straight path.',
    meaningUr: 'ہمیں سیدھے راستے پر چلا۔',
    surah: 1, ayah: 6, surahName: 'Al-Fatihah', surahNameUr: 'سورۃ الفاتحہ',
  },
  {
    id: 'forgiveness',
    title: 'Make dua for everyone seeking forgiveness',
    titleUr: 'معافی کے طلبگاروں کے لیے دعا کریں',
    arabic: 'رَبَّنَا ظَلَمْنَا أَنفُسَنَا وَإِن لَّمْ تَغْفِرْ لَنَا وَتَرْحَمْنَا لَنَكُونَنَّ مِنَ الْخَاسِرِينَ',
    meaning: 'Our Lord, we have wronged ourselves, and if You do not forgive us and have mercy upon us, we will surely be among the losers.',
    meaningUr: 'اے ہمارے رب! ہم نے اپنی جانوں پر ظلم کیا، اور اگر تو نے ہمیں نہ بخشا اور ہم پر رحم نہ کیا تو ہم ضرور نقصان اٹھانے والوں میں سے ہو جائیں گے۔',
    surah: 7, ayah: 23, surahName: "Al-A'raf", surahNameUr: 'سورۃ الاعراف',
  },
];

/**
 * Pin one dua: when set to a prompt `id`, the popup always shows that dua
 * instead of rotating. Set to null to go back to rotating through the list.
 */
export const PINNED_DUA_ID = 'ummah'; // Al-Baqarah 2:201

export default DUA_PROMPTS;
