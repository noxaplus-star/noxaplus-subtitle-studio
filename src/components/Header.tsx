import { useI18n, type Theme } from '../i18n';
import { Icon } from './Icon';
import { Logo } from './Logo';

interface HeaderProps {
  theme: Theme;
  errors: number;
  warnings: number;
  canInstall: boolean;
  onToggleTheme: () => void;
  onToggleLanguage: () => void;
  onHelp: () => void;
  onInstall: () => void;
}

export function Header({
  theme,
  errors,
  warnings,
  canInstall,
  onToggleTheme,
  onToggleLanguage,
  onHelp,
  onInstall,
}: HeaderProps) {
  const { lang, t } = useI18n();
  const status =
    errors > 0
      ? { tone: 'error', text: t('status.errors', { count: errors }) }
      : warnings > 0
        ? { tone: 'warning', text: t('status.warnings', { count: warnings }) }
        : null;

  return (
    <header className="header">
      <a className="brand" href="#main" aria-label={t('app.title')}>
        <Logo size={38} />
        <span className="brand__text">
          <span className="brand__name">NoxaPlus</span>
          <span className="brand__product">Subtitle Studio</span>
        </span>
      </a>

      <div className="header__status">
        <span className="privacy-pill">
          <Icon name="lock" size={14} />
          {t('app.private')}
        </span>
        {status ? (
          <span className={`status-pill status-pill--${status.tone}`}>
            <span className="status-pill__dot" />
            {status.text}
          </span>
        ) : null}
      </div>

      <div className="header__actions">
        {canInstall ? (
          <button
            type="button"
            className="icon-button icon-button--labeled"
            onClick={onInstall}
            aria-label={t('header.install')}
            title={t('header.install')}
          >
            <Icon name="install" />
            <span className="icon-button__label">{t('header.install')}</span>
          </button>
        ) : null}
        <button
          type="button"
          className="icon-button icon-button--labeled"
          onClick={onToggleLanguage}
          aria-label={t('header.language')}
          title={t('header.language')}
        >
          <Icon name="globe" />
          <span className="icon-button__label lang-code" dir="ltr">
            {lang === 'fa' ? 'EN' : 'FA'}
          </span>
        </button>
        <button
          type="button"
          className="icon-button"
          onClick={onToggleTheme}
          aria-label={t('header.theme')}
          title={t('header.theme')}
        >
          <Icon name={theme === 'dark' ? 'sun' : 'moon'} />
        </button>
        <button
          type="button"
          className="icon-button"
          onClick={onHelp}
          aria-label={t('header.help')}
          title={t('header.help')}
        >
          <Icon name="help" />
        </button>
      </div>
    </header>
  );
}
