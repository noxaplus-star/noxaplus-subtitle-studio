import { APP_VERSION, CONTACT_EMAIL, REPO_URL } from '../constants';
import { useI18n, type TranslationKey } from '../i18n';
import { Icon } from './Icon';
import { Modal } from './Modal';

interface HelpDialogProps {
  onClose: () => void;
}

interface Shortcut {
  label: TranslationKey;
  keys: string[];
}

const SHORTCUTS: Shortcut[] = [
  { label: 'help.undo', keys: ['Ctrl/⌘', 'Z'] },
  { label: 'help.redo', keys: ['Ctrl/⌘', 'Shift', 'Z'] },
  { label: 'help.import', keys: ['Ctrl/⌘', 'O'] },
  { label: 'help.export', keys: ['Ctrl/⌘', 'E'] },
  { label: 'help.play', keys: ['Space'] },
  { label: 'help.help', keys: ['?'] },
  { label: 'help.close', keys: ['Esc'] },
];

export function HelpDialog({ onClose }: HelpDialogProps) {
  const { t } = useI18n();

  return (
    <Modal
      title={t('help.title')}
      subtitle={t('help.subtitle')}
      size="lg"
      onClose={onClose}
      footer={
        <button type="button" className="button button--primary" onClick={onClose}>
          {t('common.close')}
        </button>
      }
    >
      <section className="help-section">
        <h3 className="help-section__title">
          <Icon name="keyboard" size={17} />
          {t('help.shortcuts')}
        </h3>
        <div className="shortcut-grid">
          {SHORTCUTS.map((shortcut) => (
            <div key={shortcut.label} className="shortcut">
              <span className="shortcut__label">{t(shortcut.label)}</span>
              <span className="shortcut__keys">
                {shortcut.keys.map((key) => (
                  <kbd key={key} dir="ltr">
                    {key}
                  </kbd>
                ))}
              </span>
            </div>
          ))}
        </div>
        <p className="hint-text">
          <Icon name="info" size={14} />
          {t('help.shortcutsNote')}
        </p>
      </section>

      <div className="help-cards">
        <section className="help-card">
          <span className="help-card__icon">
            <Icon name="shield" size={19} />
          </span>
          <h3>{t('help.privacyTitle')}</h3>
          <p>{t('help.privacyText')}</p>
        </section>
        <section className="help-card">
          <span className="help-card__icon">
            <Icon name="install" size={19} />
          </span>
          <h3>{t('help.offlineTitle')}</h3>
          <p>{t('help.offlineText')}</p>
        </section>
      </div>

      <div className="help-meta">
        <span className="chip">{t('help.version', { version: APP_VERSION })}</span>
        <a className="help-meta__link" href={`mailto:${CONTACT_EMAIL}`}>
          <Icon name="mail" size={14} />
          {CONTACT_EMAIL.replace('@', '\u200B@')}
        </a>
        <a className="help-meta__link" href={REPO_URL} target="_blank" rel="noreferrer noopener">
          <Icon name="github" size={14} />
          {t('help.github')}
          <Icon name="external" size={12} />
        </a>
      </div>
    </Modal>
  );
}
