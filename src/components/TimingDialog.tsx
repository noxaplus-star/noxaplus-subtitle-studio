import { useState } from 'react';
import { useI18n } from '../i18n';
import { Icon } from './Icon';
import { Modal } from './Modal';

interface TimingDialogProps {
  cueCount: number;
  onShift: (ms: number) => void;
  onScale: (percent: number) => void;
  onSort: () => void;
  onClose: () => void;
}

export function TimingDialog({ cueCount, onShift, onScale, onSort, onClose }: TimingDialogProps) {
  const { t } = useI18n();
  const [shift, setShift] = useState('0');
  const [scale, setScale] = useState('100');
  const [shiftError, setShiftError] = useState(false);
  const [scaleError, setScaleError] = useState(false);

  const shiftValue = Number(shift);
  const scaleValue = Number(scale);
  const shiftValid = shift.trim() !== '' && Number.isFinite(shiftValue);
  const scaleValid =
    scale.trim() !== '' && Number.isFinite(scaleValue) && scaleValue >= 10 && scaleValue <= 1_000;

  const applyShift = () => {
    if (!shiftValid || shiftValue === 0) {
      setShiftError(!shiftValid);
      return;
    }
    setShiftError(false);
    onShift(Math.round(shiftValue));
    onClose();
  };

  const applyScale = () => {
    if (!scaleValid || scaleValue === 100) {
      setScaleError(!scaleValid);
      return;
    }
    setScaleError(false);
    onScale(scaleValue);
    onClose();
  };

  const disabled = cueCount === 0;

  return (
    <Modal
      title={t('timing.title')}
      subtitle={t('timing.subtitle')}
      onClose={onClose}
      footer={
        <button type="button" className="button button--ghost" onClick={onClose}>
          {t('common.close')}
        </button>
      }
    >
      {disabled ? <p className="form-notice form-notice--warning">{t('timing.noCues')}</p> : null}

      <section className="timing-block">
        <div className="timing-block__head">
          <span className="timing-block__icon">
            <Icon name="clock" size={18} />
          </span>
          <div>
            <h3>{t('timing.shiftTitle')}</h3>
            <p>{t('timing.shiftText')}</p>
          </div>
        </div>
        <div className="inline-field">
          <label className="field-label" htmlFor="timing-shift">
            {t('timing.shiftAmount')}
          </label>
          <div className="inline-field__row">
            <input
              id="timing-shift"
              className={`input input--mono${shiftError ? ' is-invalid' : ''}`}
              value={shift}
              dir="ltr"
              inputMode="numeric"
              spellCheck={false}
              disabled={disabled}
              onChange={(event) => {
                setShift(event.target.value);
                setShiftError(false);
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  applyShift();
                }
              }}
            />
            <span className="unit">ms</span>
            <button
              type="button"
              className="button button--soft"
              onClick={applyShift}
              disabled={disabled || !shiftValid || shiftValue === 0}
            >
              {t('timing.shiftApply')}
            </button>
          </div>
          {shiftError ? (
            <p className="field-error" role="alert">
              {t('timing.invalid')}
            </p>
          ) : null}
        </div>
      </section>

      <section className="timing-block">
        <div className="timing-block__head">
          <span className="timing-block__icon">
            <Icon name="waveform" size={18} />
          </span>
          <div>
            <h3>{t('timing.scaleTitle')}</h3>
            <p>{t('timing.scaleText')}</p>
          </div>
        </div>
        <div className="inline-field">
          <label className="field-label" htmlFor="timing-scale">
            {t('timing.scalePercent')}
          </label>
          <div className="inline-field__row">
            <input
              id="timing-scale"
              className={`input input--mono${scaleError ? ' is-invalid' : ''}`}
              value={scale}
              dir="ltr"
              inputMode="numeric"
              spellCheck={false}
              disabled={disabled}
              onChange={(event) => {
                setScale(event.target.value);
                setScaleError(false);
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  applyScale();
                }
              }}
            />
            <span className="unit">%</span>
            <button
              type="button"
              className="button button--soft"
              onClick={applyScale}
              disabled={disabled || !scaleValid || scaleValue === 100}
            >
              {t('timing.scaleApply')}
            </button>
          </div>
          {scaleError ? (
            <p className="field-error" role="alert">
              {t('timing.invalid')}
            </p>
          ) : null}
        </div>
      </section>

      <div className="timing-sort">
        <div>
          <h3>{t('timing.sort')}</h3>
          <p>{t('timing.sortText')}</p>
        </div>
        <button
          type="button"
          className="button button--ghost"
          disabled={disabled}
          onClick={() => {
            onSort();
            onClose();
          }}
        >
          <Icon name="sort" />
          {t('timing.sort')}
        </button>
      </div>
    </Modal>
  );
}
