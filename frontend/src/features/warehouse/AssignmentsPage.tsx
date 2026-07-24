import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../api/axios';
import { C, PageHeader, Th, Td, Badge, Spinner, EmptyState, hoverRow, Surface } from '../../shared/ui/primitives';
import AssetLink from '../../shared/components/AssetLink';

const ASSET_TYPE_OPTIONS = [
  { value: '', label: 'Все типы' },
  { value: 'TMZ', label: 'ТМЗ' },
  { value: 'OS', label: 'ОС' },
  { value: 'NMA', label: 'НМА' },
];
const STATUS_OPTIONS = [
  { value: '', label: 'Все статусы' },
  { value: 'ACTIVE', label: 'Активно' },
  { value: 'TRANSFERRED', label: 'Передано' },
  { value: 'WRITTEN_OFF', label: 'Списано' },
];

const AssignmentsPage: React.FC = () => {
  const { t } = useTranslation();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [assetType, setAssetType] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const params: any = { page, page_size: 20, ordering: '-assigned_at' };
        if (search) params.search = search;
        if (assetType) params.asset_type = assetType;
        if (statusFilter) params.status = statusFilter;
        const res = await api.get('/assets/assignments/', { params });
        setData(res.data.results || []); setTotal(res.data.count || 0);
      } catch { setData([]); } finally { setLoading(false); }
    })();
  }, [page, search, assetType, statusFilter]);

  const inputStyle: React.CSSProperties = {
    padding: '8px 14px',
    border: `1px solid ${C.inputBorder}`,
    borderRadius: C.radiusSm,
    fontSize: 13,
    outline: 'none',
    minHeight: 38,
    background: C.glassStrong,
  };

  return (
    <div>
      <PageHeader title={t('nav.assignments')} right={
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <input placeholder={t('common.search')} value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} style={{ ...inputStyle, width: 220 }} />
          <select value={assetType} onChange={(e) => { setAssetType(e.target.value); setPage(1); }} style={inputStyle}>
            {ASSET_TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} style={inputStyle}>
            {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      } />
      {loading ? <Spinner /> : (
        <Surface>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 820 }}>
              <thead><tr>
                <Th>{t('common.asset')}</Th><Th>{t('common.code')}</Th><Th>{t('references.assignedTo')}</Th><Th>Склад</Th>
                <Th right>{t('references.quantity')}</Th><Th>{t('common.status')}</Th><Th>{t('common.date')}</Th>
              </tr></thead>
              <tbody>
                {data.length === 0 ? <tr><td colSpan={7}><EmptyState text={t('common.noData')} /></td></tr> :
                  data.map((r: any) => (
                    <tr key={r.id} onMouseEnter={(e) => hoverRow(e, true)} onMouseLeave={(e) => hoverRow(e, false)}>
                      <Td><AssetLink assetId={r.asset}>{r.asset_name}</AssetLink></Td><Td muted>{r.asset_code}</Td><Td>{r.user_name}</Td><Td muted>{r.warehouse_name || r.location || '—'}</Td>
                      <Td right>{r.quantity}</Td><Td><Badge status={r.status_display} /></Td>
                      <Td muted>{r.assigned_at ? new Date(r.assigned_at).toLocaleDateString('ru-KZ') : '—'}</Td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
          <div style={{ padding: '10px 16px', fontSize: 12, color: C.muted, borderTop: `1px solid ${C.border}` }}>
            {t('common.total')}: {total} · Стр. {page}
            {page > 1 && <button onClick={() => setPage(page - 1)} style={{ marginLeft: 8, background: 'none', border: 'none', color: C.accent, cursor: 'pointer' }}>← Назад</button>}
            {total > page * 20 && <button onClick={() => setPage(page + 1)} style={{ marginLeft: 8, background: 'none', border: 'none', color: C.accent, cursor: 'pointer' }}>Далее →</button>}
          </div>
        </Surface>
      )}
    </div>
  );
};

export default AssignmentsPage;
