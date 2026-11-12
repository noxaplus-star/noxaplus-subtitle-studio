import { formatTimestamp } from './time';
import type { Cue, SubtitleFormat } from './types';

export function serialize(cues: Cue[], format: SubtitleFormat): string {
  const ordered = [...cues].sort((a, b) => a.start - b.start || a.end - b.end);

  if (format === 'vtt') {
    const body = ordered
      .map(
        (cue) =>
          `${formatTimestamp(cue.start, 'vtt')} --> ${formatTimestamp(cue.end, 'vtt')}\n${cue.text.trim()}\n`,
      )
      .join('\n');
    return `WEBVTT\n\n${body}`;
  }

  return ordered
    .map(
      (cue, index) =>
        `${index + 1}\n${formatTimestamp(cue.start, 'srt')} --> ${formatTimestamp(cue.end, 'srt')}\n${cue.text.trim()}\n`,
    )
    .join('\n');
}
