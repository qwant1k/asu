import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { C, PageHeader } from '../../shared/ui/primitives';

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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
        {cards.map((c) => (
          <div key={c.key} onClick={() => navigate(c.key)}
            style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 10, padding: 24, textAlign: 'center', cursor: 'pointer', transition: 'border-color 0.15s, box-shadow 0.15s' }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.accent; e.currentTarget.style.boxShadow = '0 4px 12px rgba(26,86,204,0.08)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.boxShadow = 'none'; }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>{c.icon}</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: C.heading }}>{t(c.titleKey)}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DocumentsPage;
