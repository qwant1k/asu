import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  EditOutlined,
  EyeOutlined,
  FilterOutlined,
  KeyOutlined,
  LockOutlined,
  PoweroffOutlined,
  ReloadOutlined,
  SaveOutlined,
  UserAddOutlined,
} from '@ant-design/icons';
import api from '../../api/axios';
import type { Department, PaginatedResponse, User, UserRole } from '../../shared/types';
import {
  C, PageHeader, Th, Td, Badge, Spinner, EmptyState, Modal, Btn,
  InputField, SelectField, Drawer, Popconfirm, StatCard, hoverRow, Surface, FilterBar,
} from '../../shared/ui/primitives';

const PAGE_SIZE = 20;
const ROLE_OPTIONS: UserRole[] = [
  'ADMIN', 'AHS_WORKER', 'AHS_HEAD', 'MOL_WAREHOUSE', 'MOL_NMA',
  'FO_HEAD', 'DEPT_HEAD', 'USER', 'COMMISSION_MEMBER', 'IRD_WORKER',
];

const ACTIVE_OPTIONS = [
  { value: '', label: 'Все статусы' },
  { value: 'true', label: 'Активные' },
  { value: 'false', label: 'Отключенные' },
];

const STAFF_OPTIONS = [
  { value: '', label: 'Весь доступ' },
  { value: 'true', label: 'Доступ в админку' },
  { value: 'false', label: 'Без доступа в админку' },
];

const UsersAdminPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [data, setData] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [activeFilter, setActiveFilter] = useState('');
  const [staffFilter, setStaffFilter] = useState('');
  const [joinedAfter, setJoinedAfter] = useState('');
  const [joinedBefore, setJoinedBefore] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [viewItem, setViewItem] = useState<User | null>(null);
  const [editItem, setEditItem] = useState<User | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [supervisors, setSupervisors] = useState<User[]>([]);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [confirmToggle, setConfirmToggle] = useState<User | null>(null);
  const [resetItem, setResetItem] = useState<User | null>(null);
  const [tempPassword, setTempPassword] = useState('');
  const [passwordItem, setPasswordItem] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  const [fUsername, setFUsername] = useState('');
  const [fPassword, setFPassword] = useState('');
  const [fFirst, setFFirst] = useState('');
  const [fLast, setFLast] = useState('');
  const [fPatronymic, setFPatronymic] = useState('');
  const [fEmail, setFEmail] = useState('');
  const [fPhone, setFPhone] = useState('');
  const [fPosition, setFPosition] = useState('');
  const [fDepartment, setFDepartment] = useState('');
  const [fSupervisor, setFSupervisor] = useState('');
  const [fRole, setFRole] = useState<UserRole>('USER');
  const [fActive, setFActive] = useState(true);
  const [fStaff, setFStaff] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = { page, page_size: PAGE_SIZE, ordering: 'last_name' };
      if (search) params.search = search;
      if (roleFilter) params.role = roleFilter;
      if (departmentFilter) params.department = departmentFilter;
      if (activeFilter) params.is_active = activeFilter;
      if (staffFilter) params.is_staff = staffFilter;
      if (joinedAfter) params.date_joined_after = joinedAfter;
      if (joinedBefore) params.date_joined_before = joinedBefore;
      const res = await api.get<PaginatedResponse<User>>('/users/', { params });
      setData(res.data.results || []);
      setTotal(res.data.count || 0);
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [activeFilter, departmentFilter, joinedAfter, joinedBefore, page, roleFilter, search, staffFilter]);

  const fetchReferences = useCallback(async () => {
    try {
      const [deptRes, usersRes] = await Promise.all([
        api.get<PaginatedResponse<Department>>('/departments/', { params: { page_size: 500, ordering: 'name' } }),
        api.get<PaginatedResponse<User>>('/users/', { params: { page_size: 500, is_active: true, ordering: 'last_name' } }),
      ]);
      setDepartments(deptRes.data.results || []);
      setSupervisors(usersRes.data.results || []);
    } catch {
      setDepartments([]);
      setSupervisors([]);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { fetchReferences(); }, [fetchReferences]);

  const stats = useMemo(() => ({
    active: data.filter((u) => u.is_active).length,
    inactive: data.filter((u) => !u.is_active).length,
    admins: data.filter((u) => u.role === 'ADMIN').length,
    staff: data.filter((u) => u.is_staff).length,
  }), [data]);

  const resetForm = (user?: User) => {
    setFUsername(user?.username || '');
    setFPassword('');
    setFFirst(user?.first_name || '');
    setFLast(user?.last_name || '');
    setFPatronymic(user?.patronymic || '');
    setFEmail(user?.email || '');
    setFPhone(user?.phone || '');
    setFPosition(user?.position || '');
    setFDepartment(user?.department ? String(user.department) : '');
    setFSupervisor(user?.supervisor ? String(user.supervisor) : '');
    setFRole(user?.role || 'USER');
    setFActive(user?.is_active ?? true);
    setFStaff(user?.is_staff ?? false);
    setErrorMsg('');
  };

  const openCreate = () => {
    setEditItem(null);
    resetForm();
    setDrawerOpen(true);
  };

  const openEdit = (user: User) => {
    setEditItem(user);
    resetForm(user);
    setDrawerOpen(true);
  };

  const handleSave = async () => {
    if (!fUsername || !fLast || !fFirst || !fRole) {
      setErrorMsg('Заполните логин, фамилию, имя и роль');
      return;
    }
    if (!editItem && fPassword.length < 8) {
      setErrorMsg('Пароль должен быть не короче 8 символов');
      return;
    }

    setSaving(true);
    setErrorMsg('');
    try {
      const payload: Record<string, any> = {
        username: fUsername,
        first_name: fFirst,
        last_name: fLast,
        patronymic: fPatronymic,
        email: fEmail,
        phone: fPhone,
        position: fPosition,
        department: fDepartment ? Number(fDepartment) : null,
        supervisor: fSupervisor ? Number(fSupervisor) : null,
        role: fRole,
        is_active: fActive,
        is_staff: fStaff,
      };
      if (!editItem) payload.password = fPassword;

      if (editItem) {
        await api.patch(`/users/${editItem.id}/`, payload);
      } else {
        await api.post('/users/', payload);
      }

      setDrawerOpen(false);
      await fetchData();
      await fetchReferences();
    } catch (err: any) {
      setErrorMsg(err?.response?.data ? Object.values(err.response.data).flat().join('; ') : t('common.error'));
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (user: User) => {
    try {
      await api.patch(`/users/${user.id}/`, { is_active: !user.is_active });
      await fetchData();
    } catch { /* noop */ }
    setConfirmToggle(null);
  };

  const handleResetPassword = async (user: User) => {
    try {
      const res = await api.post(`/users/${user.id}/reset-password/`);
      setTempPassword(res.data.temp_password);
    } catch { /* noop */ }
    setResetItem(null);
  };

  const openPasswordModal = (user: User) => {
    setPasswordItem(user);
    setNewPassword('');
    setNewPasswordConfirm('');
    setPasswordError('');
  };

  const closePasswordModal = () => {
    setPasswordItem(null);
    setNewPassword('');
    setNewPasswordConfirm('');
    setPasswordError('');
  };

  const handleChangePassword = async () => {
    if (!passwordItem) return;
    if (newPassword.length < 8) {
      setPasswordError('Пароль должен быть не короче 8 символов');
      return;
    }
    if (newPassword !== newPasswordConfirm) {
      setPasswordError('Пароли не совпадают');
      return;
    }

    setChangingPassword(true);
    setPasswordError('');
    try {
      await api.post(`/users/${passwordItem.id}/change-password/`, { password: newPassword });
      closePasswordModal();
    } catch (err: any) {
      setPasswordError(err?.response?.data ? Object.values(err.response.data).flat().join('; ') : t('common.error'));
    } finally {
      setChangingPassword(false);
    }
  };

  const resetFilters = () => {
    setSearch('');
    setRoleFilter('');
    setDepartmentFilter('');
    setActiveFilter('');
    setStaffFilter('');
    setJoinedAfter('');
    setJoinedBefore('');
    setPage(1);
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const roleOptions = ROLE_OPTIONS.map((role) => ({ value: role, label: t(`roles.${role}`, role) }));
  const departmentOptions = departments.map((dept) => ({ value: dept.id, label: `${dept.name} (${dept.code})` }));
  const supervisorOptions = supervisors
    .filter((user) => !editItem || user.id !== editItem.id)
    .map((user) => ({ value: user.id, label: user.full_name || user.username }));
  const hasFilters = !!(search || roleFilter || departmentFilter || activeFilter || staffFilter || joinedAfter || joinedBefore);

  const inputStyle: React.CSSProperties = {
    padding: '8px 12px',
    border: `1px solid ${C.inputBorder}`,
    borderRadius: C.radiusSm,
    fontSize: 13,
    outline: 'none',
    background: C.glassStrong,
  };

  return (
    <div>
      <PageHeader
        title={t('nav.users')}
        right={<Btn onClick={openCreate}><UserAddOutlined /> Создать пользователя</Btn>}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 16 }}>
        <StatCard label="На странице" value={data.length} sub={`Всего найдено: ${total}`} />
        <StatCard label="Активные" value={stats.active} color={C.success} />
        <StatCard label="Отключенные" value={stats.inactive} color={C.danger} />
        <StatCard label="Администраторы" value={stats.admins} />
        <StatCard label="Доступ в админку" value={stats.staff} />
      </div>

      <FilterBar>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <FilterOutlined style={{ color: C.secondary }} />
          <input
            placeholder="Поиск по ФИО, логину, email, телефону"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            style={{ ...inputStyle, minWidth: 260, flex: '1 1 260px' }}
          />
          <select value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }} style={inputStyle}>
            <option value="">Все роли</option>
            {roleOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
          <select value={departmentFilter} onChange={(e) => { setDepartmentFilter(e.target.value); setPage(1); }} style={inputStyle}>
            <option value="">Все подразделения</option>
            {departmentOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
          <select value={activeFilter} onChange={(e) => { setActiveFilter(e.target.value); setPage(1); }} style={inputStyle}>
            {ACTIVE_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
          <select value={staffFilter} onChange={(e) => { setStaffFilter(e.target.value); setPage(1); }} style={inputStyle}>
            {STAFF_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
          <input type="date" value={joinedAfter} onChange={(e) => { setJoinedAfter(e.target.value); setPage(1); }} style={inputStyle} />
          <input type="date" value={joinedBefore} onChange={(e) => { setJoinedBefore(e.target.value); setPage(1); }} style={inputStyle} />
          <Btn variant="secondary" onClick={fetchData}><ReloadOutlined /> Обновить</Btn>
          {hasFilters && <Btn variant="ghost" onClick={resetFilters}>Сбросить</Btn>}
        </div>
      </FilterBar>

      {loading ? <Spinner /> : (
        <Surface>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 1120 }}>
              <thead><tr>
                <Th>Пользователь</Th>
                <Th>Контакты</Th>
                <Th>Подразделение</Th>
                <Th>Руководитель</Th>
                <Th>Роль</Th>
                <Th>Доступ</Th>
                <Th>Последний вход</Th>
                <Th></Th>
              </tr></thead>
              <tbody>
                {data.length === 0 ? <tr><td colSpan={8}><EmptyState text={t('common.noData')} /></td></tr> :
                  data.map((user) => (
                    <tr key={user.id} onMouseEnter={(e) => hoverRow(e, true)} onMouseLeave={(e) => hoverRow(e, false)}>
                      <Td>
                        <button
                          onClick={() => navigate(`/profile/${user.id}`)}
                          style={{ background: 'none', border: 'none', color: C.accent, cursor: 'pointer', padding: 0, fontSize: 13, fontWeight: 700, textAlign: 'left' }}
                        >
                          {user.full_name || user.username}
                        </button>
                        <div style={{ fontSize: 11, color: C.muted, marginTop: 3 }}>{user.username}</div>
                        {user.position && <div style={{ fontSize: 11, color: C.secondary, marginTop: 3 }}>{user.position}</div>}
                      </Td>
                      <Td>
                        <div style={{ fontSize: 12, color: C.text }}>{user.email || '—'}</div>
                        <div style={{ fontSize: 11, color: C.muted, marginTop: 3 }}>{user.phone || '—'}</div>
                      </Td>
                      <Td muted>{user.department_name || '—'}</Td>
                      <Td muted>{user.supervisor_name || '—'}</Td>
                      <Td><Badge status={user.role} /></Td>
                      <Td>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          <Badge status={user.is_active ? 'Активен' : 'Неактивен'} />
                          {user.is_staff && <Badge status="Админка" />}
                          {user.is_superuser && <Badge status="Superuser" style={{ background: C.dangerBg, color: C.danger }} />}
                        </div>
                      </Td>
                      <Td muted>{user.last_login ? new Date(user.last_login).toLocaleString('ru-KZ') : '—'}</Td>
                      <Td>
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                          <button onClick={() => setViewItem(user)} title="Просмотр" style={{ background: 'none', border: 'none', color: C.secondary, cursor: 'pointer', fontSize: 14 }}><EyeOutlined /></button>
                          <button onClick={() => openEdit(user)} title="Редактировать" style={{ background: 'none', border: 'none', color: C.accent, cursor: 'pointer', fontSize: 14 }}><EditOutlined /></button>
                          <button onClick={() => openPasswordModal(user)} title="Изменить пароль" style={{ background: 'none', border: 'none', color: C.teal, cursor: 'pointer', fontSize: 14 }}><LockOutlined /></button>
                          <button onClick={() => setResetItem(user)} title="Сбросить пароль" style={{ background: 'none', border: 'none', color: C.warning, cursor: 'pointer', fontSize: 14 }}><KeyOutlined /></button>
                          <button onClick={() => setConfirmToggle(user)} title={user.is_active ? 'Отключить' : 'Активировать'} style={{ background: 'none', border: 'none', color: user.is_active ? C.danger : C.success, cursor: 'pointer', fontSize: 14 }}><PoweroffOutlined /></button>
                        </div>
                      </Td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
          <div style={{ padding: '12px 16px', fontSize: 12, color: C.muted, borderTop: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <span>{t('common.total')}: {total} · Стр. {page}</span>
            <div style={{ display: 'flex', gap: 6 }}>
              <Btn variant="ghost" disabled={page <= 1} onClick={() => setPage(page - 1)}>Назад</Btn>
              <Btn variant="ghost" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Далее</Btn>
            </div>
          </div>
        </Surface>
      )}

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={editItem ? 'Редактирование пользователя' : 'Новый пользователь'}
        footer={<>
          <Btn variant="secondary" onClick={() => setDrawerOpen(false)}>{t('common.cancel')}</Btn>
          <Btn onClick={handleSave} loading={saving}><SaveOutlined /> {t('common.save')}</Btn>
        </>}
      >
        {errorMsg && <div style={{ background: C.dangerBg, color: C.danger, padding: '8px 12px', borderRadius: C.radiusSm, fontSize: 12, marginBottom: 14 }}>{errorMsg}</div>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <InputField label="Логин *" value={fUsername} onChange={(e) => setFUsername(e.target.value)} disabled={!!editItem} />
          {!editItem && <InputField label="Пароль *" type="password" value={fPassword} onChange={(e) => setFPassword(e.target.value)} />}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <InputField label="Фамилия *" value={fLast} onChange={(e) => setFLast(e.target.value)} />
            <InputField label="Имя *" value={fFirst} onChange={(e) => setFFirst(e.target.value)} />
          </div>
          <InputField label="Отчество" value={fPatronymic} onChange={(e) => setFPatronymic(e.target.value)} />
          <InputField label="Должность" value={fPosition} onChange={(e) => setFPosition(e.target.value)} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <InputField label="Email" type="email" value={fEmail} onChange={(e) => setFEmail(e.target.value)} />
            <InputField label="Телефон" value={fPhone} onChange={(e) => setFPhone(e.target.value)} />
          </div>
          <SelectField label="Подразделение" value={fDepartment} onChange={(e) => setFDepartment(e.target.value)}
            options={[{ value: '', label: '— не выбрано —' }, ...departmentOptions]} />
          <SelectField label="Непосредственный руководитель" value={fSupervisor} onChange={(e) => setFSupervisor(e.target.value)}
            options={[{ value: '', label: '— не выбрано —' }, ...supervisorOptions]} />
          <SelectField label="Роль *" value={fRole} onChange={(e) => setFRole(e.target.value as UserRole)} options={roleOptions} />
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: C.heading }}>
            <input type="checkbox" checked={fActive} onChange={(e) => setFActive(e.target.checked)} />
            Учетная запись активна
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: C.heading }}>
            <input type="checkbox" checked={fStaff} onChange={(e) => setFStaff(e.target.checked)} />
            Разрешить вход в Django admin
          </label>
        </div>
      </Drawer>

      <Modal open={!!viewItem} onClose={() => setViewItem(null)} title="Карточка пользователя">
        {viewItem && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
            {[
              ['ФИО', viewItem.full_name || '—'],
              ['Логин', viewItem.username],
              ['Email', viewItem.email || '—'],
              ['Телефон', viewItem.phone || '—'],
              ['Должность', viewItem.position || '—'],
              ['Подразделение', viewItem.department_name || '—'],
              ['Руководитель', viewItem.supervisor_name || '—'],
              ['Дата регистрации', new Date(viewItem.date_joined).toLocaleString('ru-KZ')],
              ['Последний вход', viewItem.last_login ? new Date(viewItem.last_login).toLocaleString('ru-KZ') : '—'],
            ].map(([label, value]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', gap: 16, borderBottom: `1px solid ${C.rowBorder}`, paddingBottom: 8 }}>
                <span style={{ color: C.secondary }}>{label}</span>
                <span style={{ color: C.heading, fontWeight: 600, textAlign: 'right' }}>{value}</span>
              </div>
            ))}
            <div style={{ display: 'flex', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
              <Badge status={viewItem.role} />
              <Badge status={viewItem.is_active ? 'Активен' : 'Неактивен'} />
              {viewItem.is_staff && <Badge status="Админка" />}
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={!!passwordItem}
        onClose={closePasswordModal}
        title="Изменить пароль"
        footer={<>
          <Btn variant="secondary" onClick={closePasswordModal}>Отмена</Btn>
          <Btn onClick={handleChangePassword} loading={changingPassword}><LockOutlined /> Сохранить пароль</Btn>
        </>}
      >
        {passwordItem && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ fontSize: 13, color: C.secondary }}>
              Пользователь: <span style={{ color: C.heading, fontWeight: 700 }}>{passwordItem.full_name || passwordItem.username}</span>
            </div>
            {passwordError && <div style={{ background: C.dangerBg, color: C.danger, padding: '8px 12px', borderRadius: C.radiusSm, fontSize: 12 }}>{passwordError}</div>}
            <InputField label="Новый пароль *" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            <InputField label="Повторите пароль *" type="password" value={newPasswordConfirm} onChange={(e) => setNewPasswordConfirm(e.target.value)} />
          </div>
        )}
      </Modal>

      <Popconfirm
        open={!!confirmToggle}
        onClose={() => setConfirmToggle(null)}
        onConfirm={() => confirmToggle && handleToggleActive(confirmToggle)}
        title={confirmToggle?.is_active ? 'Отключить учетную запись?' : 'Активировать учетную запись?'}
        confirmText={confirmToggle?.is_active ? 'Отключить' : 'Активировать'}
      />

      <Popconfirm
        open={!!resetItem}
        onClose={() => setResetItem(null)}
        onConfirm={() => resetItem && handleResetPassword(resetItem)}
        title="Сбросить пароль пользователя?"
        confirmText="Сбросить"
      />

      <Modal open={!!tempPassword} onClose={() => setTempPassword('')} title="Новый временный пароль">
        <div style={{ fontSize: 13, color: C.secondary, marginBottom: 8 }}>Передайте пароль пользователю защищенным каналом.</div>
        <div style={{ background: C.accentLight, padding: '12px 16px', borderRadius: C.radiusSm, fontWeight: 800, fontSize: 16, color: C.accent, letterSpacing: 0 }}>
          {tempPassword}
        </div>
      </Modal>
    </div>
  );
};

export default UsersAdminPage;
