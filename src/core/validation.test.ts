import { describe, expect, it } from 'vitest';
import type { Cue } from './types';
import { issuesForCue, summarize, validateCues } from './validation';

function cue(id: string, start: number, end: number, text: string): Cue {
  return { id, start, end, text };
}

function codes(cues: Cue[]): string[] {
  return validateCues(cues).map((issue) => issue.code);
}

describe('validateCues', () => {
  it('accepts a clean cue', () => {
    expect(validateCues([cue('a', 0, 2_500, 'یک زیرنویس سالم')])).toEqual([]);
  });

  it('flags empty text', () => {
    expect(codes([cue('a', 0, 2_000, '   ')])).toContain('emptyText');
  });

  it('flags invalid timing', () => {
    expect(codes([cue('a', 3_000, 2_000, 'x')])).toContain('endBeforeStart');
    expect(codes([cue('a', -100, 1_000, 'x')])).toContain('negativeTime');
  });

  it('flags short and long durations', () => {
    expect(codes([cue('a', 0, 500, 'ok')])).toContain('shortDuration');
    expect(codes([cue('a', 0, 9_000, 'a calm long cue')])).toContain('longDuration');
  });

  it('flags reading speed', () => {
    const high = cue('a', 0, 2_000, 'a'.repeat(44));
    const critical = cue('b', 0, 2_000, 'a'.repeat(60));
    expect(codes([high])).toContain('highCps');
    expect(codes([critical])).toContain('criticalCps');
  });

  it('flags long lines and too many lines', () => {
    expect(codes([cue('a', 0, 2_000, 'a'.repeat(43))])).toContain('longLine');
    expect(codes([cue('a', 0, 2_000, 'one\ntwo\nthree')])).toContain('manyLines');
  });

  it('ignores markup when measuring length', () => {
    const text = `<i>${'a'.repeat(42)}</i>`;
    expect(codes([cue('a', 0, 2_000, text)])).not.toContain('longLine');
  });

  it('detects overlaps between adjacent and contained cues', () => {
    const issues = validateCues([
      cue('a', 0, 2_000, 'first'),
      cue('b', 1_500, 3_000, 'second'),
    ]);
    const overlap = issues.find((issue) => issue.code === 'overlap');
    expect(overlap?.cueId).toBe('b');
    expect(overlap?.value).toBe(500);

    const contained = validateCues([
      cue('a', 0, 5_000, 'first'),
      cue('b', 1_000, 2_000, 'second'),
      cue('c', 4_000, 6_000, 'third'),
    ]).filter((issue) => issue.code === 'overlap');
    expect(contained.map((issue) => issue.cueId).sort()).toEqual(['b', 'c']);
  });

  it('allows touching cues without overlap', () => {
    expect(codes([cue('a', 0, 2_000, 'one'), cue('b', 2_000, 4_000, 'two')])).not.toContain('overlap');
  });

  it('sorts errors before warnings and includes cue helpers', () => {
    const issues = validateCues([
      cue('a', 0, 500, 'ok'),
      cue('b', 600, 500, 'x'),
    ]);
    expect(issues[0].severity).toBe('error');
    expect(issuesForCue(issues, 'a').every((issue) => issue.cueId === 'a')).toBe(true);
  });
});

describe('summarize', () => {
  it('computes totals and weighted reading speed', () => {
    const cues = [cue('a', 0, 2_000, 'سلام'), cue('b', 3_000, 6_000, 'دنیا')];
    const issues = validateCues(cues);
    const summary = summarize(cues, issues);
    expect(summary.characters).toBe(8);
    expect(summary.words).toBe(2);
    expect(summary.durationMs).toBe(6_000);
    expect(summary.cpsAverage).toBeCloseTo(1.6, 5);
    expect(summary.cpsMax).toBe(2);
    expect(summary.maxLine).toBe(4);
    expect(summary.errors).toBe(0);
    expect(summary.warnings).toBe(0);
  });

  it('counts issue severities', () => {
    const cues = [cue('a', 0, 500, 'a'.repeat(60)), cue('b', 0, 9_000, 'long')];
    const summary = summarize(cues, validateCues(cues));
    expect(summary.errors).toBeGreaterThan(0);
    expect(summary.warnings).toBeGreaterThan(0);
    expect(summary.infos).toBeGreaterThan(0);
  });
});
