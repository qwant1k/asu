import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../api/axios';
import { C, PageHeader, Th, Td, Badge, Btn, Spinner, EmptyState, hoverRow, Surface } from '../../shared/ui/primitives';
import AssetLink from '../../shared/components/AssetLink';
import { formatApiDate } from '../../shared/utils/date';
import { useAppSelector } from '../../app/hooks';

const ASSET_TYPE_OPTIONS = [
  { value: '', label: 'Все типы' },
  { value: 'TMZ', label: 'ТМЗ' },
  { value: 'OS', label: 'ОС' },
  { value: 'NMA', label: 'НМА' },
];
const STATUS_OPTIONS = [
  { value: '', label: 'Все статусы' },
  { value: 'ACTIVE', label: 'Активно' },
  { value: 'TRANSFERRED', label: 'Передано' },
  { value: 'WRITTEN_OFF', label: 'Списано' },
  { value: 'RELEASED', label: 'Снято с закрепления' },
];
interface MolOption { id: number; name: string; department_name: string; }

const AssignmentsPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAppSelector((state) => state.auth);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [assetType, setAssetType] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [molFilter, setMolFilter] = useState('');
  const [mols, setMols] = useState<MolOption[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [actionError, setActionError] = useState('');
  const isAdmin = Boolean(
    user?.is_superuser
    || user?.role === 'ADMIN'
    || (user?.effective_permissions || []).includes('system.admin'),
  );

  useEffect(() => {
    api.get<MolOption[]>('/inventory/mols/')
      .then((res) => setMols(res.data || []))
      .catch(() => setMols([]));
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const params: any = { page, page_size: 20, ordering: '-assigned_at' };
        if (search) params.search = search;
        if (assetType) params.asset_type = assetType;
        if (statusFilter) params.status = statusFilter;
        if (molFilter) params.mol_id = molFilter;
        const res = await api.get('/assets/assignments/', { params });
        setData(res.data.results || []); setTotal(res.data.count || 0);
      } catch { setData([]); } finally { setLoading(false); }
    })();
  }, [page, search, assetType, statusFilter, molFilter, refreshKey]);

  const releaseAssignment = async (assignmentId: number) => {
    const reason = window.prompt('Причина снятия закрепления:', '');
    if (reason === null) return;
    if (!window.confirm('Снять актив с сотрудника? История будет сохранена.')) return;
    setActionError('');
    try {
      await api.post(`/assets/assignments/${assignmentId}/release/`, { reason });
      setRefreshKey((value) => value + 1);
    } catch (err: any) {
      setActionError(err?.response?.data?.detail || t('common.error'));
    }
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
      <PageHeader title={t('nav.assignments')} right={
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <input placeholder={t('common.search')} value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} style={{ ...inputStyle, width: 220 }} />
          <select value={molFilter} onChange={(e) => { setMolFilter(e.target.value); setPage(1); }} style={{ ...inputStyle, width: 240 }}>
            <option value="">Все МОЛ</option>
            {mols.map((mol) => (
              <option key={mol.id} value={mol.id}>
                {mol.name}{mol.department_name ? ` · ${mol.department_name}` : ''}
              </option>
            ))}
          </select>
          <select value={assetType} onChange={(e) => { setAssetType(e.target.value); setPage(1); }} style={inputStyle}>
            {ASSET_TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} style={inputStyle}>
            {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      } />
      {actionError && (
        <div style={{ background: C.dangerBg, color: C.danger, padding: '10px 14px', borderRadius: C.radiusSm, marginBottom: 12 }}>
          {actionError}
        </div>
      )}
      {loading ? <Spinner /> : (
        <Surface>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 820 }}>
              <thead><tr>
                <Th>{t('common.asset')}</Th><Th>{t('common.code')}</Th><Th>{t('references.assignedTo')}</Th><Th>Склад</Th>
                <Th right>{t('references.quantity')}</Th><Th>{t('common.status')}</Th><Th>{t('common.date')}</Th>
                {isAdmin && <Th>Действия</Th>}
              </tr></thead>
              <tbody>
                {data.length === 0 ? <tr><td colSpan={isAdmin ? 8 : 7}><EmptyState text={t('common.noData')} /></td></tr> :
                  data.map((r: any) => (
                    <tr key={r.id} onMouseEnter={(e) => hoverRow(e, true)} onMouseLeave={(e) => hoverRow(e, false)}>
                      <Td><AssetLink assetId={r.asset}>{r.asset_name}</AssetLink></Td><Td muted>{r.asset_code}</Td><Td>{r.user_name}</Td><Td muted>{r.warehouse_name || r.location || '—'}</Td>
                      <Td right>{r.quantity}</Td><Td><Badge status={r.status_display} /></Td>
                      <Td muted>{formatApiDate(r.assigned_at)}</Td>
                      {isAdmin && (
                        <Td>
                          {r.status === 'ACTIVE' ? (
                            <Btn variant="danger" onClick={() => releaseAssignment(r.id)}>Снять</Btn>
                          ) : '—'}
                        </Td>
                      )}
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

export default AssignmentsPage;
