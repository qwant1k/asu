import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../api/axios';
import { C, PageHeader, Th, Td, Badge, Spinner, EmptyState, hoverRow } from '../../shared/ui/primitives';

const MovementsPage: React.FC = () => {
  const { t } = useTranslation();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const params: any = { page, page_size: 20 };
        if (search) params.search = search;
        const res = await api.get('/assets/stock-movements/', { params });
        setData(res.data.results || []); setTotal(res.data.count || 0);
      } catch { setData([]); } finally { setLoading(false); }
    })();
  }, [page, search]);

  const inputStyle: React.CSSProperties = { padding: '8px 14px', border: `1px solid ${C.inputBorder}`, borderRadius: 6, fontSize: 13, outline: 'none', width: 260 };

  return (
    <div>
      <PageHeader title={t('nav.movements')} right={
        <input placeholder={t('common.search')} value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} style={inputStyle} />
      } />
      {loading ? <Spinner /> : (
        <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 10, overflow: 'hidden' }}>
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
                      <Td muted>{r.created_at ? new Date(r.created_at).toLocaleString('ru-KZ') : '—'}</Td>
                      <Td><Badge status={r.movement_type_display} /></Td>
                      <Td>{r.asset_name}</Td>
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
        </div>
      )}
    </div>
  );
};

export default MovementsPage;
