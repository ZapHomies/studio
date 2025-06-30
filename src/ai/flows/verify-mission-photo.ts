'use server';
/**
 * @fileOverview Alur verifikasi foto misi untuk memverifikasi apakah foto yang dikirimkan pengguna relevan dengan misi harian tertentu.
 *
 * - verifyMissionPhoto - Sebuah fungsi yang menangani proses verifikasi foto misi.
 * - VerifyMissionPhotoInput - Tipe input untuk fungsi verifyMissionPhoto.
 * - VerifyMissionPhotoOutput - Tipe kembalian untuk fungsi verifyMissionPhoto.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const VerifyMissionPhotoInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "Foto yang dikirimkan oleh pengguna, sebagai URI data yang harus menyertakan tipe MIME dan menggunakan enkode Base64. Format yang diharapkan: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  missionDescription: z.string().describe('Deskripsi misi harian.'),
});
export type VerifyMissionPhotoInput = z.infer<typeof VerifyMissionPhotoInputSchema>;

const VerifyMissionPhotoOutputSchema = z.object({
  isRelevant: z.boolean().describe('Apakah foto tersebut relevan dengan misi.'),
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
  prompt: `Anda adalah asisten AI yang teliti yang bertugas memverifikasi apakah foto yang dikirimkan pengguna relevan dengan misi harian Islami mereka. Analisis foto dengan cermat dalam konteks deskripsi misi.

Deskripsi Misi: {{{missionDescription}}}
Foto: {{media url=photoDataUri}}

Tugas Anda adalah:
1. Tentukan apakah foto tersebut secara logis dapat dianggap sebagai bukti penyelesaian misi.
2. Berikan alasan yang jelas dan singkat untuk keputusan Anda dalam bahasa Indonesia.
3. Bersikaplah adil namun jangan mudah tertipu. Jika foto tidak jelas atau tidak berhubungan, tolak. Misalnya, untuk misi 'Salat 5 waktu', foto sajadah sudah cukup, tetapi foto pemandangan acak tidak. Untuk 'sedekah', foto kotak amal atau tangkapan layar transfer sudah cukup.

Atur output \`isRelevant\` ke true jika foto relevan, dan false jika tidak. Berikan alasan Anda di bidang \`reason\`.`,
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
