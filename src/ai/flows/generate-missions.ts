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
  coins: z.number().describe('Jumlah Koin yang diberikan untuk menyelesaikan misi.'),
  type: z.enum(['photo', 'action']).describe("Tipe misi. 'photo' membutuhkan bukti foto untuk bonus, 'action' hanya perlu ditandai selesai."),
  bonusXp: z.optional(z.number()).describe("Jumlah XP bonus jika pengguna mengunggah bukti foto yang valid. Hanya untuk misi tipe 'photo'."),
  category: z.enum(['Harian', 'Mingguan', 'Bulanan']).describe('Kategori misi.'),
});

const GenerateMissionsInputSchema = z.object({
  level: z.number().describe("Level pengguna saat ini untuk menyesuaikan kesulitan misi."),
  existingMissionIds: z.array(z.string()).describe("Daftar ID misi yang sudah ada untuk menghindari duplikasi."),
  count: z.number().describe("Jumlah misi yang harus dibuat."),
  category: z.enum(['Harian', 'Mingguan', 'Bulanan']).describe("Kategori misi yang akan dibuat (Harian, Mingguan, Bulanan)."),
});
export type GenerateMissionsInput = z.infer<typeof GenerateMissionsInputSchema>;

const GenerateMissionsOutputSchema = z.object({
  missions: z.array(MissionSchema).describe("Daftar misi yang dihasilkan."),
});
export type GenerateMissionsOutput = z.infer<typeof GenerateMissionsOutputSchema>;


export async function generateMissions(input: GenerateMissionsInput): Promise<GenerateMissionsOutput> {
  // Tambahkan penanganan error jika output null
  const result = await generateMissionsFlow(input);
  if (!result || !result.missions) {
    console.error("AI mission generation failed, returning empty array.");
    return { missions: [] };
  }
  return result;
}

const prompt = ai.definePrompt({
    name: 'generateMissionsPrompt',
    input: { schema: GenerateMissionsInputSchema },
    output: { schema: GenerateMissionsOutputSchema },
    prompt: `Anda adalah seorang mentor Islami yang bijaksana dan kreatif untuk aplikasi bernama Muslim Mission. Tugas Anda adalah membuat misi-misi Islami yang bermakna, menarik, dan dapat dicapai untuk pengguna.

Anda akan membuat {{count}} misi untuk kategori '{{category}}'.

PERATURAN PENTING:
1.  **Bahasa:** Semua teks (judul, deskripsi) HARUS dalam Bahasa Indonesia yang ramah dan memotivasi.
2.  **Kategori & Hadiah:**
    *   **Harian:** Tugas kecil. XP: 10-30. Koin: 5-15.
    *   **Mingguan:** Komitmen lebih besar. XP: 50-100. Koin: 25-50.
    *   **Bulanan:** Tujuan jangka panjang. XP: 150-300. Koin: 75-150.
3.  **Level Pengguna (saat ini {{level}}):** Sesuaikan kesulitan misi. Untuk level rendah, berikan misi yang lebih mudah. Untuk level tinggi, berikan tantangan yang lebih besar.
4.  **Tipe Misi:** Hasilkan campuran misi tipe 'action' (tandai selesai) dan 'photo' (unggah foto untuk bonus). JANGAN PERNAH membuat misi tipe 'auto'.
5.  **Bonus XP:** Untuk misi 'photo', selalu sertakan \`bonusXp\` yang masuk akal (sekitar 50% dari XP dasar). Misi 'photo' tidak memberikan bonus koin.
6.  **ID Unik:** Pastikan ID unik dan deskriptif (contoh: 'harian-sedekah-subuh'). JANGAN ulangi ID dari daftar ID yang sudah ada: {{{json existingMissionIds}}}.
7.  **Kreativitas:** Buat misi yang beragam dan tidak monoton. Contoh ide:
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
    return output!;
  }
);
