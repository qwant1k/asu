import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DownloadOutlined, EditOutlined, EyeOutlined, PlusOutlined } from '@ant-design/icons';
import api from '../../api/axios';
import type { Contract, Counterparty, PaginatedResponse } from '../../shared/types';
import {
  C, PageHeader, Btn, Th, Td, Badge, Modal, InputField, SelectField,
  Spinner, EmptyState, hoverRow, Surface, FilterBar,
} from '../../shared/ui/primitives';

const PAGE_SIZE = 20;

const resolveFileUrl = (url?: string | null) => {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  const base = String(api.defaults.baseURL || window.location.origin).replace(/\/api\/v1\/?$/, '');
  return `${base}${url.startsWith('/') ? url : `/${url}`}`;
};

const formatDate = (value?: string | null) => {
  if (!value) return '—';
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('ru-RU');
};

const isExpired = (value: string) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(`${value}T00:00:00`) < today;
};

const ContractsPage: React.FC = () => {
  const { t } = useTranslation();
  const [data, setData] = useState<Contract[]>([]);
  const [counterparties, setCounterparties] = useState<Counterparty[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [counterpartyFilter, setCounterpartyFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [pdfOpen, setPdfOpen] = useState(false);
  const [editItem, setEditItem] = useState<Contract | null>(null);
  const [previewItem, setPreviewItem] = useState<Contract | null>(null);
  const [pdfBlobUrl, setPdfBlobUrl] = useState('');
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [fName, setFName] = useState('');
  const [fDate, setFDate] = useState('');
  const [fValidUntil, setFValidUntil] = useState('');
  const [fCounterparty, setFCounterparty] = useState('');
  const [fPdf, setFPdf] = useState<File | null>(null);

  const fetchCounterparties = useCallback(async () => {
    try {
      const res = await api.get<PaginatedResponse<Counterparty>>('/references/counterparties/', {
        params: { page_size: 500, is_active: true, ordering: 'name' },
      });
      setCounterparties(res.data.results || []);
    } catch {
      setCounterparties([]);
    }
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = { page, page_size: PAGE_SIZE, ordering: '-contract_date' };
      if (search) params.search = search;
      if (counterpartyFilter) params.counterparty = counterpartyFilter;
      const res = await api.get<PaginatedResponse<Contract>>('/references/contracts/', { params });
      setData(res.data.results || []);
      setTotal(res.data.count);
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [counterpartyFilter, page, search]);

  useEffect(() => { fetchCounterparties(); }, [fetchCounterparties]);
  useEffect(() => { fetchData(); }, [fetchData]);

  const counterpartyOptions = useMemo(
    () => counterparties.map((item) => ({ value: item.id, label: `${item.name} (${item.bin})` })),
    [counterparties],
  );

  const resetForm = (item?: Contract) => {
    setFName(item?.name || '');
    setFDate(item?.contract_date || '');
    setFValidUntil(item?.valid_until || '');
    setFCounterparty(item?.counterparty ? String(item.counterparty) : counterpartyFilter);
    setFPdf(null);
    setErrorMsg('');
  };

  const openCreate = () => {
    setEditItem(null);
    resetForm();
    setModalOpen(true);
  };

  const openEdit = (item: Contract) => {
    setEditItem(item);
    resetForm(item);
    setModalOpen(true);
  };

  const openPdf = (item: Contract) => {
    setPreviewItem(item);
    setPdfError('');
    setPdfOpen(true);
  };

  useEffect(() => {
    if (!pdfOpen || !previewItem?.pdf_file) {
      setPdfBlobUrl('');
      setPdfLoading(false);
      return undefined;
    }

    const sourceUrl = resolveFileUrl(previewItem.pdf_file);
    let active = true;
    let objectUrl = '';

    setPdfLoading(true);
    setPdfError('');
    setPdfBlobUrl('');

    api.get(sourceUrl, {
      responseType: 'blob',
      headers: { Accept: 'application/pdf' },
    }).then((response) => {
      if (!active) return;
      const rawType = response.headers['content-type'];
      const type = typeof rawType === 'string' ? rawType : 'application/pdf';
      objectUrl = URL.createObjectURL(new Blob([response.data], { type }));
      setPdfBlobUrl(objectUrl);
    }).catch(() => {
      if (active) setPdfError('Не удалось загрузить PDF для предпросмотра');
    }).finally(() => {
      if (active) setPdfLoading(false);
    });

    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [pdfOpen, previewItem]);

  const handleSave = async () => {
    if (!fName.trim() || !fDate || !fValidUntil || !fCounterparty) {
      setErrorMsg('Заполните наименование, дату, срок и контрагента');
      return;
    }
    if (!editItem && !fPdf) {
      setErrorMsg('Загрузите подписанный PDF договора');
      return;
    }

    setSaving(true);
    setErrorMsg('');
    try {
      const fd = new FormData();
      fd.append('name', fName.trim());
      fd.append('contract_date', fDate);
      fd.append('valid_until', fValidUntil);
      fd.append('counterparty', fCounterparty);
      if (fPdf) fd.append('pdf_file', fPdf);

      const config = { headers: { 'Content-Type': 'multipart/form-data' } };
      if (editItem) {
        await api.patch(`/references/contracts/${editItem.id}/`, fd, config);
      } else {
        await api.post('/references/contracts/', fd, config);
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

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const previewSourceUrl = resolveFileUrl(previewItem?.pdf_file);

  return (
    <div>
      <PageHeader
        title="Договоры"
        subtitle="Справочник договоров с привязкой к контрагентам и PDF-версией подписанного документа"
        right={<Btn onClick={openCreate}><PlusOutlined /> Добавить договор</Btn>}
      />

      <FilterBar>
        <input
          placeholder="Поиск по договору, контрагенту или БИН"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          style={{
            padding: '8px 14px', border: `1px solid ${C.inputBorder}`,
            borderRadius: C.radiusSm, fontSize: 13, width: 300, outline: 'none', background: C.glassStrong,
          }}
        />
        <select
          value={counterpartyFilter}
          onChange={(e) => { setCounterpartyFilter(e.target.value); setPage(1); }}
          style={{
            padding: '8px 12px', border: `1px solid ${C.inputBorder}`,
            borderRadius: C.radiusSm, fontSize: 13, color: C.secondary, background: C.glassStrong,
          }}
        >
          <option value="">Все контрагенты</option>
          {counterpartyOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
      </FilterBar>

      <Surface>
        {loading ? <Spinner /> : data.length === 0 ? <EmptyState text="Договоры не найдены" /> : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 920 }}>
              <thead>
                <tr>
                  <Th>Наименование</Th>
                  <Th>Контрагент</Th>
                  <Th>Дата</Th>
                  <Th>Срок</Th>
                  <Th>PDF</Th>
                  <Th>{t('common.actions')}</Th>
                </tr>
              </thead>
              <tbody>
                {data.map((item) => (
                  <tr key={item.id} onMouseEnter={(e) => hoverRow(e, true)} onMouseLeave={(e) => hoverRow(e, false)}>
                    <Td bold>{item.name}</Td>
                    <Td>
                      <div style={{ fontWeight: 650, color: C.heading }}>{item.counterparty_name}</div>
                      <div style={{ fontSize: 11, color: C.muted }}>{item.counterparty_bin}</div>
                    </Td>
                    <Td muted>{formatDate(item.contract_date)}</Td>
                    <Td><Badge status={isExpired(item.valid_until) ? 'Истёк' : formatDate(item.valid_until)} /></Td>
                    <Td>
                      {item.pdf_file ? <Badge status="PDF загружен" /> : <Badge status="PDF нет" />}
                    </Td>
                    <Td>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <button onClick={() => openEdit(item)} title="Редактировать" style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.accent, fontSize: 14 }}><EditOutlined /></button>
                        {item.pdf_file && (
                          <>
                            <button onClick={() => openPdf(item)} title="Просмотр PDF" style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.info, fontSize: 14 }}><EyeOutlined /></button>
                            <a href={resolveFileUrl(item.pdf_file)} target="_blank" rel="noreferrer" title="Скачать PDF" style={{ color: C.secondary, fontSize: 14 }}><DownloadOutlined /></a>
                          </>
                        )}
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
        title={editItem ? 'Редактирование договора' : 'Новый договор'}
        width={640}
        footer={(
          <>
            <Btn variant="secondary" onClick={() => setModalOpen(false)}>{t('common.cancel')}</Btn>
            <Btn onClick={handleSave} loading={saving}>{t('common.save')}</Btn>
          </>
        )}
      >
        {errorMsg && <div style={{ background: C.dangerBg, color: C.danger, padding: '8px 12px', borderRadius: C.radiusSm, fontSize: 12, marginBottom: 14 }}>{errorMsg}</div>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <InputField label="Наименование *" value={fName} onChange={(e) => setFName(e.target.value)} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <InputField label="Дата договора *" type="date" value={fDate} onChange={(e) => setFDate(e.target.value)} />
            <InputField label="Срок действия *" type="date" value={fValidUntil} onChange={(e) => setFValidUntil(e.target.value)} />
          </div>
          <SelectField
            label="Контрагент *"
            value={fCounterparty}
            onChange={(e) => setFCounterparty(e.target.value)}
            options={[{ value: '', label: 'Выберите контрагента' }, ...counterpartyOptions]}
          />
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 650, color: C.heading }}>PDF договора {editItem ? '' : '*'}</span>
            <input type="file" accept="application/pdf,.pdf" onChange={(e) => setFPdf(e.target.files?.[0] || null)} />
            {editItem?.pdf_file && <span style={{ fontSize: 11, color: C.secondary }}>Текущий PDF сохранится, если не выбрать новый файл.</span>}
          </label>
        </div>
      </Modal>

      <Modal
        open={pdfOpen}
        onClose={() => setPdfOpen(false)}
        title={previewItem ? `PDF: ${previewItem.name}` : 'PDF договора'}
        width={980}
        footer={previewSourceUrl ? <Btn variant="secondary" onClick={() => window.open(previewSourceUrl, '_blank')}>Открыть в новой вкладке</Btn> : undefined}
      >
        {!previewSourceUrl ? (
          <EmptyState text="PDF не загружен" />
        ) : pdfLoading ? (
          <Spinner />
        ) : pdfError ? (
          <EmptyState text={pdfError} />
        ) : pdfBlobUrl ? (
          <iframe title="PDF договора" src={pdfBlobUrl} style={{ width: '100%', height: '72vh', border: `1px solid ${C.border}`, borderRadius: C.radiusSm }} />
        ) : <EmptyState text="PDF не загружен" />}
      </Modal>
    </div>
  );
};

export default ContractsPage;
