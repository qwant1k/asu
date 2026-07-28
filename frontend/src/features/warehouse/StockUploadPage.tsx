import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  DatabaseOutlined,
  EyeOutlined,
  FileExcelOutlined,
  InboxOutlined,
  LeftOutlined,
  SearchOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import api from '../../api/axios';
import {
  Badge,
  Btn,
  C,
  InputField,
  PageHeader,
  Panel,
  SelectField,
  Td,
  Th,
  hoverRow,
} from '../../shared/ui/primitives';
import { toLocalDateInputValue } from '../../shared/utils/date';
import type { PaginatedResponse, Warehouse } from '../../shared/types';

interface PreviewReference {
  name: string;
  asset_type?: string;
}

interface PreviewRow {
  excel_row: number;
  asset_type: string;
  source_code: string;
  code: string;
  name: string;
  unit: string;
  quantity: string;
  unit_price: string;
  total_amount: string;
  category: string;
  warehouse: string;
  errors: string[];
  warnings: string[];
  new_references: string[];
  action: 'create' | 'update' | '';
  status: 'ready' | 'new_references' | 'error';
}

interface PreviewSummary {
  total_rows: number;
  valid_rows: number;
  invalid_rows: number;
  warning_rows: number;
  create_assets: number;
  update_assets: number;
  asset_types: Record<string, number>;
  new_references: {
    units: PreviewReference[];
    warehouses: PreviewReference[];
    categories: PreviewReference[];
  };
}

interface PreviewResult {
  success: boolean;
  stage: 'preview';
  file_name: string;
  balance_date: string | null;
  preview_token: string;
  can_confirm: boolean;
  summary: PreviewSummary;
  rows: PreviewRow[];
  errors: { row: number; detail: string }[];
}

interface CreatedReference {
  id: number;
  name: string;
  code: string;
  asset_type?: string;
}

interface UploadResult {
  success: boolean;
  stage: 'confirmed';
  asset_type: string | null;
  asset_types: string[];
  balance_date: string | null;
  processed: number;
  skipped: number;
  created_assets: number;
  updated_assets: number;
  created_stock: number;
  updated_stock: number;
  created_references: {
    units: CreatedReference[];
    warehouses: CreatedReference[];
    categories: CreatedReference[];
  };
  errors: { row: number; detail: string }[];
}

const PAGE_SIZE = 50;

const metricStyle: React.CSSProperties = {
  borderTop: `1px solid ${C.rowBorder}`,
  padding: '12px 0 0',
  minWidth: 0,
};

const formatNumber = (value: string) => {
  if (value === '') return '—';
  const number = Number(value);
  return Number.isFinite(number)
    ? number.toLocaleString('ru-KZ', { maximumFractionDigits: 2 })
    : value;
};

const PreviewStatus: React.FC<{ row: PreviewRow }> = ({ row }) => {
  if (row.errors.length) {
    return (
      <span style={{ color: C.danger, background: C.dangerBg, borderRadius: 999, padding: '4px 8px', fontSize: 11, fontWeight: 700 }}>
        Ошибка
      </span>
    );
  }
  if (row.new_references.length) {
    return (
      <span style={{ color: C.warning, background: C.warningBg, borderRadius: 999, padding: '4px 8px', fontSize: 11, fontWeight: 700 }}>
        Новые справочники
      </span>
    );
  }
  if (row.warnings.length) {
    return (
      <span style={{ color: C.warning, background: C.warningBg, borderRadius: 999, padding: '4px 8px', fontSize: 11, fontWeight: 700 }}>
        Предупреждение
      </span>
    );
  }
  return (
    <span style={{ color: C.success, background: C.successBg, borderRadius: 999, padding: '4px 8px', fontSize: 11, fontWeight: 700 }}>
      Готово
    </span>
  );
};

