export const AI_MODES = {
  CAREER: 'career',
  HEALTH: 'health',
  DUAL: 'dual'
} as const;

export type AIMode = typeof AI_MODES[keyof typeof AI_MODES];

export const COLORS = {
  MEDICAL_BLUE: '#0ea5e9',
  MEDICAL_BLUE_DARK: '#0284c7',
  CAREER_GOLD: '#fbbf24',
  CAREER_GOLD_DARK: '#f59e0b',
  NEON_BLUE: '#00d4ff',
  NEON_GOLD: '#ffd700'
} as const;

export const URGENCY_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  EMERGENCY: 'emergency'
} as const;

export type UrgencyLevel = typeof URGENCY_LEVELS[keyof typeof URGENCY_LEVELS];

export const VOICE_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
  { code: 'de', name: 'Deutsch' },
  { code: 'it', name: 'Italiano' },
  { code: 'pt', name: 'Português' }
] as const;
