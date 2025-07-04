'use server';
/**
 * @fileOverview Alur Genkit untuk membuat misi Islami yang dipersonalisasi untuk pengguna.
 *
 * - generateMissions - Sebuah fungsi yang menghasilkan daftar misi berdasarkan level dan kategori pengguna.
 * - GenerateMissionsInput - Tipe input untuk fungsi generateMissions.
 * - GenerateMissionsOutput - Tipe kembalian untuk fungsi generateMissions.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Zod schema for a single mission, mirroring the Mission type
const MissionSchema = z.object({
  id: z.string().describe("ID unik untuk misi, gunakan format 'kategori-deskripsi-singkat' dalam bahasa Inggris."),
  title: z.string().describe('Judul misi yang singkat dan menarik dalam Bahasa Indonesia.'),
  description: z.string().describe('Deskripsi singkat tentang apa yang harus dilakukan pengguna dalam Bahasa Indonesia.'),
  xp: z.number().describe('Jumlah XP dasar yang diberikan untuk menyelesaikan misi.'),
  coins: z.number().describe('Jumlah Koin yang diberikan untuk menyelesaikan misi. HARUS lebih dari 0.'),
  type: z.enum(['photo', 'action']).describe("Tipe misi. 'photo' membutuhkan bukti foto untuk bonus, 'action' hanya perlu ditandai selesai."),
  bonus_xp: z.optional(z.number()).describe("Jumlah XP bonus jika pengguna mengunggah bukti foto yang valid. Hanya untuk misi tipe 'photo'."),
  category: z.enum(['Harian', 'Mingguan', 'Bulanan']).describe('Kategori misi.'),
});

const GenerateMissionsInputSchema = z.object({
  level: z.number().describe("Level pengguna saat ini untuk menyesuaikan kesulitan misi."),
  existing_mission_ids: z.array(z.string()).describe("Daftar ID misi yang sudah ada untuk menghindari duplikasi."),
  count: z.number().describe("Jumlah misi yang harus dibuat."),
  category: z.enum(['Harian', 'Mingguan', 'Bulanan']).describe("Kategori misi yang akan dibuat (Harian, Mingguan, Bulanan)."),
});
export type GenerateMissionsInput = z.infer<typeof GenerateMissionsInputSchema>;

const GenerateMissionsOutputSchema = z.object({
  missions: z.array(MissionSchema).describe("Daftar misi yang dihasilkan."),
});
export type GenerateMissionsOutput = z.infer<typeof GenerateMissionsOutputSchema>;


export async function generateMissions(input: GenerateMissionsInput): Promise<GenerateMissionsOutput> {
  try {
    const result = await generateMissionsFlow(input);
    if (!result || !result.missions) {
      console.warn("AI mission generation returned empty or null result.");
      return { missions: [] };
    }
    return result;
  } catch (error) {
    console.error("An error occurred during AI mission generation:", error);
    // API is unavailable or threw an error, so we return an empty array of missions.
    // The calling code in UserDataProvider is already set up to handle this gracefully.
    return { missions: [] };
  }
}

const prompt = ai.definePrompt({
    name: 'generateMissionsPrompt',
    input: { schema: GenerateMissionsInputSchema },
    output: { schema: GenerateMissionsOutputSchema },
    prompt: `Anda adalah seorang mentor Islami yang bijaksana dan kreatif untuk aplikasi bernama Muslim Mission. Tugas Anda adalah membuat misi-misi Islami yang bermakna, menarik, dan dapat dicapai untuk pengguna.

Anda akan membuat {{count}} misi untuk kategori '{{category}}'.

PERATURAN PENTING:
1.  **Bahasa:** Semua teks (judul, deskripsi) HARUS dalam Bahasa Indonesia yang ramah dan memotivasi.
2.  **Kategori & Hadiah (XP & Koin):**
    *   **Harian:** Tugas kecil dan cepat. XP: 10-30. Koin: 25-50.
    *   **Mingguan:** Komitmen sedang. XP: 50-100. Koin: 100-175.
    *   **Bulanan:** Tantangan besar. XP: 150-300. Koin: 300-500.
3.  **Level Pengguna (saat ini {{level}}):** Sesuaikan kesulitan misi. Untuk level rendah, berikan misi yang lebih mudah. Untuk level tinggi, berikan tantangan yang lebih besar.
4.  **Tipe Misi:** Hasilkan campuran misi tipe 'action' (tandai selesai) dan 'photo' (unggah foto untuk bonus). JANGAN PERNAH membuat misi tipe 'auto'.
5.  **Bonus XP:** Untuk misi 'photo', selalu sertakan \`bonus_xp\` yang masuk akal (sekitar 50% dari XP dasar). Misi 'photo' tidak memberikan bonus koin.
6.  **ID Unik:** Pastikan ID unik dan deskriptif (contoh: 'harian-sedekah-subuh'). JANGAN ulangi ID dari daftar ID yang sudah ada: {{{json existing_mission_ids}}}.
7.  **HADIAH KOIN WAJIB:** Semua misi HARUS memberikan hadiah Koin. Nilai 'coins' TIDAK BOLEH 0 atau kurang. Ini adalah aturan paling penting.
8.  **Kreativitas:** Buat misi yang beragam dan tidak monoton. Contoh ide:
    *   Harian: "Ucapkan Shalawat 100x", "Senyum kepada 3 orang", "Mendoakan orang tua", "Belajar 1 kosakata Arab".
    *   Mingguan: "Salat di masjid pada hari Jumat", "Menjenguk teman yang sakit", "Membaca Surah Al-Kahfi".
    *   Bulanan: "Menyelesaikan 1 Juz Al-Quran", "Puasa Senin-Kamis dua kali", "Memberi makan anak yatim".

Buatlah daftar misi yang akan menginspirasi pengguna untuk bertumbuh dalam iman mereka setiap hari.`,
});


const generateMissionsFlow = ai.defineFlow(
  {
    name: 'generateMissionsFlow',
    inputSchema: GenerateMissionsInputSchema,
    outputSchema: GenerateMissionsOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    
    if (!output?.missions) {
      return { missions: [] };
    }

    // Filter Pengaman: Pastikan semua misi memiliki Koin > 0.
    const processedMissions = output.missions.map(mission => {
      let newMission = { ...mission };
      // Jika AI gagal memberikan koin, kita berikan nilai default.
      if (!newMission.coins || newMission.coins <= 0) {
        console.warn(`Misi "${newMission.title}" dihasilkan dengan koin nol. Memberikan nilai default.`);
        switch (newMission.category) {
          case 'Harian':
            newMission.coins = 25;
            break;
          case 'Mingguan':
            newMission.coins = 100;
            break;
          case 'Bulanan':
            newMission.coins = 300;
            break;
          default:
            newMission.coins = 25; // Fallback
        }
      }
      return newMission;
    });

    return { missions: processedMissions };
  }
);
