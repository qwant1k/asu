import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '../../app/hooks';
import api from '../../api/axios';
import type { AssetRequest, PaginatedResponse, RequestTypeReference } from '../../shared/types';
import {
  C, PageHeader, Btn, Th, Td, Badge, Spinner, EmptyState, hoverRow, Surface, FilterBar,
} from '../../shared/ui/primitives';

const PAGE_SIZE = 20;

const RequestsPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const [data, setData] = useState<AssetRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [requestTypes, setRequestTypes] = useState<RequestTypeReference[]>([]);
  const [pendingOnly, setPendingOnly] = useState(false);
  const [issueOnly, setIssueOnly] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [issueCount, setIssueCount] = useState(0);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = { page, page_size: PAGE_SIZE, ordering: '-created_at' };
      if (search) params.search = search;
      if (filterStatus) params.status = filterStatus;
      if (filterType) params.request_type = filterType;
      if (dateFrom) params.created_after = dateFrom;
      if (dateTo) params.created_before = dateTo;
      if (pendingOnly) params.pending_my_approval = 'true';
      if (issueOnly) params.pending_my_issue = 'true';
      const res = await api.get<PaginatedResponse<AssetRequest>>('/requests/', { params });
      setData(res.data.results);
      setTotal(res.data.count);
    } catch { setData([]); } finally { setLoading(false); }
  }, [page, search, filterStatus, filterType, dateFrom, dateTo, pendingOnly, issueOnly]);

  const fetchPendingCount = useCallback(async () => {
    try {
      const res = await api.get<PaginatedResponse<AssetRequest>>('/requests/', { params: { pending_my_approval: 'true', page_size: 1 } });
      setPendingCount(res.data.count);
    } catch { setPendingCount(0); }
  }, []);

  const fetchIssueCount = useCallback(async () => {
    try {
      const res = await api.get<PaginatedResponse<AssetRequest>>('/requests/', { params: { pending_my_issue: 'true', page_size: 1 } });
      setIssueCount(res.data.count);
    } catch { setIssueCount(0); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { fetchPendingCount(); }, [fetchPendingCount]);
  useEffect(() => { fetchIssueCount(); }, [fetchIssueCount]);
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get<PaginatedResponse<RequestTypeReference>>('/references/request-types/', { params: { page_size: 100, is_active: true } });
        setRequestTypes(res.data.results || []);
      } catch { setRequestTypes([]); }
    })();
  }, []);

  const resetFilters = () => { setSearch(''); setFilterStatus(''); setFilterType(''); setDateFrom(''); setDateTo(''); setPage(1); };

  const totalPages = Math.ceil(total / PAGE_SIZE);
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
      <PageHeader
        title={t('requests.title')}
        right={<Btn onClick={() => navigate('/requests/new')}>+ {t('requests.createNew')}</Btn>}
      />

      <FilterBar style={{ gap: 8, marginBottom: 14 }}>
        <button onClick={() => { setPendingOnly(false); setIssueOnly(false); setPage(1); }} style={{
          padding: '8px 16px', borderRadius: C.radiusSm, border: `1px solid ${!pendingOnly && !issueOnly ? C.accent : C.inputBorder}`,
          background: !pendingOnly && !issueOnly ? `linear-gradient(135deg, ${C.accent}, #0EA5E9)` : C.glassStrong, color: !pendingOnly && !issueOnly ? '#fff' : C.text,
          cursor: 'pointer', fontSize: 13, fontWeight: 750, minHeight: 38,
        }}>{t('common.all')}</button>
        <button onClick={() => { setPendingOnly(true); setIssueOnly(false); setPage(1); }} style={{
          padding: '8px 16px', borderRadius: C.radiusSm, border: `1px solid ${pendingOnly ? C.accent : C.inputBorder}`,
          background: pendingOnly ? `linear-gradient(135deg, ${C.accent}, #0EA5E9)` : C.glassStrong, color: pendingOnly ? '#fff' : C.text,
          cursor: 'pointer', fontSize: 13, fontWeight: 750, display: 'flex', alignItems: 'center', gap: 6, minHeight: 38,
        }}>
          {t('requests.pendingMyApproval')}
          {pendingCount > 0 && (
            <span style={{
              background: pendingOnly ? 'rgba(255,255,255,0.25)' : C.danger, color: '#fff',
              borderRadius: 10, padding: '1px 7px', fontSize: 11, fontWeight: 600,
            }}>{pendingCount}</span>
          )}
        </button>
        <button onClick={() => { setPendingOnly(false); setIssueOnly(true); setPage(1); }} style={{
          padding: '8px 16px', borderRadius: C.radiusSm, border: `1px solid ${issueOnly ? C.accent : C.inputBorder}`,
          background: issueOnly ? `linear-gradient(135deg, ${C.accent}, #0EA5E9)` : C.glassStrong, color: issueOnly ? '#fff' : C.text,
          cursor: 'pointer', fontSize: 13, fontWeight: 750, display: 'flex', alignItems: 'center', gap: 6, minHeight: 38,
        }}>
          Моя выдача
          {issueCount > 0 && (
            <span style={{
              background: issueOnly ? 'rgba(255,255,255,0.25)' : C.danger, color: '#fff',
              borderRadius: 10, padding: '1px 7px', fontSize: 11, fontWeight: 600,
            }}>{issueCount}</span>
          )}
        </button>
      </FilterBar>

      <FilterBar>
        <input placeholder={t('common.search')} value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          style={{ ...inputStyle, width: 260 }}
        />
        <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
          style={{ ...inputStyle, color: C.secondary }}>
          <option value="">{t('common.allStatuses')}</option>
          <option value="DRAFT">{t('requests.status.DRAFT')}</option>
          <option value="SENT_FOR_REVISION">{t('requests.status.SENT_FOR_REVISION')}</option>
          <option value="PENDING_SUPERVISOR">{t('requests.status.PENDING_SUPERVISOR')}</option>
          <option value="APPROVED_SUPERVISOR">{t('requests.status.APPROVED_SUPERVISOR')}</option>
          <option value="APPROVED">{t('requests.status.APPROVED')}</option>
          <option value="EXECUTED">{t('requests.status.EXECUTED')}</option>
          <option value="REJECTED">{t('requests.status.REJECTED')}</option>
          <option value="CANCELLED">{t('requests.status.CANCELLED')}</option>
        </select>
        <select value={filterType} onChange={(e) => { setFilterType(e.target.value); setPage(1); }}
          style={{ ...inputStyle, color: C.secondary }}>
          <option value="">Все виды заявок</option>
          {requestTypes.map((rt) => <option key={rt.id} value={rt.id}>{rt.name}</option>)}
        </select>
        <input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
          title="Дата с" style={{ ...inputStyle, color: C.secondary }} />
        <input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
          title="Дата по" style={{ ...inputStyle, color: C.secondary }} />
        {(search || filterStatus || filterType || dateFrom || dateTo) && (
          <button onClick={resetFilters} style={{ ...inputStyle, cursor: 'pointer', background: '#fff', color: C.accent }}>Сбросить</button>
        )}
      </FilterBar>

      <Surface>
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
                  <Th></Th>
                  <Th>{t('common.actions')}</Th>
                </tr>
              </thead>
              <tbody>
                {data.map((r) => {
                  const needsInitiatorAction = user?.id === r.initiator && ['DRAFT', 'SENT_FOR_REVISION'].includes(r.status);
                  return (
                    <tr key={r.id} onMouseEnter={(e) => hoverRow(e, true)} onMouseLeave={(e) => hoverRow(e, false)}>
                      <Td bold>{r.number}</Td>
                      <Td><Badge status={r.request_type_name} /></Td>
                      <Td><Badge status={r.status_display} /></Td>
                      <Td muted>{r.initiator_name}</Td>
                      <Td muted>{new Date(r.created_at).toLocaleDateString('ru-KZ')}</Td>
                      <Td>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          {needsInitiatorAction && <Badge status={r.status === 'DRAFT' ? 'Требует отправки' : 'Требует корректировки'} />}
                          {r.pending_my_approval && <Badge status={t('requests.pendingMyApproval')} />}
                          {r.pending_my_issue && <Badge status="Моя выдача" />}
                        </div>
                      </Td>
                      <Td>
                        <button onClick={() => navigate(`/requests/${r.id}`)}
                          style={{ background: 'none', border: 'none', color: C.accent, cursor: 'pointer', fontSize: 13, fontWeight: 500 }}>
                          Открыть →
                        </button>
                      </Td>
                    </tr>
                  );
                })}
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
                  padding: '4px 10px', borderRadius: C.radiusSm, border: `1px solid ${C.inputBorder}`,
                  background: page === i + 1 ? `linear-gradient(135deg, ${C.accent}, #0EA5E9)` : C.glassStrong, color: page === i + 1 ? '#fff' : C.text,
                  cursor: 'pointer', fontSize: 12,
                }}>{i + 1}</button>
              ))}
            </div>
          </div>
        )}
      </Surface>
    </div>
  );
};

export default RequestsPage;
