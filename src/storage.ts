import type { Cue, SubtitleFormat } from './core/types';
import type { Language, Theme } from './i18n';

export const STORAGE_KEY = 'noxaplus-subtitle-studio/v1';
const MAX_STORED_CUES = 20_000;

export interface StoredState {
  version: 1;
  cues: Cue[];
  format: SubtitleFormat;
  fileName: string | null;
  lang: Language;
  theme: Theme;
  autoScroll: boolean;
}

function isCue(value: unknown): value is Cue {
  if (!value || typeof value !== 'object') return false;
  const cue = value as Record<string, unknown>;
  return (
    typeof cue.id === 'string' &&
    typeof cue.start === 'number' &&
    Number.isFinite(cue.start) &&
    typeof cue.end === 'number' &&
    Number.isFinite(cue.end) &&
    typeof cue.text === 'string'
  );
}

export function loadStoredState(): StoredState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data: unknown = JSON.parse(raw);
    if (!data || typeof data !== 'object') return null;
    const record = data as Record<string, unknown>;
    if (record.version !== 1) return null;
    if (!Array.isArray(record.cues) || record.cues.length > MAX_STORED_CUES) return null;
    const cues = record.cues.filter(isCue).map((cue) => ({
      ...cue,
      start: Math.max(0, Math.round(cue.start)),
      end: Math.max(0, Math.round(cue.end)),
    }));
    const format: SubtitleFormat = record.format === 'vtt' ? 'vtt' : 'srt';
    const lang: Language = record.lang === 'en' ? 'en' : 'fa';
    const theme: Theme = record.theme === 'light' ? 'light' : 'dark';
    return {
      version: 1,
      cues,
      format,
      fileName: typeof record.fileName === 'string' ? record.fileName : null,
      lang,
      theme,
      autoScroll: record.autoScroll !== false,
    };
  } catch {
    return null;
  }
}

export function saveStoredState(state: Omit<StoredState, 'version'>): boolean {
  try {
    const payload: StoredState = { version: 1, ...state };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    return true;
  } catch {
    return false;
  }
}
