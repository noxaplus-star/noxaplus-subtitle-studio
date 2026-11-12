import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { charactersPerSecond, lineCount, visibleLength } from '../core/text';
import { formatDuration, formatTimestamp, parseTimestamp } from '../core/time';
import type { Cue, Issue, IssueSeverity, SubtitleFormat } from '../core/types';
import { useI18n } from '../i18n';
import { highestSeverity, issueMessage } from '../issueText';
import { Icon } from './Icon';
import { useToast } from './Toasts';

interface CueCardProps {
  cue: Cue;
  index: number;
  format: SubtitleFormat;
  issues: Issue[];
  active: boolean;
  selected: boolean;
  autoFocus: boolean;
  hasVideo: boolean;
  canMerge: boolean;
  onSelect: () => void;
  onUpdateText: (text: string) => void;
  onUpdateTiming: (field: 'start' | 'end', value: number) => void;
  onSeek: () => void;
  onSplit: () => void;
  onMerge: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

function cpsTone(cps: number, issue: IssueSeverity | null): string {
  if (issue === 'error') return 'danger';
  if (issue === 'warning') return 'warn';
  if (cps > 0) return 'ok';
  return 'muted';
}

function TimeField({
  label,
  ariaLabel,
  value,
  format,
  onCommit,
}: {
  label: string;
  ariaLabel: string;
  value: number;
  format: SubtitleFormat;
  onCommit: (next: number) => void;
}) {
  const { t } = useI18n();
  const notify = useToast();
  const [draft, setDraft] = useState(() => formatTimestamp(value, format));
  const cancelRef = useRef(false);

  useEffect(() => {
    setDraft(formatTimestamp(value, format));
  }, [value, format]);

  const commit = () => {
    if (cancelRef.current) {
      cancelRef.current = false;
      return;
    }
    const parsed = parseTimestamp(draft);
    if (parsed === null) {
      setDraft(formatTimestamp(value, format));
      notify(t('cues.invalidTime'), 'error');
      return;
    }
    onCommit(parsed);
    setDraft(formatTimestamp(parsed, format));
  };

  return (
    <label className="time-field">
      <span className="time-field__label">{label}</span>
      <input
        className="time-field__input"
        value={draft}
        dir="ltr"
        inputMode="numeric"
        spellCheck={false}
        aria-label={ariaLabel}
        onChange={(event) => setDraft(event.target.value)}
        onFocus={(event) => event.currentTarget.select()}
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault();
            event.currentTarget.blur();
          } else if (event.key === 'Escape') {
            cancelRef.current = true;
            setDraft(formatTimestamp(value, format));
            event.currentTarget.blur();
          }
        }}
      />
    </label>
  );
}

