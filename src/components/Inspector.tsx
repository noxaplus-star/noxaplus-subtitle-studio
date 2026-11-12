import { useEffect, useMemo, useState } from 'react';
import { formatClock } from '../core/time';
import type { Cue, FixReport, Issue, QualitySummary } from '../core/types';
import { useI18n } from '../i18n';
import { issueMessage, severityLabel } from '../issueText';
import { Icon } from './Icon';

interface InspectorProps {
  issues: Issue[];
  cues: Cue[];
  summary: QualitySummary;
  fixReport: FixReport | null;
  onFocusCue: (id: string) => void;
  onDismissFix: () => void;
}

type Tab = 'quality' | 'stats';

export function Inspector({ issues, cues, summary, fixReport, onFocusCue, onDismissFix }: InspectorProps) {
  const { t } = useI18n();
  const [tab, setTab] = useState<Tab>('quality');
  const [showAllChanges, setShowAllChanges] = useState(false);

  useEffect(() => {
    setShowAllChanges(false);
  }, [fixReport]);

  const cueNumbers = useMemo(() => {
    const map = new Map<string, number>();
    cues.forEach((cue, index) => map.set(cue.id, index + 1));
    return map;
  }, [cues]);

  const counts = {
    error: issues.filter((issue) => issue.severity === 'error').length,
    warning: issues.filter((issue) => issue.severity === 'warning').length,
    info: issues.filter((issue) => issue.severity === 'info').length,
  };

  const changes = fixReport?.changed ?? [];
  const visibleChanges = showAllChanges ? changes : changes.slice(0, 4);

  return (
    <section className="panel inspector" aria-label={t('inspector.title')}>
      <div className="inspector__tabs" role="group" aria-label={t('inspector.title')}>
        <button
          type="button"
          aria-pressed={tab === 'quality'}
          className={`inspector__tab${tab === 'quality' ? ' is-active' : ''}`}
          onClick={() => setTab('quality')}
        >
          <Icon name="shield" size={15} />
          {t('inspector.quality')}
        </button>
        <button
          type="button"
          aria-pressed={tab === 'stats'}
          className={`inspector__tab${tab === 'stats' ? ' is-active' : ''}`}
          onClick={() => setTab('stats')}
        >
          <Icon name="waveform" size={15} />
          {t('inspector.stats')}
        </button>
      </div>

      {tab === 'quality' ? (
        <div className="inspector__panel">
          <div className="inspector__section-head">
            <h2 className="panel__title">{t('inspector.qualityTitle')}</h2>
            <div className="severity-counts">
              {counts.error > 0 ? <span className="severity-count severity-count--error">{counts.error}</span> : null}
              {counts.warning > 0 ? <span className="severity-count severity-count--warning">{counts.warning}</span> : null}
              {counts.info > 0 ? <span className="severity-count severity-count--info">{counts.info}</span> : null}
            </div>
          </div>

          {issues.length === 0 ? (
            <div className="clean-state">
              <span className="clean-state__icon">
                <Icon name="check" size={22} />
              </span>
              <h3>{t('inspector.cleanTitle')}</h3>
              <p>{t('inspector.cleanText')}</p>
            </div>
          ) : (
            <>
              <p className="inspector__hint">{t('inspector.focusHint')}</p>
              <div className="issue-list">
                {issues.map((issue) => (
                  <button
                    key={issue.id}
                    type="button"
                    className={`issue-row issue-row--${issue.severity}`}
                    onClick={() => onFocusCue(issue.cueId)}
                    title={severityLabel(issue.severity, t)}
                  >
                    <span className="issue-row__dot" aria-hidden="true" />
                    <span className="issue-row__cue">#{cueNumbers.get(issue.cueId) ?? '—'}</span>
                    <span className="issue-row__text">{issueMessage(issue, t)}</span>
                    <span className="issue-row__arrow" aria-hidden="true">
                      →
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}

          <div className="tips-card">
            <span className="tips-card__icon">
              <Icon name="sparkles" size={17} />
            </span>
            <div>
              <h3>{t('inspector.tipsTitle')}</h3>
              <p>{t('inspector.tipsText')}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="inspector__panel">
          <dl className="stats-grid">
            <div className="stat">
              <dt>{t('inspector.stats.cues')}</dt>
              <dd>{cues.length}</dd>
            </div>
            <div className="stat">
              <dt>{t('inspector.stats.duration')}</dt>
              <dd className="mono">{formatClock(summary.durationMs)}</dd>
            </div>
            <div className="stat">
              <dt>{t('inspector.stats.characters')}</dt>
              <dd>{summary.characters}</dd>
            </div>
            <div className="stat">
              <dt>{t('inspector.stats.words')}</dt>
              <dd>{summary.words}</dd>
            </div>
            <div className="stat">
              <dt>{t('inspector.stats.avgCps')}</dt>
              <dd>{summary.cpsAverage.toFixed(1)}</dd>
            </div>
            <div className="stat">
              <dt>{t('inspector.stats.maxCps')}</dt>
              <dd>{summary.cpsMax.toFixed(1)}</dd>
            </div>
            <div className="stat">
              <dt>{t('inspector.stats.maxLine')}</dt>
              <dd>{summary.maxLine}</dd>
            </div>
            <div className="stat">
              <dt>{t('inspector.stats.errors')}</dt>
              <dd className={summary.errors > 0 ? 'stat__value--error' : ''}>{summary.errors}</dd>
            </div>
            <div className="stat">
              <dt>{t('inspector.stats.warnings')}</dt>
              <dd className={summary.warnings > 0 ? 'stat__value--warning' : ''}>{summary.warnings}</dd>
            </div>
            <div className="stat">
              <dt>{t('inspector.stats.notes')}</dt>
              <dd>{summary.infos}</dd>
            </div>
          </dl>
        </div>
      )}

      {fixReport ? (
        <div className="fix-report">
          <div className="fix-report__head">
            <div>
              <h3>{t('inspector.fixTitle')}</h3>
              <p>{t('inspector.fixSummary', { count: changes.length })}</p>
            </div>
            <button
              type="button"
              className="icon-button icon-button--small"
              onClick={onDismissFix}
              title={t('inspector.dismiss')}
              aria-label={t('inspector.dismiss')}
            >
              <Icon name="x" size={15} />
            </button>
          </div>

          {changes.length === 0 ? (
            <p className="fix-report__empty">{t('inspector.fixNone')}</p>
          ) : (
            <>
              <ul className="fix-report__list">
                {visibleChanges.map((change) => (
                  <li key={change.cueId}>
                    <span className="fix-report__cue">#{cueNumbers.get(change.cueId) ?? '—'}</span>
                    <div className="fix-report__diff">
                      <p>
                        <span className="fix-report__label">{t('inspector.before')}</span>
                        <span className="fix-report__before">{change.before}</span>
                      </p>
                      <p>
                        <span className="fix-report__label">{t('inspector.after')}</span>
                        <span className="fix-report__after">{change.after}</span>
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
              {changes.length > 4 ? (
                <button
                  type="button"
                  className="link-button"
                  onClick={() => setShowAllChanges((current) => !current)}
                >
                  {showAllChanges ? t('common.none') : t('inspector.showAll')}
                </button>
              ) : null}
            </>
          )}
        </div>
      ) : null}
    </section>
  );
}
