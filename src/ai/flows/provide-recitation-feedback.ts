'use server';
/**
 * @fileOverview This file defines a Genkit flow for providing real-time feedback on Quran recitation.
 *
 * - provideRecitationFeedback - A function that takes audio data of Quran recitation and returns feedback on the pronunciation.
 * - ProvideRecitationFeedbackInput - The input type for the provideRecitationFeedback function, which includes the audio data URI.
 * - ProvideRecitationFeedbackOutput - The return type for the provideRecitationFeedback function, which includes the feedback text.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ProvideRecitationFeedbackInputSchema = z.object({
  audioDataUri: z
    .string()
    .describe(
      'Audio data of the user reciting the Quran, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' // Corrected typo here
    ),
});
export type ProvideRecitationFeedbackInput = z.infer<
  typeof ProvideRecitationFeedbackInputSchema
>;

const ProvideRecitationFeedbackOutputSchema = z.object({
  feedback: z.string().describe('Feedback on the user\'s Quran recitation.'),
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
  prompt: `You are an expert in Tajweed (the rules of Quranic recitation). A user will provide an audio recording of their recitation.

  Listen to the provided audio and provide feedback on their pronunciation, specifically pointing out any errors in Tajweed. Be encouraging and supportive, and focus on specific areas for improvement.

  Audio: {{media url=audioDataUri}}`,
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
