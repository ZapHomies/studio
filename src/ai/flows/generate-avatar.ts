'use server';
/**
 * @fileOverview Alur Genkit untuk membuat avatar pengguna.
 *
 * - generateAvatar - Sebuah fungsi yang mengambil deskripsi teks dan mengembalikan URI data gambar.
 * - GenerateAvatarInput - Tipe input untuk fungsi generateAvatar.
 * - GenerateAvatarOutput - Tipe kembalian untuk fungsi generateAvatar.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateAvatarInputSchema = z.object({
  prompt: z.string().describe('Deskripsi teks dari avatar yang diinginkan.'),
});
export type GenerateAvatarInput = z.infer<typeof GenerateAvatarInputSchema>;

const GenerateAvatarOutputSchema = z.object({
  avatar_data_uri: z
    .string()
    .describe('Gambar avatar yang dihasilkan sebagai URI data.'),
});
export type GenerateAvatarOutput = z.infer<typeof GenerateAvatarOutputSchema>;

export async function generateAvatar(
  input: GenerateAvatarInput
): Promise<GenerateAvatarOutput> {
  return generateAvatarFlow(input);
}

const generateAvatarFlow = ai.defineFlow(
  {
    name: 'generateAvatarFlow',
    inputSchema: GenerateAvatarInputSchema,
    outputSchema: GenerateAvatarOutputSchema,
  },
  async ({ prompt }) => {
    const { media } = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: `A high-quality, friendly muslim avatar, digital art style, vibrant, simple background. Description: ${prompt}`,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    if (!media?.url) {
      throw new Error('Pembuatan gambar gagal menghasilkan gambar.');
    }

    return { avatar_data_uri: media.url };
  }
);
