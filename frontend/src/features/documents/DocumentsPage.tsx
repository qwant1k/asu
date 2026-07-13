import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { C, PageHeader, Surface } from '../../shared/ui/primitives';

const cards = [
  { key: '/documents/incoming-invoices', icon: '📥', titleKey: 'nav.incomingInvoices' },
  { key: '/documents/write-off-acts', icon: '🗑️', titleKey: 'nav.writeOffActs' },
  { key: '/documents/petitions', icon: '📋', titleKey: 'nav.petitions' },
  { key: '/documents/protocols', icon: '📝', titleKey: 'nav.protocols' },
  { key: '/documents/internal-transfers', icon: '🔄', titleKey: 'nav.internalTransfers' },
];

const DocumentsPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div>
      <PageHeader title={t('documents.title')} />
      <div className="ui-action-grid">
        {cards.map((c) => (
          <Surface key={c.key} className="ui-action-card" onClick={() => navigate(c.key)}>
            <div className="ui-action-card-icon">{c.icon}</div>
            <div style={{ fontSize: 14, fontWeight: 750, color: C.heading }}>{t(c.titleKey)}</div>
          </Surface>
        ))}
      </div>
    </div>
  );
};

export default DocumentsPage;
