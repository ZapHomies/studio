'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/provide-recitation-feedback.ts';
import '@/ai/flows/verify-mission-photo.ts';
import '@/ai/flows/generate-avatar.ts';
import '@/ai/flows/generate-missions.ts';
import '@/ai/flows/generate-daily-wisdom.ts';
