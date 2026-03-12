import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { C, PageHeader } from '../../shared/ui/primitives';

const reports = [
  { key: '/reports/tmz-stock', titleKey: 'reports.tmzStock' },
  { key: '/reports/os-balance', titleKey: 'reports.osBalance' },
  { key: '/reports/os-stock', titleKey: 'reports.osStock' },
  { key: '/reports/nma-balance', titleKey: 'reports.nmaBalance' },
  { key: '/reports/movement', titleKey: 'reports.movement' },
  { key: '/reports/write-offs', titleKey: 'reports.writeOffs' },
  { key: '/reports/request-journal', titleKey: 'reports.requestJournal' },
  { key: '/reports/inventory-report', titleKey: 'reports.inventoryReport' },
];

const ReportsPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div>
      <PageHeader title={t('reports.title')} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
        {reports.map((r) => (
          <div key={r.key} onClick={() => navigate(r.key)}
            style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 10, padding: 24, textAlign: 'center', cursor: 'pointer', transition: 'border-color 0.15s, box-shadow 0.15s' }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.accent; e.currentTarget.style.boxShadow = '0 4px 12px rgba(26,86,204,0.08)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.boxShadow = 'none'; }}>
            <div style={{ fontSize: 28, marginBottom: 8, color: C.accent }}>📊</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.heading }}>{t(r.titleKey)}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReportsPage;
