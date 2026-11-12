import { formatClock } from '../core/time';
import { stripTags } from '../core/text';
import type { Cue } from '../core/types';
import type { VideoController } from '../hooks/useVideo';
import { useI18n } from '../i18n';
import { Icon } from './Icon';

interface VideoPanelProps {
  video: VideoController;
  activeCue: Cue | null;
  hasCues: boolean;
  onChoose: () => void;
  onRemove: () => void;
}

export function VideoPanel({ video, activeCue, hasCues, onChoose, onRemove }: VideoPanelProps) {
  const { t } = useI18n();

  return (
    <section
      className={`panel video-panel video-panel--${video.hasVideo ? 'loaded' : 'empty'}`}
      aria-label={t('video.title')}
    >
      <header className="video-header">
        <div>
          <h2 className="panel__title">{t('video.title')}</h2>
          <p className="panel__subtitle">{video.name ?? t('video.localFile')}</p>
        </div>
        {video.hasVideo ? (
          <div className="video-header__actions">
            <button type="button" className="icon-button icon-button--small" onClick={onChoose} title={t('video.replace')} aria-label={t('video.replace')}>
              <Icon name="film" size={16} />
            </button>
            <button type="button" className="icon-button icon-button--small icon-button--danger" onClick={onRemove} title={t('video.remove')} aria-label={t('video.remove')}>
              <Icon name="trash" size={16} />
            </button>
          </div>
        ) : null}
      </header>

      {video.hasVideo ? (
        <>
          <div className="video-stage">
            <video
              ref={video.setElement}
              className="video-stage__media"
              src={video.url ?? undefined}
              controls
              playsInline
              preload="metadata"
              aria-label={t('video.title')}
            />
            {activeCue ? (
              <div className="subtitle-overlay" aria-hidden="true">
                <span className="subtitle-overlay__text" dir="auto">
                  {stripTags(activeCue.text)}
                </span>
              </div>
            ) : null}
          </div>
          <div className="video-meta">
            <span className="video-meta__name">
              <Icon name="film" size={14} />
              {video.name}
            </span>
            <span className="mono">{formatClock(video.currentTime)}</span>
          </div>
          {!hasCues ? <p className="video-note">{t('video.needCues')}</p> : null}
        </>
      ) : (
        <div className="video-empty">
          <span className="video-empty__icon">
            <Icon name="film" size={28} />
          </span>
          <h3>{t('video.emptyTitle')}</h3>
          <p>{t('video.emptyText')}</p>
          <button type="button" className="button button--soft" onClick={onChoose}>
            <Icon name="upload" />
            {t('video.load')}
          </button>
          <span className="video-empty__note">
            <Icon name="lock" size={13} />
            {t('app.localOnly')}
          </span>
        </div>
      )}
    </section>
  );
}
