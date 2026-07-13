import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PlusOutlined } from '@ant-design/icons';
import { useAppSelector } from '../../app/hooks';
import api from '../../api/axios';
import type {
  AssetRequest, Notification, WarehouseStock, StockMovement, PaginatedResponse,
} from '../../shared/types';
import AssetLink from '../../shared/components/AssetLink';
import {
  C, StatCard, PageHeader, Btn, Panel, EmptyState, Spinner, Badge, Th, Td, hoverRow,
} from '../../shared/ui/primitives';

const LOW_STOCK_THRESHOLD = 5;
const IN_PROGRESS_STATUSES = ['PENDING_SUPERVISOR', 'APPROVED_SUPERVISOR', 'APPROVED_MOL', 'APPROVED_AHS_HEAD'];
const APPROVER_ROLES = ['DEPT_HEAD', 'MOL_WAREHOUSE', 'MOL_NMA', 'AHS_HEAD', 'ADMIN'];
const WAREHOUSE_ROLES = ['MOL_WAREHOUSE', 'MOL_NMA'];

const RequestRow: React.FC<{ r: AssetRequest; sub: string; onClick: () => void }> = ({ r, sub, onClick }) => (
  <div onClick={onClick} style={{
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '10px 0', borderBottom: `1px solid ${C.rowBorder}`, cursor: 'pointer',
  }}>
    <div>
      <div style={{ fontSize: 13, fontWeight: 500, color: C.heading }}>№{r.number}</div>
      <div style={{ fontSize: 12, color: C.muted }}>{sub}</div>
    </div>
    <Badge status={r.status_display} />
  </div>
);

const ViewAllLink: React.FC<{ onClick: () => void; label: string }> = ({ onClick, label }) => (
  <button onClick={onClick} style={{
    background: 'none', border: 'none', color: C.accent, cursor: 'pointer',
    fontSize: 12, textAlign: 'left', padding: '8px 0 0', fontWeight: 500,
  }}>{label}</button>
);

const DashboardPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const role = user?.role || '';
  const permissions = user?.effective_permissions || [];

  const isApprover = APPROVER_ROLES.includes(role)
    || permissions.includes('requests.approve_department')
    || permissions.includes('requests.approve_ahs');
  const isWarehouseKeeper = WAREHOUSE_ROLES.includes(role)
    || permissions.includes('warehouse.view')
    || permissions.includes('warehouse.upload');

  const [loading, setLoading] = useState(true);

  const [myRequestsTotal, setMyRequestsTotal] = useState(0);
  const [myInProgress, setMyInProgress] = useState(0);
  const [myApproved, setMyApproved] = useState(0);
  const [myRecent, setMyRecent] = useState<AssetRequest[]>([]);

  const [pendingApprovalCount, setPendingApprovalCount] = useState(0);
  const [pendingApprovalList, setPendingApprovalList] = useState<AssetRequest[]>([]);

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const [inventoryCount, setInventoryCount] = useState(0);

  const [stockValue, setStockValue] = useState(0);
  const [lowStockItems, setLowStockItems] = useState<WarehouseStock[]>([]);
  const [recentIssues, setRecentIssues] = useState<StockMovement[]>([]);

  const fetchMyRequests = useCallback(async () => {
    if (!user) return;
    try {
      const res = await api.get<PaginatedResponse<AssetRequest>>('/requests/', {
        params: { initiator: user.id, page_size: 100, ordering: '-created_at' },
      });
      setMyRequestsTotal(res.data.count);
      setMyRecent(res.data.results.slice(0, 5));
      setMyInProgress(res.data.results.filter((r) => IN_PROGRESS_STATUSES.includes(r.status)).length);
      setMyApproved(res.data.results.filter((r) => r.status === 'APPROVED').length);
    } catch { /* */ }
  }, [user]);

  const fetchPendingApproval = useCallback(async () => {
    if (!isApprover) return;
    try {
      const res = await api.get<PaginatedResponse<AssetRequest>>('/requests/', {
        params: { pending_my_approval: 'true', page_size: 5, ordering: '-created_at' },
      });
      setPendingApprovalCount(res.data.count);
      setPendingApprovalList(res.data.results);
    } catch { /* */ }
  }, [isApprover]);

  const fetchNotifications = useCallback(async () => {
    try {
      const [listRes, countRes] = await Promise.all([
        api.get<PaginatedResponse<Notification>>('/notifications/', { params: { page_size: 5, ordering: '-created_at' } }),
        api.get<{ count: number }>('/notifications/unread-count/'),
      ]);
      setNotifications(listRes.data.results);
      setUnreadCount(countRes.data.count);
    } catch { /* */ }
  }, []);

  const fetchInventory = useCallback(async () => {
    if (isWarehouseKeeper) return;
    try {
      const res = await api.get('/inventory/inventory-cards/', { params: { card_type: 'summary' } });
      setInventoryCount(res.data.total_count || 0);
    } catch { /* */ }
  }, [isWarehouseKeeper]);

  const fetchWarehouse = useCallback(async () => {
    if (!isWarehouseKeeper) return;
    try {
      const [tmzRes, osRes, issuesRes] = await Promise.all([
        api.get('/reports/tmz-stock/'),
        api.get('/reports/os-stock/'),
        api.get<PaginatedResponse<StockMovement>>('/assets/movements/', {
          params: { movement_type: 'ISSUE', ordering: '-performed_at', page_size: 5 },
        }),
      ]);
      const stock: WarehouseStock[] = [...(tmzRes.data.data || []), ...(osRes.data.data || [])];
      const total = stock.reduce((sum, s) => sum + Number(s.total_amount || 0), 0);
      setStockValue(total);
      setLowStockItems(
        stock.filter((s) => Number(s.quantity) <= LOW_STOCK_THRESHOLD)
          .sort((a, b) => Number(a.quantity) - Number(b.quantity))
          .slice(0, 5)
      );
      setRecentIssues(issuesRes.data.results);
    } catch { /* */ }
  }, [isWarehouseKeeper]);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    Promise.all([
      fetchMyRequests(), fetchPendingApproval(), fetchNotifications(), fetchInventory(), fetchWarehouse(),
    ]).finally(() => setLoading(false));
  }, [user, fetchMyRequests, fetchPendingApproval, fetchNotifications, fetchInventory, fetchWarehouse]);

  if (loading) return <Spinner />;

  return (
    <div>
      <PageHeader
        title={t('dashboard.welcome', { name: user?.first_name || user?.username })}
        subtitle={t('dashboard.subtitle')}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 16, marginBottom: 16 }}>
        <div style={{ cursor: 'pointer' }} onClick={() => navigate('/requests')}>
          <StatCard label={t('dashboard.myRequests')} value={myRequestsTotal} sub="Всего заявок" />
        </div>
        <div style={{ cursor: 'pointer' }} onClick={() => navigate('/requests')}>
          <StatCard label={t('dashboard.myInProgress')} value={myInProgress} sub="В процессе согласования" />
        </div>
        <div style={{ cursor: 'pointer' }} onClick={() => navigate('/requests')}>
          <StatCard label={t('dashboard.approvedReady')} value={myApproved} sub="К получению" color={myApproved > 0 ? C.success : undefined} />
        </div>
        <div style={{ cursor: 'pointer' }} onClick={() => navigate('/profile')}>
          <StatCard label={t('dashboard.unreadNotifications')} value={unreadCount} sub="Уведомления" color={unreadCount > 0 ? C.accent : undefined} />
        </div>
      </div>

      {isApprover && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: isWarehouseKeeper ? 'repeat(auto-fit, minmax(210px, 1fr))' : 'minmax(210px, 360px)',
          gap: 16, marginBottom: 24,
        }}>
          <div style={{ cursor: 'pointer' }} onClick={() => navigate('/requests')}>
            <StatCard label={t('dashboard.pendingApprovals')} value={pendingApprovalCount} sub="Требуют решения" color={pendingApprovalCount > 0 ? C.danger : undefined} />
          </div>
          {isWarehouseKeeper && (
            <>
              <div style={{ cursor: 'pointer' }} onClick={() => navigate('/warehouse/stock')}>
                <StatCard label={t('dashboard.stockValue')} value={stockValue.toLocaleString('ru-KZ')} sub="ТМЗ + ОС на складе" />
              </div>
              <div style={{ cursor: 'pointer' }} onClick={() => navigate('/warehouse/stock')}>
                <StatCard label={t('dashboard.lowStock')} value={lowStockItems.length} sub="Требуют внимания" color={lowStockItems.length > 0 ? C.warning : undefined} />
              </div>
            </>
          )}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20, marginBottom: isWarehouseKeeper ? 20 : 0 }}>
        <Panel
          title={t('dashboard.myRecentRequests')}
          titleRight={<Btn onClick={() => navigate('/requests/new')}><PlusOutlined /> {t('requests.createNew')}</Btn>}
        >
          {myRecent.length === 0 ? <EmptyState text={t('common.noData')} /> : (
            <div>
              {myRecent.map((r) => (
                <RequestRow key={r.id} r={r} sub={r.request_type_name} onClick={() => navigate(`/requests/${r.id}`)} />
              ))}
              <ViewAllLink onClick={() => navigate('/requests')} label={t('dashboard.viewAll')} />
            </div>
          )}
        </Panel>

        {isApprover ? (
          <Panel
            title={t('dashboard.approvalQueue')}
            titleRight={pendingApprovalCount > 0 ? <Badge status={String(pendingApprovalCount)} style={{ background: C.dangerBg, color: C.danger }} /> : undefined}
          >
            {pendingApprovalList.length === 0 ? <EmptyState text={t('dashboard.noApprovals')} /> : (
              <div>
                {pendingApprovalList.map((r) => (
                  <RequestRow key={r.id} r={r} sub={r.initiator_name} onClick={() => navigate(`/requests/${r.id}`)} />
                ))}
                <ViewAllLink onClick={() => navigate('/requests')} label={t('dashboard.viewAll')} />
              </div>
            )}
          </Panel>
        ) : (
          <Panel title={t('dashboard.recentNotifications')}>
            {notifications.length === 0 ? <EmptyState text={t('notifications.noNotifications')} /> : (
              <div>
                {notifications.map((n) => (
                  <div key={n.id} style={{ padding: '10px 0', borderBottom: `1px solid ${C.rowBorder}` }}>
                    <div style={{ fontSize: 13, fontWeight: n.is_read ? 400 : 600, color: C.heading }}>{n.title}</div>
                    <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{new Date(n.created_at).toLocaleString('ru-KZ')}</div>
                  </div>
                ))}
              </div>
            )}
          </Panel>
        )}
      </div>

      {isWarehouseKeeper && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
          <Panel title={t('dashboard.recentIssues')} noPad>
            {recentIssues.length === 0 ? <div style={{ padding: 20 }}><EmptyState text={t('dashboard.noRecentIssues')} /></div> : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead><tr><Th>{t('common.date')}</Th><Th>{t('common.asset')}</Th><Th right>{t('references.quantity')}</Th></tr></thead>
                <tbody>
                  {recentIssues.map((m) => (
                    <tr key={m.id} onMouseEnter={(e) => hoverRow(e, true)} onMouseLeave={(e) => hoverRow(e, false)}>
                      <Td muted>{new Date(m.performed_at).toLocaleDateString('ru-KZ')}</Td>
                      <Td><AssetLink assetId={m.asset}>{m.asset_name}</AssetLink></Td>
                      <Td right>{m.quantity}</Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Panel>

          <Panel title={t('dashboard.lowStock')} noPad>
            {lowStockItems.length === 0 ? <div style={{ padding: 20 }}><EmptyState text={t('dashboard.noLowStock')} /></div> : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead><tr><Th>{t('common.asset')}</Th><Th right>{t('references.quantity')}</Th><Th>{t('references.unit')}</Th></tr></thead>
                <tbody>
                  {lowStockItems.map((s) => (
                    <tr key={s.id} onMouseEnter={(e) => hoverRow(e, true)} onMouseLeave={(e) => hoverRow(e, false)}>
                      <Td><AssetLink assetId={s.asset}>{s.asset_name}</AssetLink></Td>
                      <Td right style={{ color: C.warning, fontWeight: 600 }}>{s.quantity}</Td>
                      <Td muted>{s.unit_of_measure}</Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Panel>
        </div>
      )}

      {!isApprover && !isWarehouseKeeper && (
        <Panel
          title={t('dashboard.myInventory')}
          titleRight={<ViewAllLink onClick={() => navigate('/inventory')} label={t('dashboard.viewAll')} />}
        >
          <div style={{ fontSize: 28, fontWeight: 700, color: C.heading }}>{inventoryCount}</div>
          <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>{t('dashboard.itemsInCard')}</div>
        </Panel>
      )}
    </div>
  );
};

export default DashboardPage;
