import React, { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import type { User, Department, PaginatedResponse, Position, UserRole } from '../../shared/types';
import {
  C, PageHeader, Btn, Th, Td, Badge as UBadge, Drawer, InputField, SelectField,
  Spinner, EmptyState, hoverRow, Popconfirm, Modal, Surface, FilterBar,
} from '../../shared/ui/primitives';

const PAGE_SIZE = 20;
const ROLE_OPTIONS: UserRole[] = [
  'ADMIN', 'AHS_WORKER', 'AHS_HEAD', 'MOL_WAREHOUSE', 'MOL_NMA',
  'FO_HEAD', 'DEPT_HEAD', 'USER', 'COMMISSION_MEMBER', 'IRD_WORKER',
];

const UsersPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [data, setData] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editItem, setEditItem] = useState<User | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [supervisors, setSupervisors] = useState<User[]>([]);
  const [confirmItem, setConfirmItem] = useState<User | null>(null);
  const [resetItem, setResetItem] = useState<User | null>(null);
  const [tempPassword, setTempPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  /* form */
  const [fUsername, setFUsername] = useState('');
  const [fPassword, setFPassword] = useState('');
  const [fLastName, setFLastName] = useState('');
  const [fFirstName, setFFirstName] = useState('');
  const [fPatronymic, setFPatronymic] = useState('');
  const [fEmail, setFEmail] = useState('');
  const [fPhone, setFPhone] = useState('');
  const [fPosition, setFPosition] = useState('');
  const [fDept, setFDept] = useState('');
  const [fRole, setFRole] = useState<string>('USER');
  const [fSupervisor, setFSupervisor] = useState('');

  const fetchDepartments = useCallback(async () => {
    try {
      const res = await api.get('/departments/', { params: { page_size: 100 } });
      setDepartments(res.data.results || []);
    } catch { /* */ }
  }, []);

  const fetchPositions = useCallback(async () => {
    try {
      const res = await api.get<PaginatedResponse<Position>>('/references/positions/', { params: { page_size: 500, is_active: true, ordering: 'name' } });
      setPositions(res.data.results || []);
    } catch { setPositions([]); }
  }, []);

  const fetchSupervisors = useCallback(async () => {
    try {
      const res = await api.get('/users/', { params: { role: 'DEPT_HEAD', page_size: 100 } });
      setSupervisors(res.data.results || []);
    } catch { /* */ }
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = { page, page_size: PAGE_SIZE };
      if (search) params.search = search;
      if (filterDept) params.department = filterDept;
      if (filterRole) params.role = filterRole;
      const res = await api.get<PaginatedResponse<User>>('/users/', { params });
      setData(res.data.results);
      setTotal(res.data.count);
    } catch { /* */ } finally { setLoading(false); }
  }, [page, search, filterDept, filterRole]);

  useEffect(() => { fetchDepartments(); fetchPositions(); fetchSupervisors(); }, [fetchDepartments, fetchPositions, fetchSupervisors]);
  useEffect(() => { fetchData(); }, [fetchData]);

  const resetForm = (u?: User) => {
    setFUsername(u?.username || '');
    setFPassword('');
    setFLastName(u?.last_name || '');
    setFFirstName(u?.first_name || '');
    setFPatronymic(u?.patronymic || '');
    setFEmail(u?.email || '');
    setFPhone(u?.phone || '');
    setFPosition(u?.position_ref ? String(u.position_ref) : '');
    setFDept(u?.department ? String(u.department) : '');
    setFRole(u?.role || 'USER');
    setFSupervisor(u?.supervisor ? String(u.supervisor) : '');
    setErrorMsg('');
  };

  const openCreate = () => { setEditItem(null); resetForm(); setDrawerOpen(true); };
  const openEdit = (r: User) => { setEditItem(r); resetForm(r); setDrawerOpen(true); };

  const handleSave = async () => {
    if (!fUsername || !fLastName || !fFirstName || !fRole) { setErrorMsg('Заполните обязательные поля'); return; }
    if (!editItem && fPassword.length < 8) { setErrorMsg('Пароль минимум 8 символов'); return; }
    setSaving(true); setErrorMsg('');
    try {
      const payload: Record<string, any> = {
        username: fUsername, last_name: fLastName, first_name: fFirstName,
        patronymic: fPatronymic, email: fEmail, phone: fPhone,
        position_ref: fPosition ? Number(fPosition) : null,
        role: fRole,
        department: fDept ? Number(fDept) : null,
        supervisor: fSupervisor ? Number(fSupervisor) : null,
      };
      if (!editItem) payload.password = fPassword;
      if (editItem) {
        await api.patch(`/users/${editItem.id}/`, payload);
      } else {
        await api.post('/users/', payload);
      }
      setDrawerOpen(false);
      fetchData();
    } catch (err: any) {
      const msgs = err?.response?.data ? Object.values(err.response.data).flat().join('; ') : t('common.error');
      setErrorMsg(String(msgs));
    } finally { setSaving(false); }
  };

  const handleToggleActive = async (record: User) => {
    try { await api.patch(`/users/${record.id}/`, { is_active: !record.is_active }); fetchData(); } catch { /* */ }
    setConfirmItem(null);
  };

  const handleResetPassword = async (record: User) => {
    try {
      const res = await api.post(`/users/${record.id}/reset-password/`);
      setTempPassword(res.data.temp_password);
    } catch { /* */ }
    setResetItem(null);
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const deptOpts = [{ value: '', label: t('common.allDepartments') }, ...departments.map((d) => ({ value: String(d.id), label: d.name }))];
  const positionOpts = [{ value: '', label: '— не выбрано —' }, ...positions.map((p) => ({ value: p.id, label: p.name }))];
  const roleOpts = [{ value: '', label: t('common.allRoles') }, ...ROLE_OPTIONS.map((r) => ({ value: r, label: t(`roles.${r}`) }))];

  return (
    <div>
      <PageHeader title={t('nav.users')} right={<Btn onClick={openCreate}>+ {t('common.add')}</Btn>} />

      <FilterBar>
        <input placeholder={t('common.search')} value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          style={{ padding: '8px 14px', border: `1px solid ${C.inputBorder}`, borderRadius: C.radiusSm, fontSize: 13, width: 250, outline: 'none', background: C.glassStrong }}
        />
        <select value={filterDept} onChange={(e) => { setFilterDept(e.target.value); setPage(1); }}
          style={{ padding: '8px 12px', border: `1px solid ${C.inputBorder}`, borderRadius: C.radiusSm, fontSize: 13, color: C.secondary, background: C.glassStrong }}>
          {deptOpts.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <select value={filterRole} onChange={(e) => { setFilterRole(e.target.value); setPage(1); }}
          style={{ padding: '8px 12px', border: `1px solid ${C.inputBorder}`, borderRadius: C.radiusSm, fontSize: 13, color: C.secondary, background: C.glassStrong }}>
          {roleOpts.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </FilterBar>

      <Surface>
        {loading ? <Spinner /> : data.length === 0 ? <EmptyState /> : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
              <thead>
                <tr>
                  <Th>{t('profile.fullName')}</Th>
                  <Th>{t('profile.position')}</Th>
                  <Th>{t('profile.department')}</Th>
                  <Th>{t('profile.role')}</Th>
                  <Th>{t('common.status')}</Th>
                  <Th>{t('common.actions')}</Th>
                </tr>
              </thead>
              <tbody>
                {data.map((r) => (
                  <tr key={r.id} onMouseEnter={(e) => hoverRow(e, true)} onMouseLeave={(e) => hoverRow(e, false)}>
                    <Td>
                      <button onClick={() => navigate(`/profile/${r.id}`)} style={{ background: 'none', border: 'none', color: C.accent, cursor: 'pointer', fontSize: 13, fontWeight: 500, padding: 0 }}>
                        {r.full_name}
                      </button>
                    </Td>
                    <Td muted>{r.position_ref_name || r.position}</Td>
                    <Td muted>{r.department_name}</Td>
                    <Td><UBadge status={r.role} /></Td>
                    <Td><UBadge status={r.is_active ? t('common.active') : t('common.inactive')} /></Td>
                    <Td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => navigate(`/profile/${r.id}`)} title="Просмотр" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13 }}>👁️</button>
                        <button onClick={() => openEdit(r)} title="Редактировать" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13 }}>✏️</button>
                        <button onClick={() => setConfirmItem(r)} title={r.is_active ? 'Деактивировать' : 'Активировать'} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: r.is_active ? C.danger : C.success }}>
                          {r.is_active ? '⛔' : '✅'}
                        </button>
                        <button onClick={() => setResetItem(r)} title="Сбросить пароль" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13 }}>🔑</button>
                      </div>
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
                  padding: '4px 10px', borderRadius: C.radiusSm, border: `1px solid ${C.inputBorder}`,
                  background: page === i + 1 ? `linear-gradient(135deg, ${C.accent}, #0EA5E9)` : C.glassStrong, color: page === i + 1 ? '#fff' : C.text,
                  cursor: 'pointer', fontSize: 12,
                }}>{i + 1}</button>
              ))}
            </div>
          </div>
        )}
      </Surface>

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={editItem ? t('common.edit') : t('common.add')}
        footer={<>
          <Btn variant="secondary" onClick={() => setDrawerOpen(false)}>{t('common.cancel')}</Btn>
          <Btn onClick={handleSave} loading={saving}>{t('common.save')}</Btn>
        </>}
      >
        {errorMsg && <div style={{ background: C.dangerBg, color: C.danger, padding: '8px 12px', borderRadius: C.radiusSm, fontSize: 12, marginBottom: 14 }}>{errorMsg}</div>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <InputField label={t('auth.username') + ' *'} value={fUsername} onChange={(e) => setFUsername(e.target.value)} disabled={!!editItem} />
          {!editItem && <InputField label={t('auth.password') + ' *'} type="password" value={fPassword} onChange={(e) => setFPassword(e.target.value)} />}
          <InputField label={t('profile.lastName') + ' *'} value={fLastName} onChange={(e) => setFLastName(e.target.value)} />
          <InputField label={t('profile.firstName') + ' *'} value={fFirstName} onChange={(e) => setFFirstName(e.target.value)} />
          <InputField label={t('profile.patronymic')} value={fPatronymic} onChange={(e) => setFPatronymic(e.target.value)} />
          <InputField label={t('profile.email')} value={fEmail} onChange={(e) => setFEmail(e.target.value)} />
          <InputField label={t('profile.phone')} value={fPhone} onChange={(e) => setFPhone(e.target.value)} />
          <SelectField label={t('profile.position')} value={fPosition} onChange={(e) => setFPosition(e.target.value)}
            options={positionOpts} />
          <SelectField label={t('profile.department')} value={fDept} onChange={(e) => setFDept(e.target.value)}
            options={[{ value: '', label: '— не выбрано —' }, ...departments.map((d) => ({ value: d.id, label: d.name }))]} />
          <SelectField label={t('profile.role') + ' *'} value={fRole} onChange={(e) => setFRole(e.target.value)}
            options={ROLE_OPTIONS.map((r) => ({ value: r, label: t(`roles.${r}`) }))} />
          <SelectField label={t('profile.supervisor')} value={fSupervisor} onChange={(e) => setFSupervisor(e.target.value)}
            options={[{ value: '', label: '— не выбрано —' }, ...supervisors.map((s) => ({ value: s.id, label: s.full_name }))]} />
        </div>
      </Drawer>

      <Popconfirm open={!!confirmItem} onClose={() => setConfirmItem(null)}
        onConfirm={() => confirmItem && handleToggleActive(confirmItem)}
        title={confirmItem?.is_active ? t('common.confirmDeactivate') : t('common.confirmActivate')} />

      <Popconfirm open={!!resetItem} onClose={() => setResetItem(null)}
        onConfirm={() => resetItem && handleResetPassword(resetItem)}
        title={t('common.confirmResetPassword')} confirmText="Сбросить" />

      <Modal open={!!tempPassword} onClose={() => setTempPassword('')} title={t('common.passwordReset')}>
        <p style={{ fontSize: 13, color: C.text, marginBottom: 8 }}>{t('common.tempPassword')}:</p>
        <div style={{ background: C.accentLight, padding: '12px 16px', borderRadius: C.radiusSm, fontWeight: 700, fontSize: 16, color: C.accent, letterSpacing: 1 }}>
          {tempPassword}
        </div>
      </Modal>
    </div>
  );
};

export default UsersPage;
