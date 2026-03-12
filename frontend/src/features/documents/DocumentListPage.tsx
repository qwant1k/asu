import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../../api/axios';
import { C, PageHeader, Btn, Th, Td, Badge, Spinner, EmptyState, hoverRow } from '../../shared/ui/primitives';

const ENDPOINTS: Record<string, string> = {
  '/documents/incoming-invoices': '/documents/incoming-invoices/',
  '/documents/write-off-acts': '/documents/write-off-acts/',
  '/documents/petitions': '/documents/petitions/',
  '/documents/protocols': '/documents/protocols/',
  '/documents/internal-transfers': '/documents/internal-transfers/',
};
const TITLES: Record<string, string> = {
  '/documents/incoming-invoices': 'nav.incomingInvoices',
  '/documents/write-off-acts': 'nav.writeOffActs',
  '/documents/petitions': 'nav.petitions',
  '/documents/protocols': 'nav.protocols',
  '/documents/internal-transfers': 'nav.internalTransfers',
};

const DocumentListPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const basePath = Object.keys(ENDPOINTS).find((p) => location.pathname.startsWith(p)) || '/documents/incoming-invoices';
  const endpoint = ENDPOINTS[basePath];
  const titleKey = TITLES[basePath];

  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { page, page_size: 20 };
      if (search) params.search = search;
      const res = await api.get(endpoint, { params });
      setData(res.data.results || []); setTotal(res.data.count || 0);
    } catch { setData([]); } finally { setLoading(false); }
  }, [page, search, endpoint]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { setPage(1); setSearch(''); }, [basePath]);

  const inputStyle: React.CSSProperties = { padding: '8px 14px', border: `1px solid ${C.inputBorder}`, borderRadius: 6, fontSize: 13, outline: 'none', width: 240 };

  return (
    <div>
      <PageHeader title={t(titleKey)} right={
        <div style={{ display: 'flex', gap: 10 }}>
          <input placeholder={t('common.search')} value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} style={inputStyle} />
          <Btn onClick={() => navigate(`${basePath}/new`)}>+ {t('common.add')}</Btn>
        </div>
      } />
      {loading ? <Spinner /> : (
        <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 10, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
              <thead><tr>
                <Th>№</Th><Th>{t('common.date')}</Th><Th>{t('common.status')}</Th>
                <Th>{t('documents.createdBy')}</Th><Th>{t('common.created')}</Th><Th></Th>
              </tr></thead>
              <tbody>
                {data.length === 0 ? <tr><td colSpan={6}><EmptyState text={t('common.noData')} /></td></tr> :
                  data.map((r: any) => (
                    <tr key={r.id} onMouseEnter={(e) => hoverRow(e, true)} onMouseLeave={(e) => hoverRow(e, false)} style={{ cursor: 'pointer' }} onClick={() => navigate(`${basePath}/${r.id}`)}>
                      <Td bold>{r.number}</Td>
                      <Td muted>{r.date ? new Date(r.date).toLocaleDateString('ru-KZ') : '—'}</Td>
                      <Td><Badge status={r.status} /></Td>
                      <Td>{r.created_by_name}</Td>
                      <Td muted>{r.created_at ? new Date(r.created_at).toLocaleString('ru-KZ') : '—'}</Td>
                      <Td><span style={{ color: C.accent, fontSize: 13 }}>→</span></Td>
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

export default DocumentListPage;
