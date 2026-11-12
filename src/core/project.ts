import { createId } from './ids';
import { parseSubtitle, SubtitleParseError } from './parse';
import type { Cue, SubtitleFormat } from './types';

interface ProjectCue {
  start: number;
  end: number;
  text: string;
}

interface ProjectFile {
  app: string;
  version: number;
  format: SubtitleFormat;
  cues: ProjectCue[];
}

export function serializeProject(cues: Cue[], format: SubtitleFormat): string {
  const payload: ProjectFile = {
    app: 'noxaplus-subtitle-studio',
    version: 1,
    format,
    cues: cues.map((cue) => ({ start: cue.start, end: cue.end, text: cue.text })),
  };
  return JSON.stringify(payload, null, 2);
}

export function parseProject(text: string): { cues: Cue[]; format: SubtitleFormat } {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new SubtitleParseError('invalidJson');
  }

  if (!data || typeof data !== 'object' || !('cues' in data) || !Array.isArray(data.cues)) {
    throw new SubtitleParseError('invalidProject');
  }

  const record = data as Record<string, unknown>;
  const rawCues = record.cues;
  if (!Array.isArray(rawCues)) throw new SubtitleParseError('invalidProject');
  const format: SubtitleFormat = record.format === 'vtt' ? 'vtt' : 'srt';
  const cues: Cue[] = [];

  for (const raw of rawCues) {
    if (!raw || typeof raw !== 'object') continue;
    const item = raw as Record<string, unknown>;
    if (typeof item.start !== 'number' || typeof item.end !== 'number' || typeof item.text !== 'string') {
      continue;
    }
    if (!Number.isFinite(item.start) || !Number.isFinite(item.end)) continue;
    cues.push({
      id: createId(),
      start: Math.max(0, Math.round(item.start)),
      end: Math.max(0, Math.round(item.end)),
      text: item.text,
    });
  }

  if (cues.length === 0) throw new SubtitleParseError('invalidProject');
  return { cues, format };
}

export function parseAny(text: string, fileName = ''): { cues: Cue[]; format: SubtitleFormat; warnings: string[] } {
  const trimmed = text.trim();
  if (/\.json$/i.test(fileName) || trimmed.startsWith('{')) {
    const parsed = parseProject(text);
    return { cues: parsed.cues, format: parsed.format, warnings: [] };
  }
  return parseSubtitle(text, fileName);
}
