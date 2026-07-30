// Wrapper para centralizar o hook de idioma em um único lugar.
// Se precisar mudar de lib no futuro, só atualiza aqui.
export { useTranslation } from 'react-i18next';
export { default as i18n } from './config';

export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'pt-BR', label: 'Português' },
  { code: 'es', label: 'Español' },
];