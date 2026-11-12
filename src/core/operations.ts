import { createId } from './ids';
import type { Cue } from './types';

export function sortCues(cues: Cue[]): Cue[] {
  return [...cues].sort((a, b) => a.start - b.start || a.end - b.end);
}

export function shiftAll(cues: Cue[], deltaMs: number): Cue[] {
  if (cues.length === 0) return cues;
  const delta = Math.round(deltaMs);
  const earliest = Math.min(...cues.map((cue) => cue.start));
  const applied = Math.max(delta, -earliest);
  return cues.map((cue) => ({
    ...cue,
    start: Math.max(0, cue.start + applied),
    end: Math.max(0, cue.end + applied),
  }));
}

export function scaleAll(cues: Cue[], factor: number): Cue[] {
  const safeFactor = Math.min(10, Math.max(0.1, factor));
  return cues.map((cue) => ({
    ...cue,
    start: Math.max(0, Math.round(cue.start * safeFactor)),
    end: Math.max(0, Math.round(cue.end * safeFactor)),
  }));
}

export function splitCue(cue: Cue): [Cue, Cue] | null {
  const duration = cue.end - cue.start;
  if (duration < 600) return null;

  const lines = cue.text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  let firstText = '';
  let secondText = '';

  if (lines.length >= 2) {
    const cut = Math.ceil(lines.length / 2);
    firstText = lines.slice(0, cut).join('\n');
    secondText = lines.slice(cut).join('\n');
  } else {
    const words = cue.text.trim().split(/\s+/).filter(Boolean);
    if (words.length < 2) return null;
    const cut = Math.ceil(words.length / 2);
    firstText = words.slice(0, cut).join(' ');
    secondText = words.slice(cut).join(' ');
  }

  if (!firstText || !secondText) return null;

  const totalChars = firstText.length + secondText.length;
  const ratio = totalChars === 0 ? 0.5 : firstText.length / totalChars;
  const splitAt = Math.max(
    cue.start + 300,
    Math.min(cue.end - 300, Math.round(cue.start + duration * ratio)),
  );

  if (splitAt <= cue.start || splitAt >= cue.end) return null;

  return [
    { ...cue, end: splitAt, text: firstText },
    { id: createId(), start: splitAt, end: cue.end, text: secondText },
  ];
}

export function mergeCues(first: Cue, second: Cue): Cue {
  return {
    ...first,
    end: Math.max(first.end, second.end),
    text: [first.text.trim(), second.text.trim()].filter(Boolean).join('\n'),
  };
}

export function duplicateCue(cue: Cue): Cue {
  const duration = Math.max(500, cue.end - cue.start);
  const start = cue.end + 200;
  return { id: createId(), start, end: start + duration, text: cue.text };
}

export function createCueAfter(cues: Cue[], afterId?: string | null): Cue {
  const index = afterId ? cues.findIndex((cue) => cue.id === afterId) : -1;
  const anchor = index >= 0 ? cues[index] : cues[cues.length - 1];
  const start = anchor ? Math.max(anchor.end + 200, 0) : 0;
  return { id: createId(), start, end: start + 2_000, text: '' };
}

export function replaceCue(cues: Cue[], id: string, patch: Partial<Omit<Cue, 'id'>>): Cue[] {
  return cues.map((cue) => (cue.id === id ? { ...cue, ...patch } : cue));
}
