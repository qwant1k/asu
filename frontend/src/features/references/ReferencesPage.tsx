import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { C, PageHeader, Surface } from '../../shared/ui/primitives';

const cards = [
  { key: '/references/counterparties', icon: '🤝', titleKey: 'nav.counterparties' },
  { key: '/references/users', icon: '👤', titleKey: 'nav.users' },
  { key: '/references/limits', icon: '📏', titleKey: 'nav.limits' },
  { key: '/references/request-types', icon: '📋', titleKey: 'nav.requestTypes' },
  { key: '/references/units-of-measure', icon: '📐', titleKey: 'nav.unitsOfMeasure' },
  { key: '/references/warehouses', icon: '🏭', titleKey: 'nav.warehouses' },
  { key: '/references/positions', icon: '🏅', titleKey: 'nav.positions' },
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
      <div className="ui-action-grid">
        {cards.map((c) => (
          <Surface
            key={c.key}
            className="ui-action-card"
            onClick={() => navigate(c.key)}
          >
            <div className="ui-action-card-icon">{c.icon}</div>
            <div style={{ fontSize: 14, fontWeight: 750, color: C.heading }}>{t(c.titleKey)}</div>
          </Surface>
        ))}
      </div>
    </div>
  );
};

export default ReferencesPage;
