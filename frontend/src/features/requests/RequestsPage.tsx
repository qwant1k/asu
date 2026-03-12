import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../../api/axios';
import type { AssetRequest, PaginatedResponse } from '../../shared/types';
import {
  C, PageHeader, Btn, Th, Td, Badge, Spinner, EmptyState, hoverRow,
} from '../../shared/ui/primitives';

const PAGE_SIZE = 20;

const RequestsPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [data, setData] = useState<AssetRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = { page, page_size: PAGE_SIZE, ordering: '-created_at' };
      if (search) params.search = search;
      if (filterStatus) params.status = filterStatus;
      const res = await api.get<PaginatedResponse<AssetRequest>>('/requests/', { params });
      setData(res.data.results);
      setTotal(res.data.count);
    } catch { setData([]); } finally { setLoading(false); }
  }, [page, search, filterStatus]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const inputStyle: React.CSSProperties = { padding: '8px 14px', border: `1px solid ${C.inputBorder}`, borderRadius: 6, fontSize: 13, outline: 'none' };

  return (
    <div>
      <PageHeader
        title={t('requests.title')}
        right={<Btn onClick={() => navigate('/requests/new')}>+ {t('requests.createNew')}</Btn>}
      />

      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <input placeholder={t('common.search')} value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          style={{ ...inputStyle, width: 260 }}
        />
        <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
          style={{ ...inputStyle, color: C.secondary, background: '#fff' }}>
          <option value="">{t('common.allStatuses')}</option>
          <option value="DRAFT">{t('requests.status.DRAFT')}</option>
          <option value="PENDING_SUPERVISOR">{t('requests.status.PENDING_SUPERVISOR')}</option>
          <option value="APPROVED">{t('requests.status.APPROVED')}</option>
          <option value="EXECUTED">{t('requests.status.EXECUTED')}</option>
          <option value="REJECTED">{t('requests.status.REJECTED')}</option>
          <option value="CANCELLED">{t('requests.status.CANCELLED')}</option>
        </select>
      </div>

      <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 10, overflow: 'hidden' }}>
        {loading ? <Spinner /> : data.length === 0 ? <EmptyState text={t('common.noData')} /> : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 800 }}>
              <thead>
                <tr>
                  <Th>{t('common.number')}</Th>
                  <Th>{t('common.type')}</Th>
                  <Th>{t('common.status')}</Th>
                  <Th>{t('requests.initiator')}</Th>
                  <Th>{t('common.date')}</Th>
                  <Th>{t('common.actions')}</Th>
                </tr>
              </thead>
              <tbody>
                {data.map((r) => (
                  <tr key={r.id} onMouseEnter={(e) => hoverRow(e, true)} onMouseLeave={(e) => hoverRow(e, false)}>
                    <Td bold>{r.number}</Td>
                    <Td><Badge status={r.request_type_name} /></Td>
                    <Td><Badge status={r.status_display} /></Td>
                    <Td muted>{r.initiator_name}</Td>
                    <Td muted>{new Date(r.created_at).toLocaleDateString('ru-KZ')}</Td>
                    <Td>
                      <button onClick={() => navigate(`/requests/${r.id}`)}
                        style={{ background: 'none', border: 'none', color: C.accent, cursor: 'pointer', fontSize: 13, fontWeight: 500 }}>
                        Открыть →
                      </button>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {totalPages > 1 && (
          <div style={{ padding: '12px 16px', borderTop: `1px solid ${C.rowBorder}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, color: C.secondary }}>
            <span>{t('common.total')}: {total}</span>
            <div style={{ display: 'flex', gap: 4 }}>
              {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => (
                <button key={i} onClick={() => setPage(i + 1)} style={{
                  padding: '4px 10px', borderRadius: 4, border: `1px solid ${C.inputBorder}`,
                  background: page === i + 1 ? C.accent : '#fff', color: page === i + 1 ? '#fff' : C.text,
                  cursor: 'pointer', fontSize: 12,
                }}>{i + 1}</button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RequestsPage;
