import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DeleteOutlined, EditOutlined, PlusOutlined, SettingOutlined } from '@ant-design/icons';
import api from '../../api/axios';
import type { ApprovalStep, PaginatedResponse, RequestTypeReference, UserRole } from '../../shared/types';
import {
  C, PageHeader, Btn, Th, Td, Badge, StatCard, Drawer, InputField, SelectField, TextAreaField,
  Spinner, EmptyState, hoverRow, Popconfirm, Surface,
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

  const ROLE_OPTIONS = [
    { value: 'DEPT_HEAD', label: 'Руководитель подразделения' },
    { value: 'AHS_HEAD', label: 'Руководитель АХС' },
    { value: 'MOL_WAREHOUSE', label: 'МОЛ по складу' },
    { value: 'MOL_NMA', label: 'МОЛ по НМА' },
    { value: 'AHS_WORKER', label: 'Работник АХС' },
    { value: 'FO_HEAD', label: 'Руководитель ФО' },
    { value: 'IRD_WORKER', label: 'ИРД/ОСМР работник' },
    { value: 'ADMIN', label: 'Администратор' },
  ];

  /* approval steps editor */
  const [stepsOpen, setStepsOpen] = useState(false);
  const [stepsType, setStepsType] = useState<RequestTypeReference | null>(null);
  const [steps, setSteps] = useState<ApprovalStep[]>([]);
  const [stepsLoading, setStepsLoading] = useState(false);
  const [stepSaving, setStepSaving] = useState(false);
  const [stepEditing, setStepEditing] = useState<ApprovalStep | null>(null);
  const [stepForm, setStepForm] = useState({
    order: 1,
    approver_role: 'DEPT_HEAD' as UserRole,
    title: '',
    requires_supervisor: false,
    is_active: true,
  });
  const [stepDelete, setStepDelete] = useState<ApprovalStep | null>(null);
  const [stepError, setStepError] = useState('');

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
    if (!fName || !fAssetType) { setErrorMsg('Заполните обязательные поля'); return; }
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

  const resetStepForm = (step?: ApprovalStep) => {
    setStepForm({
      order: step?.order ?? steps.length + 1,
      approver_role: (step?.approver_role || 'DEPT_HEAD') as UserRole,
      title: step?.title || '',
      requires_supervisor: step?.requires_supervisor || false,
      is_active: step?.is_active ?? true,
    });
    setStepEditing(step || null);
    setStepError('');
  };

  const openSteps = (r: RequestTypeReference) => {
    setStepsType(r);
    setSteps(r.approval_steps || []);
    setStepsOpen(true);
    resetStepForm(undefined);
    setStepDelete(null);
  };

  const closeSteps = () => {
    setStepsOpen(false);
    setStepsType(null);
    setStepDelete(null);
  };

  const fetchSteps = useCallback(async (requestTypeId: number) => {
    setStepsLoading(true);
    try {
      const res = await api.get<PaginatedResponse<ApprovalStep>>(
        '/references/approval-steps/',
        { params: { request_type: requestTypeId, page_size: 100, ordering: 'order' } },
      );
      const list = res.data.results || [];
      setSteps(list);
      if (stepsType) {
        setStepsType({ ...stepsType, approval_steps: list });
      }
    } catch { /* */ } finally { setStepsLoading(false); }
  }, [stepsType]);

  useEffect(() => {
    if (stepsOpen && stepsType) {
      fetchSteps(stepsType.id);
    }
  }, [stepsOpen, stepsType, fetchSteps]);

  const handleSaveStep = async () => {
    if (!stepsType) return;
    if (!stepForm.approver_role) { setStepError('Выберите роль согласующего'); return; }
    setStepSaving(true); setStepError('');
    try {
      const payload = {
        request_type: stepsType.id,
        order: stepForm.order,
        approver_role: stepForm.approver_role,
        title: stepForm.title,
        requires_supervisor: stepForm.requires_supervisor,
        is_active: stepForm.is_active,
      };
      if (stepEditing) {
        await api.patch(`/references/approval-steps/${stepEditing.id}/`, payload);
      } else {
        await api.post('/references/approval-steps/', payload);
      }
      await fetchSteps(stepsType.id);
      resetStepForm(undefined);
    } catch (err: any) {
      setStepError(err?.response?.data ? Object.values(err.response.data).flat().join('; ') : t('common.error'));
    } finally { setStepSaving(false); }
  };

  const handleDeleteStep = async (step: ApprovalStep) => {
    if (!stepsType) return;
    try { await api.delete(`/references/approval-steps/${step.id}/`); await fetchSteps(stepsType.id); } catch { /* */ }
    setStepDelete(null);
  };

  return (
    <div>
      <PageHeader
        title="Виды заявок"
        subtitle="Управление сценариями заявок: создание, редактирование, отключение и настройка признака «Длительного пользования»."
        right={<Btn onClick={openCreate}><PlusOutlined /> Создать вид заявки</Btn>}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 16, marginBottom: 24 }}>
        <StatCard label="Всего видов" value={stats.total} sub="📋" />
        <StatCard label="Для номенклатуры" value={stats.tmz} />
        <StatCard label="Для ОС и НМА" value={stats.osNma} />
        <StatCard label="Длительное пользование" value={stats.longTerm} />
      </div>

      <Surface>
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
                      <button onClick={() => openSteps(r)} title="Этапы согласования" style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.heading, fontSize: 13 }}><SettingOutlined /></button>
                      <button onClick={() => openEdit(r)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.accent, fontSize: 13 }}><EditOutlined /></button>
                      <button onClick={() => setDeleteItem(r)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.danger, fontSize: 13 }}><DeleteOutlined /></button>
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Surface>

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)}
        title={editing ? 'Редактирование вида заявки' : 'Новый вид заявки'}
        footer={<>
          <Btn variant="secondary" onClick={() => setDrawerOpen(false)}>{t('common.cancel')}</Btn>
          <Btn onClick={handleSave} loading={saving}>{t('common.save')}</Btn>
        </>}
      >
        {errorMsg && <div style={{ background: C.dangerBg, color: C.danger, padding: '8px 12px', borderRadius: C.radiusSm, fontSize: 12, marginBottom: 14 }}>{errorMsg}</div>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <InputField label="Наименование *" value={fName} onChange={(e) => setFName(e.target.value)} placeholder="Например, Выдача ТМЗ длительного пользования" />
          <InputField label="Код" value={fCode} onChange={(e) => setFCode(e.target.value)} placeholder="Можно оставить пустым: код создастся автоматически" />
          <SelectField label="Тип актива *" value={fAssetType}
            onChange={(e) => { setFAssetType(e.target.value); if (e.target.value !== 'TMZ') setFLongTerm(false); }}
            options={[{ value: 'TMZ', label: 'Номенклатура' }, { value: 'REPRESENTATIVE_TMZ', label: 'Представительские ТМЗ' }, { value: 'OS', label: 'ОС' }, { value: 'NMA', label: 'НМА' }]} />
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

      <Drawer open={stepsOpen} onClose={closeSteps}
        title={stepsType ? `Этапы согласования: ${stepsType.name}` : 'Этапы согласования'}
        footer={<>
          <Btn variant="secondary" onClick={closeSteps}>{t('common.close')}</Btn>
          <Btn onClick={handleSaveStep} loading={stepSaving}>{stepEditing ? 'Сохранить этап' : 'Добавить этап'}</Btn>
        </>}
      >
        {stepError && <div style={{ background: C.dangerBg, color: C.danger, padding: '8px 12px', borderRadius: C.radiusSm, fontSize: 12, marginBottom: 14 }}>{stepError}</div>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
            <div style={{ width: 80 }}>
              <InputField label="Порядок" type="number" value={String(stepForm.order)} onChange={(e) => setStepForm({ ...stepForm, order: parseInt(e.target.value, 10) || 0 })} />
            </div>
            <div style={{ flex: 1 }}>
              <SelectField label="Роль согласующего *" value={stepForm.approver_role}
                onChange={(e) => setStepForm({ ...stepForm, approver_role: e.target.value as UserRole })}
                options={ROLE_OPTIONS} />
            </div>
          </div>
          <InputField label="Наименование этапа" value={stepForm.title} onChange={(e) => setStepForm({ ...stepForm, title: e.target.value })} placeholder="Например, Согласование руководителем подразделения" />
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <input type="checkbox" id="requires_supervisor" checked={stepForm.requires_supervisor} onChange={(e) => setStepForm({ ...stepForm, requires_supervisor: e.target.checked })} />
            <label htmlFor="requires_supervisor" style={{ fontSize: 13, color: C.heading }}>Только непосредственный руководитель инициатора</label>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <input type="checkbox" id="step_active" checked={stepForm.is_active} onChange={(e) => setStepForm({ ...stepForm, is_active: e.target.checked })} />
            <label htmlFor="step_active" style={{ fontSize: 13, color: C.heading }}>Активен</label>
          </div>
          {stepEditing && <button onClick={() => resetStepForm(undefined)} style={{ background: 'none', border: 'none', color: C.accent, fontSize: 13, cursor: 'pointer', textAlign: 'left', padding: 0 }}>+ Создать новый этап вместо редактирования</button>}
        </div>

        <div style={{ marginTop: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.heading, marginBottom: 10 }}>Настроенные этапы</div>
          {stepsLoading ? <Spinner /> : steps.length === 0 ? <EmptyState text="Этапы не настроены" /> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {steps.map((step: ApprovalStep) => (
                <div key={step.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', border: `1px solid ${C.border}`, borderRadius: C.radiusSm, background: step.is_active ? C.glassStrong : C.surfaceSoft }}>
                  <div style={{ width: 28, height: 28, borderRadius: 14, background: C.accent, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>{step.order}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: C.heading }}>{step.title || step.approver_role_display}</div>
                    <div style={{ fontSize: 11, color: C.muted }}>{step.approver_role_display}{step.requires_supervisor ? ' • непосредственный руководитель' : ''}{step.is_active ? '' : ' • неактивен'}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => resetStepForm(step)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.accent, fontSize: 13 }}><EditOutlined /></button>
                    <button onClick={() => setStepDelete(step)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.danger, fontSize: 13 }}><DeleteOutlined /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Drawer>

      <Popconfirm open={!!deleteItem} onClose={() => setDeleteItem(null)}
        onConfirm={() => deleteItem && handleDelete(deleteItem)}
        title="Удалить этот вид заявки?" confirmText="Удалить" />

      <Popconfirm open={!!stepDelete} onClose={() => setStepDelete(null)}
        onConfirm={() => stepDelete && handleDeleteStep(stepDelete)}
        title="Удалить этот этап согласования?" confirmText="Удалить" />
    </div>
  );
};

export default RequestTypesPage;
