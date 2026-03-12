/* Переключатель языка — скрыт до появления переводов kk/en */

import React from 'react';
import { useTranslation } from 'react-i18next';

const LANGUAGES = [
  { value: 'ru', label: 'Русский' },
  { value: 'kk', label: 'Қазақша' },
  { value: 'en', label: 'English' },
];

const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();

  return (
    <div style={{ display: 'none' }}>
      {/* Убрать display:none когда появятся переводы на kk/en */}
      <select
        value={i18n.language}
        onChange={(e) => i18n.changeLanguage(e.target.value)}
        style={{ width: 120, fontSize: 13, padding: '4px 8px', borderRadius: 4, border: '1px solid #D0D5DD' }}
      >
        {LANGUAGES.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
      </select>
    </div>
  );
};

export default LanguageSwitcher;
