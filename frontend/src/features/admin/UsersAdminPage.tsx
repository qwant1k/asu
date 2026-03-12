import React, { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../api/axios';
import type { User, PaginatedResponse } from '../../shared/types';
import {
  C, PageHeader, Th, Td, Badge, Spinner, EmptyState, Modal, Btn,
  InputField, SelectField, hoverRow,
} from '../../shared/ui/primitives';

const ROLE_OPTIONS = [
  { value: 'ADMIN', label: 'Администратор' },
  { value: 'AHS_WORKER', label: 'Работник АХС' },
  { value: 'AHS_HEAD', label: 'Руководитель АХС' },
  { value: 'MOL_WAREHOUSE', label: 'МОЛ по складу' },
  { value: 'MOL_NMA', label: 'МОЛ по НМА' },
  { value: 'FO_HEAD', label: 'Руководитель ФО' },
  { value: 'DEPT_HEAD', label: 'Руководитель подразделения' },
  { value: 'USER', label: 'Рядовой пользователь' },
  { value: 'COMMISSION_MEMBER', label: 'Член Рабочей комиссии' },
  { value: 'IRD_WORKER', label: 'ИРД/ОСМР работник' },
];

const UsersAdminPage: React.FC = () => {
  const { t } = useTranslation();
  const [data, setData] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<User | null>(null);
  const [departments, setDepartments] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  /* edit form fields */
  const [eFirst, setEFirst] = useState('');
  const [eLast, setELast] = useState('');
  const [ePatr, setEPatr] = useState('');
  const [ePos, setEPos] = useState('');
  const [eDept, setEDept] = useState('');
  const [eRole, setERole] = useState('');
  const [eActive, setEActive] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { page, page_size: 20 };
      if (search) params.search = search;
      const res = await api.get<PaginatedResponse<User>>('/users/', { params });
      setData(res.data.results); setTotal(res.data.count);
    } catch { setData([]); } finally { setLoading(false); }
  }, [page, search]);

  const fetchDepartments = useCallback(async () => {
    try { const res = await api.get('/departments/', { params: { page_size: 100 } }); setDepartments((res.data.results || []).map((d: any) => ({ value: d.id, label: d.name }))); } catch { /* */ }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { fetchDepartments(); }, [fetchDepartments]);

  const openEdit = (record: User) => {
    setEditItem(record);
    setEFirst(record.first_name || ''); setELast(record.last_name || '');
    setEPatr(record.patronymic || ''); setEPos(record.position || '');
    setEDept(record.department ? String(record.department) : '');
    setERole(record.role || ''); setEActive(record.is_active);
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!editItem) return;
    setSaving(true);
    try {
      await api.patch(`/users/${editItem.id}/`, {
        first_name: eFirst, last_name: eLast, patronymic: ePatr,
        position: ePos, department: eDept || null, role: eRole, is_active: eActive,
      });
      setModalOpen(false); fetchData();
    } catch { /* */ } finally { setSaving(false); }
  };

  const inputStyle: React.CSSProperties = { padding: '8px 14px', border: `1px solid ${C.inputBorder}`, borderRadius: 6, fontSize: 13, outline: 'none', width: 260 };

  return (
    <div>
      <PageHeader title={t('nav.users')} right={
        <input placeholder={t('common.search')} value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} style={inputStyle} />
      } />
      {loading ? <Spinner /> : (
        <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 10, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
              <thead><tr>
                <Th>{t('auth.username')}</Th><Th>{t('profile.fullName')}</Th><Th>{t('profile.department')}</Th>
                <Th>{t('profile.position')}</Th><Th>{t('profile.role')}</Th><Th>{t('common.active')}</Th><Th></Th>
              </tr></thead>
              <tbody>
                {data.length === 0 ? <tr><td colSpan={7}><EmptyState text={t('common.noData')} /></td></tr> :
                  data.map((r) => (
                    <tr key={r.id} onMouseEnter={(e) => hoverRow(e, true)} onMouseLeave={(e) => hoverRow(e, false)}>
                      <Td bold>{r.username}</Td>
                      <Td>{r.full_name || `${r.last_name} ${r.first_name}`}</Td>
                      <Td muted>{r.department_name}</Td>
                      <Td muted>{r.position}</Td>
                      <Td><Badge status={t(`roles.${r.role}`, r.role)} /></Td>
                      <Td><span style={{ color: r.is_active ? C.success : C.danger, fontWeight: 500, fontSize: 12 }}>{r.is_active ? t('common.yes') : t('common.no')}</span></Td>
                      <Td><button onClick={() => openEdit(r)} style={{ background: 'none', border: 'none', color: C.accent, cursor: 'pointer', fontSize: 13 }}>✏️</button></Td>
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
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={t('common.edit')}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <InputField label={t('profile.firstName')} value={eFirst} onChange={(e) => setEFirst(e.target.value)} />
          <InputField label={t('profile.lastName')} value={eLast} onChange={(e) => setELast(e.target.value)} />
          <InputField label={t('profile.patronymic')} value={ePatr} onChange={(e) => setEPatr(e.target.value)} />
          <InputField label={t('profile.position')} value={ePos} onChange={(e) => setEPos(e.target.value)} />
          <SelectField label={t('profile.department')} value={eDept} onChange={(e) => setEDept(e.target.value)}
            options={[{ value: '', label: '— не выбрано —' }, ...departments]} />
          <SelectField label={t('profile.role')} value={eRole} onChange={(e) => setERole(e.target.value)} options={ROLE_OPTIONS} />
          <div>
            <label style={{ fontSize: 12, fontWeight: 500, color: C.secondary, display: 'block', marginBottom: 4 }}>{t('common.active')}</label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <input type="checkbox" checked={eActive} onChange={(e) => setEActive(e.target.checked)} />
              <span style={{ fontSize: 13 }}>{eActive ? t('common.yes') : t('common.no')}</span>
            </label>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
            <Btn variant="secondary" onClick={() => setModalOpen(false)}>{t('common.cancel')}</Btn>
            <Btn onClick={handleSave} loading={saving}>{t('common.save')}</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default UsersAdminPage;
