'use server';
/**
 * @fileOverview File ini mendefinisikan alur Genkit untuk memberikan umpan balik real-time pada pembacaan Al-Quran.
 *
 * - provideRecitationFeedback - Sebuah fungsi yang mengambil data audio dari pembacaan Al-Quran dan mengembalikan umpan balik tentang pengucapan.
 * - ProvideRecitationFeedbackInput - Tipe input untuk fungsi provideRecitationFeedback, yang mencakup URI data audio.
 * - ProvideRecitationFeedbackOutput - Tipe kembalian untuk fungsi provideRecitationFeedback, yang mencakup teks umpan balik.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ProvideRecitationFeedbackInputSchema = z.object({
  audio_data_uri: z
    .string()
    .describe(
      'Data audio pengguna yang sedang membaca Al-Quran, sebagai URI data yang harus menyertakan tipe MIME dan menggunakan enkode Base64. Format yang diharapkan: \'data:<mimetype>;base64,<encoded_data>\'.'
    ),
});
export type ProvideRecitationFeedbackInput = z.infer<
  typeof ProvideRecitationFeedbackInputSchema
>;

const ProvideRecitationFeedbackOutputSchema = z.object({
  feedback: z.string().describe('Umpan balik tentang pembacaan Al-Quran pengguna.'),
});
export type ProvideRecitationFeedbackOutput = z.infer<
  typeof ProvideRecitationFeedbackOutputSchema
>;

export async function provideRecitationFeedback(
  input: ProvideRecitationFeedbackInput
): Promise<ProvideRecitationFeedbackOutput> {
  return provideRecitationFeedbackFlow(input);
}

const prompt = ai.definePrompt({
  name: 'provideRecitationFeedbackPrompt',
  input: {schema: ProvideRecitationFeedbackInputSchema},
  output: {schema: ProvideRecitationFeedbackOutputSchema},
  prompt: `Anda adalah seorang ahli Tajwid (aturan membaca Al-Quran). Seorang pengguna akan memberikan rekaman audio dari bacaan mereka.

  Dengarkan audio yang diberikan dan berikan umpan balik tentang pengucapan mereka, secara spesifik menunjukkan kesalahan dalam Tajwid. Berikan semangat dan dukungan, serta fokus pada area spesifik untuk perbaikan.

  Audio: {{media url=audio_data_uri}}`,
});

const provideRecitationFeedbackFlow = ai.defineFlow(
  {
    name: 'provideRecitationFeedbackFlow',
    inputSchema: ProvideRecitationFeedbackInputSchema,
    outputSchema: ProvideRecitationFeedbackOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
