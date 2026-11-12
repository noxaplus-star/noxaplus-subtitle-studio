import { useMemo, useState } from 'react';
import { DEFAULT_FIX_OPTIONS, fixCues } from '../core/persian';
import type { Cue, PersianFixOptions } from '../core/types';
import { useI18n, type TranslationKey } from '../i18n';
import { Icon } from './Icon';
import { Modal } from './Modal';

interface FixDialogProps {
  cues: Cue[];
  onApply: (options: PersianFixOptions) => void;
  onClose: () => void;
}

interface OptionDefinition {
  key: keyof PersianFixOptions;
  title: TranslationKey;
  hint: TranslationKey;
}

const OPTIONS: OptionDefinition[] = [
  { key: 'normalizeCharacters', title: 'fix.normalizeCharacters', hint: 'fix.normalizeCharacters.hint' },
  { key: 'halfSpaces', title: 'fix.halfSpaces', hint: 'fix.halfSpaces.hint' },
  { key: 'punctuation', title: 'fix.punctuation', hint: 'fix.punctuation.hint' },
  { key: 'ellipsis', title: 'fix.ellipsis', hint: 'fix.ellipsis.hint' },
  { key: 'whitespace', title: 'fix.whitespace', hint: 'fix.whitespace.hint' },
  { key: 'removeDiacritics', title: 'fix.removeDiacritics', hint: 'fix.removeDiacritics.hint' },
  { key: 'persianDigits', title: 'fix.persianDigits', hint: 'fix.persianDigits.hint' },
];

export function FixDialog({ cues, onApply, onClose }: FixDialogProps) {
  const { t } = useI18n();
  const [options, setOptions] = useState<PersianFixOptions>(() => ({ ...DEFAULT_FIX_OPTIONS }));

  const preview = useMemo(() => fixCues(cues, options), [cues, options]);
  const changes = preview.report.changed;
  const anyEnabled = OPTIONS.some((option) => options[option.key]);
  const cueNumbers = useMemo(() => {
    const map = new Map<string, number>();
    cues.forEach((cue, index) => map.set(cue.id, index + 1));
    return map;
  }, [cues]);

  const toggle = (key: keyof PersianFixOptions) => {
    setOptions((current) => ({ ...current, [key]: !current[key] }));
  };

  return (
    <Modal
      title={t('fix.title')}
      subtitle={t('fix.subtitle')}
      size="lg"
      onClose={onClose}
      footer={
        <>
          <button
            type="button"
            className="button button--ghost"
            onClick={() => setOptions({ ...DEFAULT_FIX_OPTIONS })}
          >
            <Icon name="undo" />
            {t('fix.reset')}
          </button>
          <span className="modal-footer__spacer" />
          <button type="button" className="button button--ghost" onClick={onClose}>
            {t('common.cancel')}
          </button>
          <button
            type="button"
            className="button button--primary"
            disabled={changes.length === 0}
            onClick={() => {
              onApply(options);
              onClose();
            }}
          >
            <Icon name="wand" />
            {t('fix.apply')}
            {changes.length > 0 ? <span className="button__count">{changes.length}</span> : null}
          </button>
        </>
      }
    >
      <div className="option-list">
        {OPTIONS.map((option) => (
          <label key={option.key} className={`option-row${options[option.key] ? ' is-on' : ''}`}>
            <input
              type="checkbox"
              checked={options[option.key]}
              onChange={() => toggle(option.key)}
            />
            <span className="option-row__box" aria-hidden="true">
              <Icon name="check" size={13} />
            </span>
            <span className="option-row__body">
              <span className="option-row__title">{t(option.title)}</span>
              <span className="option-row__hint">{t(option.hint)}</span>
            </span>
          </label>
        ))}
      </div>

      {!anyEnabled ? (
        <p className="form-notice form-notice--warning">{t('fix.disabledHint')}</p>
      ) : null}

      <div className="fix-dialog__preview">
        <div className="fix-dialog__preview-head">
          <span className="field-label">{t('fix.preview')}</span>
          <span className={`chip${changes.length > 0 ? ' chip--accent' : ''}`}>
            {t('fix.previewCount', { count: changes.length })}
          </span>
        </div>

        {changes.length === 0 ? (
          <p className="empty-note">
            <Icon name="check" size={16} />
            {t('fix.none')}
          </p>
        ) : (
          <ul className="fix-preview-list">
            {changes.map((change) => (
              <li key={change.cueId}>
                <span className="fix-preview-list__cue">#{cueNumbers.get(change.cueId) ?? '—'}</span>
                <div className="fix-preview-list__diff">
                  <div className="fix-preview-list__row">
                    <span className="fix-preview-list__mark" aria-hidden="true">
                      −
                    </span>
                    <p className="fix-preview-list__before" dir="auto">
                      {change.before}
                    </p>
                  </div>
                  <div className="fix-preview-list__row">
                    <span
                      className="fix-preview-list__mark fix-preview-list__mark--add"
                      aria-hidden="true"
                    >
                      +
                    </span>
                    <p className="fix-preview-list__after" dir="auto">
                      {change.after}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="hint-text">
        <Icon name="undo" size={14} />
        {t('fix.undoHint')}
      </p>
    </Modal>
  );
}
