import { describe, expect, it } from 'vitest';
import { DEFAULT_FIX_OPTIONS, fixCues, fixPersianText } from './persian';
import type { Cue, PersianFixOptions } from './types';

function withOptions(overrides: Partial<PersianFixOptions>): PersianFixOptions {
  return { ...DEFAULT_FIX_OPTIONS, ...overrides };
}

const ALL_OFF: PersianFixOptions = {
  normalizeCharacters: false,
  persianDigits: false,
  halfSpaces: false,
  punctuation: false,
  removeDiacritics: false,
  ellipsis: false,
  whitespace: false,
};

describe('character normalization', () => {
  it('normalizes Arabic yeh, kaf and digits', () => {
    expect(fixPersianText('علي كتاب ١٢٣')).toBe('علی کتاب ۱۲۳');
  });

  it('removes tatweel and zero-width spaces', () => {
    expect(fixPersianText('ســـلام\u200B دنیا')).toBe('سلام دنیا');
  });

  it('can be disabled', () => {
    expect(fixPersianText('علي كتاب', withOptions({ normalizeCharacters: false }))).toBe('علي كتاب');
  });
});

describe('half-spaces', () => {
  it('joins verb prefixes', () => {
    expect(fixPersianText('می شود')).toBe('می‌شود');
    expect(fixPersianText('نمی توانم')).toBe('نمی‌توانم');
    expect(fixPersianText('او می رود')).toBe('او می‌رود');
  });

  it('joins plural suffixes', () => {
    expect(fixPersianText('کتاب ها')).toBe('کتاب‌ها');
    expect(fixPersianText('کتاب های من')).toBe('کتاب‌های من');
    expect(fixPersianText('خانه هایی')).toBe('خانه‌هایی');
  });

  it('joins comparative suffixes', () => {
    expect(fixPersianText('بزرگ تر')).toBe('بزرگ‌تر');
    expect(fixPersianText('بزرگ ترین')).toBe('بزرگ‌ترین');
  });

  it('joins the بی prefix', () => {
    expect(fixPersianText('بی گناه')).toBe('بی‌گناه');
  });

  it('leaves intact words alone', () => {
    expect(fixPersianText('میان بهتر دختر تنها')).toBe('میان بهتر دختر تنها');
  });

  it('does not cross line breaks', () => {
    expect(fixPersianText('می\nشود')).toBe('می\nشود');
  });
});

describe('punctuation and ellipsis', () => {
  it('fixes spacing around Persian punctuation', () => {
    expect(fixPersianText('سلام ،دنیا')).toBe('سلام، دنیا');
    expect(fixPersianText('چه خبر ؟')).toBe('چه خبر؟');
    expect(fixPersianText('او گفت :سلام')).toBe('او گفت: سلام');
  });

  it('removes inner spaces in guillemets', () => {
    expect(fixPersianText('« سلام »')).toBe('«سلام»');
  });

  it('normalizes repeated punctuation', () => {
    expect(fixPersianText('چی؟؟')).toBe('چی؟');
    expect(fixPersianText('بله!!')).toBe('بله!');
    expect(fixPersianText('خوب ،، بد')).toBe('خوب، بد');
  });

  it('normalizes ellipsis', () => {
    expect(fixPersianText('خب ... بریم')).toBe('خب… بریم');
    expect(fixPersianText('خب…بریم')).toBe('خب… بریم');
  });

  it('adds a space after a Latin comma before a letter', () => {
    expect(fixPersianText('Hello,world')).toBe('Hello, world');
  });

  it('does not split decimal numbers', () => {
    expect(fixPersianText('عدد 3.14 است')).toBe('عدد 3.14 است');
  });
});

describe('whitespace', () => {
  it('collapses spaces and trims lines', () => {
    expect(fixPersianText('  سلام   دنیا  ')).toBe('سلام دنیا');
    expect(fixPersianText('a\n\n\n\nb')).toBe('a\n\nb');
    expect(fixPersianText('  خط اول  \n  خط دوم  ')).toBe('خط اول\nخط دوم');
  });
});

describe('digits, diacritics and tags', () => {
  it('converts digits only when enabled', () => {
    expect(fixPersianText('سال 2026')).toBe('سال 2026');
    expect(fixPersianText('سال 2026', withOptions({ persianDigits: true }))).toBe('سال ۲۰۲۶');
  });

  it('protects URLs and emails during digit conversion', () => {
    const input = 'آدرس https://example.com/2026 و ایمیل user2026@example.com';
    const output = fixPersianText(input, withOptions({ persianDigits: true }));
    expect(output).toContain('https://example.com/2026');
    expect(output).toContain('user2026@example.com');
  });

  it('removes diacritics only when enabled', () => {
    expect(fixPersianText('مُحَمَّد', withOptions({ removeDiacritics: true }))).toBe('محمد');
  });

  it('preserves markup tags', () => {
    expect(fixPersianText('<i>می شود</i>')).toBe('<i>می‌شود</i>');
  });

  it('returns input unchanged when every option is off', () => {
    const input = 'علي  كتاب ها ...';
    expect(fixPersianText(input, ALL_OFF)).toBe(input);
  });
});

describe('fixCues', () => {
  it('reports only changed cues and preserves timing and ids', () => {
    const cues: Cue[] = [
      { id: 'a', start: 0, end: 2_000, text: 'می شود' },
      { id: 'b', start: 2_000, end: 4_000, text: 'سالم' },
    ];
    const result = fixCues(cues);
    expect(result.report.changed).toHaveLength(1);
    expect(result.report.changed[0].cueId).toBe('a');
    expect(result.cues[0].text).toBe('می‌شود');
    expect(result.cues[0].start).toBe(0);
    expect(result.cues[0].end).toBe(2_000);
    expect(result.cues[1]).toBe(cues[1]);
  });
});
