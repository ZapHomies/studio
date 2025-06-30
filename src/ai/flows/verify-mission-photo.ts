// The verifyMissionPhoto flow verifies if a user-submitted photo is relevant to a specific daily mission.

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const VerifyMissionPhotoInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo submitted by the user, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  missionDescription: z.string().describe('The description of the daily mission.'),
});
export type VerifyMissionPhotoInput = z.infer<typeof VerifyMissionPhotoInputSchema>;

const VerifyMissionPhotoOutputSchema = z.object({
  isRelevant: z.boolean().describe('Whether the photo is relevant to the mission.'),
  reason: z.string().describe("The AI's reasoning for its relevance determination."),
});
export type VerifyMissionPhotoOutput = z.infer<typeof VerifyMissionPhotoOutputSchema>;

export async function verifyMissionPhoto(input: VerifyMissionPhotoInput): Promise<VerifyMissionPhotoOutput> {
  return verifyMissionPhotoFlow(input);
}

const prompt = ai.definePrompt({
  name: 'verifyMissionPhotoPrompt',
  input: {schema: VerifyMissionPhotoInputSchema},
  output: {schema: VerifyMissionPhotoOutputSchema},
  prompt: `You are an AI assistant tasked with verifying if a user-submitted photo is relevant to their daily mission.

  Mission Description: {{{missionDescription}}}
  Photo: {{media url=photoDataUri}}`,
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

