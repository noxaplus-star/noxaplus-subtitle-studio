export interface Cue {
  id: string;
  start: number;
  end: number;
  text: string;
}

export type SubtitleFormat = 'srt' | 'vtt';

export interface ParseResult {
  cues: Cue[];
  format: SubtitleFormat;
  warnings: string[];
}

export type IssueCode =
  | 'emptyText'
  | 'endBeforeStart'
  | 'negativeTime'
  | 'shortDuration'
  | 'longDuration'
  | 'highCps'
  | 'criticalCps'
  | 'longLine'
  | 'manyLines'
  | 'overlap';

export type IssueSeverity = 'error' | 'warning' | 'info';

export interface Issue {
  id: string;
  cueId: string;
  code: IssueCode;
  severity: IssueSeverity;
  value: number;
}

export interface PersianFixOptions {
  normalizeCharacters: boolean;
  persianDigits: boolean;
  halfSpaces: boolean;
  punctuation: boolean;
  removeDiacritics: boolean;
  ellipsis: boolean;
  whitespace: boolean;
}

export interface FixChange {
  cueId: string;
  before: string;
  after: string;
}

export interface FixReport {
  options: PersianFixOptions;
  changed: FixChange[];
}

export interface QualitySummary {
  errors: number;
  warnings: number;
  infos: number;
  cpsAverage: number;
  cpsMax: number;
  characters: number;
  words: number;
  durationMs: number;
  maxLine: number;
}
