import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LeftOutlined } from '@ant-design/icons';
import api from '../../api/axios';
import { C, PageHeader, Btn, Th, Td, Badge, Spinner, EmptyState, hoverRow, Surface } from '../../shared/ui/primitives';
import AssetLink from '../../shared/components/AssetLink';

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
  const tail = location.pathname.slice(basePath.length).replace(/^\/+/, '');
  const detailId = tail && tail !== 'new' ? tail : '';

  const [data, setData] = useState<any[]>([]);
  const [detail, setDetail] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateAfter, setDateAfter] = useState('');
  const [dateBefore, setDateBefore] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { page, page_size: 20 };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (dateAfter) params.date_after = dateAfter;
      if (dateBefore) params.date_before = dateBefore;
      const res = await api.get(endpoint, { params });
      setData(res.data.results || []); setTotal(res.data.count || 0);
    } catch { setData([]); } finally { setLoading(false); }
  }, [dateAfter, dateBefore, endpoint, page, search, statusFilter]);

  const fetchDetail = useCallback(async () => {
    if (!detailId) { setDetail(null); return; }
    setDetailLoading(true);
    try {
      const res = await api.get(`${endpoint}${detailId}/`);
      setDetail(res.data);
    } catch { setDetail(null); } finally { setDetailLoading(false); }
  }, [detailId, endpoint]);

  useEffect(() => { if (!detailId) fetchData(); }, [detailId, fetchData]);
  useEffect(() => { fetchDetail(); }, [fetchDetail]);
  useEffect(() => { setPage(1); setSearch(''); setStatusFilter(''); setDateAfter(''); setDateBefore(''); }, [basePath]);

  const inputStyle: React.CSSProperties = {
    padding: '8px 14px',
    border: `1px solid ${C.inputBorder}`,
    borderRadius: C.radiusSm,
    fontSize: 13,
    outline: 'none',
    width: 240,
    minHeight: 38,
    background: C.glassStrong,
  };
  const detailItems = detail ? (detail.items || detail.attachment_items || []) : [];

  if (detailId) {
    return (
      <div>
        <PageHeader title={`${t(titleKey)} ${detail?.number || ''}`} right={
          <Btn variant="secondary" onClick={() => navigate(basePath)}><LeftOutlined /> {t('common.back')}</Btn>
        } />
        {detailLoading ? <Spinner /> : !detail ? <EmptyState text={t('common.notFound')} /> : (
          <Surface>
            <div style={{ padding: 16, display: 'flex', gap: 12, flexWrap: 'wrap', borderBottom: `1px solid ${C.rowBorder}` }}>
              <Badge status={detail.status_display || detail.status} />
              <span style={{ fontSize: 13, color: C.secondary }}>{detail.date ? new Date(detail.date).toLocaleDateString('ru-KZ') : 'Без даты'}</span>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 720 }}>
                <thead><tr>
                  <Th>{t('common.asset')}</Th><Th>{t('common.code')}</Th><Th right>{t('references.quantity')}</Th><Th right>{t('references.unitPrice')}</Th><Th right>{t('references.totalAmount')}</Th>
                </tr></thead>
                <tbody>
                  {detailItems.length === 0 ? <tr><td colSpan={5}><EmptyState text={t('common.noData')} /></td></tr> :
                    detailItems.map((item: any) => (
                      <tr key={item.id} onMouseEnter={(e) => hoverRow(e, true)} onMouseLeave={(e) => hoverRow(e, false)}>
                        <Td><AssetLink assetId={item.asset}>{item.asset_name || '—'}</AssetLink></Td>
                        <Td muted>{item.asset_code || '—'}</Td>
                        <Td right>{item.quantity || '—'}</Td>
                        <Td right>{item.unit_price || '—'}</Td>
                        <Td right>{item.total || '—'}</Td>
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
  }

  return (
    <div>
      <PageHeader title={t(titleKey)} right={
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <input placeholder={t('common.search')} value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} style={inputStyle} />
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} style={inputStyle}>
            <option value="">Все статусы</option>
            <option value="DRAFT">Черновик</option>
            <option value="PENDING_SIGNATURE">На подписании</option>
            <option value="SIGNED">Подписан</option>
            <option value="CANCELLED">Отменен</option>
          </select>
          <input type="date" value={dateAfter} onChange={(e) => { setDateAfter(e.target.value); setPage(1); }} style={inputStyle} />
          <input type="date" value={dateBefore} onChange={(e) => { setDateBefore(e.target.value); setPage(1); }} style={inputStyle} />
          <Btn onClick={() => navigate(`${basePath}/new`)}>+ {t('common.add')}</Btn>
        </div>
      } />
      {loading ? <Spinner /> : (
        <Surface>
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
        </Surface>
      )}
    </div>
  );
};

export default DocumentListPage;
