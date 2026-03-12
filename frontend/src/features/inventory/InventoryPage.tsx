import React, { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../api/axios';
import { C, PageHeader, Btn, Th, Td, Badge, Spinner, EmptyState, hoverRow } from '../../shared/ui/primitives';

const CARD_TYPES = [
  { value: '', label: 'Все' },
  { value: 'user', label: 'По сотруднику' },
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

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (cardType) params.card_type = cardType;
      if (search) params.search = search;
      const res = await api.get('/inventory/cards/', { params });
      setData(res.data.results || res.data || []);
    } catch { setData([]); } finally { setLoading(false); }
  }, [cardType, search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleExport = async () => {
    try {
      const res = await api.get('/inventory/export/', { params: { card_type: cardType }, responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a'); link.href = url;
      link.download = `inventory_${new Date().toISOString().slice(0, 10)}.pdf`; link.click();
    } catch { /* */ }
  };

  const inputStyle: React.CSSProperties = { padding: '8px 14px', border: `1px solid ${C.inputBorder}`, borderRadius: 6, fontSize: 13, outline: 'none' };

  return (
    <div>
      <PageHeader title={t('inventory.title')} right={
        <div style={{ display: 'flex', gap: 10 }}>
          <input placeholder={t('common.search')} value={search} onChange={(e) => setSearch(e.target.value)} style={{ ...inputStyle, width: 240 }} />
          <select value={cardType} onChange={(e) => setCardType(e.target.value)} style={{ ...inputStyle, width: 150 }}>
            {CARD_TYPES.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <Btn variant="secondary" onClick={handleExport}>📥 {t('common.export')}</Btn>
        </div>
      } />
      {loading ? <Spinner /> : (
        <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 10, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 800 }}>
              <thead><tr>
                <Th>{t('common.name')}</Th><Th>{t('profile.department')}</Th><Th>{t('common.asset')}</Th>
                <Th>{t('common.code')}</Th><Th>{t('common.type')}</Th><Th right>{t('references.quantity')}</Th><Th>{t('common.date')}</Th>
              </tr></thead>
              <tbody>
                {data.length === 0 ? <tr><td colSpan={7}><EmptyState text={t('common.noData')} /></td></tr> :
                  data.map((r: any, i: number) => (
                    <tr key={`${r.user_id}_${r.asset_id}_${i}`} onMouseEnter={(e) => hoverRow(e, true)} onMouseLeave={(e) => hoverRow(e, false)}>
                      <Td>{r.user_name}</Td><Td muted>{r.department_name}</Td><Td>{r.asset_name}</Td>
                      <Td muted>{r.asset_code}</Td><Td><Badge status={r.asset_type_display} /></Td>
                      <Td right>{r.quantity}</Td>
                      <Td muted>{r.assigned_at ? new Date(r.assigned_at).toLocaleDateString('ru-KZ') : '—'}</Td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryPage;
