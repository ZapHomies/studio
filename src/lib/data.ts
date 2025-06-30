import { User, Mission } from './types';

export const initialUser: User = {
  name: 'Abdullah',
  level: 1,
  xp: 20,
  xpToNextLevel: 150,
  completedMissions: [],
};

export const initialMissions: Mission[] = [
  {
    id: 'mission-1',
    title: 'Complete 5 Daily Prayers',
    description: 'Perform the five obligatory daily prayers: Fajr, Dhuhr, Asr, Maghrib, and Isha. Upload a picture of your prayer mat after one of the prayers.',
    xp: 50,
  },
  {
    id: 'mission-2',
    title: 'Act of Kindness',
    description: 'Perform an act of kindness towards someone. This could be helping a neighbor, feeding a stray animal, or giving charity. Capture a photo that represents your good deed.',
    xp: 30,
  },
  {
    id: 'mission-3',
    title: 'Read a Page of the Quran',
    description: 'Read at least one page from the Holy Quran with reflection on its meaning. Submit a photo of the page you read.',
    xp: 25,
  },
    {
    id: 'mission-4',
    title: 'Make Dua for Someone',
    description: 'Take a moment to make a sincere prayer (Dua) for a family member, a friend, or someone in need. Upload a photo of your hands in prayer.',
    xp: 20,
  },
];
