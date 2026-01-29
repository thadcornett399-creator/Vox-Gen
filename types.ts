export enum VoiceName {
  Puck = 'Puck',
  Charon = 'Charon',
  Kore = 'Kore',
  Fenrir = 'Fenrir',
  Zephyr = 'Zephyr',
}

export type Gender = 'Male' | 'Female';

export interface VoiceOption {
  id: VoiceName;
  name: string;
  gender: Gender;
  description: string;
}

export interface VoiceSettings {
  emotion: string;
  pitch: number; // -2 (Low) to 2 (High)
  speed: number; // 0.5 (Slow) to 2.0 (Fast)
  accent: string;
}

export interface GeneratedAudio {
  id: string;
  text: string;
  voice: VoiceName;
  settings: VoiceSettings;
  blobUrl: string;
  timestamp: number;
  duration?: number;
}

export interface VoicePreset {
  id: string;
  name: string;
  voice: VoiceName;
  settings: VoiceSettings;
  author: string;
  likes: number;
  tags: string[];
}
