import { describe, expect, it } from 'vitest';
import { clampTime, formatClock, formatDuration, formatTimestamp, parseTimestamp } from './time';

describe('parseTimestamp', () => {
  it('parses SRT timestamps', () => {
    expect(parseTimestamp('00:00:01,000')).toBe(1_000);
    expect(parseTimestamp('00:01:02,500')).toBe(62_500);
    expect(parseTimestamp('1:02:03,004')).toBe(3_723_004);
  });

  it('parses VTT timestamps', () => {
    expect(parseTimestamp('00:00:01.250')).toBe(1_250);
    expect(parseTimestamp('01:02.500')).toBe(62_500);
    expect(parseTimestamp('00:01:02.5')).toBe(62_500);
  });

  it('pads short millisecond fields', () => {
    expect(parseTimestamp('00:00:01,5')).toBe(1_500);
    expect(parseTimestamp('00:00:01,05')).toBe(1_050);
  });

  it('rejects invalid input', () => {
    expect(parseTimestamp('')).toBeNull();
    expect(parseTimestamp('nope')).toBeNull();
    expect(parseTimestamp('00:60:00,000')).toBeNull();
    expect(parseTimestamp('00:00:60,000')).toBeNull();
    expect(parseTimestamp('00:00:01')).toBeNull();
  });
});

describe('formatTimestamp', () => {
  it('formats SRT and VTT', () => {
    expect(formatTimestamp(62_500, 'srt')).toBe('00:01:02,500');
    expect(formatTimestamp(62_500, 'vtt')).toBe('00:01:02.500');
    expect(formatTimestamp(3_723_004, 'srt')).toBe('01:02:03,004');
  });

  it('clamps negative values', () => {
    expect(formatTimestamp(-500)).toBe('00:00:00,000');
  });
});

describe('human time helpers', () => {
  it('formats durations', () => {
    expect(formatDuration(850)).toBe('850 ms');
    expect(formatDuration(2_400)).toBe('2.4 s');
    expect(formatDuration(65_000)).toBe('1m 05s');
  });

  it('formats clocks', () => {
    expect(formatClock(65_000)).toBe('01:05');
    expect(formatClock(3_670_000)).toBe('1:01:10');
  });

  it('clamps time values', () => {
    expect(clampTime(-20)).toBe(0);
    expect(clampTime(Number.NaN)).toBe(0);
    expect(clampTime(12.6)).toBe(13);
  });
});
