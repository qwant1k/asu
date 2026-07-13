import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import api from '../../api/axios';
import type { Department, PaginatedResponse, Warehouse } from '../../shared/types';
import {
  C, PageHeader, Btn, Th, Td, Badge, Modal, InputField, TextAreaField, SelectField, Spinner, EmptyState, hoverRow, Popconfirm, Surface, FilterBar,
} from '../../shared/ui/primitives';

const PAGE_SIZE = 20;

const WarehousesPage: React.FC = () => {
  const { t } = useTranslation();
  const [data, setData] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [departments, setDepartments] = useState<Department[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Warehouse | null>(null);
  const [deleteItem, setDeleteItem] = useState<Warehouse | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const [fName, setFName] = useState('');
  const [fCode, setFCode] = useState('');
  const [fAddress, setFAddress] = useState('');
  const [fDept, setFDept] = useState('');
  const [fActive, setFActive] = useState(true);

  const fetchDepartments = useCallback(async () => {
    try {
      const res = await api.get<PaginatedResponse<Department>>('/departments/', { params: { page_size: 100, ordering: 'name' } });
      setDepartments(res.data.results || []);
    } catch { /* */ }
  }, []);

  useEffect(() => { fetchDepartments(); }, [fetchDepartments]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = { page, page_size: PAGE_SIZE };
      if (search) params.search = search;
      if (filterDept) params.department = filterDept;
      const res = await api.get<PaginatedResponse<Warehouse>>('/references/warehouses/', { params });
      setData(res.data.results || []);
      setTotal(res.data.count);
    } catch { /* ignore */ } finally { setLoading(false); }
  }, [page, search, filterDept]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const resetForm = (item?: Warehouse) => {
    setFName(item?.name || '');
    setFCode(item?.code || '');
    setFAddress(item?.address || '');
    setFDept(item?.department ? String(item.department) : '');
    setFActive(item ? item.is_active : true);
    setErrorMsg('');
  };

  const openCreate = () => { setEditItem(null); resetForm(); setModalOpen(true); };
  const openEdit = (r: Warehouse) => { setEditItem(r); resetForm(r); setModalOpen(true); };

  const handleSave = async () => {
    if (!fName.trim()) { setErrorMsg('Заполните наименование'); return; }
    setSaving(true); setErrorMsg('');
    try {
      const payload = { name: fName.trim(), code: fCode.trim(), address: fAddress.trim(), department: fDept ? Number(fDept) : null, is_active: fActive };
      if (editItem) {
        await api.patch(`/references/warehouses/${editItem.id}/`, payload);
      } else {
        await api.post('/references/warehouses/', payload);
      }
      setModalOpen(false);
      fetchData();
    } catch (err: any) {
      const msgs = err?.response?.data ? Object.values(err.response.data).flat().join('; ') : t('common.error');
      setErrorMsg(String(msgs));
    } finally { setSaving(false); }
  };

  const handleDelete = async (r: Warehouse) => {
    try { await api.delete(`/references/warehouses/${r.id}/`); fetchData(); } catch { /* ignore */ }
    setDeleteItem(null);
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const deptOpts = [{ value: '', label: t('common.allDepartments') }, ...departments.map((d) => ({ value: String(d.id), label: d.name }))];

  return (
    <div>
      <PageHeader title={t('nav.warehouses')} right={<Btn onClick={openCreate}><PlusOutlined /> {t('common.add')}</Btn>} />

      <FilterBar>
        <input
          placeholder={t('common.search')}
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          style={{ padding: '8px 14px', border: `1px solid ${C.inputBorder}`, borderRadius: C.radiusSm, fontSize: 13, width: 300, outline: 'none', background: C.glassStrong }}
        />
        <select value={filterDept} onChange={(e) => { setFilterDept(e.target.value); setPage(1); }}
          style={{ padding: '8px 12px', border: `1px solid ${C.inputBorder}`, borderRadius: C.radiusSm, fontSize: 13, color: C.secondary, background: C.glassStrong }}>
          {deptOpts.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </FilterBar>

      <Surface>
        {loading ? <Spinner /> : data.length === 0 ? <EmptyState /> : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 800 }}>
              <thead>
                <tr>
                  <Th>{t('common.name')}</Th>
                  <Th>{t('common.code')}</Th>
                  <Th>{t('references.department') || 'Подразделение'}</Th>
                  <Th>{t('references.address') || 'Адрес'}</Th>
                  <Th>{t('common.status')}</Th>
                  <Th>{t('common.actions')}</Th>
                </tr>
              </thead>
              <tbody>
                {data.map((r) => (
                  <tr key={r.id} onMouseEnter={(e) => hoverRow(e, true)} onMouseLeave={(e) => hoverRow(e, false)}>
                    <Td bold>{r.name}</Td>
                    <Td muted>{r.code}</Td>
                    <Td>{r.department_name || '—'}</Td>
                    <Td>{r.address || '—'}</Td>
                    <Td><Badge status={r.is_active ? t('common.active') : t('common.inactive')} /></Td>
                    <Td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => openEdit(r)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.accent, fontSize: 13 }}><EditOutlined /></button>
                        <button onClick={() => setDeleteItem(r)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.danger, fontSize: 13 }}><DeleteOutlined /></button>
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
              {Array.from({ length: totalPages }, (_, i) => (
                <button key={i} onClick={() => setPage(i + 1)} style={{ padding: '4px 10px', borderRadius: C.radiusSm, border: `1px solid ${C.inputBorder}`, background: page === i + 1 ? `linear-gradient(135deg, ${C.accent}, #0EA5E9)` : C.glassStrong, color: page === i + 1 ? '#fff' : C.text, cursor: 'pointer', fontSize: 12 }}>{i + 1}</button>
              ))}
            </div>
          </div>
        )}
      </Surface>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? t('common.edit') : t('common.add')} footer={<>
        <Btn variant="secondary" onClick={() => setModalOpen(false)}>{t('common.cancel')}</Btn>
        <Btn onClick={handleSave} loading={saving}>{t('common.save')}</Btn>
      </>}>
        {errorMsg && <div style={{ background: C.dangerBg, color: C.danger, padding: '8px 12px', borderRadius: C.radiusSm, fontSize: 12, marginBottom: 14 }}>{errorMsg}</div>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <InputField label={t('common.name') + ' *'} value={fName} onChange={(e) => setFName(e.target.value)} />
          <InputField label={t('common.code')} value={fCode} onChange={(e) => setFCode(e.target.value)} placeholder="Можно оставить пустым" />
          <SelectField label={t('profile.department') || 'Подразделение'} value={fDept} onChange={(e) => setFDept(e.target.value)} options={deptOpts} />
          <TextAreaField label={t('references.address') || 'Адрес'} value={fAddress} onChange={(e) => setFAddress(e.target.value)} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <label style={{ fontSize: 13, fontWeight: 500, color: C.heading }}>{t('common.active')}</label>
            <input type="checkbox" checked={fActive} onChange={(e) => setFActive(e.target.checked)} />
          </div>
        </div>
      </Modal>

      <Popconfirm open={!!deleteItem} onClose={() => setDeleteItem(null)} onConfirm={() => deleteItem && handleDelete(deleteItem)} title={t('common.confirmDelete')} confirmText={t('common.delete')} />
    </div>
  );
};

export default WarehousesPage;
