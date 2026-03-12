import React, { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../api/axios';
import type { LimitNorm, Department, PaginatedResponse } from '../../shared/types';
import {
  C, PageHeader, Btn, Th, Td, Badge, Modal, InputField, SelectField,
  Spinner, EmptyState, hoverRow,
} from '../../shared/ui/primitives';

const PAGE_SIZE = 20;

const LimitsPage: React.FC = () => {
  const { t } = useTranslation();
  const [data, setData] = useState<LimitNorm[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<LimitNorm | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [errorMsg, setErrorMsg] = useState('');

  /* form */
  const [fAssetType, setFAssetType] = useState('TMZ');
  const [fCategory, setFCategory] = useState('');
  const [fQty, setFQty] = useState('');
  const [fPeriod, setFPeriod] = useState('MONTHLY');
  const [fDept, setFDept] = useState('');
  const [fFrom, setFFrom] = useState('');
  const [fTo, setFTo] = useState('');

  const fetchDepartments = useCallback(async () => {
    try {
      const res = await api.get('/departments/', { params: { page_size: 100 } });
      setDepartments(res.data.results || []);
    } catch { /* */ }
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = { page, page_size: PAGE_SIZE };
      if (search) params.search = search;
      if (filterType) params.asset_type = filterType;
      if (filterDept) params.department = filterDept;
      const res = await api.get<PaginatedResponse<LimitNorm>>('/references/limit-norms/', { params });
      setData(res.data.results);
      setTotal(res.data.count);
    } catch { /* */ } finally { setLoading(false); }
  }, [page, search, filterType, filterDept]);

  useEffect(() => { fetchDepartments(); }, [fetchDepartments]);
  useEffect(() => { fetchData(); }, [fetchData]);

  const isActive = (item: LimitNorm) => {
    const today = new Date().toISOString().slice(0, 10);
    return item.valid_from <= today && item.valid_to >= today;
  };

  const resetForm = (item?: LimitNorm) => {
    setFAssetType(item?.asset_type || 'TMZ');
    setFCategory(item?.category || '');
    setFQty(item ? String(Number(item.quantity_limit)) : '');
    setFPeriod(item?.period || 'MONTHLY');
    setFDept(item?.department ? String(item.department) : '');
    setFFrom(item?.valid_from || '');
    setFTo(item?.valid_to || '');
    setErrorMsg('');
  };

  const openCreate = () => { setEditItem(null); resetForm(); setModalOpen(true); };
  const openEdit = (r: LimitNorm) => { setEditItem(r); resetForm(r); setModalOpen(true); };

  const handleSave = async () => {
    if (!fAssetType || !fCategory || !fQty || !fPeriod || !fFrom || !fTo) { setErrorMsg('Заполните обязательные поля'); return; }
    setSaving(true); setErrorMsg('');
    try {
      const payload = {
        asset_type: fAssetType, category: fCategory,
        quantity_limit: Number(fQty), period: fPeriod,
        department: fDept ? Number(fDept) : null,
        valid_from: fFrom, valid_to: fTo,
      };
      if (editItem) {
        await api.patch(`/references/limit-norms/${editItem.id}/`, payload);
      } else {
        await api.post('/references/limit-norms/', payload);
      }
      setModalOpen(false); fetchData();
    } catch (err: any) {
      const msgs = err?.response?.data ? Object.values(err.response.data).flat().join('; ') : t('common.error');
      setErrorMsg(String(msgs));
    } finally { setSaving(false); }
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const typeOpts = [{ value: '', label: t('common.allTypes') }, { value: 'TMZ', label: 'ТМЗ' }, { value: 'OS', label: 'ОС' }, { value: 'NMA', label: 'НМА' }];
  const deptOpts = [{ value: '', label: t('common.allDepartments') }, ...departments.map((d) => ({ value: String(d.id), label: d.name }))];

  return (
    <div>
      <PageHeader title={t('references.limits.title')} right={<Btn onClick={openCreate}>+ {t('common.add')}</Btn>} />

      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <input placeholder={t('common.search')} value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          style={{ padding: '8px 14px', border: `1px solid ${C.inputBorder}`, borderRadius: 6, fontSize: 13, width: 250, outline: 'none' }}
        />
        <select value={filterType} onChange={(e) => { setFilterType(e.target.value); setPage(1); }}
          style={{ padding: '8px 12px', border: `1px solid ${C.inputBorder}`, borderRadius: 6, fontSize: 13, color: C.secondary, background: '#fff' }}>
          {typeOpts.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <select value={filterDept} onChange={(e) => { setFilterDept(e.target.value); setPage(1); }}
          style={{ padding: '8px 12px', border: `1px solid ${C.inputBorder}`, borderRadius: 6, fontSize: 13, color: C.secondary, background: '#fff' }}>
          {deptOpts.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 10, overflow: 'hidden' }}>
        {loading ? <Spinner /> : data.length === 0 ? <EmptyState /> : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 1000 }}>
              <thead>
                <tr>
                  <Th>{t('references.limits.category')}</Th>
                  <Th>{t('references.limits.assetType')}</Th>
                  <Th right>{t('references.limits.quantityLimit')}</Th>
                  <Th>{t('references.limits.period')}</Th>
                  <Th>{t('references.departmentOrFund')}</Th>
                  <Th>{t('references.validPeriod')}</Th>
                  <Th>{t('references.limitStatus')}</Th>
                  <Th>{t('common.actions')}</Th>
                </tr>
              </thead>
              <tbody>
                {data.map((r) => (
                  <tr key={r.id} onMouseEnter={(e) => hoverRow(e, true)} onMouseLeave={(e) => hoverRow(e, false)}>
                    <Td bold>{r.category}</Td>
                    <Td>{r.asset_type_display}</Td>
                    <Td right>{Number(r.quantity_limit).toLocaleString()}</Td>
                    <Td>{r.period_display}</Td>
                    <Td muted>{r.department_name || t('references.wholeFund')}</Td>
                    <Td muted>{r.valid_from} — {r.valid_to}</Td>
                    <Td><Badge status={isActive(r) ? t('references.limitActive') : t('references.limitExpired')} /></Td>
                    <Td>
                      <button onClick={() => openEdit(r)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.accent, fontSize: 13 }}>✏️</button>
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
                  padding: '4px 10px', borderRadius: 4, border: `1px solid ${C.inputBorder}`,
                  background: page === i + 1 ? C.accent : '#fff', color: page === i + 1 ? '#fff' : C.text,
                  cursor: 'pointer', fontSize: 12,
                }}>{i + 1}</button>
              ))}
            </div>
          </div>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? t('common.edit') : t('common.add')}
        footer={<>
          <Btn variant="secondary" onClick={() => setModalOpen(false)}>{t('common.cancel')}</Btn>
          <Btn onClick={handleSave} loading={saving}>{t('common.save')}</Btn>
        </>}
      >
        {errorMsg && <div style={{ background: C.dangerBg, color: C.danger, padding: '8px 12px', borderRadius: 6, fontSize: 12, marginBottom: 14 }}>{errorMsg}</div>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <SelectField label={t('references.limits.assetType') + ' *'} value={fAssetType} onChange={(e) => setFAssetType(e.target.value)}
            options={[{ value: 'TMZ', label: 'ТМЗ' }, { value: 'OS', label: 'ОС' }, { value: 'NMA', label: 'НМА' }]} />
          <InputField label={t('references.limits.category') + ' *'} value={fCategory} onChange={(e) => setFCategory(e.target.value)} />
          <InputField label={t('references.limits.quantityLimit') + ' *'} type="number" value={fQty} onChange={(e) => setFQty(e.target.value)} />
          <SelectField label={t('references.limits.period') + ' *'} value={fPeriod} onChange={(e) => setFPeriod(e.target.value)}
            options={[{ value: 'MONTHLY', label: 'Ежемесячно' }, { value: 'QUARTERLY', label: 'Ежеквартально' }, { value: 'ANNUAL', label: 'Ежегодно' }]} />
          <SelectField label={t('profile.department')} value={fDept} onChange={(e) => setFDept(e.target.value)}
            options={[{ value: '', label: t('references.wholeFund') }, ...departments.map((d) => ({ value: d.id, label: d.name }))]} />
          <InputField label={t('references.validPeriod') + ' (с) *'} type="date" value={fFrom} onChange={(e) => setFFrom(e.target.value)} />
          <InputField label={t('references.validPeriod') + ' (по) *'} type="date" value={fTo} onChange={(e) => setFTo(e.target.value)} />
        </div>
      </Modal>
    </div>
  );
};

export default LimitsPage;
