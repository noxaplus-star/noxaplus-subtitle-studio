const TAG_PATTERN = /(<[^>]*>)/g;
const INVISIBLE_ORDER_MARKS = /[\u200B-\u200F\u202A-\u202E\u2066-\u2069]/g;

export function stripTags(text: string): string {
  return text.replace(/<[^>]*>/g, '');
}

export function normalizeNewlines(text: string): string {
  return text.replace(/\r\n?/g, '\n');
}

export function mapOutsideTags(text: string, transform: (segment: string) => string): string {
  return text
    .split(TAG_PATTERN)
    .map((segment) => (segment.startsWith('<') && segment.endsWith('>') ? segment : transform(segment)))
    .join('');
}

export function visibleText(text: string): string {
  return stripTags(text).replace(INVISIBLE_ORDER_MARKS, '');
}

export function visibleLength(text: string): number {
  return Array.from(visibleText(text).replace(/\n+/g, ' ').trim()).length;
}

export function lineLengths(text: string): number[] {
  return visibleText(text)
    .split('\n')
    .map((line) => Array.from(line.trim()).length);
}

export function maxLineLength(text: string): number {
  const lengths = lineLengths(text);
  return lengths.length === 0 ? 0 : Math.max(...lengths);
}

export function lineCount(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split('\n').length;
}

export function wordCount(text: string): number {
  const value = visibleText(text).replace(/\u200C/g, ' ').trim();
  if (!value) return 0;
  return value.split(/\s+/).filter(Boolean).length;
}

export function charactersPerSecond(text: string, durationMs: number): number {
  if (durationMs <= 0) return 0;
  const characters = Array.from(visibleText(text).replace(/\n+/g, ' ').trim()).length;
  return characters / (durationMs / 1_000);
}

export function sanitizeFileName(name: string): string {
  const base = name
    .replace(/\.[^.]+$/, '')
    .replace(/[<>:"/\\|?*\u0000-\u001F]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  return base || 'subtitles';
}

export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return '0 B';
  if (bytes < 1_024) return `${Math.round(bytes)} B`;
  if (bytes < 1_048_576) return `${(bytes / 1_024).toFixed(bytes < 10_240 ? 1 : 0)} KB`;
  return `${(bytes / 1_048_576).toFixed(1)} MB`;
}
