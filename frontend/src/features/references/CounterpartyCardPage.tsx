import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DownloadOutlined, EditOutlined, EyeOutlined, LeftOutlined, PlusOutlined } from '@ant-design/icons';
import api from '../../api/axios';
import type { Contract, Counterparty, PaginatedResponse } from '../../shared/types';
import {
  C, PageHeader, Btn, Th, Td, Badge, Modal, InputField,
  Spinner, EmptyState, hoverRow, Panel,
} from '../../shared/ui/primitives';

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

const InfoRow = ({ label, value }: { label: string; value?: React.ReactNode }) => (
  <div style={{ display: 'grid', gridTemplateColumns: '180px minmax(0, 1fr)', gap: 12, padding: '10px 0', borderBottom: `1px solid ${C.rowBorder}` }}>
    <span style={{ color: C.secondary, fontSize: 12, fontWeight: 650 }}>{label}</span>
    <strong style={{ color: C.heading, fontSize: 13, overflowWrap: 'anywhere' }}>{value || '—'}</strong>
  </div>
);

const CounterpartyCardPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [counterparty, setCounterparty] = useState<Counterparty | null>(null);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
  const [fPdf, setFPdf] = useState<File | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [counterpartyRes, contractsRes] = await Promise.all([
        api.get<Counterparty>(`/references/counterparties/${id}/`),
        api.get<PaginatedResponse<Contract>>('/references/contracts/', {
          params: { counterparty: id, page_size: 500, ordering: '-contract_date' },
        }),
      ]);
      setCounterparty(counterpartyRes.data);
      setContracts(contractsRes.data.results || []);
    } catch {
      setCounterparty(null);
      setContracts([]);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const resetForm = (item?: Contract) => {
    setFName(item?.name || '');
    setFDate(item?.contract_date || '');
    setFValidUntil(item?.valid_until || '');
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
    if (!counterparty) return;
    if (!fName.trim() || !fDate || !fValidUntil) {
      setErrorMsg('Заполните наименование, дату и срок договора');
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
      fd.append('counterparty', String(counterparty.id));
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
      const msgs = err?.response?.data ? Object.values(err.response.data).flat().join('; ') : 'Не удалось сохранить договор';
      setErrorMsg(String(msgs));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spinner />;
  if (!counterparty) return <EmptyState text="Контрагент не найден" />;

  const previewSourceUrl = resolveFileUrl(previewItem?.pdf_file);

  return (
    <div>
      <PageHeader
        title={counterparty.name}
        subtitle={`БИН ${counterparty.bin}`}
        right={(
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <Btn variant="secondary" onClick={() => navigate(-1)}><LeftOutlined /> Назад</Btn>
            <Btn onClick={openCreate}><PlusOutlined /> Добавить договор</Btn>
          </div>
        )}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 360px), 1fr))', gap: 18, marginBottom: 18 }}>
        <Panel title="Карточка контрагента">
          <InfoRow label="Наименование" value={counterparty.name} />
          <InfoRow label="БИН" value={counterparty.bin} />
          <InfoRow label="Статус" value={<Badge status={counterparty.is_active ? 'Активен' : 'Неактивен'} />} />
          <InfoRow label="Адрес" value={counterparty.address} />
        </Panel>

        <Panel title="Контакты и договоры">
          <InfoRow label="Контактное лицо" value={counterparty.contact_person} />
          <InfoRow label="Телефон" value={counterparty.phone} />
          <InfoRow label="Email" value={counterparty.email} />
          <InfoRow label="Договоров" value={contracts.length} />
        </Panel>
      </div>

      <Panel title="Договоры" noPad titleRight={<Badge status={`${contracts.length} записей`} />}>
        {contracts.length === 0 ? <EmptyState text="По контрагенту пока нет договоров" /> : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 860 }}>
              <thead>
                <tr>
                  <Th>Наименование</Th>
                  <Th>Дата</Th>
                  <Th>Срок</Th>
                  <Th>PDF</Th>
                  <Th>Действия</Th>
                </tr>
              </thead>
              <tbody>
                {contracts.map((item) => (
                  <tr key={item.id} onMouseEnter={(e) => hoverRow(e, true)} onMouseLeave={(e) => hoverRow(e, false)}>
                    <Td bold>{item.name}</Td>
                    <Td muted>{formatDate(item.contract_date)}</Td>
                    <Td><Badge status={isExpired(item.valid_until) ? 'Истёк' : formatDate(item.valid_until)} /></Td>
                    <Td>{item.pdf_file ? <Badge status="PDF загружен" /> : <Badge status="PDF нет" />}</Td>
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
      </Panel>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editItem ? 'Редактирование договора' : 'Новый договор'}
        width={620}
        footer={(
          <>
            <Btn variant="secondary" onClick={() => setModalOpen(false)}>Отмена</Btn>
            <Btn onClick={handleSave} loading={saving}>Сохранить</Btn>
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

export default CounterpartyCardPage;
