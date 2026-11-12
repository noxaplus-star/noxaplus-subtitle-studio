import { mapOutsideTags } from './text';
import type { Cue, FixChange, FixReport, PersianFixOptions } from './types';

export const DEFAULT_FIX_OPTIONS: PersianFixOptions = {
  normalizeCharacters: true,
  persianDigits: false,
  halfSpaces: true,
  punctuation: true,
  removeDiacritics: false,
  ellipsis: true,
  whitespace: true,
};

const PROTECTED_TOKEN = /(https?:\/\/[^\s]+|www\.[^\s]+|[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})/g;

function normalizeCharacters(input: string): string {
  let s = input;
  s = s.replace(/\u064A/g, '\u06CC');
  s = s.replace(/\u0649/g, '\u06CC');
  s = s.replace(/\u0643/g, '\u06A9');
  s = s.replace(/\u0640/g, '');
  s = s.replace(/\u200B/g, '');
  s = s.replace(/\u00A0/g, ' ');
  s = s.replace(/[\u0660-\u0669]/g, (digit) =>
    String.fromCharCode(0x06f0 + (digit.charCodeAt(0) - 0x0660)),
  );
  s = s.replace(/\u200C{2,}/g, '\u200C');
  return s;
}

function toPersianDigits(input: string): string {
  const parts = input.split(PROTECTED_TOKEN);
  return parts
    .map((part, index) => {
      if (index % 2 === 1) return part;
      return part.replace(/[0-9]/g, (digit) => String.fromCharCode(0x06f0 + Number(digit)));
    })
    .join('');
}

function applyHalfSpaces(input: string): string {
  let s = input;
  s = s.replace(/(^|[^\p{L}\u200C])نمی[ \t]+/gu, '$1نمی\u200C');
  s = s.replace(/(^|[^\p{L}\u200C])می[ \t]+/gu, '$1می\u200C');
  s = s.replace(
    /(\p{L})[ \t]+(هایمان|هایتان|هایشان|هایی|هایم|هایت|هایش|های|ها)(?=$|[^\p{L}])/gu,
    '$1\u200C$2',
  );
  s = s.replace(/(\p{L}{2,})[ \t]+(ترین|تر)(?=$|[^\p{L}])/gu, '$1\u200C$2');
  s = s.replace(/(^|[^\p{L}])بی[ \t]+(\p{L}{2,})/gu, '$1بی\u200C$2');
  s = s.replace(/[ \t]*\u200C[ \t]*/g, '\u200C');
  return s;
}

function fixEllipsis(input: string): string {
  let s = input;
  s = s.replace(/[ \t]*\.{3,}[ \t]*/g, '…');
  s = s.replace(/…{2,}/g, '…');
  s = s.replace(/…(?=[\p{L}\p{N}])/gu, '… ');
  return s;
}

function fixPunctuation(input: string): string {
  let s = input;
  s = s.replace(/[ \t]+([،؛:!؟.,…»)\]}])/g, '$1');
  s = s.replace(/([«(\[{])[ \t]+/g, '$1');
  s = s.replace(/([،؛!؟])(?=[^\s،؛!؟.,:…»"\')\]}])/g, '$1 ');
  s = s.replace(/(?<=[\u0600-\u06FF])\.(?=\p{L})/gu, '. ');
  s = s.replace(/,([\p{L}])/gu, ', $1');
  s = s.replace(/:([\p{L}])/gu, ': $1');
  s = s.replace(/…(?=[\p{L}\p{N}])/gu, '… ');
  s = s.replace(/؟{2,}/g, '؟');
  s = s.replace(/،{2,}/g, '،');
  s = s.replace(/؛{2,}/g, '؛');
  s = s.replace(/!{2,}/g, '!');
  return s;
}

function fixWhitespace(input: string): string {
  let s = input;
  s = s.replace(/[ \t]+/g, ' ');
  s = s.replace(/[ \t]+\n/g, '\n');
  s = s.replace(/\n[ \t]+/g, '\n');
  s = s.replace(/\n{3,}/g, '\n\n');
  return s;
}

function fixSegment(segment: string, options: PersianFixOptions): string {
  let s = segment;
  if (options.normalizeCharacters) s = normalizeCharacters(s);
  if (options.removeDiacritics) s = s.replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, '');
  if (options.whitespace) s = fixWhitespace(s);
  if (options.halfSpaces) s = applyHalfSpaces(s);
  if (options.ellipsis) s = fixEllipsis(s);
  if (options.punctuation) s = fixPunctuation(s);
  if (options.persianDigits) s = toPersianDigits(s);
  if (options.whitespace) {
    s = s
      .split('\n')
      .map((line) => line.trim())
      .join('\n')
      .trim();
  }
  return s;
}

export function fixPersianText(text: string, options: PersianFixOptions = DEFAULT_FIX_OPTIONS): string {
  return mapOutsideTags(text, (segment) => fixSegment(segment, options));
}

export function fixCues(
  cues: Cue[],
  options: PersianFixOptions = DEFAULT_FIX_OPTIONS,
): { cues: Cue[]; report: FixReport } {
  const changed: FixChange[] = [];
  const next = cues.map((cue) => {
    const after = fixPersianText(cue.text, options);
    if (after === cue.text) return cue;
    changed.push({ cueId: cue.id, before: cue.text, after });
    return { ...cue, text: after };
  });
  return { cues: next, report: { options, changed } };
}
