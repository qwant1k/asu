import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  AppstoreOutlined,
  AuditOutlined,
  BarChartOutlined,
  BookOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  DatabaseOutlined,
  DoubleLeftOutlined,
  DoubleRightOutlined,
  FileTextOutlined,
  FormOutlined,
  InboxOutlined,
  LogoutOutlined,
  RightOutlined,
  SettingOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { Tooltip } from 'antd';
import { useReducedMotion } from 'framer-motion';
import { motion, AnimatePresence } from '../ui/animated/animations';
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { logoutThunk } from '../../features/auth/authSlice';
import { C } from '../ui/primitives';
import NotificationBell from '../ui/NotificationBell';
import api from '../../api/axios';
import type { ActiveStockAlert, Notification, PaginatedResponse } from '../types';
import { isManagerUser } from '../auth/access';
import {
  AppBreadcrumbItem,
  BreadcrumbContext,
  resolveBreadcrumbs,
} from '../navigation/breadcrumbs';

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

const HeaderDateTime: React.FC = () => {
  const [currentDateTime, setCurrentDateTime] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setCurrentDateTime(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const currentDate = currentDateTime.toLocaleDateString('ru-RU', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
  const currentTime = currentDateTime.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return (
    <div
      className="header-date-time"
      aria-label={`${currentDate}, ${currentTime}`}
      title={`${currentDate}, ${currentTime}`}
    >
      <CalendarOutlined className="header-date-time__calendar" />
      <div className="header-date-time__content">
        <span className="header-date-time__date">{currentDate}</span>
        <time className="header-date-time__time" dateTime={currentDateTime.toISOString()}>
          <ClockCircleOutlined />
          {currentTime}
        </time>
      </div>
    </div>
  );
};

const AppLayout: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const [flyout, setFlyout] = useState<string | null>(null);
  const [flyoutPos, setFlyoutPos] = useState<{ top: number; left: number } | null>(null);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationsNext, setNotificationsNext] = useState<string | null>(null);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [stockAlerts, setStockAlerts] = useState<ActiveStockAlert[]>([]);
  const [pageBreadcrumbTitle, setPageBreadcrumbTitle] = useState('');
  const [customBreadcrumbItems, setCustomBreadcrumbItems] = useState<AppBreadcrumbItem[] | null>(null);

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
        { path: '/admin/stock-upload', label: t('nav.uploadStock'), access: 'system.admin' },
        { path: '/admin/trash', label: 'Удалённые объекты', access: 'system.admin' },
      ],
    }] : []),
  ], [canManageDocuments, isAdmin, isManager, isReportViewer, t]);

  const isActive = (item: NavItem) => {
    if (item.path) return location.pathname === item.path;
    return item.children?.some((c) => location.pathname.startsWith(c.path)) || false;
  };

  const resolvedBreadcrumbs = useMemo(
    () => resolveBreadcrumbs(location.pathname),
    [location.pathname],
  );
  const routeBreadcrumbItems = useMemo(() => {
    if (customBreadcrumbItems?.length) return customBreadcrumbItems;
    if (!resolvedBreadcrumbs.usePageTitle || !pageBreadcrumbTitle) return resolvedBreadcrumbs.items;
    return resolvedBreadcrumbs.items.map((item, index) => (
      index === resolvedBreadcrumbs.items.length - 1
        ? { ...item, label: pageBreadcrumbTitle }
        : item
    ));
  }, [customBreadcrumbItems, pageBreadcrumbTitle, resolvedBreadcrumbs]);
  const homePath = isManager ? '/dashboard' : '/requests';
  const headerBreadcrumbItems = useMemo(() => {
    const hasRoot = routeBreadcrumbItems[0]?.label === 'ИС «АСУ»';
    return hasRoot
      ? routeBreadcrumbItems
      : [{ label: 'ИС «АСУ»', path: homePath }, ...routeBreadcrumbItems];
  }, [homePath, routeBreadcrumbItems]);
  const breadcrumbContextValue = useMemo(() => ({
    setPageTitle: setPageBreadcrumbTitle,
    setCustomItems: setCustomBreadcrumbItems,
  }), []);
  const reduced = useReducedMotion();

  const handleLogout = () => {
    dispatch(logoutThunk());
    navigate('/login');
  };

  const handleCollapsedSidebarClick = (event: React.MouseEvent<HTMLElement>) => {
    if (sidebarExpanded) return;
    const target = event.target as HTMLElement;
    if (target.closest('[data-sidebar-preserve-action="true"]')) return;
    setSidebarExpanded(true);
  };

  const initials = user
    ? `${(user.first_name || '')[0] || ''}${(user.last_name || '')[0] || ''}`.toUpperCase() || 'U'
    : 'U';

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

  const flyoutItem = flyout ? nav.find((n) => n.id === flyout) : null;

  return (
    <BreadcrumbContext.Provider value={breadcrumbContextValue}>
    <div style={{ display: 'flex', height: '100vh', background: 'var(--bg, #F7F8FA)' }}>
      <aside
        onClick={handleCollapsedSidebarClick}
        style={{
          width: sidebarExpanded ? 220 : 64,
          background: '#1B2A3D',
          display: 'flex',
          flexDirection: 'column',
          alignItems: sidebarExpanded ? 'stretch' : 'center',
          flexShrink: 0,
          zIndex: 30,
          paddingTop: 12,
          paddingBottom: 12,
          transition: 'width 0.25s ease-out',
          overflow: 'hidden',
          boxSizing: 'border-box',
          cursor: sidebarExpanded ? 'default' : 'pointer',
        }}
      >
        <div
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: sidebarExpanded ? 'flex-start' : 'center',
            padding: '0 12px',
            marginBottom: 8,
            boxSizing: 'border-box',
            gap: 10,
          }}
        >
          <Tooltip title={!sidebarExpanded ? 'ИС «АСУ»' : undefined} placement="right" mouseEnterDelay={0.3}>
            <button
              onClick={() => {
                if (sidebarExpanded) {
                  navigate(isManager ? '/dashboard' : '/requests');
                } else {
                  setSidebarExpanded(true);
                }
              }}
              aria-label="ИС «АСУ»"
              style={{
                width: 36,
                height: 36,
                border: 'none',
                borderRadius: 8,
                background: '#0E7C86',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              <DatabaseOutlined style={{ color: '#fff', fontSize: 17 }} />
            </button>
          </Tooltip>
          {sidebarExpanded && (
            <motion.span
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: reduced ? 0 : 0.15, ease: [0, 0, 0.2, 1] }}
              style={{ fontSize: 15, fontWeight: 700, color: '#FFFFFF', whiteSpace: 'nowrap' }}
            >
              ИС «АСУ»
            </motion.span>
          )}
        </div>

        <nav
          className="icon-sidebar-nav"
          style={{
            flex: 1,
            marginTop: 12,
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: sidebarExpanded ? 'stretch' : 'center',
            gap: 4,
            overflowY: 'auto',
            overflowX: 'hidden',
            minHeight: 0,
            boxSizing: 'border-box',
            padding: '0 12px',
          }}
        >
          {nav.map((n) => {
            const active = isActive(n);
            return (
              <div key={n.id} style={{ position: 'relative', width: '100%', display: 'flex', justifyContent: sidebarExpanded ? 'flex-start' : 'center', boxSizing: 'border-box' }}>
                {/* Активный пункт — левая полоса 3px акцентным цветом */}
                {active && (
                  <motion.span
                    layoutId="nav-active-bar"
                    transition={reduced ? { duration: 0 } : { duration: 0.2, ease: 'easeOut' }}
                    style={{
                      position: 'absolute',
                      left: 0,
                      top: 9,
                      width: 3,
                      height: 22,
                      borderRadius: '0 2px 2px 0',
                      background: '#2FB3BD',
                    }}
                  />
                )}
                <Tooltip title={!sidebarExpanded ? n.label : undefined} placement="right" mouseEnterDelay={0.3}>
                  <button
                    className="icon-nav-btn"
                    data-sidebar-preserve-action="true"
                    aria-label={n.label}
                    onClick={(e) => {
                      if (n.path) {
                        navigate(n.path);
                        setFlyout(null);
                        setFlyoutPos(null);
                      } else if (flyout === n.id) {
                        setFlyout(null);
                        setFlyoutPos(null);
                      } else {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setFlyoutPos({ top: rect.top, left: rect.right + 12 });
                        setFlyout(n.id);
                      }
                    }}
                    style={{
                      position: 'relative',
                      width: sidebarExpanded ? '100%' : 40,
                      height: 40,
                      border: 'none',
                      borderRadius: 8,
                      background: active ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                      color: active ? '#FFFFFF' : 'rgba(255, 255, 255, 0.62)',
                      fontSize: 18,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: sidebarExpanded ? 'flex-start' : 'center',
                      cursor: 'pointer',
                      paddingLeft: sidebarExpanded ? 12 : 0,
                      paddingRight: sidebarExpanded ? 28 : 0,
                      gap: sidebarExpanded ? 10 : 0,
                    }}
                  >
                    {n.icon}
                    {sidebarExpanded && (
                      <motion.span
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: reduced ? 0 : 0.15, ease: [0, 0, 0.2, 1] }}
                        style={{ flex: 1, minWidth: 0, fontSize: 13, fontWeight: active ? 600 : 500, color: active ? '#FFFFFF' : 'rgba(255, 255, 255, 0.62)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                      >
                        {n.label}
                      </motion.span>
                    )}
                    {n.children && (
                      <motion.span
                        animate={{ rotate: flyout === n.id ? 90 : 0 }}
                        transition={{ duration: reduced ? 0 : 0.15, ease: [0, 0, 0.2, 1] }}
                        style={{
                          position: 'absolute',
                          right: 12,
                          top: 0,
                          bottom: 0,
                          display: 'flex',
                          alignItems: 'center',
                          fontSize: 11,
                          color: active ? '#FFFFFF' : 'rgba(255, 255, 255, 0.72)',
                          pointerEvents: 'none',
                        }}
                      >
                        <RightOutlined />
                      </motion.span>
                    )}
                  </button>
                </Tooltip>

                {/* Флайаут подменю группы */}
                <AnimatePresence>
                  {flyout === n.id && n.children && (
                    <>
                      <div
                        data-sidebar-preserve-action="true"
                        onClick={() => { setFlyout(null); setFlyoutPos(null); }}
                        style={{ position: 'fixed', inset: 0, zIndex: 40 }}
                      />
                      <motion.div
                        data-sidebar-preserve-action="true"
                        initial={reduced ? { opacity: 1 } : { opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={reduced ? { opacity: 0 } : { opacity: 0, x: -6 }}
                        transition={{ duration: 0.15, ease: 'easeOut' }}
                        style={{
                          position: 'fixed',
                          top: flyoutPos?.top ?? 0,
                          left: flyoutPos?.left ?? 0,
                          minWidth: 224,
                          background: '#FFFFFF',
                          border: `1px solid ${C.border}`,
                          borderRadius: 10,
                          boxShadow: '0 8px 24px rgba(15, 23, 42, 0.12)',
                          padding: 6,
                          zIndex: 41,
                        }}
                      >
                        <div style={{ padding: '7px 10px 6px', fontSize: 11, fontWeight: 600, color: C.secondary, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          {n.label}
                        </div>
                        {n.children
                          .filter((c) => (!c.roles || c.roles.includes(role)) && (!c.access || canAccess(c.access)))
                          .map((c) => {
                            const childActive = location.pathname === c.path;
                            return (
                              <button
                                key={c.path}
                                className="app-menu-action"
                                onClick={() => { navigate(c.path); setFlyout(null); }}
                                style={{
                                  ...navButtonBase,
                                  minHeight: 34,
                                  padding: '8px 10px',
                                  borderRadius: 7,
                                  background: childActive ? C.accentLight : 'transparent',
                                  color: childActive ? C.accent : C.text,
                                  fontWeight: childActive ? 600 : 400,
                                  fontSize: 13,
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {c.label}
                              </button>
                            );
                          })}
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </nav>

        <div
          style={{
            width: '100%',
            display: 'flex',
            justifyContent: sidebarExpanded ? 'flex-end' : 'center',
            padding: '0 12px',
            marginBottom: 8,
            boxSizing: 'border-box',
          }}
        >
          <button
            className="icon-nav-btn"
            onClick={() => setSidebarExpanded((v) => !v)}
            aria-label={sidebarExpanded ? 'Свернуть меню' : 'Развернуть меню'}
            style={{
              width: sidebarExpanded ? '100%' : 32,
              height: 32,
              border: 'none',
              borderRadius: 8,
              background: sidebarExpanded ? 'rgba(255, 255, 255, 0.06)' : 'transparent',
              color: 'rgba(255, 255, 255, 0.62)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: sidebarExpanded ? 'flex-start' : 'center',
              cursor: 'pointer',
              paddingLeft: sidebarExpanded ? 12 : 0,
              gap: sidebarExpanded ? 10 : 0,
              transition: 'width 0.25s ease-out, background-color 0.12s ease-out',
            }}
          >
            {sidebarExpanded ? <DoubleLeftOutlined /> : <DoubleRightOutlined />}
            {sidebarExpanded && (
              <motion.span
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: reduced ? 0 : 0.15, ease: [0, 0, 0.2, 1] }}
                style={{ fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap' }}
              >
                Свернуть
              </motion.span>
            )}
          </button>
        </div>

        <div
          style={{
            position: 'relative',
            marginTop: 0,
            width: '100%',
            padding: '0 12px',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            alignItems: sidebarExpanded ? 'stretch' : 'center',
          }}
        >
          <Tooltip title={!sidebarExpanded ? (user?.short_name || user?.username) : undefined} placement="right" mouseEnterDelay={0.3}>
            <div
              aria-label="Текущий пользователь"
              style={{
                width: sidebarExpanded ? '100%' : 40,
                height: 40,
                border: 'none',
                borderRadius: 8,
                background: 'transparent',
                cursor: 'default',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: sidebarExpanded ? 'flex-start' : 'center',
                padding: 0,
                paddingLeft: sidebarExpanded ? 12 : 0,
                paddingRight: sidebarExpanded ? 12 : 0,
                gap: sidebarExpanded ? 10 : 0,
                transition: 'width 0.25s ease-out, background-color 0.12s ease-out',
              }}
            >
              <span
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 8,
                  background: 'rgba(255, 255, 255, 0.12)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 11,
                  fontWeight: 600,
                  color: '#FFFFFF',
                  overflow: 'hidden',
                  flexShrink: 0,
                }}
              >
                {user?.photo
                  ? <img src={user.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : initials}
              </span>
              {sidebarExpanded && (
                <motion.span
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: reduced ? 0 : 0.15, ease: [0, 0, 0.2, 1] }}
                  style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
                >
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#FFFFFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {user?.short_name || user?.username}
                  </span>
                  <span style={{ fontSize: 11, color: 'rgba(255, 255, 255, 0.58)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {user?.position || t(`roles.${role}`)}
                  </span>
                </motion.span>
              )}
            </div>
          </Tooltip>

          <button
            onClick={handleLogout}
            data-sidebar-preserve-action="true"
            aria-label={t('auth.logout')}
            className="icon-nav-btn"
            style={{
              width: sidebarExpanded ? '100%' : 32,
              height: 32,
              border: 'none',
              borderRadius: 8,
              background: 'transparent',
              color: 'rgba(255, 255, 255, 0.62)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: sidebarExpanded ? 'flex-start' : 'center',
              cursor: 'pointer',
              paddingLeft: sidebarExpanded ? 12 : 0,
              paddingRight: sidebarExpanded ? 12 : 0,
              gap: sidebarExpanded ? 10 : 0,
              fontSize: 13,
              fontWeight: 500,
              transition: 'width 0.25s ease-out, background-color 0.12s ease-out',
            }}
          >
            <LogoutOutlined />
            {sidebarExpanded && <span style={{ whiteSpace: 'nowrap' }}>{t('auth.logout')}</span>}
          </button>
        </div>
      </aside>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <header
          style={{
            height: 56,
            background: '#FFFFFF',
            borderBottom: `1px solid ${C.border}`,
            display: 'flex',
            alignItems: 'center',
            padding: '0 20px',
            gap: 16,
            flexShrink: 0,
            zIndex: 20,
          }}
        >
          {/* Название текущего модуля — breadcrumb в верхней панели */}
          <nav aria-label="Хлебные крошки" className="header-breadcrumbs">
            {headerBreadcrumbItems.map((item, index) => {
              const isCurrent = index === headerBreadcrumbItems.length - 1;
              return (
                <React.Fragment key={`${item.path || 'current'}-${index}`}>
                  {index > 0 && <RightOutlined className="header-breadcrumb-separator" />}
                  <button
                    type="button"
                    className={`header-breadcrumb-link${isCurrent ? ' is-current' : ''}`}
                    onClick={() => navigate(item.path || location.pathname)}
                    aria-current={isCurrent ? 'page' : undefined}
                    title={item.label}
                  >
                    {item.label}
                  </button>
                </React.Fragment>
              );
            })}
          </nav>
          <HeaderDateTime />
          <div style={{ position: 'relative' }}>
            <NotificationBell
              unreadCount={unreadCount}
              open={notificationsOpen}
              title={t('notifications.title')}
              onClick={() => {
                const nextOpen = !notificationsOpen;
                setNotificationsOpen(nextOpen);
                if (nextOpen) {
                  fetchNotifications(false);
                  fetchUnreadCount();
                }
              }}
            />

            <AnimatePresence>
            {notificationsOpen && (
              <>
                <div onClick={() => setNotificationsOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 90 }} />
                <motion.div
                  initial={reduced ? { opacity: 1 } : { opacity: 0, y: -6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={reduced ? { opacity: 0 } : { opacity: 0, y: -6, scale: 0.98 }}
                  transition={{ duration: 0.18, ease: 'easeOut' }}
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 10px)',
                    right: 0,
                    width: 380,
                    maxWidth: 'calc(100vw - 48px)',
                    background: '#FFFFFF',
                    border: `1px solid ${C.border}`,
                    borderRadius: 10,
                    boxShadow: '0 8px 24px rgba(15, 23, 42, 0.12)',
                    zIndex: 91,
                    overflow: 'hidden',
                    transformOrigin: 'top right',
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
                </motion.div>
              </>
            )}
          </AnimatePresence>
          </div>
        </header>

        <main style={{ flex: 1, overflow: 'auto', padding: '16px 20px' }}>
          <div style={{ maxWidth: 1600, margin: '0 auto' }}>
            {stockAlerts.length > 0 && (
              <div
                style={{
                  marginBottom: 18,
                  borderRadius: C.radiusLg,
                  border: `1px solid ${C.dangerBg}`,
                  background: C.dangerBg,
                  overflow: 'hidden',
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
                      borderTop: index === 0 ? 'none' : `1px solid ${C.dangerBg}`,
                    }}
                  >
                    <div
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: 8,
                        background: C.danger,
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <WarningOutlined />
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ color: C.danger, fontSize: 13, fontWeight: 600, lineHeight: 1.3 }}>
                        {alert.message}
                      </div>
                      <div style={{ color: C.text, fontSize: 11, marginTop: 4 }}>
                        Остаток: {alert.current_quantity} {alert.unit_of_measure} · Порог: {alert.threshold_quantity}
                        {alert.warehouse_name ? ` · ${alert.warehouse_name}` : ''}
                      </div>
                    </div>
                    <button
                      onClick={() => navigate(alert.action_url)}
                      className="ui-button ui-button-danger"
                      style={{
                        border: `1px solid ${C.danger}`,
                        background: '#fff',
                        color: C.danger,
                        borderRadius: C.radiusSm,
                        padding: '9px 13px',
                        fontSize: 12,
                        fontWeight: 500,
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
    </BreadcrumbContext.Provider>
  );
};

export default AppLayout;
