import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../api/axios';
import type { PaginatedResponse, RequestTypeReference } from '../../shared/types';
import {
  C, PageHeader, Btn, Th, Td, Badge, StatCard, Drawer, InputField, SelectField, TextAreaField,
  Spinner, EmptyState, hoverRow, Popconfirm,
} from '../../shared/ui/primitives';

const RequestTypesPage: React.FC = () => {
  const { t } = useTranslation();
  const [data, setData] = useState<RequestTypeReference[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<RequestTypeReference | null>(null);
  const [deleteItem, setDeleteItem] = useState<RequestTypeReference | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  /* form */
  const [fName, setFName] = useState('');
  const [fCode, setFCode] = useState('');
  const [fAssetType, setFAssetType] = useState('TMZ');
  const [fLongTerm, setFLongTerm] = useState(false);
  const [fDesc, setFDesc] = useState('');
  const [fActive, setFActive] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<PaginatedResponse<RequestTypeReference>>('/references/request-types/', {
        params: { page_size: 100, ordering: 'name' },
      });
      setData(res.data.results || []);
    } catch { /* */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const stats = useMemo(() => ({
    total: data.length,
    tmz: data.filter((i) => i.asset_type === 'TMZ').length,
    osNma: data.filter((i) => ['OS', 'NMA'].includes(i.asset_type)).length,
    longTerm: data.filter((i) => i.requires_long_term_use).length,
  }), [data]);

  const resetForm = (r?: RequestTypeReference) => {
    setFName(r?.name || '');
    setFCode(r?.code || '');
    setFAssetType(r?.asset_type || 'TMZ');
    setFLongTerm(r?.requires_long_term_use || false);
    setFDesc(r?.description || '');
    setFActive(r?.is_active ?? true);
    setErrorMsg('');
  };

  const openCreate = () => { setEditing(null); resetForm(); setDrawerOpen(true); };
  const openEdit = (r: RequestTypeReference) => { setEditing(r); resetForm(r); setDrawerOpen(true); };

  const handleSave = async () => {
    if (!fName || !fCode || !fAssetType) { setErrorMsg('Заполните обязательные поля'); return; }
    setSaving(true); setErrorMsg('');
    try {
      const payload = {
        name: fName, code: fCode, asset_type: fAssetType,
        requires_long_term_use: fAssetType === 'TMZ' ? fLongTerm : false,
        description: fDesc, is_active: fActive,
      };
      if (editing) {
        await api.patch(`/references/request-types/${editing.id}/`, payload);
      } else {
        await api.post('/references/request-types/', payload);
      }
      setDrawerOpen(false); fetchData();
    } catch (err: any) {
      setErrorMsg(err?.response?.data ? Object.values(err.response.data).flat().join('; ') : t('common.error'));
    } finally { setSaving(false); }
  };

  const handleDelete = async (r: RequestTypeReference) => {
    try { await api.delete(`/references/request-types/${r.id}/`); fetchData(); } catch { /* */ }
    setDeleteItem(null);
  };

  return (
    <div>
      <PageHeader
        title="Виды заявок"
        subtitle="Управление сценариями заявок: создание, редактирование, отключение и настройка признака «Длительного пользования»."
        right={<Btn onClick={openCreate}>+ Создать вид заявки</Btn>}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <StatCard label="Всего видов" value={stats.total} sub="📋" />
        <StatCard label="Для номенклатуры" value={stats.tmz} />
        <StatCard label="Для ОС и НМА" value={stats.osNma} />
        <StatCard label="Длительное пользование" value={stats.longTerm} />
      </div>

      <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 10, overflow: 'hidden' }}>
        {loading ? <Spinner /> : data.length === 0 ? <EmptyState /> : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <Th>Вид заявки</Th>
                <Th>Тип актива</Th>
                <Th>Длительное пользование</Th>
                <Th>Статус</Th>
                <Th>Описание</Th>
                <Th>{t('common.actions')}</Th>
              </tr>
            </thead>
            <tbody>
              {data.map((r) => (
                <tr key={r.id} onMouseEnter={(e) => hoverRow(e, true)} onMouseLeave={(e) => hoverRow(e, false)}>
                  <Td>
                    <div style={{ fontWeight: 500, color: C.heading }}>{r.name}</div>
                    <div style={{ fontSize: 11, color: C.muted }}>{r.code}</div>
                  </Td>
                  <Td><Badge status={r.asset_type_display} /></Td>
                  <Td>
                    <Badge status={r.asset_type === 'TMZ' ? (r.requires_long_term_use ? 'Да' : 'Нет') : 'Не применяется'} />
                  </Td>
                  <Td><Badge status={r.is_active ? 'Активен' : 'Неактивен'} /></Td>
                  <Td muted style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.description}</Td>
                  <Td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => openEdit(r)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.accent, fontSize: 13 }}>✏️</button>
                      <button onClick={() => setDeleteItem(r)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.danger, fontSize: 13 }}>🗑️</button>
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)}
        title={editing ? 'Редактирование вида заявки' : 'Новый вид заявки'}
        footer={<>
          <Btn variant="secondary" onClick={() => setDrawerOpen(false)}>{t('common.cancel')}</Btn>
          <Btn onClick={handleSave} loading={saving}>{t('common.save')}</Btn>
        </>}
      >
        {errorMsg && <div style={{ background: C.dangerBg, color: C.danger, padding: '8px 12px', borderRadius: 6, fontSize: 12, marginBottom: 14 }}>{errorMsg}</div>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <InputField label="Наименование *" value={fName} onChange={(e) => setFName(e.target.value)} placeholder="Например, Выдача ТМЗ длительного пользования" />
          <InputField label="Код *" value={fCode} onChange={(e) => setFCode(e.target.value)} placeholder="TMZ_LONG_TERM" />
          <SelectField label="Тип актива *" value={fAssetType}
            onChange={(e) => { setFAssetType(e.target.value); if (e.target.value !== 'TMZ') setFLongTerm(false); }}
            options={[{ value: 'TMZ', label: 'Номенклатура' }, { value: 'OS', label: 'ОС' }, { value: 'NMA', label: 'НМА' }]} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <label style={{ fontSize: 13, fontWeight: 500, color: C.heading }}>Только длительного пользования</label>
            <input type="checkbox" checked={fLongTerm} onChange={(e) => setFLongTerm(e.target.checked)} disabled={fAssetType !== 'TMZ'} />
          </div>
          <TextAreaField label="Описание" value={fDesc} onChange={(e) => setFDesc(e.target.value)} placeholder="Краткое описание сценария заявки" />
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <label style={{ fontSize: 13, fontWeight: 500, color: C.heading }}>Активен</label>
            <input type="checkbox" checked={fActive} onChange={(e) => setFActive(e.target.checked)} />
          </div>
        </div>
      </Drawer>

      <Popconfirm open={!!deleteItem} onClose={() => setDeleteItem(null)}
        onConfirm={() => deleteItem && handleDelete(deleteItem)}
        title="Удалить этот вид заявки?" confirmText="Удалить" />
    </div>
  );
};

export default RequestTypesPage;
