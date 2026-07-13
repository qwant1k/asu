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

const MovementsPage: React.FC = () => {
  const { t } = useTranslation();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [assetType, setAssetType] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const params: any = { page, page_size: 20, ordering: '-performed_at' };
        if (search) params.search = search;
        if (assetType) params.asset_type = assetType;
        if (dateFrom) params.performed_after = dateFrom;
        if (dateTo) params.performed_before = dateTo;
        const res = await api.get('/assets/movements/', { params });
        setData(res.data.results || []); setTotal(res.data.count || 0);
      } catch { setData([]); } finally { setLoading(false); }
    })();
  }, [page, search, assetType, dateFrom, dateTo]);

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
      <PageHeader title={t('nav.movements')} right={
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <input placeholder={t('common.search')} value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} style={{ ...inputStyle, width: 220 }} />
          <select value={assetType} onChange={(e) => { setAssetType(e.target.value); setPage(1); }} style={inputStyle}>
            {ASSET_TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(1); }} title="Дата с" style={inputStyle} />
          <input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(1); }} title="Дата по" style={inputStyle} />
        </div>
      } />
      {loading ? <Spinner /> : (
        <Surface>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 800 }}>
              <thead><tr>
                <Th>{t('common.date')}</Th><Th>{t('common.type')}</Th><Th>{t('common.asset')}</Th>
                <Th right>{t('references.quantity')}</Th><Th>{t('common.comment')}</Th><Th>{t('common.performer')}</Th>
              </tr></thead>
              <tbody>
                {data.length === 0 ? <tr><td colSpan={6}><EmptyState text={t('common.noData')} /></td></tr> :
                  data.map((r: any) => (
                    <tr key={r.id} onMouseEnter={(e) => hoverRow(e, true)} onMouseLeave={(e) => hoverRow(e, false)}>
                      <Td muted>{r.performed_at ? new Date(r.performed_at).toLocaleString('ru-KZ') : '—'}</Td>
                      <Td><Badge status={r.movement_type_display} /></Td>
                      <Td><AssetLink assetId={r.asset}>{r.asset_name}</AssetLink></Td>
                      <Td right>{r.quantity}</Td>
                      <Td muted>{r.comment}</Td>
                      <Td muted>{r.performed_by_name}</Td>
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

export default MovementsPage;
