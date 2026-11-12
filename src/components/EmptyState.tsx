import { useI18n } from '../i18n';
import { Icon } from './Icon';

interface EmptyStateProps {
  onChoose: () => void;
  onPaste: () => void;
  onSample: () => void;
}

const FEATURES = [
  { icon: 'lock', title: 'empty.features.local.title', text: 'empty.features.local.text' },
  { icon: 'sparkles', title: 'empty.features.persian.title', text: 'empty.features.persian.text' },
  { icon: 'waveform', title: 'empty.features.quality.title', text: 'empty.features.quality.text' },
  { icon: 'film', title: 'empty.features.video.title', text: 'empty.features.video.text' },
  { icon: 'install', title: 'empty.features.offline.title', text: 'empty.features.offline.text' },
  { icon: 'file', title: 'empty.features.formats.title', text: 'empty.features.formats.text' },
] as const;

export function EmptyState({ onChoose, onPaste, onSample }: EmptyStateProps) {
  const { t } = useI18n();
  return (
    <div className="landing">
      <section className="hero">
        <div className="hero__copy">
          <p className="eyebrow">
            <span className="eyebrow__dot" />
            {t('empty.eyebrow')}
          </p>
          <h1 className="hero__title">{t('empty.title')}</h1>
          <p className="hero__subtitle">{t('empty.subtitle')}</p>

          <button type="button" className="dropzone" onClick={onChoose}>
            <span className="dropzone__icon">
              <Icon name="upload" size={26} />
            </span>
            <span className="dropzone__text">
              <span className="dropzone__title">{t('empty.dropTitle')}</span>
              <span className="dropzone__hint">{t('empty.dropHint')}</span>
            </span>
            <span className="dropzone__action">{t('empty.choose')}</span>
          </button>

          <div className="hero__actions">
            <button type="button" className="button button--ghost" onClick={onPaste}>
              <Icon name="paste" />
              {t('empty.paste')}
            </button>
            <button type="button" className="button button--ghost" onClick={onSample}>
              <Icon name="sparkles" />
              {t('empty.sample')}
            </button>
            <span className="hero__shortcut">
              <Icon name="keyboard" size={15} />
              {t('empty.shortcuts')}
            </span>
          </div>

          <p className="hero__brand">{t('empty.brandNote')}</p>
        </div>

        <div className="hero__art" aria-hidden="true">
          <div className="hero__glow" />
          <div className="mock mock--player">
            <div className="mock__bar">
              <span className="mock__dot mock__dot--red" />
              <span className="mock__dot mock__dot--amber" />
              <span className="mock__dot mock__dot--teal" />
              <span className="mock__label">NoxaPlus Subtitle Studio</span>
            </div>
            <div className="mock__screen">
              <span className="mock__cue-line" />
              <span className="mock__subtitle">هر زیرنویس را دقیق و خوانا کن.</span>
            </div>
            <div className="mock__timeline">
              <span className="mock__range" />
              <span className="mock__playhead" />
            </div>
            <div className="mock__times">
              <span>00:01:24</span>
              <span>CPS 16.4</span>
            </div>
          </div>
          <div className="mock mock--cue">
            <div className="mock__cue-top">
              <span className="mock__index">03</span>
              <span className="mock__time">00:00:07,200 → 00:00:11,000</span>
              <span className="mock__badge">3.8 s</span>
            </div>
            <p className="mock__text">زیرنویس SRT یا VTT را رها کنید، ویدیو را باز کنید و همان‌جا ویرایش کنید.</p>
            <div className="mock__meta">
              <span>۲ خط</span>
              <span>۶۲ کاراکتر</span>
              <span className="mock__ok">CPS 16.3</span>
            </div>
          </div>
          <div className="mock mock--fix">
            <span className="mock__fix-icon">
              <Icon name="wand" size={16} />
            </span>
            <span>می شود → می‌شود</span>
            <span className="mock__check">
              <Icon name="check" size={14} />
            </span>
          </div>
        </div>
      </section>

      <section className="features" aria-label={t('app.tagline')}>
        {FEATURES.map((feature) => (
          <article key={feature.title} className="feature">
            <span className="feature__icon">
              <Icon name={feature.icon} size={20} />
            </span>
            <div>
              <h2 className="feature__title">{t(feature.title)}</h2>
              <p className="feature__text">{t(feature.text)}</p>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
