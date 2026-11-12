import { createId } from './ids';
import type { Cue } from './types';

interface SampleLine {
  start: number;
  end: number;
  text: string;
}

const PERSIAN_SAMPLE: SampleLine[] = [
  { start: 0, end: 3_200, text: 'سلام! به NoxaPlus Subtitle Studio خوش آمدید.' },
  {
    start: 3_400,
    end: 7_000,
    text: 'این ابزار کاملاً در مرورگر شما اجرا می شود\nو هیچ فایلی آپلود نمی شود.',
  },
  {
    start: 7_200,
    end: 11_000,
    text: 'زیرنویس SRT یا VTT را رها کنید،\nویدیو را باز کنید و همان‌جا ویرایش کنید.',
  },
  { start: 11_200, end: 15_000, text: 'موتور فارسی، نیم‌فاصله، اعداد و علائم را اصلاح می کند.' },
  {
    start: 15_200,
    end: 19_500,
    text: 'بررسی کیفیت، سرعت خواندن، طول خط\nو هم‌پوشانی را نشان می دهد.',
  },
  {
    start: 19_700,
    end: 23_500,
    text: 'با یک کلیک متن ها را تمیز کنید\nو خروجی استاندارد بگیرید.',
  },
  {
    start: 23_700,
    end: 28_000,
    text: 'همه چیز آفلاین است؛ حتی بدون اینترنت\nهم می توانید کار کنید.',
  },
  {
    start: 28_200,
    end: 32_000,
    text: 'ساخته شده توسط NoxaPlus — رایگان، متن‌باز\nو برای همیشه مال شما.',
  },
];

const ENGLISH_SAMPLE: SampleLine[] = [
  { start: 0, end: 3_200, text: 'Welcome to NoxaPlus Subtitle Studio.' },
  {
    start: 3_400,
    end: 7_000,
    text: 'Everything runs in your browser.\nNo uploads, no accounts, no tracking.',
  },
  { start: 7_200, end: 11_000, text: 'Drop an SRT or VTT file and start editing.' },
  {
    start: 11_200,
    end: 15_000,
    text: 'Load a local video to preview cues in context.',
  },
  {
    start: 15_200,
    end: 19_500,
    text: 'Fix Persian text, digits and punctuation in one click.',
  },
  {
    start: 19_700,
    end: 23_500,
    text: 'Catch reading-speed, line-length and overlap issues.',
  },
  {
    start: 23_700,
    end: 28_000,
    text: "Export clean SRT or VTT files when you're done.",
  },
  {
    start: 28_200,
    end: 32_000,
    text: 'Built by NoxaPlus — free, open source, MIT licensed.',
  },
];

export function getSampleCues(language: 'fa' | 'en'): Cue[] {
  const source = language === 'fa' ? PERSIAN_SAMPLE : ENGLISH_SAMPLE;
  return source.map((line) => ({ id: createId(), ...line }));
}
