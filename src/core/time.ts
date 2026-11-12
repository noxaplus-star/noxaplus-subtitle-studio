import type { SubtitleFormat } from './types';

const TIMESTAMP_PATTERN = /^(?:(\d{1,3}):)?(\d{1,2}):(\d{1,2})[.,](\d{1,3})$/;

export function parseTimestamp(raw: string): number | null {
  const value = raw.trim();
  const match = TIMESTAMP_PATTERN.exec(value);
  if (!match) return null;

  const [, hoursRaw, minutesRaw, secondsRaw, millisRaw] = match;
  const hours = hoursRaw === undefined ? 0 : Number(hoursRaw);
  const minutes = Number(minutesRaw);
  const seconds = Number(secondsRaw);
  const millis = Number(millisRaw.padEnd(3, '0'));

  if (minutes > 59 || seconds > 59) return null;
  if (hoursRaw === undefined && minutes > 59) return null;

  return hours * 3_600_000 + minutes * 60_000 + seconds * 1_000 + millis;
}

function pad(value: number, length: number): string {
  return String(value).padStart(length, '0');
}

export function formatTimestamp(ms: number, format: SubtitleFormat = 'srt'): string {
  const safe = Math.max(0, Math.round(ms));
  const hours = Math.floor(safe / 3_600_000);
  const minutes = Math.floor((safe % 3_600_000) / 60_000);
  const seconds = Math.floor((safe % 60_000) / 1_000);
  const millis = safe % 1_000;
  const separator = format === 'srt' ? ',' : '.';
  return `${pad(hours, 2)}:${pad(minutes, 2)}:${pad(seconds, 2)}${separator}${pad(millis, 3)}`;
}

export function formatDuration(ms: number): string {
  if (!Number.isFinite(ms)) return '0 ms';
  if (ms < 1_000) return `${Math.round(ms)} ms`;
  if (ms < 60_000) return `${(ms / 1_000).toFixed(1)} s`;
  const minutes = Math.floor(ms / 60_000);
  const seconds = Math.round((ms % 60_000) / 1_000);
  return `${minutes}m ${pad(seconds, 2)}s`;
}

export function formatClock(ms: number): string {
  const safe = Math.max(0, Math.round(ms));
  const hours = Math.floor(safe / 3_600_000);
  const minutes = Math.floor((safe % 3_600_000) / 60_000);
  const seconds = Math.floor((safe % 60_000) / 1_000);
  if (hours > 0) return `${hours}:${pad(minutes, 2)}:${pad(seconds, 2)}`;
  return `${pad(minutes, 2)}:${pad(seconds, 2)}`;
}

export function clampTime(ms: number): number {
  if (!Number.isFinite(ms)) return 0;
  return Math.max(0, Math.round(ms));
}

export function humanTime(ms: number): string {
  return formatClock(ms);
}
