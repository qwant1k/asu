import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import api from '../../api/axios';
import type { Department, PaginatedResponse, User } from '../../shared/types';
import {
  C, PageHeader, Btn, Th, Td, Modal, InputField, SelectField,
  Spinner, EmptyState, hoverRow, Popconfirm, Surface, FilterBar,
} from '../../shared/ui/primitives';

const PAGE_SIZE = 20;

const DepartmentsPage: React.FC = () => {
  const { t } = useTranslation();
  const [data, setData] = useState<Department[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Department | null>(null);
  const [deleteItem, setDeleteItem] = useState<Department | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const [fName, setFName] = useState('');
  const [fCode, setFCode] = useState('');
  const [fHead, setFHead] = useState('');
  const [fParent, setFParent] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = { page, page_size: PAGE_SIZE, ordering: 'name' };
      if (search) params.search = search;
      const res = await api.get<PaginatedResponse<Department>>('/departments/', { params });
      setData(res.data.results || []);
      setTotal(res.data.count || 0);
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await api.get<PaginatedResponse<User>>('/users/', {
        params: { page_size: 500, is_active: true, ordering: 'last_name' },
      });
      setUsers(res.data.results || []);
    } catch {
      setUsers([]);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const resetForm = (item?: Department) => {
    setFName(item?.name || '');
    setFCode(item?.code || '');
    setFHead(item?.head ? String(item.head) : '');
    setFParent(item?.parent ? String(item.parent) : '');
    setErrorMsg('');
  };

  const openCreate = () => {
    setEditItem(null);
    resetForm();
    setModalOpen(true);
  };

  const openEdit = (item: Department) => {
    setEditItem(item);
    resetForm(item);
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!fName.trim() || !fCode.trim()) {
      setErrorMsg('Заполните наименование и код подразделения');
      return;
    }

    setSaving(true);
    setErrorMsg('');
    try {
      const payload = {
        name: fName.trim(),
        code: fCode.trim(),
        head: fHead ? Number(fHead) : null,
        parent: fParent ? Number(fParent) : null,
      };
      if (editItem) {
        await api.patch(`/departments/${editItem.id}/`, payload);
      } else {
        await api.post('/departments/', payload);
      }
      setModalOpen(false);
      await fetchData();
    } catch (err: any) {
      const msgs = err?.response?.data ? Object.values(err.response.data).flat().join('; ') : t('common.error');
      setErrorMsg(String(msgs));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item: Department) => {
    try {
      await api.delete(`/departments/${item.id}/`);
      await fetchData();
    } catch { /* ignore */ }
    setDeleteItem(null);
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const parentOptions = data
    .filter((dept) => !editItem || dept.id !== editItem.id)
    .map((dept) => ({ value: dept.id, label: dept.name }));
  const headOptions = users.map((user) => ({
    value: user.id,
    label: user.full_name || user.username,
  }));

  return (
    <div>
      <PageHeader title={t('nav.departments')} right={<Btn onClick={openCreate}><PlusOutlined /> {t('common.add')}</Btn>} />

      <FilterBar>
        <input
          placeholder={t('common.search')}
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          style={{
            padding: '8px 14px',
            border: `1px solid ${C.inputBorder}`,
            borderRadius: C.radiusSm,
            fontSize: 13,
            width: 300,
            outline: 'none',
            background: C.glassStrong,
          }}
        />
      </FilterBar>

      <Surface>
        {loading ? <Spinner /> : data.length === 0 ? <EmptyState /> : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 820 }}>
              <thead>
                <tr>
                  <Th>{t('common.name')}</Th>
                  <Th>{t('common.code')}</Th>
                  <Th>{t('profile.supervisor')}</Th>
                  <Th>Родительское подразделение</Th>
                  <Th>{t('common.actions')}</Th>
                </tr>
              </thead>
              <tbody>
                {data.map((dept) => (
                  <tr key={dept.id} onMouseEnter={(e) => hoverRow(e, true)} onMouseLeave={(e) => hoverRow(e, false)}>
                    <Td bold>{dept.name}</Td>
                    <Td muted>{dept.code}</Td>
                    <Td>{dept.head_name || '—'}</Td>
                    <Td>{dept.parent_name || '—'}</Td>
                    <Td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => openEdit(dept)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.accent, fontSize: 13 }}><EditOutlined /></button>
                        <button onClick={() => setDeleteItem(dept)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.danger, fontSize: 13 }}><DeleteOutlined /></button>
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
                <button key={i} onClick={() => setPage(i + 1)} style={{
                  padding: '4px 10px',
                  borderRadius: C.radiusSm,
                  border: `1px solid ${C.inputBorder}`,
                  background: page === i + 1 ? `linear-gradient(135deg, ${C.accent}, #0EA5E9)` : C.glassStrong,
                  color: page === i + 1 ? '#fff' : C.text,
                  cursor: 'pointer',
                  fontSize: 12,
                }}>{i + 1}</button>
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
          <InputField label={t('common.code') + ' *'} value={fCode} onChange={(e) => setFCode(e.target.value)} />
          <SelectField
            label={t('profile.supervisor')}
            value={fHead}
            onChange={(e) => setFHead(e.target.value)}
            options={[{ value: '', label: '— не выбрано —' }, ...headOptions]}
          />
          <SelectField
            label="Родительское подразделение"
            value={fParent}
            onChange={(e) => setFParent(e.target.value)}
            options={[{ value: '', label: '— нет —' }, ...parentOptions]}
          />
        </div>
      </Modal>

      <Popconfirm
        open={!!deleteItem}
        onClose={() => setDeleteItem(null)}
        onConfirm={() => deleteItem && handleDelete(deleteItem)}
        title={t('common.confirmDelete')}
        confirmText={t('common.delete')}
      />
    </div>
  );
};

export default DepartmentsPage;
