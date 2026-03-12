import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { C, PageHeader } from '../../shared/ui/primitives';

const cards = [
  { key: '/references/counterparties', icon: '🤝', titleKey: 'nav.counterparties' },
  { key: '/references/users', icon: '👤', titleKey: 'nav.users' },
  { key: '/references/limits', icon: '📏', titleKey: 'nav.limits' },
  { key: '/references/request-types', icon: '📋', titleKey: 'nav.requestTypes' },
  { key: '/references/assets/tmz', icon: '📦', titleKey: 'nav.assetsTmz' },
  { key: '/references/assets/os', icon: '🏗️', titleKey: 'nav.assetsOs' },
  { key: '/references/assets/nma', icon: '💡', titleKey: 'nav.assetsNma' },
];

const ReferencesPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div>
      <PageHeader title={t('references.title')} subtitle="Управление справочными данными системы" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
        {cards.map((c) => (
          <div
            key={c.key}
            onClick={() => navigate(c.key)}
            style={{
              background: '#fff', border: `1px solid ${C.border}`, borderRadius: 10,
              padding: '28px 24px', textAlign: 'center', cursor: 'pointer',
              transition: 'box-shadow 0.15s, border-color 0.15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.accent; e.currentTarget.style.boxShadow = '0 4px 12px rgba(26,86,204,0.08)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.boxShadow = 'none'; }}
          >
            <div style={{ fontSize: 32, marginBottom: 12 }}>{c.icon}</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: C.heading }}>{t(c.titleKey)}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReferencesPage;
