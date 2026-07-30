import { useTranslation } from '../../i18n';

interface AuthToggleProps {
  mode: 'login' | 'register';
  onToggle: () => void;
}

export function AuthToggle({ mode, onToggle }: AuthToggleProps) {
  const { t } = useTranslation('auth');

  return (
    <div className="mt-10 text-center">
      <button
        type="button"
        onClick={onToggle}
        className="text-sm font-medium text-textSecondary hover:text-textPrimary transition-colors"
      >
        {mode === 'login' ? t('noAccount') : t('hasAccount')}
      </button>
    </div>
  );
}
