import { useEffect, useMemo } from 'react';
import { formatClock } from '../core/time';
import type { Cue, Issue, SubtitleFormat } from '../core/types';
import { useI18n } from '../i18n';
import { CueCard } from './CueCard';
import { Icon } from './Icon';

interface CueListProps {
  cues: Cue[];
  format: SubtitleFormat;
  issues: Issue[];
  activeId: string | null;
  selectedId: string | null;
  autoFocusId: string | null;
  autoScroll: boolean;
  playing: boolean;
  hasVideo: boolean;
  onToggleAutoScroll: () => void;
  onSelect: (id: string) => void;
  onUpdateText: (id: string, text: string) => void;
  onUpdateTiming: (id: string, field: 'start' | 'end', value: number) => void;
  onSeek: (id: string) => void;
  onSplit: (id: string) => void;
  onMerge: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
  onSort: () => void;
}

export function CueList({
  cues,
  format,
  issues,
  activeId,
  selectedId,
  autoFocusId,
  autoScroll,
  playing,
  hasVideo,
  onToggleAutoScroll,
  onSelect,
  onUpdateText,
  onUpdateTiming,
  onSeek,
  onSplit,
  onMerge,
  onDuplicate,
  onDelete,
  onAdd,
  onSort,
}: CueListProps) {
  const { t } = useI18n();

  const issuesByCue = useMemo(() => {
    const map = new Map<string, Issue[]>();
    for (const issue of issues) {
      const existing = map.get(issue.cueId);
      if (existing) existing.push(issue);
      else map.set(issue.cueId, [issue]);
    }
    return map;
  }, [issues]);

  const total = useMemo(() => cues.reduce((max, cue) => Math.max(max, cue.end), 0), [cues]);

  useEffect(() => {
    if (!autoScroll || !playing || !activeId) return;
    const node = document.getElementById(`cue-${activeId}`);
    if (!node) return;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    node.scrollIntoView({ block: 'nearest', behavior: reduceMotion ? 'auto' : 'smooth' });
  }, [activeId, autoScroll, playing]);

  return (
    <section className="panel cues-panel" aria-label={t('cues.title')}>
      <header className="cues-header">
        <div>
          <h2 className="panel__title">{t('cues.title')}</h2>
          <p className="panel__subtitle">
            {t('cues.summary', {
              count: cues.length,
              duration: formatClock(total),
            })}
          </p>
        </div>
        <div className="cues-header__tools">
          <label className="switch" title={t('cues.autoScroll')}>
            <input type="checkbox" checked={autoScroll} onChange={onToggleAutoScroll} />
            <span className="switch__track" aria-hidden="true">
              <span className="switch__thumb" />
            </span>
            <span className="switch__label">{t('cues.autoScroll')}</span>
          </label>
          <button
            type="button"
            className="icon-button"
            onClick={onSort}
            title={t('cues.sort')}
            aria-label={t('cues.sort')}
          >
            <Icon name="sort" />
          </button>
          <button type="button" className="button button--soft" onClick={onAdd}>
            <Icon name="plus" />
            <span className="button__label">{t('toolbar.addCue')}</span>
          </button>
        </div>
      </header>

      <div className="cue-list">
        {cues.length === 0 ? (
          <div className="cue-list__empty">
            <span className="cue-list__empty-icon">
              <Icon name="waveform" size={26} />
            </span>
            <p>{t('cues.empty')}</p>
            <button type="button" className="button button--primary" onClick={onAdd}>
              <Icon name="plus" />
              {t('toolbar.addCue')}
            </button>
          </div>
        ) : null}

        {cues.map((cue, index) => (
          <CueCard
            key={cue.id}
            cue={cue}
            index={index}
            format={format}
            issues={issuesByCue.get(cue.id) ?? []}
            active={cue.id === activeId}
            selected={cue.id === selectedId}
            autoFocus={cue.id === autoFocusId}
            hasVideo={hasVideo}
            canMerge={index < cues.length - 1}
            onSelect={() => onSelect(cue.id)}
            onUpdateText={(text) => onUpdateText(cue.id, text)}
            onUpdateTiming={(field, value) => onUpdateTiming(cue.id, field, value)}
            onSeek={() => onSeek(cue.id)}
            onSplit={() => onSplit(cue.id)}
            onMerge={() => onMerge(cue.id)}
            onDuplicate={() => onDuplicate(cue.id)}
            onDelete={() => onDelete(cue.id)}
          />
        ))}

        {cues.length > 0 ? (
          <button type="button" className="add-cue" onClick={onAdd}>
            <Icon name="plus" size={16} />
            {t('toolbar.addCue')}
          </button>
        ) : null}
      </div>
    </section>
  );
}
