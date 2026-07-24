import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../../api/axios';
import { useAppSelector } from '../../app/hooks';
import type { AssetCategory, Warehouse, WarehouseStock, PaginatedResponse } from '../../shared/types';
import { C, PageHeader, Th, Td, Badge, Spinner, EmptyState, Btn, hoverRow, Surface } from '../../shared/ui/primitives';
import AssetLink from '../../shared/components/AssetLink';

const ASSET_TYPE_OPTIONS = [
  { value: '', label: 'Все' },
  { value: 'TMZ', label: 'ТМЗ' },
  { value: 'OS', label: 'ОС' },
  { value: 'NMA', label: 'НМА' },
];

const WarehouseStockPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const canUpload = ['ADMIN', 'MOL_WAREHOUSE', 'MOL_NMA'].includes(user?.role || '')
    || (user?.effective_permissions || []).includes('warehouse.upload');
  const [data, setData] = useState<WarehouseStock[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [assetType, setAssetType] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [groupFilter, setGroupFilter] = useState('');
  const [warehouseFilter, setWarehouseFilter] = useState('');
  const [categories, setCategories] = useState<AssetCategory[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const params: any = { page, page_size: 20 };
        if (search) params.search = search;
        if (assetType) params.asset_type = assetType;
        if (categoryFilter) params.category = categoryFilter;
        if (groupFilter) params.group = groupFilter;
        if (warehouseFilter) params.warehouse = warehouseFilter;
        const res = await api.get<PaginatedResponse<WarehouseStock>>('/assets/warehouse-stock/', { params });
        setData(res.data.results); setTotal(res.data.count);
      } catch { setData([]); } finally { setLoading(false); }
    })();
  }, [page, search, assetType, categoryFilter, groupFilter, warehouseFilter]);

  useEffect(() => {
    (async () => {
      try {
        const params: Record<string, any> = { page_size: 500, ordering: 'name' };
        if (assetType) params.asset_type = assetType;
        const res = await api.get<PaginatedResponse<AssetCategory>>('/references/asset-categories/', { params });
        setCategories(res.data.results || []);
      } catch { setCategories([]); }
    })();
  }, [assetType]);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get<PaginatedResponse<Warehouse>>('/references/warehouses/', {
          params: { page_size: 500, is_active: true, ordering: 'name' },
        });
        setWarehouses(res.data.results || []);
      } catch { setWarehouses([]); }
    })();
  }, []);

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
      <PageHeader title={t('nav.stock')} right={
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <input placeholder={t('common.search')} value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} style={{ ...inputStyle, width: 240 }} />
          <select value={assetType} onChange={(e) => { setAssetType(e.target.value); setCategoryFilter(''); setGroupFilter(''); setPage(1); }} style={{ ...inputStyle, width: 130 }}>
            {ASSET_TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <select value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }} style={{ ...inputStyle, width: 170 }}>
            <option value="">Все категории</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select value={groupFilter} onChange={(e) => { setGroupFilter(e.target.value); setPage(1); }} style={{ ...inputStyle, width: 170 }}>
            <option value="">Все группы</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select value={warehouseFilter} onChange={(e) => { setWarehouseFilter(e.target.value); setPage(1); }} style={{ ...inputStyle, width: 190 }}>
            <option value="">Все склады</option>
            {warehouses.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
          </select>
          {canUpload && (
            <Btn variant="secondary" onClick={() => navigate('/warehouse/stock/upload')}>
              {t('common.importExcel')}
            </Btn>
          )}
        </div>
      } />
      {loading ? <Spinner /> : (
        <Surface>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
              <thead><tr>
                <Th>{t('common.code')}</Th><Th>{t('common.name')}</Th><Th>{t('common.type')}</Th>
                <Th>{t('references.unitOfMeasure')}</Th><Th>Группа</Th><Th right>{t('references.unitPrice')}</Th>
                <Th right>{t('references.quantity')}</Th><Th right>{t('references.totalAmount')}</Th>
                <Th>{t('references.location')}</Th>
              </tr></thead>
              <tbody>
                {data.length === 0 ? <tr><td colSpan={9}><EmptyState text={t('common.noData')} /></td></tr> :
                  data.map((r) => (
                    <tr key={r.id} onMouseEnter={(e) => hoverRow(e, true)} onMouseLeave={(e) => hoverRow(e, false)}>
                      <Td muted>{r.asset_code}</Td><Td><AssetLink assetId={r.asset}>{r.asset_name}</AssetLink></Td>
                      <Td><Badge status={r.asset_type_display} /></Td>
                      <Td muted>{r.unit_of_measure}</Td><Td muted>{r.group_name || '—'}</Td><Td right>{r.unit_price}</Td>
                      <Td right>{r.quantity}</Td><Td right>{r.total_amount}</Td>
                      <Td muted>{r.warehouse_name || r.location}</Td>
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

export default WarehouseStockPage;
