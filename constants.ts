import { VoiceName, VoiceOption, VoicePreset } from './types';

export const VOICES: VoiceOption[] = [
  {
    id: VoiceName.Puck,
    name: "Puck",
    gender: "Male",
    description: "Mischievous, energetic, and bright.",
  },
  {
    id: VoiceName.Charon,
    name: "Charon",
    gender: "Male",
    description: "Deep, resonant, and authoritative.",
  },
  {
    id: VoiceName.Kore,
    name: "Kore",
    gender: "Female",
    description: "Warm, nurturing, and calm.",
  },
  {
    id: VoiceName.Fenrir,
    name: "Fenrir",
    gender: "Male",
    description: "Intense, gritty, and powerful.",
  },
  {
    id: VoiceName.Zephyr,
    name: "Zephyr",
    gender: "Female",
    description: "Soft, airy, and gentle.",
  },
];

export const EMOTIONS = [
  { id: 'natural', label: 'Natural' },
  { id: 'happy', label: 'Happy' },
  { id: 'sad', label: 'Sad' },
  { id: 'angry', label: 'Angry' },
  { id: 'excited', label: 'Excited' },
  { id: 'fearful', label: 'Fearful' },
  { id: 'sarcastic', label: 'Sarcastic' },
  { id: 'formal', label: 'Formal' },
  { id: 'whispering', label: 'Whispering' },
  { id: 'shouting', label: 'Shouting' },
  { id: 'ominous', label: 'Ominous' },
  { id: 'creepy', label: 'Creepy' },
  { id: 'growling', label: 'Growling' },
  { id: 'hysterical', label: 'Hysterical' },
  { id: 'painful', label: 'In Pain' },
];

export const ACCENTS = [
  { id: 'none', label: 'Default' },
  { id: 'american', label: 'American' },
  { id: 'british', label: 'British' },
  { id: 'australian', label: 'Australian' },
  { id: 'indian', label: 'Indian' },
  { id: 'german', label: 'German' },
  { id: 'french', label: 'French' },
  { id: 'robot', label: 'Robot' },
  { id: 'monster', label: 'Monster' },
  { id: 'goblin', label: 'Goblin' },
  { id: 'orc', label: 'Orc' },
  { id: 'ogre', label: 'Ogre' },
  { id: 'devil', label: 'Devil' },
  { id: 'vampire', label: 'Vampire' },
  { id: 'zombie', label: 'Zombie' },
  { id: 'ghoul', label: 'Ghoul' },
  { id: 'wraith', label: 'Wraith' },
  { id: 'banshee', label: 'Banshee' },
  { id: 'ghost', label: 'Ghost/Ethereal' },
  { id: 'demonic', label: 'Demonic' },
  { id: 'witch', label: 'Witch' },
  { id: 'news_anchor', label: 'News Anchor' },
];

export const COMMUNITY_PRESETS: VoicePreset[] = [
  {
    id: 'c1',
    name: 'Dungeon Master',
    voice: VoiceName.Charon,
    settings: { emotion: 'formal', pitch: -1, speed: 0.9, accent: 'british' },
    author: 'RPGMaster99',
    likes: 1240,
    tags: ['Game', 'Narrator']
  },
  {
    id: 'c2',
    name: 'Sassy Sidekick',
    voice: VoiceName.Puck,
    settings: { emotion: 'sarcastic', pitch: 1, speed: 1.2, accent: 'american' },
    author: 'IndieDevJane',
    likes: 856,
    tags: ['NPC', 'Funny']
  },
  {
    id: 'c3',
    name: 'Swamp Goblin',
    voice: VoiceName.Fenrir,
    settings: { emotion: 'angry', pitch: 1.5, speed: 1.4, accent: 'goblin' },
    author: 'CreatureFeature',
    likes: 2103,
    tags: ['Monster', 'Enemy']
  },
  {
    id: 'c4',
    name: 'Ship AI',
    voice: VoiceName.Kore,
    settings: { emotion: 'formal', pitch: 0, speed: 1.0, accent: 'robot' },
    author: 'SciFiBuilder',
    likes: 1542,
    tags: ['SciFi', 'UI']
  },
  {
    id: 'c5',
    name: 'Eldritch Horror',
    voice: VoiceName.Charon,
    settings: { emotion: 'whispering', pitch: -2, speed: 0.6, accent: 'monster' },
    author: 'LovecraftFan',
    likes: 933,
    tags: ['Horror', 'Ambient']
  },
  {
    id: 'c6',
    name: 'Dark Lord',
    voice: VoiceName.Charon,
    settings: { emotion: 'ominous', pitch: -1.5, speed: 0.8, accent: 'demonic' },
    author: 'DungeonMaster',
    likes: 666,
    tags: ['Boss', 'Evil']
  },
  {
    id: 'c7',
    name: 'Undead Soldier',
    voice: VoiceName.Fenrir,
    settings: { emotion: 'growling', pitch: -1, speed: 0.7, accent: 'zombie' },
    author: 'Necromancer',
    likes: 342,
    tags: ['Undead', 'Monster']
  },
  {
    id: 'c8',
    name: 'High Vampire',
    voice: VoiceName.Charon,
    settings: { emotion: 'formal', pitch: -0.5, speed: 0.9, accent: 'vampire' },
    author: 'CountDrac',
    likes: 890,
    tags: ['Boss', 'Sophisticated']
  },
  {
    id: 'c9',
    name: 'Cave Ogre',
    voice: VoiceName.Fenrir,
    settings: { emotion: 'angry', pitch: -2, speed: 0.6, accent: 'ogre' },
    author: 'SmashBad',
    likes: 120,
    tags: ['Enemy', 'Brute']
  },
  {
    id: 'c10',
    name: 'Cursed Spirit',
    voice: VoiceName.Zephyr,
    settings: { emotion: 'creepy', pitch: 1.5, speed: 0.8, accent: 'wraith' },
    author: 'GhostHunter',
    likes: 567,
    tags: ['Horror', 'Ethereal']
  }
];