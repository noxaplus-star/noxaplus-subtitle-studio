import { describe, expect, it } from 'vitest';
import { parseAny, parseProject, serializeProject } from './project';
import { parseSrt, parseVtt, SubtitleParseError } from './parse';
import { serialize } from './serialize';
import type { Cue } from './types';

function cue(id: string, start: number, end: number, text: string): Cue {
  return { id, start, end, text };
}

describe('serialize', () => {
  it('writes sorted SRT with sequential indexes', () => {
    const cues = [cue('b', 2_000, 3_000, 'second'), cue('a', 0, 1_000, 'first')];
    const text = serialize(cues, 'srt');
    expect(text.startsWith('1\n00:00:00,000 --> 00:00:01,000\nfirst\n')).toBe(true);
    expect(text).toContain('2\n00:00:02,000 --> 00:00:03,000\nsecond');
  });

  it('writes VTT with a header and dot separators', () => {
    const text = serialize([cue('a', 1_000, 2_500, 'hello')], 'vtt');
    expect(text).toBe('WEBVTT\n\n00:00:01.000 --> 00:00:02.500\nhello\n');
  });

  it('handles empty cue lists', () => {
    expect(serialize([], 'srt')).toBe('');
    expect(serialize([], 'vtt')).toBe('WEBVTT\n\n');
  });

  it('round-trips through the parsers', () => {
    const cues = [
      cue('a', 0, 1_500, 'line one\nline two'),
      cue('b', 2_000, 4_500, 'second cue'),
    ];
    const srtRoundTrip = parseSrt(serialize(cues, 'srt')).cues;
    expect(srtRoundTrip.map((item) => [item.start, item.end, item.text])).toEqual([
      [0, 1_500, 'line one\nline two'],
      [2_000, 4_500, 'second cue'],
    ]);

    const vttRoundTrip = parseVtt(serialize(cues, 'vtt')).cues;
    expect(vttRoundTrip.map((item) => [item.start, item.end, item.text])).toEqual([
      [0, 1_500, 'line one\nline two'],
      [2_000, 4_500, 'second cue'],
    ]);
  });
});

describe('project JSON', () => {
  it('round-trips cues and format', () => {
    const cues = [cue('a', 0, 2_000, 'سلام'), cue('b', 2_500, 4_000, 'دنیا')];
    const parsed = parseProject(serializeProject(cues, 'vtt'));
    expect(parsed.format).toBe('vtt');
    expect(parsed.cues.map((item) => [item.start, item.end, item.text])).toEqual([
      [0, 2_000, 'سلام'],
      [2_500, 4_000, 'دنیا'],
    ]);
  });

  it('clamps negative times and skips invalid cues', () => {
    const parsed = parseProject(
      JSON.stringify({
        cues: [
          { start: -500, end: 1_000, text: 'ok' },
          { start: 'bad', end: 1_000, text: 'nope' },
          { start: 2_000, end: 3_000, text: 'done' },
        ],
        format: 'srt',
      }),
    );
    expect(parsed.cues).toHaveLength(2);
    expect(parsed.cues[0].start).toBe(0);
  });

  it('rejects malformed JSON and payloads', () => {
    expect(() => parseProject('{broken')).toThrow(SubtitleParseError);
    expect(() => parseProject('{"hello":1}')).toThrow(SubtitleParseError);
    expect(() => parseProject('{"cues":[]}')).toThrow(SubtitleParseError);
  });

  it('detects JSON projects by content or extension', () => {
    const payload = serializeProject([cue('a', 0, 1_000, 'hi')], 'srt');
    expect(parseAny(payload).cues[0].text).toBe('hi');
    expect(parseAny(payload, 'project.json').cues).toHaveLength(1);
  });
});
