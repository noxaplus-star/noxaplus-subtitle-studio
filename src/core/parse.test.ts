import { describe, expect, it } from 'vitest';
import { detectFormat, parseSrt, parseSubtitle, parseVtt, SubtitleParseError } from './parse';

const SRT = `1
00:00:01,000 --> 00:00:03,000
Hello world
Second line

2
00:00:04,500 --> 00:00:07,000
Another cue
`;

describe('parseSrt', () => {
  it('parses cues and keeps multiline text', () => {
    const result = parseSrt(SRT);
    expect(result.format).toBe('srt');
    expect(result.cues).toHaveLength(2);
    expect(result.cues[0].start).toBe(1_000);
    expect(result.cues[0].end).toBe(3_000);
    expect(result.cues[0].text).toBe('Hello world\nSecond line');
    expect(result.cues[1].start).toBe(4_500);
    expect(result.warnings).toEqual([]);
  });

  it('parses files without numeric indexes', () => {
    const result = parseSrt(`00:00:01,000 --> 00:00:02,000\nNo index\n`);
    expect(result.cues).toHaveLength(1);
    expect(result.cues[0].text).toBe('No index');
  });

  it('handles BOM, CRLF and spaces around the arrow', () => {
    const result = parseSrt(`\uFEFF1\r\n00:00:01,000   -->   00:00:02,000\r\nHi\r\n`);
    expect(result.cues[0].start).toBe(1_000);
    expect(result.cues[0].end).toBe(2_000);
    expect(result.cues[0].text).toBe('Hi');
  });

  it('keeps empty cue text instead of dropping the cue', () => {
    const result = parseSrt(`1\n00:00:01,000 --> 00:00:02,000\n\n2\n00:00:03,000 --> 00:00:04,000\nText`);
    expect(result.cues).toHaveLength(2);
    expect(result.cues[0].text).toBe('');
  });

  it('skips malformed blocks with a warning', () => {
    const result = parseSrt(
      `garbage\n\n1\n00:xx:01,000 --> 00:00:02,000\nBad\n\n2\n00:00:03,000 --> 00:00:04,000\nGood`,
    );
    expect(result.cues).toHaveLength(1);
    expect(result.cues[0].text).toBe('Good');
    expect(result.warnings.length).toBeGreaterThan(0);
  });

  it('throws on empty input and files without cues', () => {
    expect(() => parseSrt('   ')).toThrow(SubtitleParseError);
    try {
      parseSrt('just text');
    } catch (error) {
      expect((error as SubtitleParseError).code).toBe('noCues');
    }
  });
});

const VTT = `WEBVTT

NOTE this note must be ignored

intro
00:00:01.000 --> 00:00:03.000 align:start position:10%
Hello
world

00:00:04.000 --> 00:00:05.500
Second cue
`;

describe('parseVtt', () => {
  it('parses cues, ids, settings and skips notes', () => {
    const result = parseVtt(VTT);
    expect(result.format).toBe('vtt');
    expect(result.cues).toHaveLength(2);
    expect(result.cues[0].start).toBe(1_000);
    expect(result.cues[0].end).toBe(3_000);
    expect(result.cues[0].text).toBe('Hello\nworld');
    expect(result.cues[1].text).toBe('Second cue');
  });

  it('skips STYLE and REGION blocks', () => {
    const result = parseVtt(`WEBVTT\n\nSTYLE\n::cue { color: red }\n\n00:00:01.000 --> 00:00:02.000\nHi`);
    expect(result.cues).toHaveLength(1);
  });

  it('rejects files without a WEBVTT header', () => {
    expect(() => parseVtt('00:00:01.000 --> 00:00:02.000\nHi')).toThrow(SubtitleParseError);
  });

  it('throws when only a header exists', () => {
    expect(() => parseVtt('WEBVTT\n')).toThrow(SubtitleParseError);
  });
});

describe('format detection', () => {
  it('detects by extension and content', () => {
    expect(detectFormat('anything', 'movie.vtt')).toBe('vtt');
    expect(detectFormat('anything', 'movie.srt')).toBe('srt');
    expect(detectFormat('WEBVTT\n\n')).toBe('vtt');
    expect(detectFormat('1\n00:00:01,000 --> 00:00:02,000\nHi')).toBe('srt');
  });

  it('parses through parseSubtitle', () => {
    expect(parseSubtitle(VTT).format).toBe('vtt');
    expect(parseSubtitle(SRT).format).toBe('srt');
  });
});
