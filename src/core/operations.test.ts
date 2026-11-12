import { describe, expect, it } from 'vitest';
import {
  createCueAfter,
  duplicateCue,
  mergeCues,
  replaceCue,
  scaleAll,
  shiftAll,
  sortCues,
  splitCue,
} from './operations';
import type { Cue } from './types';

function cue(id: string, start: number, end: number, text: string): Cue {
  return { id, start, end, text };
}

describe('timing operations', () => {
  it('sorts cues by start then end', () => {
    const cues = [cue('b', 3_000, 4_000, 'b'), cue('a', 1_000, 2_000, 'a'), cue('c', 3_000, 5_000, 'c')];
    expect(sortCues(cues).map((item) => item.id)).toEqual(['a', 'b', 'c']);
  });

  it('shifts all cues and clamps at zero', () => {
    const cues = [cue('a', 1_000, 2_000, 'a'), cue('b', 3_000, 4_000, 'b')];
    expect(shiftAll(cues, 500).map((item) => [item.start, item.end])).toEqual([
      [1_500, 2_500],
      [3_500, 4_500],
    ]);
    expect(shiftAll(cues, -1_500).map((item) => [item.start, item.end])).toEqual([
      [0, 1_000],
      [2_000, 3_000],
    ]);
  });

  it('scales all cues', () => {
    const cues = [cue('a', 1_000, 2_000, 'a')];
    expect(scaleAll(cues, 2)[0]).toMatchObject({ start: 2_000, end: 4_000 });
    expect(scaleAll(cues, 0.5)[0]).toMatchObject({ start: 500, end: 1_000 });
  });
});

describe('splitCue', () => {
  it('splits two-line cues at the midpoint', () => {
    const parts = splitCue(cue('a', 0, 4_000, 'line one\nline two'));
    expect(parts).not.toBeNull();
    expect(parts?.[0]).toMatchObject({ start: 0, end: 2_000, text: 'line one' });
    expect(parts?.[1]).toMatchObject({ start: 2_000, end: 4_000, text: 'line two' });
  });

  it('splits words proportionally', () => {
    const parts = splitCue(cue('a', 0, 3_000, 'one two three'));
    expect(parts?.[0].text).toBe('one two');
    expect(parts?.[1].text).toBe('three');
    expect(parts?.[0].end).toBe(parts?.[1].start);
    expect(parts?.[0].end).toBe(1_750);
  });

  it('refuses cues that are too short or have one word', () => {
    expect(splitCue(cue('a', 0, 500, 'hello'))).toBeNull();
    expect(splitCue(cue('b', 0, 3_000, 'hello'))).toBeNull();
  });
});

describe('cue operations', () => {
  it('merges cues with a line break', () => {
    const merged = mergeCues(cue('a', 0, 2_000, 'one'), cue('b', 2_000, 3_500, 'two'));
    expect(merged.text).toBe('one\ntwo');
    expect(merged.start).toBe(0);
    expect(merged.end).toBe(3_500);
    expect(merged.id).toBe('a');
  });

  it('duplicates a cue after a small gap', () => {
    const copy = duplicateCue(cue('a', 1_000, 2_000, 'text'));
    expect(copy.start).toBe(2_200);
    expect(copy.end).toBe(3_200);
    expect(copy.text).toBe('text');
    expect(copy.id).not.toBe('a');
  });

  it('creates a cue after the anchor or at the end', () => {
    const cues = [cue('a', 0, 2_000, 'a'), cue('b', 2_500, 4_000, 'b')];
    expect(createCueAfter(cues, 'a')).toMatchObject({ start: 2_200, end: 4_200 });
    expect(createCueAfter(cues)).toMatchObject({ start: 4_200, end: 6_200 });
    expect(createCueAfter([])).toMatchObject({ start: 0, end: 2_000 });
  });

  it('replaces a cue without mutating the input', () => {
    const cues = [cue('a', 0, 2_000, 'old')];
    const next = replaceCue(cues, 'a', { text: 'new' });
    expect(next[0].text).toBe('new');
    expect(cues[0].text).toBe('old');
  });
});
