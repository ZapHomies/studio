'use server';
/**
 * @fileOverview Alur Genkit untuk menghasilkan kutipan Islami harian (Hikmah Harian).
 *
 * - generateDailyWisdom - Sebuah fungsi yang mengembalikan satu kutipan inspiratif.
 * - DailyWisdomOutput - Tipe kembalian untuk fungsi generateDailyWisdom.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const DailyWisdomOutputSchema = z.object({
  wisdom: z.string().describe('Teks kutipan hikmah yang singkat, memotivasi, dan dalam Bahasa Indonesia.'),
  source: z.string().describe('Sumber kutipan (contoh: "Al-Quran, 2:286", "Hadis Riwayat Bukhari", atau "Kutipan oleh Ali bin Abi Thalib").'),
});
export type DailyWisdomOutput = z.infer<typeof DailyWisdomOutputSchema>;

export async function generateDailyWisdom(): Promise<DailyWisdomOutput> {
  const result = await generateDailyWisdomFlow();
  if (!result) {
    return {
        wisdom: "Dan barangsiapa bertakwa kepada Allah, niscaya Dia akan membukakan jalan keluar baginya.",
        source: "Al-Quran, At-Talaq: 2"
    }
  }
  return result;
}

const prompt = ai.definePrompt({
    name: 'generateDailyWisdomPrompt',
    output: { schema: DailyWisdomOutputSchema },
    prompt: `Anda adalah seorang ulama dan cendekiawan Muslim yang bijaksana. 
    
    Tugas Anda adalah memberikan satu (1) kutipan hikmah Islami yang singkat, inspiratif, dan memotivasi untuk pengguna aplikasi "Muslim Mission".
    
    PERATURAN:
    1.  **Bahasa:** Kutipan dan sumber HARUS dalam Bahasa Indonesia.
    2.  **Singkat & Padat:** Buat kutipan yang mudah diingat dan dicerna.
    3.  **Sumber Jelas:** Sertakan sumbernya, baik itu dari Al-Quran (dengan nama surat dan nomor ayat), Hadis (dengan perawinya), atau kutipan dari tokoh Islam terkemuka.
    4.  **Tema:** Fokus pada tema-tema seperti kesabaran, rasa syukur, keimanan, perbuatan baik, pengingat kematian, dan hubungan dengan Allah.
    5.  **Variasi:** Berikan kutipan yang bervariasi setiap kali diminta.

    Contoh output yang baik:
    - wisdom: "Janganlah kamu berduka cita, sesungguhnya Allah beserta kita." source: "Al-Quran, At-Taubah: 40"
    - wisdom: "Amal yang paling dicintai oleh Allah adalah yang paling konsisten, meskipun sedikit." source: "Hadis Riwayat Bukhari dan Muslim"
    
    Sekarang, berikan satu kutipan hikmah untuk hari ini.`,
});


const generateDailyWisdomFlow = ai.defineFlow(
  {
    name: 'generateDailyWisdomFlow',
    outputSchema: DailyWisdomOutputSchema,
  },
  async () => {
    const { output } = await prompt();
    return output!;
  }
);
