import { useI18n } from '../i18n';
import type { SubtitleFormat } from '../core/types';
import { Icon } from './Icon';

interface ToolbarProps {
  fileName: string | null;
  cueCount: number;
  format: SubtitleFormat;
  canUndo: boolean;
  canRedo: boolean;
  onImport: () => void;
  onPaste: () => void;
  onExport: () => void;
  onFix: () => void;
  onTiming: () => void;
  onUndo: () => void;
  onRedo: () => void;
}

export function Toolbar({
  fileName,
  cueCount,
  format,
  canUndo,
  canRedo,
  onImport,
  onPaste,
  onExport,
  onFix,
  onTiming,
  onUndo,
  onRedo,
}: ToolbarProps) {
  const { t } = useI18n();
  return (
    <div className="toolbar">
      <div className="toolbar__identity">
        <span className="toolbar__eyebrow">{t('toolbar.project')}</span>
        <span className="toolbar__file" title={fileName ?? t('toolbar.localDraft')}>
          {fileName ?? t('toolbar.localDraft')}
        </span>
        <span className="chip chip--format">{format.toUpperCase()}</span>
        <span className="chip chip--count">
          {t('toolbar.cues')} · {cueCount}
        </span>
      </div>

      <div className="toolbar__actions">
        <button type="button" className="button button--ghost" onClick={onImport}>
          <Icon name="upload" />
          <span className="button__label">{t('toolbar.import')}</span>
        </button>
        <button
          type="button"
          className="icon-button"
          onClick={onPaste}
          aria-label={t('paste.title')}
          title={t('paste.title')}
        >
          <Icon name="paste" />
        </button>
        <button type="button" className="button button--ghost" onClick={onFix}>
          <Icon name="wand" />
          <span className="button__label">{t('toolbar.fix')}</span>
        </button>
        <button type="button" className="button button--ghost" onClick={onTiming}>
          <Icon name="clock" />
          <span className="button__label">{t('toolbar.timing')}</span>
        </button>
        <span className="button-group" role="group" aria-label={t('toolbar.undo')}>
          <button
            type="button"
            className="icon-button"
            onClick={onUndo}
            disabled={!canUndo}
            aria-label={t('toolbar.undo')}
            title={`${t('toolbar.undo')} · Ctrl/⌘+Z`}
          >
            <Icon name="undo" />
          </button>
          <button
            type="button"
            className="icon-button"
            onClick={onRedo}
            disabled={!canRedo}
            aria-label={t('toolbar.redo')}
            title={`${t('toolbar.redo')} · Ctrl/⌘+Shift+Z`}
          >
            <Icon name="redo" />
          </button>
        </span>
        <button type="button" className="button button--primary" onClick={onExport}>
          <Icon name="download" />
          <span className="button__label">{t('toolbar.export')}</span>
        </button>
      </div>
    </div>
  );
}
