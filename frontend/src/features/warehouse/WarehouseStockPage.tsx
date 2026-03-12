import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../api/axios';
import type { WarehouseStock, PaginatedResponse } from '../../shared/types';
import { C, PageHeader, Th, Td, Badge, Spinner, EmptyState, hoverRow } from '../../shared/ui/primitives';

const ASSET_TYPE_OPTIONS = [
  { value: '', label: 'Все' },
  { value: 'TMZ', label: 'ТМЗ' },
  { value: 'OS', label: 'ОС' },
  { value: 'NMA', label: 'НМА' },
];

const WarehouseStockPage: React.FC = () => {
  const { t } = useTranslation();
  const [data, setData] = useState<WarehouseStock[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [assetType, setAssetType] = useState('');

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const params: any = { page, page_size: 20 };
        if (search) params.search = search;
        if (assetType) params.asset_type = assetType;
        const res = await api.get<PaginatedResponse<WarehouseStock>>('/assets/warehouse-stock/', { params });
        setData(res.data.results); setTotal(res.data.count);
      } catch { setData([]); } finally { setLoading(false); }
    })();
  }, [page, search, assetType]);

  const inputStyle: React.CSSProperties = { padding: '8px 14px', border: `1px solid ${C.inputBorder}`, borderRadius: 6, fontSize: 13, outline: 'none' };

  return (
    <div>
      <PageHeader title={t('nav.stock')} right={
        <div style={{ display: 'flex', gap: 10 }}>
          <input placeholder={t('common.search')} value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} style={{ ...inputStyle, width: 240 }} />
          <select value={assetType} onChange={(e) => { setAssetType(e.target.value); setPage(1); }} style={{ ...inputStyle, width: 130 }}>
            {ASSET_TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      } />
      {loading ? <Spinner /> : (
        <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 10, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
              <thead><tr>
                <Th>{t('common.code')}</Th><Th>{t('common.name')}</Th><Th>{t('common.type')}</Th>
                <Th>{t('references.unitOfMeasure')}</Th><Th right>{t('references.unitPrice')}</Th>
                <Th right>{t('references.quantity')}</Th><Th right>{t('references.totalAmount')}</Th>
                <Th>{t('references.location')}</Th>
              </tr></thead>
              <tbody>
                {data.length === 0 ? <tr><td colSpan={8}><EmptyState text={t('common.noData')} /></td></tr> :
                  data.map((r) => (
                    <tr key={r.id} onMouseEnter={(e) => hoverRow(e, true)} onMouseLeave={(e) => hoverRow(e, false)}>
                      <Td muted>{r.asset_code}</Td><Td>{r.asset_name}</Td>
                      <Td><Badge status={r.asset_type_display} /></Td>
                      <Td muted>{r.unit_of_measure}</Td><Td right>{r.unit_price}</Td>
                      <Td right>{r.quantity}</Td><Td right>{r.total_amount}</Td>
                      <Td muted>{r.location}</Td>
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
        </div>
      )}
    </div>
  );
};

export default WarehouseStockPage;
