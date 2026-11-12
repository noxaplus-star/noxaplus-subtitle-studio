import { charactersPerSecond, lineCount, maxLineLength, visibleLength, wordCount } from './text';
import type { Cue, Issue, QualitySummary } from './types';

export const THRESHOLDS = {
  shortDurationMs: 700,
  longDurationMs: 8_000,
  cpsWarning: 20,
  cpsError: 25,
  maxLineChars: 42,
  maxLines: 2,
} as const;

export function validateCues(cues: Cue[]): Issue[] {
  const issues: Issue[] = [];

  for (const cue of cues) {
    const push = (code: Issue['code'], severity: Issue['severity'], value: number) => {
      issues.push({ id: `${cue.id}:${code}`, cueId: cue.id, code, severity, value });
    };

    if (cue.start < 0 || cue.end < 0) push('negativeTime', 'error', 0);
    if (cue.end <= cue.start) push('endBeforeStart', 'error', 0);
    if (!cue.text.trim()) push('emptyText', 'warning', 0);

    const duration = cue.end - cue.start;
    if (duration > 0) {
      if (duration < THRESHOLDS.shortDurationMs) push('shortDuration', 'warning', duration);
      if (duration > THRESHOLDS.longDurationMs) push('longDuration', 'info', duration);

      if (cue.text.trim()) {
        const cps = charactersPerSecond(cue.text, duration);
        if (cps > THRESHOLDS.cpsError) push('criticalCps', 'error', cps);
        else if (cps > THRESHOLDS.cpsWarning) push('highCps', 'warning', cps);
      }
    }

    const lines = lineCount(cue.text);
    if (lines > THRESHOLDS.maxLines) push('manyLines', 'warning', lines);
    const longest = maxLineLength(cue.text);
    if (longest > THRESHOLDS.maxLineChars) push('longLine', 'warning', longest);
  }

  const sorted = [...cues].sort((a, b) => a.start - b.start || a.end - b.end);
  let furthest: Cue | null = null;
  for (const cue of sorted) {
    if (furthest && cue.start < furthest.end) {
      issues.push({
        id: `${cue.id}:overlap`,
        cueId: cue.id,
        code: 'overlap',
        severity: 'error',
        value: furthest.end - cue.start,
      });
    }
    if (!furthest || cue.end > furthest.end) furthest = cue;
  }

  const order = new Map(cues.map((cue, index) => [cue.id, index]));
  const rank: Record<Issue['severity'], number> = { error: 0, warning: 1, info: 2 };
  return issues.sort(
    (a, b) =>
      rank[a.severity] - rank[b.severity] ||
      (order.get(a.cueId) ?? 0) - (order.get(b.cueId) ?? 0),
  );
}

export function summarize(cues: Cue[], issues: Issue[]): QualitySummary {
  let characters = 0;
  let words = 0;
  let maxLine = 0;
  let cpsMax = 0;
  let drivenChars = 0;
  let drivenMs = 0;

  for (const cue of cues) {
    const chars = visibleLength(cue.text);
    characters += chars;
    words += wordCount(cue.text);
    maxLine = Math.max(maxLine, maxLineLength(cue.text));
    const duration = Math.max(0, cue.end - cue.start);
    if (chars > 0 && duration > 0) {
      cpsMax = Math.max(cpsMax, charactersPerSecond(cue.text, duration));
      drivenChars += chars;
      drivenMs += duration;
    }
  }

  return {
    errors: issues.filter((issue) => issue.severity === 'error').length,
    warnings: issues.filter((issue) => issue.severity === 'warning').length,
    infos: issues.filter((issue) => issue.severity === 'info').length,
    cpsAverage: drivenMs > 0 ? drivenChars / (drivenMs / 1_000) : 0,
    cpsMax,
    characters,
    words,
    durationMs: cues.reduce((max, cue) => Math.max(max, cue.end), 0),
    maxLine,
  };
}

export function issuesForCue(issues: Issue[], cueId: string): Issue[] {
  return issues.filter((issue) => issue.cueId === cueId);
}