export function CueCard({
  cue,
  index,
  format,
  issues,
  active,
  selected,
  autoFocus,
  hasVideo,
  canMerge,
  onSelect,
  onUpdateText,
  onUpdateTiming,
  onSeek,
  onSplit,
  onMerge,
  onDuplicate,
  onDelete,
}: CueCardProps) {
  const { t } = useI18n();
  const textRef = useRef<HTMLTextAreaElement>(null);
  const duration = cue.end - cue.start;
  const cps = charactersPerSecond(cue.text, duration);
  const severity = highestSeverity(issues);
  const cpsSeverity = issues.some((issue) => issue.code === 'criticalCps')
    ? 'error'
    : issues.some((issue) => issue.code === 'highCps')
      ? 'warning'
      : null;
  const issueTitle = issues.map((issue) => issueMessage(issue, t)).join('\n');

  useLayoutEffect(() => {
    const element = textRef.current;
    if (!element) return;
    element.style.height = 'auto';
    element.style.height = `${Math.min(Math.max(element.scrollHeight, 46), 190)}px`;
  }, [cue.text]);

  useEffect(() => {
    if (!autoFocus) return;
    const element = textRef.current;
    if (!element) return;
    element.focus();
    element.setSelectionRange(element.value.length, element.value.length);
  }, [autoFocus]);

  return (
    <article
      id={`cue-${cue.id}`}
      className={`cue${active ? ' cue--active' : ''}${selected ? ' cue--selected' : ''}`}
      onClick={onSelect}
    >
      <div className="cue__rail">
        <span className="cue__index">{String(index + 1).padStart(2, '0')}</span>
        <button
          type="button"
          className="cue__seek"
          onClick={(event) => {
            event.stopPropagation();
            onSeek();
          }}
          disabled={!hasVideo}
          title={t('cues.seek')}
          aria-label={t('cues.seek')}
        >
          <Icon name="play" size={13} />
        </button>
      </div>

      <div className="cue__body">
        <div className="cue__top">
          <TimeField
            label={t('cues.start')}
            ariaLabel={`${t('cues.start')} ${index + 1}`}
            value={cue.start}
            format={format}
            onCommit={(next) => onUpdateTiming('start', next)}
          />
          <span className="cue__arrow" aria-hidden="true">
            →
          </span>
          <TimeField
            label={t('cues.end')}
            ariaLabel={`${t('cues.end')} ${index + 1}`}
            value={cue.end}
            format={format}
            onCommit={(next) => onUpdateTiming('end', next)}
          />
          <span className="badge badge--muted" title={t('cues.duration')}>
            {formatDuration(Math.max(0, duration))}
          </span>
          <span
            className={`badge badge--${cpsTone(cps, cpsSeverity)}`}
            title={`${t('cues.cps')} · ${cps.toFixed(1)}`}
          >
            {cps.toFixed(1)} CPS
          </span>
          {active ? (
            <span className="badge badge--live">
              <span className="live-dot" />
              {t('cues.active')}
            </span>
          ) : null}

          <div className="cue__actions" role="group" aria-label={t('cues.actions')}>
            <button
              type="button"
              className="icon-button icon-button--small"
              onClick={(event) => {
                event.stopPropagation();
                onSplit();
              }}
              title={t('cues.split')}
              aria-label={t('cues.split')}
            >
              <Icon name="split" size={16} />
            </button>
            <button
              type="button"
              className="icon-button icon-button--small"
              onClick={(event) => {
                event.stopPropagation();
                onMerge();
              }}
              disabled={!canMerge}
              title={canMerge ? t('cues.merge') : t('cues.mergeDisabled')}
              aria-label={t('cues.merge')}
            >
              <Icon name="merge" size={16} />
            </button>
            <button
              type="button"
              className="icon-button icon-button--small"
              onClick={(event) => {
                event.stopPropagation();
                onDuplicate();
              }}
              title={t('cues.duplicate')}
              aria-label={t('cues.duplicate')}
            >
              <Icon name="copy" size={16} />
            </button>
            <button
              type="button"
              className="icon-button icon-button--small icon-button--danger"
              onClick={(event) => {
                event.stopPropagation();
                onDelete();
              }}
              title={t('cues.delete')}
              aria-label={t('cues.delete')}
            >
              <Icon name="trash" size={16} />
            </button>
          </div>
        </div>

        <textarea
          ref={textRef}
          className="cue__text"
          value={cue.text}
          dir="auto"
          rows={1}
          spellCheck={false}
          placeholder={t('cues.placeholder')}
          aria-label={`${t('cues.title')} ${index + 1}`}
          onChange={(event) => onUpdateText(event.target.value)}
          onFocus={onSelect}
        />

        <div className="cue__meta">
          <span>{t('cues.lines', { count: lineCount(cue.text) })}</span>
          <span>{t('cues.chars', { count: visibleLength(cue.text) })}</span>
          {issues.length > 0 ? (
            <span
              className={`cue__issues cue__issues--${severity ?? 'info'}`}
              title={issueTitle}
            >
              <Icon name={severity === 'error' ? 'alert' : 'info'} size={13} />
              {t('cues.issues', { count: issues.length })}
            </span>
          ) : cue.text.trim() ? (
            <span className="cue__clean">
              <Icon name="check" size={13} />
              {t('cues.clean')}
            </span>
          ) : null}
        </div>
      </div>
    </article>
  );
}
