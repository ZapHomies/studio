'use server';

export interface Ayah {
  id: number;
  text: string;
  translation: string;
}

export interface Surah {
  id: number;
  name: string;
  translation: string;
  revelationType: 'Meccan' | 'Medinan';
  numberOfAyahs: number;
  ayahs: Ayah[];
}

export const quranData: Surah[] = [
  {
    id: 1,
    name: "Al-Fatihah",
    translation: "Pembukaan",
    revelationType: "Meccan",
    numberOfAyahs: 7,
    ayahs: [
      { id: 1, text: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ", translation: "Dengan nama Allah Yang Maha Pengasih, Maha Penyayang." },
      { id: 2, text: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ", translation: "Segala puji bagi Allah, Tuhan seluruh alam," },
      { id: 3, text: "الرَّحْمَٰنِ الرَّحِيمِ", translation: "Yang Maha Pengasih, Maha Penyayang," },
      { id: 4, text: "مَالِكِ يَوْمِ الدِّينِ", translation: "Pemilik hari pembalasan." },
      { id: 5, text: "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ", translation: "Hanya kepada Engkaulah kami menyembah dan hanya kepada Engkaulah kami memohon pertolongan." },
      { id: 6, text: "اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ", translation: "Tunjukilah kami jalan yang lurus," },
      { id: 7, text: "صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ", translation: "(yaitu) jalan orang-orang yang telah Engkau beri nikmat kepadanya; bukan (jalan) mereka yang dimurkai, dan bukan (pula jalan) mereka yang sesat." },
    ],
  },
  {
    id: 2,
    name: "Al-Baqarah",
    translation: "Sapi Betina",
    revelationType: "Medinan",
    numberOfAyahs: 286,
    ayahs: [
      { id: 1, text: "الٓمٓ", translation: "Alif Lam Mim." },
      { id: 2, text: "ذَٰلِكَ الْكِتَابُ لَا رَيْبَ ۛ فِيهِ ۛ هُدًى لِّلْمُتَّقِينَ", translation: "Kitab (Al-Qur'an) ini tidak ada keraguan padanya; petunjuk bagi mereka yang bertakwa," },
      { id: 3, text: "الَّذِينَ يُؤْمِنُونَ بِالْغَيْبِ وَيُقِيمُونَ الصَّلَاةَ وَمِمَّا رَزَقْنَاهُمْ يُنفِقُونَ", translation: "(yaitu) mereka yang beriman kepada yang gaib, melaksanakan salat, dan menginfakkan sebagian rezeki yang Kami berikan kepada mereka," },
      { id: 4, text: "وَالَّذِينَ يُؤْمِنُونَ بِمَا أُنزِلَ إِلَيْكَ وَمَا أُنزِلَ مِن قَبْلِكَ وَبِالْآخِرَةِ هُمْ يُوقِنُونَ", translation: "dan mereka yang beriman kepada (Al-Qur'an) yang diturunkan kepadamu (Muhammad) dan (kitab-kitab) yang telah diturunkan sebelum engkau, dan mereka yakin akan adanya akhirat." },
      { id: 5, text: "أُولَٰئِكَ عَلَىٰ هُدًى مِّن رَّبِّهِمْ ۖ وَأُولَٰئِكَ هُمُ الْمُفْلِحُونَ", translation: "Merekalah yang mendapat petunjuk dari Tuhannya, dan mereka itulah orang-orang yang beruntung." },
      { id: 6, text: "إِنَّ الَّذِينَ كَفَرُوا سَوَاءٌ عَلَيْهِمْ ءَأَنذَرْتَهُمْ أَمْ لَمْ تُنذِرْهُمْ لَا يُؤْمِنُونَ", translation: "Sesungguhnya orang-orang kafir, sama saja bagi mereka, engkau (Muhammad) beri peringatan atau tidak engkau beri peringatan, mereka tidak akan beriman." },
      { id: 7, text: "خَتَمَ اللَّهُ عَلَىٰ قُلُوبِهِمْ وَعَلَىٰ سَمْعِهِمْ ۖ وَعَلَىٰ أَبْصَارِهِمْ غِشَاوَةٌ ۖ وَلَهُمْ عَذَابٌ عَظِيمٌ", translation: "Allah telah mengunci hati dan pendengaran mereka, penglihatan mereka telah tertutup, dan mereka akan mendapat azab yang berat." },
      { id: 8, text: "وَمِنَ النَّاسِ مَن يَقُولُ ءَامَنَّا بِاللَّهِ وَبِالْيَوْمِ الْآخِرِ وَمَا هُم بِمُؤْمِنِينَ", translation: "Dan di antara manusia ada yang berkata, “Kami beriman kepada Allah dan hari akhir,” padahal sesungguhnya mereka itu bukanlah orang-orang yang beriman." },
      { id: 9, text: "يُخَادِعُونَ اللَّهَ وَالَّذِينَ ءَامَنُوا وَمَا يَخْدَعُونَ إِلَّآ أَنفُسَهُمْ وَمَا يَشْعُرُونَ", translation: "Mereka menipu Allah dan orang-orang yang beriman, padahal mereka hanyalah menipu diri sendiri tanpa mereka sadari." },
      { id: 10, text: "فِى قُلُوبِهِم مَّرَضٌ فَزَادَهُمُ اللَّهُ مَرَضًا ۖ وَلَهُمْ عَذَابٌ أَلِيمٌۢ بِمَا كَانُوا يَكْذِبُونَ", translation: "Dalam hati mereka ada penyakit, lalu Allah menambah penyakitnya itu; dan mereka mendapat azab yang pedih karena mereka berdusta." },
    ],
  },
  {
    id: 112,
    name: "Al-Ikhlas",
    translation: "Keesaan Allah",
    revelationType: "Meccan",
    numberOfAyahs: 4,
    ayahs: [
      { id: 1, text: "قُلْ هُوَ اللَّهُ أَحَدٌ", translation: "Katakanlah (Muhammad), 'Dialah Allah, Yang Maha Esa.'" },
      { id: 2, text: "اللَّهُ الصَّمَدُ", translation: "Allah tempat meminta segala sesuatu." },
      { id: 3, text: "لَمْ يَلِدْ وَلَمْ يُولَدْ", translation: "(Allah) tidak beranak dan tidak pula diperanakkan." },
      { id: 4, text: "وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ", translation: "Dan tidak ada sesuatu yang setara dengan Dia." }
    ]
  }
];
