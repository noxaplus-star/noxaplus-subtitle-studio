import { useMemo, useState } from 'react';
import { serializeProject } from '../core/project';
import { serialize } from '../core/serialize';
import { formatBytes, sanitizeFileName } from '../core/text';
import type { Cue, SubtitleFormat } from '../core/types';
import { useI18n } from '../i18n';
import { Icon } from './Icon';
import { Modal } from './Modal';
import { useToast } from './Toasts';

type ExportFormat = SubtitleFormat | 'json';

interface ExportDialogProps {
  cues: Cue[];
  format: SubtitleFormat;
  fileName: string | null;
  issueCount: number;
  onClose: () => void;
}

const FORMATS: { value: ExportFormat; label: 'export.srt' | 'export.vtt' | 'export.json'; hint: 'export.srtHint' | 'export.vttHint' | 'export.jsonHint'; icon: 'file' | 'globe' | 'shield' }[] = [
  { value: 'srt', label: 'export.srt', hint: 'export.srtHint', icon: 'file' },
  { value: 'vtt', label: 'export.vtt', hint: 'export.vttHint', icon: 'globe' },
  { value: 'json', label: 'export.json', hint: 'export.jsonHint', icon: 'shield' },
];

const MIME_TYPES: Record<ExportFormat, string> = {
  srt: 'application/x-subrip;charset=utf-8',
  vtt: 'text/vtt;charset=utf-8',
  json: 'application/json;charset=utf-8',
};

export function ExportDialog({ cues, format, fileName, issueCount, onClose }: ExportDialogProps) {
  const { t } = useI18n();
  const notify = useToast();
  const [selected, setSelected] = useState<ExportFormat>(format);
  const [name, setName] = useState(() => sanitizeFileName(fileName ?? ''));

  const content = useMemo(
    () => (selected === 'json' ? serializeProject(cues, format) : serialize(cues, selected)),
    [cues, format, selected],
  );

  const extension = selected === 'json' ? 'json' : selected;
  const finalName = `${sanitizeFileName(name)}.${extension}`;
  const size = useMemo(() => formatBytes(new TextEncoder().encode(content).length), [content]);
  const preview = useMemo(
    () => (content.length > 2_600 ? `${content.slice(0, 2_600)}\n…` : content),
    [content],
  );

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      notify(t('export.copied'), 'success');
    } catch {
      notify(t('export.copyFailed'), 'error');
    }
  };

  const download = () => {
    const blob = new Blob([content], { type: MIME_TYPES[selected] });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = finalName;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
    notify(t('export.downloaded', { name: finalName }), 'success');
  };

  const empty = cues.length === 0;

  return (
    <Modal
      title={t('export.title')}
      subtitle={t('export.subtitle')}
      size="lg"
      onClose={onClose}
      footer={
        <>
          <button type="button" className="button button--ghost" onClick={onClose}>
            {t('common.cancel')}
          </button>
          <button type="button" className="button button--ghost" onClick={() => void copy()} disabled={empty}>
            <Icon name="copy" />
            {t('export.copy')}
          </button>
          <button type="button" className="button button--primary" onClick={download} disabled={empty}>
            <Icon name="download" />
            {t('export.download')}
          </button>
        </>
      }
    >
      {empty ? (
        <p className="form-notice form-notice--warning">{t('export.empty')}</p>
      ) : null}

      <fieldset className="field-group">
        <legend className="field-label">{t('export.format')}</legend>
        <div className="format-grid">
          {FORMATS.map((option) => (
            <label
              key={option.value}
              className={`format-option${selected === option.value ? ' is-selected' : ''}`}
            >
              <input
                type="radio"
                name="export-format"
                value={option.value}
                checked={selected === option.value}
                onChange={() => setSelected(option.value)}
              />
              <span className="format-option__icon">
                <Icon name={option.icon} size={19} />
              </span>
              <span className="format-option__body">
                <span className="format-option__title">{t(option.label)}</span>
                <span className="format-option__hint">{t(option.hint)}</span>
              </span>
              <span className="format-option__check" aria-hidden="true">
                <Icon name="check" size={14} />
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="field">
        <label className="field-label" htmlFor="export-name">
          {t('export.filename')}
        </label>
        <div className="filename-field">
          <input
            id="export-name"
            className="input"
            value={name}
            dir="ltr"
            spellCheck={false}
            onChange={(event) => setName(event.target.value)}
            onFocus={(event) => event.currentTarget.select()}
            placeholder="subtitles"
          />
          <span className="filename-field__suffix" dir="ltr">
            .{extension}
          </span>
        </div>
      </div>

      <div className="export-meta">
        <span className="chip">{t('export.summary', { cues: cues.length, size })}</span>
        {issueCount > 0 ? (
          <span className="chip chip--warning">{t('export.issues', { count: issueCount })}</span>
        ) : null}
      </div>

      <div className="field">
        <span className="field-label">{t('export.preview')}</span>
        <pre className="export-preview" dir="auto" aria-label={t('export.preview')}>
          {preview}
        </pre>
      </div>
    </Modal>
  );
}
