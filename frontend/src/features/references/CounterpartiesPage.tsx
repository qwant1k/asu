import React, { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../api/axios';
import type { Counterparty, PaginatedResponse } from '../../shared/types';
import {
  C, PageHeader, Btn, Th, Td, Badge, Modal, InputField, TextAreaField,
  Spinner, EmptyState, hoverRow, Popconfirm, Surface, FilterBar,
} from '../../shared/ui/primitives';

const PAGE_SIZE = 20;

const CounterpartiesPage: React.FC = () => {
  const { t } = useTranslation();
  const [data, setData] = useState<Counterparty[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Counterparty | null>(null);
  const [confirmItem, setConfirmItem] = useState<Counterparty | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  /* form fields */
  const [fName, setFName] = useState('');
  const [fBin, setFBin] = useState('');
  const [fAddress, setFAddress] = useState('');
  const [fContact, setFContact] = useState('');
  const [fPhone, setFPhone] = useState('');
  const [fEmail, setFEmail] = useState('');
  const [fActive, setFActive] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = { page, page_size: PAGE_SIZE };
      if (search) params.search = search;
      const res = await api.get<PaginatedResponse<Counterparty>>('/references/counterparties/', { params });
      setData(res.data.results);
      setTotal(res.data.count);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const resetForm = (item?: Counterparty) => {
    setFName(item?.name || '');
    setFBin(item?.bin || '');
    setFAddress(item?.address || '');
    setFContact(item?.contact_person || '');
    setFPhone(item?.phone || '');
    setFEmail(item?.email || '');
    setFActive(item ? item.is_active : true);
    setErrorMsg('');
  };

  const openCreate = () => { setEditItem(null); resetForm(); setModalOpen(true); };
  const openEdit = (r: Counterparty) => { setEditItem(r); resetForm(r); setModalOpen(true); };

  const handleSave = async () => {
    if (!fName || !fBin) { setErrorMsg('Заполните обязательные поля'); return; }
    if (!/^\d{12}$/.test(fBin)) { setErrorMsg('БИН должен состоять из 12 цифр'); return; }
    setSaving(true);
    setErrorMsg('');
    try {
      const payload = { name: fName, bin: fBin, address: fAddress, contact_person: fContact, phone: fPhone, email: fEmail, is_active: fActive };
      if (editItem) {
        await api.patch(`/references/counterparties/${editItem.id}/`, payload);
      } else {
        await api.post('/references/counterparties/', payload);
      }
      setModalOpen(false);
      fetchData();
    } catch (err: any) {
      const msgs = err?.response?.data ? Object.values(err.response.data).flat().join('; ') : t('common.error');
      setErrorMsg(String(msgs));
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (record: Counterparty) => {
    try {
      await api.patch(`/references/counterparties/${record.id}/`, { is_active: !record.is_active });
      fetchData();
    } catch { /* ignore */ }
    setConfirmItem(null);
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div>
      <PageHeader
        title={t('nav.counterparties')}
        right={<Btn onClick={openCreate}>+ {t('common.add')}</Btn>}
      />

      <FilterBar>
        <input
          placeholder={t('common.search')}
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          style={{
            padding: '8px 14px', border: `1px solid ${C.inputBorder}`,
            borderRadius: C.radiusSm, fontSize: 13, width: 300, outline: 'none', background: C.glassStrong,
          }}
        />
      </FilterBar>

      <Surface>
        {loading ? <Spinner /> : data.length === 0 ? <EmptyState /> : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <Th>{t('common.name')}</Th>
                <Th>{t('references.bin')}</Th>
                <Th>{t('references.contactPerson')}</Th>
                <Th>{t('profile.phone')}</Th>
                <Th>{t('profile.email')}</Th>
                <Th>{t('common.status')}</Th>
                <Th>{t('common.actions')}</Th>
              </tr>
            </thead>
            <tbody>
              {data.map((r) => (
                <tr key={r.id} onMouseEnter={(e) => hoverRow(e, true)} onMouseLeave={(e) => hoverRow(e, false)}>
                  <Td bold>{r.name}</Td>
                  <Td muted>{r.bin}</Td>
                  <Td>{r.contact_person}</Td>
                  <Td muted>{r.phone}</Td>
                  <Td muted>{r.email}</Td>
                  <Td><Badge status={r.is_active ? t('common.active') : t('common.inactive')} /></Td>
                  <Td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => openEdit(r)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.accent, fontSize: 13 }}>✏️</button>
                      <button onClick={() => setConfirmItem(r)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: r.is_active ? C.danger : C.success, fontSize: 13 }}>
                        {r.is_active ? '⛔' : '✅'}
                      </button>
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {totalPages > 1 && (
          <div style={{ padding: '12px 16px', borderTop: `1px solid ${C.rowBorder}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, color: C.secondary }}>
            <span>{t('common.total')}: {total}</span>
            <div style={{ display: 'flex', gap: 4 }}>
              {Array.from({ length: totalPages }, (_, i) => (
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

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editItem ? t('common.edit') : t('common.add')}
        footer={<>
          <Btn variant="secondary" onClick={() => setModalOpen(false)}>{t('common.cancel')}</Btn>
          <Btn onClick={handleSave} loading={saving}>{t('common.save')}</Btn>
        </>}
      >
        {errorMsg && <div style={{ background: C.dangerBg, color: C.danger, padding: '8px 12px', borderRadius: C.radiusSm, fontSize: 12, marginBottom: 14 }}>{errorMsg}</div>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <InputField label={t('common.name') + ' *'} value={fName} onChange={(e) => setFName(e.target.value)} />
          <InputField label={t('references.bin') + ' *'} value={fBin} onChange={(e) => setFBin(e.target.value)} maxLength={12} />
          <TextAreaField label={t('references.address')} value={fAddress} onChange={(e) => setFAddress(e.target.value)} />
          <InputField label={t('references.contactPerson')} value={fContact} onChange={(e) => setFContact(e.target.value)} />
          <InputField label={t('profile.phone')} value={fPhone} onChange={(e) => setFPhone(e.target.value)} />
          <InputField label={t('profile.email')} value={fEmail} onChange={(e) => setFEmail(e.target.value)} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <label style={{ fontSize: 13, fontWeight: 500, color: C.heading }}>{t('common.active')}</label>
            <input type="checkbox" checked={fActive} onChange={(e) => setFActive(e.target.checked)} />
          </div>
        </div>
      </Modal>

      <Popconfirm
        open={!!confirmItem}
        onClose={() => setConfirmItem(null)}
        onConfirm={() => confirmItem && handleToggleActive(confirmItem)}
        title={confirmItem?.is_active ? t('common.confirmDeactivate') : t('common.confirmActivate')}
      />
    </div>
  );
};

export default CounterpartiesPage;