const StockUploadPage: React.FC = () => {
  const navigate = useNavigate();
  const [balanceDate, setBalanceDate] = useState(() => toLocalDateInputValue());
  const [warehouse, setWarehouse] = useState('');
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<PreviewResult | null>(null);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [checking, setChecking] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    (async () => {
      try {
        const response = await api.get<PaginatedResponse<Warehouse>>('/references/warehouses/', {
          params: { page_size: 500, is_active: true, ordering: 'name' },
        });
        const items = response.data.results || [];
        setWarehouses(items);
        if (items.length) setWarehouse(String(items[0].id));
      } catch {
        setWarehouses([]);
      }
    })();
  }, []);

  const invalidatePreview = () => {
    setPreview(null);
    setResult(null);
    setError('');
    setSearch('');
    setTypeFilter('');
    setStatusFilter('');
    setPage(1);
  };

  const fileMeta = useMemo(() => {
    if (!file) return '';
    const sizeKb = Math.max(1, Math.round(file.size / 1024));
    return `${file.name} · ${sizeKb} КБ`;
  }, [file]);

  const makeFormData = (previewToken?: string) => {
    const formData = new FormData();
    if (file) formData.append('file', file);
    formData.append('balance_date', balanceDate);
    if (warehouse) formData.append('warehouse', warehouse);
    if (previewToken) formData.append('preview_token', previewToken);
    return formData;
  };

  const handlePreview = async (event?: React.FormEvent) => {
    event?.preventDefault();
    if (!file) return;
    setChecking(true);
    setError('');
    setPreview(null);
    setResult(null);
    try {
      const response = await api.post<PreviewResult>(
        '/assets/upload-stock/preview/',
        makeFormData(),
        { headers: { 'Content-Type': 'multipart/form-data' } },
      );
      setPreview(response.data);
      setPage(1);
    } catch (requestError: any) {
      setError(requestError.response?.data?.detail || 'Не удалось проверить файл');
    } finally {
      setChecking(false);
    }
  };

  const handleConfirm = async () => {
    if (!file || !preview?.can_confirm || result) return;
    setConfirming(true);
    setError('');
    try {
      const response = await api.post<UploadResult>(
        '/assets/upload-stock/confirm/',
        makeFormData(preview.preview_token),
        { headers: { 'Content-Type': 'multipart/form-data' } },
      );
      setResult(response.data);
    } catch (requestError: any) {
      setError(requestError.response?.data?.detail || 'Не удалось подтвердить загрузку');
    } finally {
      setConfirming(false);
    }
  };

  const filteredRows = useMemo(() => {
    if (!preview) return [];
    const normalizedSearch = search.trim().toLocaleLowerCase('ru');
    return preview.rows.filter((row) => {
      if (typeFilter && row.asset_type !== typeFilter) return false;
      if (statusFilter === 'warning' && row.warnings.length === 0) return false;
      if (statusFilter && statusFilter !== 'warning' && row.status !== statusFilter) return false;
      if (!normalizedSearch) return true;
      const searchable = [
        row.source_code,
        row.code,
        row.name,
        row.unit,
        row.category,
        row.warehouse,
        ...row.errors,
        ...row.warnings,
        ...row.new_references,
      ].join(' ').toLocaleLowerCase('ru');
      return searchable.includes(normalizedSearch);
    });
  }, [preview, search, typeFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const visiblePage = Math.min(page, totalPages);
  const pageRows = filteredRows.slice((visiblePage - 1) * PAGE_SIZE, visiblePage * PAGE_SIZE);

  const createdReferenceGroups = result ? [
    { label: 'Единицы измерения', items: result.created_references.units },
    { label: 'Места хранения (склады)', items: result.created_references.warehouses },
    { label: 'Категории', items: result.created_references.categories },
  ].filter((group) => group.items.length > 0) : [];

  const previewNewReferenceGroups = preview ? [
    { label: 'Единицы измерения', items: preview.summary.new_references.units },
    { label: 'Места хранения (склады)', items: preview.summary.new_references.warehouses },
    { label: 'Категории', items: preview.summary.new_references.categories },
  ].filter((group) => group.items.length > 0) : [];

  return (
    <div>
      <PageHeader
        title="Загрузка остатков из Excel"
        subtitle="Сначала проверьте данные в таблице, затем подтвердите их запись в базу."
        right={(
          <Btn variant="secondary" onClick={() => navigate('/warehouse/stock')}>
            <LeftOutlined /> Назад
          </Btn>
        )}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 390px), 1fr))', gap: 18, alignItems: 'start' }}>
        <Panel title="1. Выбор и проверка файла">
          <form onSubmit={handlePreview} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 14 }}>
              <InputField
                label="Дата остатка"
                type="date"
                value={balanceDate}
                onChange={(event) => {
                  setBalanceDate(event.target.value);
                  invalidatePreview();
                }}
              />
              <SelectField
                label="Склад для строк без места хранения"
                value={warehouse}
                onChange={(event) => {
                  setWarehouse(event.target.value);
                  invalidatePreview();
                }}
                options={[
                  { value: '', label: '— не назначать —' },
                  ...warehouses.map((item) => ({ value: item.id, label: item.name })),
                ]}
              />
            </div>

            <label
              className="ui-card"
              style={{
                border: `1px dashed ${file ? C.accent : C.inputBorder}`,
                borderRadius: C.radiusLg,
                background: file ? C.accentSubtle : C.surfaceSoft,
                padding: 22,
                minHeight: 154,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 9,
                textAlign: 'center',
                cursor: 'pointer',
              }}
            >
              <input
                type="file"
                accept=".xlsx"
                onChange={(event) => {
                  setFile(event.target.files?.[0] || null);
                  invalidatePreview();
                }}
                style={{ display: 'none' }}
              />
              <span style={{ width: 44, height: 44, borderRadius: C.radiusMd, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: file ? C.white : C.accentLight, color: C.accent, fontSize: 22 }}>
                {file ? <FileExcelOutlined /> : <InboxOutlined />}
              </span>
              <span style={{ fontSize: 14, fontWeight: 750, color: C.heading }}>
                {file ? fileMeta : 'Выберите файл Excel'}
              </span>
              <span style={{ fontSize: 12, color: C.secondary, maxWidth: 470, lineHeight: 1.45 }}>
                Выбор файла запускает только проверку. До подтверждения никакие записи в базе не изменяются.
              </span>
            </label>

            {error && (
              <div role="alert" style={{ display: 'flex', gap: 8, alignItems: 'flex-start', color: C.danger, fontSize: 13, background: C.dangerBg, borderRadius: C.radiusSm, padding: 12 }}>
                <CloseCircleOutlined style={{ marginTop: 1 }} /> <span>{error}</span>
              </div>
            )}

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <Btn variant="ghost" type="button" onClick={() => navigate('/warehouse/stock')}>
                Отмена
              </Btn>
              <Btn disabled={!file || checking || confirming} loading={checking}>
                <EyeOutlined /> Проверить файл
              </Btn>
            </div>
          </form>
        </Panel>

        <Panel title={result ? 'Загрузка завершена' : preview ? 'Результат проверки' : 'Этапы загрузки'}>
          {!preview && !result && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
              {[
                ['1', 'Выберите Excel-файл, дату и склад'],
                ['2', 'Проверьте сформированную таблицу и предупреждения'],
                ['3', 'Подтвердите запись проверенных данных в базу'],
              ].map(([number, text]) => (
                <div key={number} style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                  <span style={{ width: 28, height: 28, borderRadius: 999, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: C.accentLight, color: C.accent, fontWeight: 800, fontSize: 12 }}>{number}</span>
                  <span style={{ color: C.text, fontSize: 13 }}>{text}</span>
                </div>
              ))}
            </div>
          )}

          {preview && !result && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                {preview.can_confirm
                  ? <CheckCircleOutlined style={{ color: C.success, fontSize: 21 }} />
                  : <CloseCircleOutlined style={{ color: C.danger, fontSize: 21 }} />}
                <div>
                  <div style={{ fontSize: 14, fontWeight: 750, color: C.heading }}>
                    {preview.can_confirm ? 'Файл готов к подтверждению' : 'Необходимо исправить ошибки'}
                  </div>
                  <div style={{ fontSize: 12, color: C.secondary, marginTop: 3 }}>
                    Данные пока не записаны в базу.
                  </div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 12 }}>
                {[
                  ['Всего', preview.summary.total_rows],
                  ['Корректно', preview.summary.valid_rows],
                  ['Ошибки', preview.summary.invalid_rows],
                  ['Создание', preview.summary.create_assets],
                  ['Обновление', preview.summary.update_assets],
                  ['Предупреждения', preview.summary.warning_rows],
                ].map(([label, value]) => (
                  <div key={label} style={metricStyle}>
                    <div style={{ color: C.heading, fontSize: 20, lineHeight: 1, fontWeight: 800 }}>{value}</div>
                    <div style={{ color: C.secondary, fontSize: 11, marginTop: 5 }}>{label}</div>
                  </div>
                ))}
              </div>
              {previewNewReferenceGroups.length > 0 && (
                <div style={{ borderRadius: C.radiusSm, padding: 12, background: C.warningBg, border: `1px solid ${C.warning}` }}>
                  <div style={{ display: 'flex', gap: 7, color: C.heading, fontSize: 12, fontWeight: 750, marginBottom: 7 }}>
                    <WarningOutlined style={{ color: C.warning }} /> Будут созданы новые справочники
                  </div>
                  {previewNewReferenceGroups.map((group) => (
                    <div key={group.label} style={{ fontSize: 11, color: C.text, marginTop: 4, lineHeight: 1.45 }}>
                      <strong>{group.label}:</strong>{' '}
                      {group.items.map((item) => `${item.name}${item.asset_type ? ` [${item.asset_type}]` : ''}`).join(', ')}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {result && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <CheckCircleOutlined style={{ color: C.success, fontSize: 23 }} />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: C.heading }}>Данные записаны в базу</div>
                  <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
                    {result.asset_types.map((type) => <Badge key={type} status={type} />)}
                    {result.balance_date && <Badge status={result.balance_date} />}
                  </div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12 }}>
                {[
                  ['Обработано строк', result.processed],
                  ['Создано активов', result.created_assets],
                  ['Обновлено активов', result.updated_assets],
                  ['Создано остатков', result.created_stock],
                  ['Обновлено остатков', result.updated_stock],
                ].map(([label, value]) => (
                  <div key={label} style={metricStyle}>
                    <div style={{ color: C.heading, fontSize: 20, lineHeight: 1, fontWeight: 800 }}>{value}</div>
                    <div style={{ color: C.secondary, fontSize: 11, marginTop: 5 }}>{label}</div>
                  </div>
                ))}
              </div>
              {createdReferenceGroups.length > 0 && (
                <div role="alert" style={{ padding: 12, borderRadius: C.radiusSm, border: `1px solid ${C.warning}`, background: C.warningBg }}>
                  <div style={{ fontSize: 12, fontWeight: 750, color: C.heading, marginBottom: 6 }}>
                    Созданы новые записи в справочниках
                  </div>
                  {createdReferenceGroups.map((group) => (
                    <div key={group.label} style={{ fontSize: 11, color: C.text, marginTop: 4 }}>
                      <strong>{group.label}:</strong>{' '}
                      {group.items.map((item) => `${item.name}${item.asset_type ? ` [${item.asset_type}]` : ''} (${item.code})`).join(', ')}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </Panel>
      </div>

      {preview && (
        <Panel
          title="2. Предпросмотр загружаемых данных"
          subtitle="Фильтры применяются только к отображению. Подтверждение загружает весь проверенный файл."
          style={{ marginTop: 18 }}
          noPad
        >
          <div style={{ padding: 16, display: 'grid', gridTemplateColumns: 'minmax(240px, 2fr) repeat(2, minmax(170px, 1fr))', gap: 12 }}>
            <InputField
              label="Поиск в таблице"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Код, наименование, категория, склад..."
            />
            <SelectField
              label="Тип актива"
              value={typeFilter}
              onChange={(event) => {
                setTypeFilter(event.target.value);
                setPage(1);
              }}
              options={[
                { value: '', label: 'Все типы' },
                { value: 'OS', label: 'ОС' },
                { value: 'NMA', label: 'НМА' },
                { value: 'TMZ', label: 'ТМЗ' },
              ]}
            />
            <SelectField
              label="Статус проверки"
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value);
                setPage(1);
              }}
              options={[
                { value: '', label: 'Все статусы' },
                { value: 'ready', label: 'Готово' },
                { value: 'new_references', label: 'Новые справочники' },
                { value: 'warning', label: 'Предупреждения' },
                { value: 'error', label: 'Ошибки' },
              ]}
            />
          </div>

          <div style={{ overflowX: 'auto', borderTop: `1px solid ${C.rowBorder}` }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 1700 }}>
              <thead>
                <tr>
                  <Th>Строка</Th>
                  <Th>Статус</Th>
                  <Th>Тип</Th>
                  <Th>Код Excel</Th>
                  <Th>Код в БД</Th>
                  <Th>Наименование</Th>
                  <Th>Ед. изм.</Th>
                  <Th right>Количество</Th>
                  <Th right>Цена</Th>
                  <Th right>Сумма</Th>
                  <Th>Категория</Th>
                  <Th>Склад</Th>
                  <Th>Действие</Th>
                </tr>
              </thead>
              <tbody>
                {pageRows.map((row) => (
                  <tr
                    key={row.excel_row}
                    onMouseEnter={(event) => hoverRow(event, true)}
                    onMouseLeave={(event) => hoverRow(event, false)}
                    style={{
                      background: row.errors.length
                        ? C.dangerBg
                        : row.warnings.length || row.new_references.length
                          ? C.warningBg
                          : undefined,
                    }}
                  >
                    <Td muted>{row.excel_row}</Td>
                    <Td><PreviewStatus row={row} /></Td>
                    <Td><Badge status={row.asset_type} /></Td>
                    <Td>{row.source_code || '—'}</Td>
                    <Td bold>{row.code || '—'}</Td>
                    <Td style={{ minWidth: 280, whiteSpace: 'normal' }}>
                      <div style={{ fontWeight: 650, color: C.heading }}>{row.name || '—'}</div>
                      {row.errors.map((message) => (
                        <div key={message} style={{ color: C.danger, fontSize: 11, marginTop: 4 }}>{message}</div>
                      ))}
                      {row.warnings.map((message) => (
                        <div key={message} style={{ color: C.warning, fontSize: 11, marginTop: 4 }}>{message}</div>
                      ))}
                      {row.new_references.map((message) => (
                        <div key={message} style={{ color: C.warning, fontSize: 11, marginTop: 4 }}>Будет создано: {message}</div>
                      ))}
                    </Td>
                    <Td>{row.unit || '—'}</Td>
                    <Td right>{formatNumber(row.quantity)}</Td>
                    <Td right>{formatNumber(row.unit_price)}</Td>
                    <Td right>{formatNumber(row.total_amount)}</Td>
                    <Td style={{ maxWidth: 240, whiteSpace: 'normal' }}>{row.category || '—'}</Td>
                    <Td style={{ maxWidth: 220, whiteSpace: 'normal' }}>{row.warehouse || '—'}</Td>
                    <Td>
                      {row.action === 'create'
                        ? <span style={{ color: C.success, fontWeight: 700 }}>Создание</span>
                        : row.action === 'update'
                          ? <span style={{ color: C.accent, fontWeight: 700 }}>Обновление</span>
                          : '—'}
                    </Td>
                  </tr>
                ))}
                {pageRows.length === 0 && (
                  <tr>
                    <Td style={{ textAlign: 'center', padding: 28 }} muted>
                      По выбранным фильтрам строки не найдены
                    </Td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div style={{ padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap', borderTop: `1px solid ${C.rowBorder}` }}>
            <div style={{ color: C.secondary, fontSize: 12 }}>
              Показано {pageRows.length} из {filteredRows.length} строк · Страница {visiblePage} из {totalPages}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <Btn variant="secondary" disabled={visiblePage <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))}>
                Назад
              </Btn>
              <Btn variant="secondary" disabled={visiblePage >= totalPages} onClick={() => setPage((current) => Math.min(totalPages, current + 1))}>
                Далее
              </Btn>
            </div>
          </div>
        </Panel>
      )}

      {preview && (
        <div
          style={{
            marginTop: 18,
            padding: 16,
            borderRadius: C.radiusLg,
            border: `1px solid ${preview.can_confirm ? C.success : C.danger}`,
            background: preview.can_confirm ? C.successBg : C.dangerBg,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 16,
            flexWrap: 'wrap',
          }}
        >
          <div style={{ minWidth: 260, flex: 1 }}>
            <div style={{ color: C.heading, fontSize: 14, fontWeight: 800 }}>
              {result
                ? 'Загрузка подтверждена'
                : preview.can_confirm
                  ? '3. Подтвердите загрузку проверенных данных'
                  : `Подтверждение заблокировано: ошибок — ${preview.summary.invalid_rows}`}
            </div>
            <div style={{ color: C.secondary, fontSize: 12, marginTop: 4 }}>
              {result
                ? 'Данные уже сохранены и доступны в системе.'
                : preview.can_confirm
                  ? `В базу будут записаны все ${preview.summary.valid_rows} проверенных строк.`
                  : 'Исправьте Excel-файл и выполните проверку повторно.'}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {!result && (
              <Btn variant="secondary" disabled={checking || confirming} loading={checking} onClick={() => handlePreview()}>
                <SearchOutlined /> Проверить повторно
              </Btn>
            )}
            <Btn
              disabled={!preview.can_confirm || confirming || checking || Boolean(result)}
              loading={confirming}
              success={Boolean(result)}
              onClick={handleConfirm}
            >
              {result ? <CheckCircleOutlined /> : <DatabaseOutlined />}
              {result ? 'Загрузка подтверждена' : 'Подтвердить загрузку в БД'}
            </Btn>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockUploadPage;
