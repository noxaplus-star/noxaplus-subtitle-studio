import { createId } from './ids';
import { normalizeNewlines } from './text';
import { parseTimestamp } from './time';
import type { Cue, ParseResult, SubtitleFormat } from './types';

export type ParseErrorCode = 'empty' | 'noCues' | 'invalidProject' | 'invalidJson';

export class SubtitleParseError extends Error {
  readonly code: ParseErrorCode;

  constructor(code: ParseErrorCode, message?: string) {
    super(message ?? code);
    this.name = 'SubtitleParseError';
    this.code = code;
  }
}

export function detectFormat(text: string, fileName = ''): SubtitleFormat {
  if (/\.vtt$/i.test(fileName)) return 'vtt';
  if (/\.srt$/i.test(fileName)) return 'srt';
  return /^\uFEFF?\s*WEBVTT/m.test(text) ? 'vtt' : 'srt';
}

function cleanBlockText(lines: string[]): string {
  const textLines = [...lines];
  while (textLines.length > 0 && textLines[0].trim() === '') textLines.shift();
  while (textLines.length > 0 && textLines[textLines.length - 1].trim() === '') textLines.pop();
  return textLines.map((line) => line.trim()).join('\n');
}

function readTimingLine(line: string): { start: number; end: number } | null {
  const parts = line.split('-->');
  if (parts.length < 2) return null;
  const start = parseTimestamp(parts[0]);
  const endToken = parts[1].trim().split(/\s+/)[0] ?? '';
  const end = parseTimestamp(endToken);
  if (start === null || end === null) return null;
  return { start, end };
}

export function parseSrt(text: string): ParseResult {
  const normalized = normalizeNewlines(text).replace(/^\uFEFF/, '').trim();
  if (!normalized) throw new SubtitleParseError('empty');

  const blocks = normalized.split(/\n{2,}/);
  const cues: Cue[] = [];
  const warnings: string[] = [];

  for (const block of blocks) {
    const lines = block.split('\n');
    const timingIndex = lines.findIndex((line) => line.includes('-->'));
    if (timingIndex === -1) {
      warnings.push('A block without a timing line was skipped.');
      continue;
    }
    if (timingIndex > 1) {
      warnings.push('A block had unexpected content before its timing line.');
    }
    const timing = readTimingLine(lines[timingIndex]);
    if (!timing) {
      warnings.push('A block had an invalid timestamp and was skipped.');
      continue;
    }
    cues.push({
      id: createId(),
      start: timing.start,
      end: timing.end,
      text: cleanBlockText(lines.slice(timingIndex + 1)),
    });
  }

  if (cues.length === 0) throw new SubtitleParseError('noCues');
  return { cues, format: 'srt', warnings };
}

export function parseVtt(text: string): ParseResult {
  const normalized = normalizeNewlines(text).replace(/^\uFEFF/, '').trim();
  if (!normalized) throw new SubtitleParseError('empty');
  if (!/^WEBVTT/.test(normalized)) {
    throw new SubtitleParseError('noCues', 'The file does not contain a WEBVTT header.');
  }

  const blocks = normalized.split(/\n{2,}/);
  const cues: Cue[] = [];
  const warnings: string[] = [];

  for (const block of blocks) {
    const lines = block.split('\n');
    const first = lines[0].trim();
    if (/^WEBVTT\b/.test(first)) continue;
    if (/^(NOTE|STYLE|REGION)\b/.test(first)) continue;

    const timingIndex = lines.findIndex((line) => line.includes('-->'));
    if (timingIndex === -1) {
      warnings.push('A WebVTT block without a timing line was skipped.');
      continue;
    }
    if (timingIndex > 1) {
      warnings.push('A WebVTT block had unexpected content before its timing line.');
      continue;
    }
    const timing = readTimingLine(lines[timingIndex]);
    if (!timing) {
      warnings.push('A WebVTT block had an invalid timestamp and was skipped.');
      continue;
    }
    cues.push({
      id: createId(),
      start: timing.start,
      end: timing.end,
      text: cleanBlockText(lines.slice(timingIndex + 1)),
    });
  }

  if (cues.length === 0) throw new SubtitleParseError('noCues');
  return { cues, format: 'vtt', warnings };
}

export function parseSubtitle(text: string, fileName = ''): ParseResult {
  return detectFormat(text, fileName) === 'vtt' ? parseVtt(text) : parseSrt(text);
}
