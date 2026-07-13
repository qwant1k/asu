import React, { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { DownloadOutlined } from '@ant-design/icons';
import api from '../../api/axios';
import type { AssetCategory, PaginatedResponse } from '../../shared/types';
import { C, PageHeader, Btn, Th, Td, Badge, Spinner, EmptyState, hoverRow, Surface } from '../../shared/ui/primitives';
import AssetLink from '../../shared/components/AssetLink';

const CARD_TYPES = [
  { value: '', label: 'Все' },
  { value: 'TMZ', label: 'ТМЗ' },
  { value: 'OS', label: 'ОС' },
  { value: 'NMA', label: 'НМА' },
];

const InventoryPage: React.FC = () => {
  const { t } = useTranslation();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [cardType, setCardType] = useState('');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [groupFilter, setGroupFilter] = useState('');
  const [assignedAfter, setAssignedAfter] = useState('');
  const [assignedBefore, setAssignedBefore] = useState('');
  const [categories, setCategories] = useState<AssetCategory[]>([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (cardType) params.asset_type = cardType;
      if (search) params.search = search;
      if (categoryFilter) params.category = categoryFilter;
      if (groupFilter) params.group = groupFilter;
      if (assignedAfter) params.assigned_after = assignedAfter;
      if (assignedBefore) params.assigned_before = assignedBefore;
      const res = await api.get('/inventory/inventory-cards/', { params });
      setData(res.data.items || res.data.results || []);
    } catch { setData([]); } finally { setLoading(false); }
  }, [assignedAfter, assignedBefore, cardType, categoryFilter, groupFilter, search]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => {
    (async () => {
      try {
        const params: Record<string, any> = { page_size: 500, ordering: 'name' };
        if (cardType) params.asset_type = cardType;
        const res = await api.get<PaginatedResponse<AssetCategory>>('/references/asset-categories/', { params });
        setCategories(res.data.results || []);
      } catch { setCategories([]); }
    })();
  }, [cardType]);

  const handleExport = async () => {
    try {
      const params: Record<string, any> = { export: 'xlsx' };
      if (cardType) params.asset_type = cardType;
      if (search) params.search = search;
      if (categoryFilter) params.category = categoryFilter;
      if (groupFilter) params.group = groupFilter;
      if (assignedAfter) params.assigned_after = assignedAfter;
      if (assignedBefore) params.assigned_before = assignedBefore;
      const res = await api.get('/inventory/inventory-cards/export/', { params, responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a'); link.href = url;
      link.download = `inventory_${new Date().toISOString().slice(0, 10)}.xlsx`; link.click();
    } catch { /* */ }
  };

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
      <PageHeader title={t('inventory.title')} right={
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <input placeholder={t('common.search')} value={search} onChange={(e) => setSearch(e.target.value)} style={{ ...inputStyle, width: 240 }} />
          <select value={cardType} onChange={(e) => { setCardType(e.target.value); setCategoryFilter(''); setGroupFilter(''); }} style={{ ...inputStyle, width: 150 }}>
            {CARD_TYPES.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} style={{ ...inputStyle, width: 170 }}>
            <option value="">Все категории</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select value={groupFilter} onChange={(e) => setGroupFilter(e.target.value)} style={{ ...inputStyle, width: 170 }}>
            <option value="">Все группы</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <input type="date" value={assignedAfter} onChange={(e) => setAssignedAfter(e.target.value)} style={inputStyle} />
          <input type="date" value={assignedBefore} onChange={(e) => setAssignedBefore(e.target.value)} style={inputStyle} />
          <Btn variant="secondary" onClick={handleExport}><DownloadOutlined /> {t('common.export')}</Btn>
        </div>
      } />
      {loading ? <Spinner /> : (
        <Surface>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 800 }}>
              <thead><tr>
                <Th>{t('common.name')}</Th><Th>{t('profile.department')}</Th><Th>{t('common.asset')}</Th>
                <Th>{t('common.code')}</Th><Th>{t('common.type')}</Th><Th right>{t('references.quantity')}</Th><Th>{t('common.date')}</Th>
              </tr></thead>
              <tbody>
                {data.length === 0 ? <tr><td colSpan={7}><EmptyState text={t('common.noData')} /></td></tr> :
                  data.map((r: any, i: number) => (
                    <tr key={`${r.user}_${r.asset}_${i}`} onMouseEnter={(e) => hoverRow(e, true)} onMouseLeave={(e) => hoverRow(e, false)}>
                      <Td>{r.user_name}</Td><Td muted>{r.department_name}</Td><Td><AssetLink assetId={r.asset}>{r.asset_name}</AssetLink></Td>
                      <Td muted>{r.asset_code}</Td><Td><Badge status={r.asset_type_display} /></Td>
                      <Td right>{r.quantity}</Td>
                      <Td muted>{r.assigned_at ? new Date(r.assigned_at).toLocaleDateString('ru-KZ') : '—'}</Td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        </Surface>
      )}
    </div>
  );
};

export default InventoryPage;
