import React, { useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { logoutThunk } from '../../features/auth/authSlice';
import { C } from '../ui/primitives';

interface NavItem {
  id: string;
  icon: string;
  label: string;
  path?: string;
  children?: { path: string; label: string }[];
  roles?: string[];
}

const AppLayout: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const role = user?.role || 'USER';
  const isAdmin = role === 'ADMIN';
  const isAHS = ['ADMIN', 'AHS_WORKER', 'AHS_HEAD'].includes(role);
  const isMOL = ['ADMIN', 'MOL_WAREHOUSE', 'MOL_NMA'].includes(role);
  const isReportViewer = ['ADMIN', 'AHS_HEAD', 'AHS_WORKER', 'MOL_WAREHOUSE', 'MOL_NMA'].includes(role);

  const nav: NavItem[] = [
    { id: 'dashboard', icon: '⊞', label: t('nav.dashboard'), path: '/dashboard' },
    { id: 'profile', icon: '👤', label: t('nav.profile'), path: '/profile' },
    {
      id: 'references', icon: '📖', label: t('nav.references'),
      children: [
        { path: '/references/counterparties', label: t('nav.counterparties') },
        { path: '/references/users', label: t('nav.users') },
        { path: '/references/limits', label: t('nav.limits') },
        { path: '/references/request-types', label: t('nav.requestTypes') },
        { path: '/references/assets/tmz', label: t('nav.assetsTmz') },
        { path: '/references/assets/os', label: t('nav.assetsOs') },
        { path: '/references/assets/nma', label: t('nav.assetsNma') },
      ],
    },
    {
      id: 'warehouse', icon: '📦', label: t('nav.warehouse'),
      children: [
        { path: '/warehouse/stock', label: t('nav.stock') },
        { path: '/warehouse/movements', label: t('nav.movements') },
        { path: '/warehouse/assignments', label: t('nav.assignments') },
      ],
    },
    {
      id: 'requests', icon: '📋', label: t('nav.requests'),
      children: [
        { path: '/requests', label: t('nav.requestJournal') },
        { path: '/requests/new', label: t('nav.newRequest') },
      ],
    },
    ...((isMOL || isAHS) ? [{
      id: 'documents', icon: '📄', label: t('nav.documents'),
      children: [
        { path: '/documents/incoming-invoices', label: t('nav.incomingInvoices') },
        { path: '/documents/write-off-acts', label: t('nav.writeOffActs') },
        { path: '/documents/petitions', label: t('nav.petitions') },
        { path: '/documents/protocols', label: t('nav.protocols') },
        { path: '/documents/internal-transfers', label: t('nav.internalTransfers') },
      ],
    }] : []),
    { id: 'inventory', icon: '🪪', label: t('nav.inventory'), path: '/inventory' },
    ...(isReportViewer ? [{
      id: 'reports', icon: '📊', label: t('nav.reports'),
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
      id: 'admin', icon: '⚙', label: t('nav.admin'),
      children: [
        { path: '/admin/users', label: t('nav.users') },
        { path: '/admin/sync-1c', label: t('nav.sync1c') },
      ],
    }] : []),
  ];

  const isActive = (item: NavItem) => {
    if (item.path) return location.pathname === item.path;
    return item.children?.some((c) => location.pathname.startsWith(c.path)) || false;
  };

  const handleLogout = () => {
    dispatch(logoutThunk());
    navigate('/login');
  };

  const initials = user
    ? `${(user.first_name || '')[0] || ''}${(user.last_name || '')[0] || ''}`.toUpperCase() || 'U'
    : 'U';

  const currentDate = new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div style={{ display: 'flex', height: '100vh', background: C.bg }}>
      {/* Sidebar */}
      <aside style={{
        width: 228, background: '#fff', borderRight: `1px solid ${C.border}`,
        display: 'flex', flexDirection: 'column', flexShrink: 0,
      }}>
        {/* Logo */}
        <div style={{ padding: '20px 20px 16px', borderBottom: `1px solid ${C.rowBorder}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 34, height: 34, background: C.accent, borderRadius: 8,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ color: '#fff', fontSize: 14, fontWeight: 700 }}>АУ</span>
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.heading, lineHeight: 1.2 }}>ИС «АСУ»</div>
              <div style={{ fontSize: 11, color: C.muted }}>Учёт активов</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 10px', overflowY: 'auto' }}>
          <div style={{
            fontSize: 11, color: C.muted, padding: '8px 10px 6px',
            letterSpacing: '0.06em', fontWeight: 600, textTransform: 'uppercase',
          }}>
            Разделы
          </div>
          {nav.map((n) => {
            const active = isActive(n);
            const expanded = openGroup === n.id;
            return (
              <div key={n.id}>
                <button
                  onClick={() => {
                    if (n.path) {
                      navigate(n.path);
                      setOpenGroup(null);
                    } else {
                      setOpenGroup(expanded ? null : n.id);
                    }
                  }}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                    padding: '9px 10px', borderRadius: 7, border: 'none',
                    background: active ? C.accentLight : 'transparent',
                    color: active ? C.accent : C.secondary,
                    fontWeight: active ? 600 : 400,
                    fontSize: 13, cursor: 'pointer', textAlign: 'left',
                    transition: 'all 0.12s', marginBottom: 2,
                  }}
                  onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = '#F9FAFB'; }}
                  onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'transparent'; }}
                >
                  <span style={{ fontSize: 15 }}>{n.icon}</span>
                  {n.label}
                  {n.children && (
                    <span style={{ marginLeft: 'auto', fontSize: 10, color: C.muted }}>
                      {expanded ? '▾' : '▸'}
                    </span>
                  )}
                  {n.id === 'requests' && (
                    <span style={{
                      marginLeft: n.children ? 0 : 'auto',
                      background: C.accent, color: '#fff', fontSize: 10, fontWeight: 700,
                      padding: '1px 6px', borderRadius: 10,
                    }}>●</span>
                  )}
                </button>
                {n.children && expanded && (
                  <div style={{ paddingLeft: 26, paddingBottom: 4 }}>
                    {n.children.map((c) => {
                      const childActive = location.pathname === c.path;
                      return (
                        <button
                          key={c.path}
                          onClick={() => navigate(c.path)}
                          style={{
                            width: '100%', display: 'block', padding: '6px 10px',
                            borderRadius: 5, border: 'none', textAlign: 'left',
                            background: childActive ? C.accentLight : 'transparent',
                            color: childActive ? C.accent : C.secondary,
                            fontWeight: childActive ? 600 : 400,
                            fontSize: 12, cursor: 'pointer', marginBottom: 1,
                          }}
                          onMouseEnter={(e) => { if (!childActive) e.currentTarget.style.background = '#F9FAFB'; }}
                          onMouseLeave={(e) => { if (!childActive) e.currentTarget.style.background = 'transparent'; }}
                        >
                          {c.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* User */}
        <div style={{
          padding: '14px 16px', borderTop: `1px solid ${C.rowBorder}`,
          display: 'flex', alignItems: 'center', gap: 10, position: 'relative',
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%', background: C.accentLight,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 700, color: C.accent,
            overflow: 'hidden',
          }}>
            {user?.photo
              ? <img src={user.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: C.heading, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.short_name || user?.username}
            </div>
            <div style={{ fontSize: 11, color: C.muted }}>{user?.position || t(`roles.${role}`)}</div>
          </div>
          <span
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            style={{ fontSize: 16, color: C.muted, cursor: 'pointer' }}
          >⚙</span>

          {userMenuOpen && (
            <>
              <div onClick={() => setUserMenuOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 99 }} />
              <div style={{
                position: 'absolute', bottom: '100%', left: 10, right: 10,
                background: '#fff', borderRadius: 8, border: `1px solid ${C.border}`,
                boxShadow: '0 4px 16px rgba(0,0,0,0.1)', zIndex: 100, overflow: 'hidden',
              }}>
                <button
                  onClick={() => { navigate('/profile'); setUserMenuOpen(false); }}
                  style={{
                    width: '100%', padding: '10px 14px', border: 'none', background: 'transparent',
                    textAlign: 'left', fontSize: 13, color: C.text, cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = C.hoverRow; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                >{t('nav.profile')}</button>
                <div style={{ height: 1, background: C.rowBorder }} />
                <button
                  onClick={() => { handleLogout(); setUserMenuOpen(false); }}
                  style={{
                    width: '100%', padding: '10px 14px', border: 'none', background: 'transparent',
                    textAlign: 'left', fontSize: 13, color: C.danger, cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = C.hoverRow; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                >{t('auth.logout')}</button>
              </div>
            </>
          )}
        </div>
      </aside>

      {/* Content area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Topbar */}
        <header style={{
          height: 56, background: '#fff', borderBottom: `1px solid ${C.border}`,
          display: 'flex', alignItems: 'center', padding: '0 28px', gap: 16, flexShrink: 0,
        }}>
          <div style={{ flex: 1, fontSize: 13, color: C.secondary }}>
            {nav.find((n) => isActive(n))?.label || ''}
          </div>
          <div style={{ fontSize: 12, color: C.muted }}>{currentDate}</div>
          <div style={{ width: 1, height: 20, background: C.border }} />
          <button
            onClick={() => navigate('/profile')}
            style={{
              background: C.rowBorder, border: 'none', borderRadius: 6,
              padding: '7px 14px', fontSize: 12, color: C.text, cursor: 'pointer',
            }}
          >
            🔔 {t('notifications.title')}
          </button>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, overflow: 'auto', padding: 28 }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
