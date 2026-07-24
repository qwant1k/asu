import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { DeleteOutlined } from '@ant-design/icons';
import { useAppSelector } from '../../app/hooks';
import api from '../../api/axios';
import type { AssetRequest, PaginatedResponse, RequestTypeReference } from '../../shared/types';
import {
  C, PageHeader, Btn, Th, Td, Badge, Spinner, EmptyState, hoverRow, Surface, FilterBar, Popconfirm,
} from '../../shared/ui/primitives';

const PAGE_SIZE = 20;

const parseDateValue = (value?: string | null) => {
  if (!value) return null;
  const text = String(value).trim();
  const localMatch = text.match(/^(\d{2})\.(\d{2})\.(\d{4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?$/);
  if (localMatch) {
    const [, day, month, year, hour = '0', minute = '0', second = '0'] = localMatch;
    return new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute), Number(second));
  }
  const date = new Date(text);
  return Number.isNaN(date.getTime()) ? null : date;
};

const formatDate = (value?: string | null) => {
  const date = parseDateValue(value);
  if (!date) return '—';
  return date.toLocaleDateString('ru-RU');
};

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
  const [deletionOnly, setDeletionOnly] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [issueCount, setIssueCount] = useState(0);
  const [deletionCount, setDeletionCount] = useState(0);
  const [confirmAction, setConfirmAction] = useState<{ request: AssetRequest; mode: 'delete' | 'mark' } | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const userPermissions = user?.effective_permissions || [];
  const isAdmin = user?.role === 'ADMIN' || user?.is_superuser || userPermissions.includes('system.admin');

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
      if (deletionOnly) params.deletion_requested = 'true';
      const res = await api.get<PaginatedResponse<AssetRequest>>('/requests/', { params });
      setData(res.data.results);
      setTotal(res.data.count);
    } catch { setData([]); } finally { setLoading(false); }
  }, [page, search, filterStatus, filterType, dateFrom, dateTo, pendingOnly, issueOnly, deletionOnly]);

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

  const fetchDeletionCount = useCallback(async () => {
    if (!isAdmin) {
      setDeletionCount(0);
      return;
    }
    try {
      const res = await api.get<PaginatedResponse<AssetRequest>>('/requests/', { params: { deletion_requested: 'true', page_size: 1 } });
      setDeletionCount(res.data.count);
    } catch { setDeletionCount(0); }
  }, [isAdmin]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { fetchPendingCount(); }, [fetchPendingCount]);
  useEffect(() => { fetchIssueCount(); }, [fetchIssueCount]);
  useEffect(() => { fetchDeletionCount(); }, [fetchDeletionCount]);
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get<PaginatedResponse<RequestTypeReference>>('/references/request-types/', { params: { page_size: 100, is_active: true } });
        setRequestTypes(res.data.results || []);
      } catch { setRequestTypes([]); }
    })();
  }, []);

  const resetFilters = () => {
    setSearch('');
    setFilterStatus('');
    setFilterType('');
    setDateFrom('');
    setDateTo('');
    setDeletionOnly(false);
    setPage(1);
  };

  const handleConfirmAction = async () => {
    if (!confirmAction) return;
    setActionError(null);
    try {
      if (confirmAction.mode === 'delete') {
        await api.delete(`/requests/${confirmAction.request.id}/`);
      } else {
        await api.post(`/requests/${confirmAction.request.id}/mark-for-deletion/`);
      }
      setConfirmAction(null);
      fetchData();
      fetchPendingCount();
      fetchIssueCount();
      fetchDeletionCount();
    } catch (err: any) {
      setActionError(err?.response?.data?.detail || t('common.error'));
      setConfirmAction(null);
    }
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const allMode = !pendingOnly && !issueOnly && !deletionOnly;
  const inputStyle: React.CSSProperties = {
    padding: '8px 14px',
    border: `1px solid ${C.inputBorder}`,
    borderRadius: C.radiusSm,
    fontSize: 13,
    outline: 'none',
    minHeight: 38,
    background: C.glassStrong,
  };
  const iconButtonStyle: React.CSSProperties = {
    width: 34,
    height: 34,
    borderRadius: C.radiusSm,
    border: `1px solid ${C.border}`,
    background: C.glassStrong,
    color: C.danger,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 14,
  };

  return (
    <div>
      <PageHeader
        title={t('requests.title')}
        right={<Btn onClick={() => navigate('/requests/new')}>+ {t('requests.createNew')}</Btn>}
      />

      <FilterBar style={{ gap: 8, marginBottom: 14 }}>
        <button onClick={() => { setPendingOnly(false); setIssueOnly(false); setDeletionOnly(false); setPage(1); }} style={{
          padding: '8px 16px', borderRadius: C.radiusSm, border: `1px solid ${allMode ? C.accent : C.inputBorder}`,
          background: allMode ? `linear-gradient(135deg, ${C.accent}, #0EA5E9)` : C.glassStrong, color: allMode ? '#fff' : C.text,
          cursor: 'pointer', fontSize: 13, fontWeight: 750, minHeight: 38,
        }}>{t('common.all')}</button>
        <button onClick={() => { setPendingOnly(true); setIssueOnly(false); setDeletionOnly(false); setPage(1); }} style={{
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
        <button onClick={() => { setPendingOnly(false); setIssueOnly(true); setDeletionOnly(false); setPage(1); }} style={{
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
        {isAdmin && (
          <button onClick={() => { setPendingOnly(false); setIssueOnly(false); setDeletionOnly(true); setPage(1); }} style={{
            padding: '8px 16px', borderRadius: C.radiusSm, border: `1px solid ${deletionOnly ? C.danger : C.inputBorder}`,
            background: deletionOnly ? C.dangerBg : C.glassStrong, color: deletionOnly ? C.danger : C.text,
            cursor: 'pointer', fontSize: 13, fontWeight: 750, display: 'flex', alignItems: 'center', gap: 6, minHeight: 38,
          }}>
            К удалению
            {deletionCount > 0 && (
              <span style={{
                background: deletionOnly ? C.danger : C.danger, color: '#fff',
                borderRadius: 10, padding: '1px 7px', fontSize: 11, fontWeight: 600,
              }}>{deletionCount}</span>
            )}
          </button>
        )}
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
        {(search || filterStatus || filterType || dateFrom || dateTo || deletionOnly) && (
          <button onClick={resetFilters} style={{ ...inputStyle, cursor: 'pointer', background: '#fff', color: C.accent }}>Сбросить</button>
        )}
      </FilterBar>

      {actionError && (
        <div style={{ background: C.dangerBg, color: C.danger, padding: '10px 14px', borderRadius: C.radiusSm, fontSize: 13, marginBottom: 14 }}>
          {actionError}
        </div>
      )}

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
                  const canMarkDeletion = !isAdmin && user?.id === r.initiator && !r.deletion_requested;
                  return (
                    <tr key={r.id} onMouseEnter={(e) => hoverRow(e, true)} onMouseLeave={(e) => hoverRow(e, false)}>
                      <Td bold>{r.number}</Td>
                      <Td><Badge status={r.request_type_name} /></Td>
                      <Td><Badge status={r.status_display} /></Td>
                      <Td muted>{r.initiator_name}</Td>
                      <Td muted>{formatDate(r.created_at)}</Td>
                      <Td>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          {needsInitiatorAction && <Badge status={r.status === 'DRAFT' ? 'Требует отправки' : 'Требует корректировки'} />}
                          {r.pending_my_approval && <Badge status={t('requests.pendingMyApproval')} />}
                          {r.pending_my_issue && <Badge status="Моя выдача" />}
                          {r.deletion_requested && (
                            <>
                              <Badge status="На удаление" style={{ background: C.dangerBg, color: C.danger }} />
                              {isAdmin && r.deletion_requested_by_name && (
                                <span style={{ fontSize: 11, color: C.secondary, alignSelf: 'center' }}>
                                  {r.deletion_requested_by_name}
                                </span>
                              )}
                            </>
                          )}
                        </div>
                      </Td>
                      <Td>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'flex-start' }}>
                          <button onClick={() => navigate(`/requests/${r.id}`)}
                            style={{ background: 'none', border: 'none', color: C.accent, cursor: 'pointer', fontSize: 13, fontWeight: 500 }}>
                            Открыть →
                          </button>
                          {isAdmin && (
                            <button
                              aria-label="Удалить заявку"
                              title={r.deletion_requested ? 'Удалить помеченную заявку' : 'Удалить заявку полностью'}
                              onClick={() => setConfirmAction({ request: r, mode: 'delete' })}
                              style={iconButtonStyle}
                            >
                              <DeleteOutlined />
                            </button>
                          )}
                          {!isAdmin && user?.id === r.initiator && (
                            <button
                              aria-label="Пометить заявку на удаление"
                              title={r.deletion_requested ? 'Заявка уже помечена на удаление' : 'Пометить заявку на удаление'}
                              disabled={!canMarkDeletion}
                              onClick={() => setConfirmAction({ request: r, mode: 'mark' })}
                              style={{
                                ...iconButtonStyle,
                                opacity: canMarkDeletion ? 1 : 0.45,
                                cursor: canMarkDeletion ? 'pointer' : 'not-allowed',
                              }}
                            >
                              <DeleteOutlined />
                            </button>
                          )}
                        </div>
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
      <Popconfirm
        open={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        onConfirm={handleConfirmAction}
        title={
          confirmAction?.mode === 'delete'
            ? `Удалить заявку ${confirmAction.request.number} полностью?`
            : `Пометить заявку ${confirmAction?.request.number} на удаление?`
        }
        confirmText={confirmAction?.mode === 'delete' ? 'Удалить' : 'Пометить'}
      />
    </div>
  );
};

export default RequestsPage;
