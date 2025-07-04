'use server';
/**
 * @fileOverview Alur verifikasi foto misi untuk memverifikasi apakah foto yang dikirimkan pengguna relevan dengan misi harian tertentu untuk mendapatkan bonus.
 *
 * - verifyMissionPhoto - Sebuah fungsi yang menangani proses verifikasi foto misi.
 * - VerifyMissionPhotoInput - Tipe input untuk fungsi verifyMissionPhoto.
 * - VerifyMissionPhotoOutput - Tipe kembalian untuk fungsi verifyMissionPhoto.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const VerifyMissionPhotoInputSchema = z.object({
  photo_data_uri: z
    .string()
    .describe(
      "Foto yang dikirimkan oleh pengguna, sebagai URI data yang harus menyertakan tipe MIME dan menggunakan enkode Base64. Format yang diharapkan: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  mission_description: z.string().describe('Deskripsi misi harian.'),
});
export type VerifyMissionPhotoInput = z.infer<typeof VerifyMissionPhotoInputSchema>;

const VerifyMissionPhotoOutputSchema = z.object({
  is_relevant: z.boolean().describe('Apakah foto tersebut relevan dengan misi untuk mendapatkan bonus.'),
  reason: z.string().describe("Alasan AI untuk penentuan relevansinya."),
});
export type VerifyMissionPhotoOutput = z.infer<typeof VerifyMissionPhotoOutputSchema>;

export async function verifyMissionPhoto(input: VerifyMissionPhotoInput): Promise<VerifyMissionPhotoOutput> {
  return verifyMissionPhotoFlow(input);
}

const prompt = ai.definePrompt({
  name: 'verifyMissionPhotoPrompt',
  input: {schema: VerifyMissionPhotoInputSchema},
  output: {schema: VerifyMissionPhotoOutputSchema},
  prompt: `Anda adalah asisten AI yang ramah dan positif yang bertugas memverifikasi apakah foto yang dikirimkan pengguna cukup relevan dengan misi harian Islami mereka untuk mendapatkan XP bonus.

Deskripsi Misi: {{{mission_description}}}
Foto: {{media url=photo_data_uri}}

Tugas Anda adalah:
1. Tentukan apakah foto tersebut secara logis dapat dianggap sebagai bukti penyelesaian misi untuk mendapatkan bonus. Berikan penilaian yang murah hati dan positif jika memungkinkan.
2. Berikan alasan yang jelas, singkat, dan mendukung untuk keputusan Anda dalam bahasa Indonesia.
3. Tujuannya adalah untuk mendorong, bukan menghakimi. Jika foto sangat tidak berhubungan (misal: foto mobil untuk misi salat), tolak dengan sopan. Jika ada sedikit relevansi (misal: foto langit saat maghrib untuk misi salat maghrib), setujui.

Atur output \`is_relevant\` ke true jika foto relevan untuk bonus, dan false jika tidak. Selalu berikan alasan yang membangun di bidang \`reason\`.`,
});

const verifyMissionPhotoFlow = ai.defineFlow(
  {
    name: 'verifyMissionPhotoFlow',
    inputSchema: VerifyMissionPhotoInputSchema,
    outputSchema: VerifyMissionPhotoOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
