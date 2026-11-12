import { useState } from 'react';
import { useI18n } from '../i18n';
import { Icon } from './Icon';
import { Modal } from './Modal';

interface PasteDialogProps {
  onImport: (text: string) => boolean;
  onClose: () => void;
}

export function PasteDialog({ onImport, onClose }: PasteDialogProps) {
  const { t } = useI18n();
  const [text, setText] = useState('');
  const [invalid, setInvalid] = useState(false);

  const submit = () => {
    const trimmed = text.trim();
    if (!trimmed || !onImport(trimmed)) {
      setInvalid(true);
      return;
    }
    onClose();
  };

  return (
    <Modal
      title={t('paste.title')}
      subtitle={t('paste.subtitle')}
      size="lg"
      onClose={onClose}
      footer={
        <>
          <button type="button" className="button button--ghost" onClick={onClose}>
            {t('common.cancel')}
          </button>
          <button
            type="button"
            className="button button--primary"
            onClick={submit}
            disabled={text.trim().length === 0}
          >
            <Icon name="paste" />
            {t('paste.import')}
          </button>
        </>
      }
    >
      <div className="field">
        <textarea
          className="input textarea paste-area"
          value={text}
          dir="auto"
          spellCheck={false}
          rows={14}
          placeholder={t('paste.placeholder')}
          aria-label={t('paste.title')}
          aria-invalid={invalid}
          onChange={(event) => {
            setText(event.target.value);
            setInvalid(false);
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
              event.preventDefault();
              submit();
            }
          }}
        />
      </div>
      {invalid ? (
        <p className="form-notice form-notice--error" role="alert">
          {t('paste.invalid')}
        </p>
      ) : null}
    </Modal>
  );
}
