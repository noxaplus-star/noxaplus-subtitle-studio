import { CONTACT_EMAIL, REPO_URL, SITE_URL } from '../constants';
import { useI18n } from '../i18n';
import { Icon } from './Icon';
import { Logo } from './Logo';

export function Footer() {
  const { t } = useI18n();
  return (
    <footer className="footer">
      <div className="footer__brand">
        <Logo size={22} />
        <span>{t('footer.made')}</span>
      </div>
      <nav className="footer__links" aria-label={t('app.title')}>
        <a href={SITE_URL} target="_blank" rel="noreferrer noopener">
          <Icon name="globe" size={15} />
          {t('footer.website')}
        </a>
        <a href={REPO_URL} target="_blank" rel="noreferrer noopener">
          <Icon name="github" size={15} />
          {t('footer.github')}
        </a>
        <a href={`${REPO_URL}#privacy-and-offline-use`} target="_blank" rel="noreferrer noopener">
          <Icon name="shield" size={15} />
          {t('footer.privacy')}
        </a>
        <a href={`mailto:${CONTACT_EMAIL}`}>
          <Icon name="mail" size={15} />
          {t('help.contact')}
        </a>
        <span className="footer__license">{t('footer.license')}</span>
      </nav>
    </footer>
  );
}
