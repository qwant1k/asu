import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  AppstoreOutlined,
  AuditOutlined,
  BarChartOutlined,
  BellOutlined,
  BookOutlined,
  DatabaseOutlined,
  DownOutlined,
  FileTextOutlined,
  FormOutlined,
  InboxOutlined,
  LogoutOutlined,
  RightOutlined,
  SettingOutlined,
  UserOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { logoutThunk } from '../../features/auth/authSlice';
import { C } from '../ui/primitives';
import api from '../../api/axios';
import type { ActiveStockAlert, Notification, PaginatedResponse } from '../types';
import { isManagerUser } from '../auth/access';

interface NavItem {
  id: string;
  icon: React.ReactNode;
  label: string;
  path?: string;
  children?: { path: string; label: string; roles?: string[]; access?: string }[];
  roles?: string[];
  access?: string;
}

const navButtonBase: React.CSSProperties = {
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  border: 'none',
  textAlign: 'left',
  cursor: 'pointer',
  transition: 'background 0.16s ease, color 0.16s ease, transform 0.16s ease',
};

const AppLayout: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationsNext, setNotificationsNext] = useState<string | null>(null);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [stockAlerts, setStockAlerts] = useState<ActiveStockAlert[]>([]);

  const role = user?.role || 'USER';
  const permissions = user?.effective_permissions || [];
  const canAccess = useCallback((access?: string, fallbackRoles: string[] = []) => (
    role === 'ADMIN' || (access ? permissions.includes(access) : false) || fallbackRoles.includes(role)
  ), [permissions, role]);
  const isManager = isManagerUser(user);
  const isAdmin = canAccess('system.admin', ['ADMIN'])
    || canAccess('users.manage')
    || canAccess('access.manage')
    || canAccess('integrations.sync');
  const canManageDocuments = canAccess('documents.manage') || canAccess('requests.approve_ahs');
  const isReportViewer = canAccess('reports.view');

  const nav: NavItem[] = useMemo(() => [
    ...(isManager ? [{ id: 'dashboard', icon: <AppstoreOutlined />, label: t('nav.dashboard'), path: '/dashboard' }] : []),
    { id: 'profile', icon: <UserOutlined />, label: t('nav.profile'), path: '/profile' },
    ...(isManager ? [{
      id: 'references',
      icon: <BookOutlined />,
      label: t('nav.references'),
      children: [
        { path: '/references/counterparties', label: t('nav.counterparties') },
        { path: '/references/contracts', label: t('nav.contracts') },
        { path: '/references/users', label: t('nav.users') },
        { path: '/references/departments', label: t('nav.departments') },
        { path: '/references/limits', label: t('nav.limits') },
        { path: '/references/request-types', label: t('nav.requestTypes') },
        { path: '/references/units-of-measure', label: t('nav.unitsOfMeasure') },
        { path: '/references/warehouses', label: t('nav.warehouses') },
        { path: '/references/positions', label: t('nav.positions') },
        { path: '/references/assets/tmz', label: t('nav.assetsTmz') },
        { path: '/references/assets/os', label: t('nav.assetsOs') },
        { path: '/references/assets/nma', label: t('nav.assetsNma') },
      ],
    }] : []),
    ...(isManager ? [{
      id: 'warehouse',
      icon: <InboxOutlined />,
      label: t('nav.warehouse'),
      children: [
        { path: '/warehouse/stock', label: t('nav.stock') },
        { path: '/warehouse/stock/upload', label: t('nav.uploadStock'), access: 'warehouse.upload' },
        { path: '/warehouse/stock-alerts', label: 'Алармы остатков', access: 'warehouse.upload' },
        { path: '/warehouse/movements', label: t('nav.movements') },
        { path: '/warehouse/assignments', label: t('nav.assignments') },
      ],
    }] : []),
    {
      id: 'requests',
      icon: <FormOutlined />,
      label: t('nav.requests'),
      children: [
        { path: '/requests', label: t('nav.requestJournal') },
        { path: '/requests/new', label: t('nav.newRequest') },
      ],
    },
    ...(canManageDocuments ? [{
      id: 'documents',
      icon: <FileTextOutlined />,
      label: t('nav.documents'),
      children: [
        { path: '/documents/incoming-invoices', label: t('nav.incomingInvoices') },
        { path: '/documents/write-off-acts', label: t('nav.writeOffActs') },
        { path: '/documents/petitions', label: t('nav.petitions') },
        { path: '/documents/protocols', label: t('nav.protocols') },
        { path: '/documents/internal-transfers', label: t('nav.internalTransfers') },
      ],
    }] : []),
    ...(isManager ? [{ id: 'inventory', icon: <AuditOutlined />, label: t('nav.inventory'), path: '/inventory' }] : []),
    ...(isReportViewer ? [{
      id: 'reports',
      icon: <BarChartOutlined />,
      label: t('nav.reports'),
      children: [
        { path: '/reports/tmz-stock', label: t('reports.tmzStock') },
        { path: '/reports/os-balance', label: t('reports.osBalance') },
        { path: '/reports/os-stock', label: t('reports.osStock') },
        { path: '/reports/nma-balance', label: t('reports.nmaBalance') },
        { path: '/reports/movement', label: t('reports.movement') },
        { path: '/reports/write-offs', label: t('reports.writeOffs') },
        { path: '/reports/request-journal', label: t('reports.requestJournal') },
        { path: '/reports/inventory-report', label: t('reports.inventoryReport') },
      ],
    }] : []),
    ...(isAdmin ? [{
      id: 'admin',
      icon: <SettingOutlined />,
      label: t('nav.admin'),
      children: [
        { path: '/admin/users', label: t('nav.users'), access: 'users.manage' },
        { path: '/admin/access', label: 'Права доступа', access: 'access.manage' },
        { path: '/admin/sync-1c', label: t('nav.sync1c'), access: 'integrations.sync' },
      ],
    }] : []),
  ], [canManageDocuments, isAdmin, isManager, isReportViewer, t]);

  const isActive = (item: NavItem) => {
    if (item.path) return location.pathname === item.path;
    return item.children?.some((c) => location.pathname.startsWith(c.path)) || false;
  };

  const activeItem = nav.find((n) => isActive(n));
  const activeGroupId = activeItem?.children ? activeItem.id : null;

  const handleLogout = () => {
    dispatch(logoutThunk());
    navigate('/login');
  };

  const initials = user
    ? `${(user.first_name || '')[0] || ''}${(user.last_name || '')[0] || ''}`.toUpperCase() || 'U'
    : 'U';

  const currentDate = new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });

  const fetchNotifications = useCallback(async (append = false, nextUrl?: string | null) => {
    if (!user) return;
    setNotificationsLoading(true);
    try {
      const res = await api.get<PaginatedResponse<Notification>>(nextUrl || '/notifications/', {
        params: nextUrl ? undefined : { page_size: 20, ordering: '-created_at' },
      });
      setNotifications((prev) => {
        if (!append) return res.data.results;
        const seen = new Set(prev.map((item) => item.id));
        return [...prev, ...res.data.results.filter((item) => !seen.has(item.id))];
      });
      setNotificationsNext(res.data.next);
    } catch {
      if (!append) {
        setNotifications([]);
        setNotificationsNext(null);
      }
    } finally {
      setNotificationsLoading(false);
    }
  }, [user]);

  const fetchUnreadCount = useCallback(async () => {
    if (!user) return;
    try {
      const res = await api.get<{ count: number }>('/notifications/unread-count/');
      setUnreadCount(res.data.count || 0);
    } catch {
      setUnreadCount(0);
    }
  }, [user]);

  const fetchStockAlerts = useCallback(async () => {
    if (!user) return;
    try {
      const res = await api.get<ActiveStockAlert[]>('/assets/stock-alerts/active/');
      setStockAlerts(res.data || []);
    } catch {
      setStockAlerts([]);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return undefined;
    fetchNotifications(false);
    fetchUnreadCount();
    fetchStockAlerts();

    const timer = window.setInterval(() => {
      fetchNotifications(false);
      fetchUnreadCount();
      fetchStockAlerts();
    }, 60000);
    return () => window.clearInterval(timer);
  }, [fetchNotifications, fetchStockAlerts, fetchUnreadCount, user]);

  const markAllNotificationsRead = async () => {
    try {
      await api.post('/notifications/mark-all-read/');
      setNotifications((prev) => prev.map((item) => ({ ...item, is_read: true })));
      setUnreadCount(0);
    } catch { /* */ }
  };

  const getNotificationPath = (notification: Notification) => {
    if (!notification.related_object_id) return '';
    if (notification.related_model === 'assetrequest') return `/requests/${notification.related_object_id}`;
    if (notification.related_model === 'warehousestock') return '/warehouse/stock';
    if (notification.related_model === 'incominginvoice') return `/documents/incoming-invoices/${notification.related_object_id}`;
    if (notification.related_model === 'writeoffact') return `/documents/write-off-acts/${notification.related_object_id}`;
    if (notification.related_model === 'petition') return `/documents/petitions/${notification.related_object_id}`;
    if (notification.related_model === 'commissionprotocol') return `/documents/protocols/${notification.related_object_id}`;
    if (notification.related_model === 'internaltransferinvoice') return `/documents/internal-transfers/${notification.related_object_id}`;
    return '';
  };

  const openNotification = async (notification: Notification) => {
    if (!notification.is_read) {
      try {
        await api.patch(`/notifications/${notification.id}/read/`);
        setNotifications((prev) => prev.map((item) => (
          item.id === notification.id ? { ...item, is_read: true } : item
        )));
        setUnreadCount((count) => Math.max(0, count - 1));
      } catch { /* */ }
    }

    const path = getNotificationPath(notification);
    if (path) {
      setNotificationsOpen(false);
      navigate(path);
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'linear-gradient(135deg, #E7ECF4 0%, #F7F9FC 48%, #EEF6FF 100%)' }}>
      <aside
        className="app-sidebar-graphite"
        style={{
          width: 304,
          background: 'linear-gradient(180deg, rgba(17, 24, 39, 0.98) 0%, rgba(31, 41, 55, 0.96) 58%, rgba(15, 23, 42, 0.98) 100%)',
          backdropFilter: 'blur(22px) saturate(1.35)',
          WebkitBackdropFilter: 'blur(22px) saturate(1.35)',
          borderRight: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
          boxShadow: '16px 0 46px rgba(15, 23, 42, 0.2)',
          zIndex: 2,
        }}
      >
        <div style={{ padding: '20px 18px 16px' }}>
          <button
            onClick={() => navigate(isManager ? '/dashboard' : '/requests')}
            style={{
              ...navButtonBase,
              padding: 0,
              background: 'transparent',
              gap: 12,
            }}
          >
            <div
              style={{
                width: 38,
                height: 38,
                background: 'linear-gradient(145deg, #38BDF8, #2563EB)',
                borderRadius: 14,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 14px 30px rgba(37, 99, 235, 0.34)',
              }}
            >
              <DatabaseOutlined style={{ color: '#fff', fontSize: 17 }} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: C.heading, lineHeight: 1.2 }}>ИС «АСУ»</div>
              <div style={{ fontSize: 12, color: C.secondary, marginTop: 2 }}>Учет активов</div>
            </div>
          </button>
        </div>

        <nav className="app-sidebar-nav" style={{ flex: 1, padding: '10px 14px 16px', overflowY: 'auto', minHeight: 0 }}>
          <div style={{ fontSize: 11, color: C.muted, padding: '8px 10px 10px', fontWeight: 700, letterSpacing: 0 }}>
            Меню
          </div>
          {nav.map((n) => {
            const active = isActive(n);
            const expanded = openGroup === n.id || (openGroup === null && activeGroupId === n.id);
            const iconColor = active ? C.accentCyan : '#94A3B8';
            return (
              <div key={n.id} style={{ marginBottom: 6 }}>
                <button
                  className="app-nav-button"
                  onClick={() => {
                    if (n.path) {
                      navigate(n.path);
                      setOpenGroup(null);
                    } else {
                      setOpenGroup(expanded ? '' : n.id);
                    }
                  }}
                  style={{
                    ...navButtonBase,
                    minHeight: 46,
                    padding: '12px 13px',
                    borderRadius: 16,
                    background: active ? 'rgba(56, 189, 248, 0.14)' : 'transparent',
                    color: active ? '#F8FAFC' : '#CBD5E1',
                    border: active ? '1px solid rgba(125, 211, 252, 0.22)' : '1px solid transparent',
                    fontWeight: active ? 700 : 600,
                    fontSize: 13,
                    position: 'relative',
                    boxShadow: active ? 'inset 0 1px 0 rgba(255, 255, 255, 0.08)' : 'none',
                  }}
                >
                  <span style={{ width: 22, display: 'inline-flex', justifyContent: 'center', color: iconColor, fontSize: 16 }}>
                    {n.icon}
                  </span>
                  <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.label}</span>
                  {n.children && (
                    <span style={{ color: active ? C.accentCyan : '#64748B', fontSize: 10, display: 'inline-flex' }}>
                      {expanded ? <DownOutlined /> : <RightOutlined />}
                    </span>
                  )}
                </button>

                {n.children && (
                  <div
                    style={{
                      maxHeight: expanded ? 720 : 0,
                      opacity: expanded ? 1 : 0,
                      overflow: 'hidden',
                      transition: 'max-height 0.32s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.24s ease',
                      paddingLeft: 34,
                    }}
                  >
                    <div style={{ padding: '6px 0 7px' }}>
                      {n.children
                        .filter((c) => (!c.roles || c.roles.includes(role)) && (!c.access || canAccess(c.access)))
                        .map((c) => {
                          const childActive = location.pathname === c.path;
                          return (
                            <button
                              key={c.path}
                              className="app-nav-child"
                              onClick={() => navigate(c.path)}
                              style={{
                                ...navButtonBase,
                                minHeight: 36,
                                padding: '9px 10px',
                                borderRadius: 13,
                                background: childActive ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                                color: childActive ? C.accentCyan : '#94A3B8',
                                fontWeight: childActive ? 700 : 500,
                                fontSize: 12,
                              }}
                            >
                              {c.label}
                            </button>
                          );
                        })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div style={{ padding: 12, borderTop: '1px solid rgba(255, 255, 255, 0.08)', position: 'relative' }}>
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            style={{
              ...navButtonBase,
              gap: 10,
              padding: 10,
              borderRadius: 16,
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 13,
                background: 'rgba(56, 189, 248, 0.16)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 12,
                fontWeight: 800,
                color: C.accentCyan,
                overflow: 'hidden',
                flexShrink: 0,
              }}
            >
              {user?.photo
                ? <img src={user.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : initials}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 750, color: C.heading, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.short_name || user?.username}
              </div>
              <div style={{ fontSize: 11, color: C.muted, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.position || t(`roles.${role}`)}
              </div>
            </div>
            <DownOutlined style={{ color: C.muted, fontSize: 10 }} />
          </button>

          {userMenuOpen && (
            <>
              <div onClick={() => setUserMenuOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 99 }} />
              <div
                className="ui-modal"
                style={{
                  position: 'absolute',
                  bottom: 'calc(100% + 8px)',
                  left: 12,
                  right: 12,
                  background: 'rgba(255, 255, 255, 0.92)',
                  backdropFilter: 'blur(20px) saturate(1.5)',
                  WebkitBackdropFilter: 'blur(20px) saturate(1.5)',
                  borderRadius: 14,
                  border: `1px solid ${C.border}`,
                  boxShadow: C.shadow,
                  zIndex: 100,
                  overflow: 'hidden',
                }}
              >
                <button
                  onClick={() => { navigate('/profile'); setUserMenuOpen(false); }}
                  className="app-menu-action"
                  style={{ ...navButtonBase, padding: '11px 13px', background: 'transparent', fontSize: 13, color: C.text, fontWeight: 600 }}
                >
                  <UserOutlined />
                  {t('nav.profile')}
                </button>
                <div style={{ height: 1, background: C.rowBorder }} />
                <button
                  onClick={() => { handleLogout(); setUserMenuOpen(false); }}
                  className="app-menu-action"
                  style={{ ...navButtonBase, padding: '11px 13px', background: 'transparent', fontSize: 13, color: C.danger, fontWeight: 650 }}
                >
                  <LogoutOutlined />
                  {t('auth.logout')}
                </button>
              </div>
            </>
          )}
        </div>
      </aside>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <header
          style={{
            height: 68,
            background: 'rgba(255, 255, 255, 0.74)',
            backdropFilter: 'blur(24px) saturate(1.35)',
            WebkitBackdropFilter: 'blur(24px) saturate(1.35)',
            borderBottom: `1px solid ${C.border}`,
            display: 'flex',
            alignItems: 'center',
            padding: '0 30px',
            gap: 16,
            flexShrink: 0,
            zIndex: 1,
            boxShadow: '0 1px 0 rgba(255, 255, 255, 0.7), 0 12px 28px rgba(15, 23, 42, 0.04)',
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, color: C.secondary, fontWeight: 750 }}>{activeItem?.label || ''}</div>
          </div>
          <div style={{ fontSize: 12, color: C.muted }}>{currentDate}</div>
          <div style={{ position: 'relative' }}>
            <button
              className="ui-icon-button"
              onClick={() => {
                const nextOpen = !notificationsOpen;
                setNotificationsOpen(nextOpen);
                if (nextOpen) {
                  fetchNotifications(false);
                  fetchUnreadCount();
                }
              }}
              title={t('notifications.title')}
              style={{
                width: 36,
                height: 36,
                borderRadius: 14,
                background: notificationsOpen ? 'rgba(56, 189, 248, 0.16)' : 'rgba(255, 255, 255, 0.78)',
                border: `1px solid ${notificationsOpen ? 'rgba(14, 165, 233, 0.42)' : C.border}`,
                color: notificationsOpen ? C.accent : C.text,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
              }}
            >
              <BellOutlined />
              {unreadCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: -5,
                    right: -5,
                    minWidth: 18,
                    height: 18,
                    padding: '0 5px',
                    borderRadius: 9,
                    background: C.danger,
                    color: C.white,
                    border: `2px solid ${C.white}`,
                    fontSize: 10,
                    fontWeight: 800,
                    lineHeight: '14px',
                  }}
                >
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>

            {notificationsOpen && (
              <>
                <div onClick={() => setNotificationsOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 90 }} />
                <div
                  className="ui-modal"
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 10px)',
                    right: 0,
                    width: 380,
                    maxWidth: 'calc(100vw - 48px)',
                    background: 'rgba(255, 255, 255, 0.92)',
                    backdropFilter: 'blur(20px) saturate(1.5)',
                    WebkitBackdropFilter: 'blur(20px) saturate(1.5)',
                    border: `1px solid ${C.border}`,
                    borderRadius: 22,
                    boxShadow: C.shadow,
                    zIndex: 91,
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 12,
                      padding: '13px 14px',
                      borderBottom: `1px solid ${C.rowBorder}`,
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 800, color: C.heading }}>{t('notifications.title')}</div>
                      <div style={{ fontSize: 11, color: C.secondary, marginTop: 2 }}>
                        Непрочитанные: {unreadCount}
                      </div>
                    </div>
                    <button
                      onClick={markAllNotificationsRead}
                      disabled={unreadCount === 0}
                      style={{
                        border: 'none',
                        background: 'transparent',
                        color: unreadCount > 0 ? C.accent : C.muted,
                        cursor: unreadCount > 0 ? 'pointer' : 'default',
                        fontSize: 12,
                        fontWeight: 700,
                      }}
                    >
                      Прочитать все
                    </button>
                  </div>

                  <div style={{ maxHeight: 420, overflowY: 'auto' }}>
                    {notifications.length === 0 && !notificationsLoading ? (
                      <div style={{ padding: 18, fontSize: 13, color: C.secondary, textAlign: 'center' }}>
                        {t('notifications.noNotifications')}
                      </div>
                    ) : (
                      notifications.map((notification) => {
                        const path = getNotificationPath(notification);
                        return (
                          <button
                            key={notification.id}
                            onClick={() => openNotification(notification)}
                            style={{
                              width: '100%',
                              display: 'block',
                              border: 'none',
                              borderBottom: `1px solid ${C.rowBorder}`,
                              background: notification.is_read ? 'rgba(255, 255, 255, 0.72)' : 'rgba(234, 243, 255, 0.92)',
                              cursor: path || !notification.is_read ? 'pointer' : 'default',
                              textAlign: 'left',
                              padding: '12px 14px',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                              <span
                                style={{
                                  width: 8,
                                  height: 8,
                                  borderRadius: 4,
                                  background: notification.is_read ? C.border : C.accentCyan,
                                  marginTop: 5,
                                  flexShrink: 0,
                                }}
                              />
                              <span style={{ minWidth: 0, flex: 1 }}>
                                <span style={{ display: 'block', fontSize: 13, fontWeight: 750, color: C.heading }}>
                                  {notification.title}
                                </span>
                                {notification.body && (
                                  <span style={{ display: 'block', fontSize: 12, color: C.secondary, marginTop: 4, lineHeight: 1.35 }}>
                                    {notification.body}
                                  </span>
                                )}
                                <span style={{ display: 'block', fontSize: 11, color: C.muted, marginTop: 7 }}>
                                  {new Date(notification.created_at).toLocaleString('ru-KZ')}
                                </span>
                              </span>
                            </div>
                          </button>
                        );
                      })
                    )}

                    {notificationsLoading && (
                      <div style={{ padding: 14, fontSize: 12, color: C.secondary, textAlign: 'center' }}>
                        Загрузка...
                      </div>
                    )}

                    {notificationsNext && !notificationsLoading && (
                      <button
                        onClick={() => fetchNotifications(true, notificationsNext)}
                        style={{
                          width: '100%',
                          border: 'none',
                          background: C.surfaceSoft,
                          color: C.accent,
                          cursor: 'pointer',
                          padding: '11px 14px',
                          fontSize: 12,
                          fontWeight: 750,
                        }}
                      >
                        Показать еще
                      </button>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </header>

        <main style={{ flex: 1, overflow: 'auto', padding: 30 }}>
          <div style={{ maxWidth: 1480, margin: '0 auto' }}>
            {stockAlerts.length > 0 && (
              <div
                className="stock-alert-banner"
                style={{
                  marginBottom: 18,
                  borderRadius: C.radiusLg,
                  border: '1px solid rgba(220, 38, 38, 0.34)',
                  background: 'linear-gradient(135deg, rgba(254, 242, 242, 0.98), rgba(255, 228, 230, 0.92))',
                  boxShadow: '0 18px 44px rgba(220, 38, 38, 0.16)',
                  overflow: 'hidden',
                  animation: 'stock-alert-pulse 1.8s ease-in-out infinite',
                }}
              >
                {stockAlerts.slice(0, 3).map((alert, index) => (
                  <div
                    key={alert.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 14,
                      padding: '14px 16px',
                      borderTop: index === 0 ? 'none' : '1px solid rgba(220, 38, 38, 0.18)',
                    }}
                  >
                    <div
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: 14,
                        background: C.danger,
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        boxShadow: '0 10px 22px rgba(220, 38, 38, 0.28)',
                      }}
                    >
                      <WarningOutlined />
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ color: C.danger, fontSize: 13, fontWeight: 850, lineHeight: 1.3 }}>
                        {alert.message}
                      </div>
                      <div style={{ color: '#991B1B', fontSize: 11, marginTop: 4 }}>
                        Остаток: {alert.current_quantity} {alert.unit_of_measure} · Порог: {alert.threshold_quantity}
                        {alert.warehouse_name ? ` · ${alert.warehouse_name}` : ''}
                      </div>
                    </div>
                    <button
                      onClick={() => navigate(alert.action_url)}
                      style={{
                        border: `1px solid ${C.danger}`,
                        background: C.danger,
                        color: '#fff',
                        borderRadius: C.radiusSm,
                        padding: '9px 13px',
                        fontSize: 12,
                        fontWeight: 800,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      Добавить на склад
                    </button>
                  </div>
                ))}
                {stockAlerts.length > 3 && (
                  <div style={{ padding: '0 16px 12px', color: C.danger, fontSize: 12, fontWeight: 750 }}>
                    Еще критических позиций: {stockAlerts.length - 3}
                  </div>
                )}
              </div>
            )}
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
