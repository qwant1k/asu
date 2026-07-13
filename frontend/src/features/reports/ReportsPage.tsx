import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  AuditOutlined,
  CaretDownFilled,
  CaretUpFilled,
  CloseCircleOutlined,
  DatabaseOutlined,
  DownloadOutlined,
  FileTextOutlined,
  LeftOutlined,
  SearchOutlined,
  SwapOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import api from '../../api/axios';
import type { AssetCategory, Department, PaginatedResponse } from '../../shared/types';
import { Badge, Btn, C, EmptyState, FilterBar, InputField, PageHeader, Panel, SelectField, Spinner, Th, Td, hoverRow } from '../../shared/ui/primitives';
import AssetLink from '../../shared/components/AssetLink';

type FilterKey = 'search' | 'assetType' | 'category' | 'group' | 'dateRange' | 'movementType' | 'requestStatus' | 'actType' | 'department';

interface ReportColumn {
  key: string;
  label: string;
  right?: boolean;
  badge?: boolean;
  assetLink?: boolean;
}

interface ReportConfig {
  key: string;
  endpoint: string;
  titleKey: string;
  section: 'stock' | 'assignments' | 'movement' | 'requests';
  icon: React.ReactNode;
  fixedAssetType?: 'TMZ' | 'OS' | 'NMA';
  filters: FilterKey[];
  columns: ReportColumn[];
}

const SECTIONS: { key: ReportConfig['section']; label: string }[] = [
  { key: 'stock', label: 'Склад и остатки' },
  { key: 'assignments', label: 'Закрепления и инвентаризация' },
  { key: 'movement', label: 'Движение и списания' },
  { key: 'requests', label: 'Заявки' },
];

const MOVEMENT_TYPES = [
  { value: 'RECEIPT', label: 'Оприходование' },
  { value: 'ISSUE', label: 'Выдача' },
  { value: 'TRANSFER', label: 'Перемещение' },
  { value: 'WRITE_OFF', label: 'Списание' },
  { value: 'INVENTORY_ADJUSTMENT', label: 'Корректировка по инвентаризации' },
];

const REQUEST_STATUSES = [
  { value: 'DRAFT', label: 'Черновик' },
  { value: 'SENT_FOR_REVISION', label: 'На корректировке' },
  { value: 'PENDING_SUPERVISOR', label: 'На согласовании у руководителя' },
  { value: 'APPROVED_SUPERVISOR', label: 'Согласована руководителем' },
  { value: 'APPROVED_MOL', label: 'Согласована МОЛ' },
  { value: 'APPROVED_AHS_HEAD', label: 'Утверждена руководителем АХС' },
  { value: 'APPROVED', label: 'Согласована' },
  { value: 'EXECUTED', label: 'Выдана' },
  { value: 'REJECTED', label: 'Отклонена' },
  { value: 'CANCELLED', label: 'Отменена' },
];

const WRITE_OFF_TYPES = [
  { value: 'TMZ', label: 'Списание ТМЗ' },
  { value: 'REPRESENTATIVE_TMZ', label: 'Списание представительских ТМЗ' },
  { value: 'OS_NMA', label: 'Списание ОС/НМА' },
  { value: 'DESTRUCTION', label: 'Акт уничтожения' },
];

const PAGE_SIZE_OPTIONS = [25, 50, 100, 200];

const reports: ReportConfig[] = [
  {
    key: '/reports/tmz-stock',
    endpoint: '/reports/tmz-stock/',
    titleKey: 'reports.tmzStock',
    section: 'stock',
    icon: <DatabaseOutlined />,
    fixedAssetType: 'TMZ',
    filters: ['search', 'category', 'group', 'dateRange'],
    columns: [
      { key: 'asset_code', label: 'Код' },
      { key: 'asset_name', label: 'Наименование', assetLink: true },
      { key: 'asset_type_display', label: 'Тип', badge: true },
      { key: 'unit_of_measure', label: 'Ед.' },
      { key: 'quantity', label: 'Кол-во', right: true },
      { key: 'unit_price', label: 'Цена', right: true },
      { key: 'total_amount', label: 'Сумма', right: true },
      { key: 'location', label: 'Склад' },
    ],
  },
  {
    key: '/reports/os-stock',
    endpoint: '/reports/os-stock/',
    titleKey: 'reports.osStock',
    section: 'stock',
    icon: <DatabaseOutlined />,
    fixedAssetType: 'OS',
    filters: ['search', 'category', 'group', 'dateRange'],
    columns: [
      { key: 'asset_code', label: 'Код' },
      { key: 'asset_name', label: 'Наименование', assetLink: true },
      { key: 'quantity', label: 'Кол-во', right: true },
      { key: 'unit_price', label: 'Цена', right: true },
      { key: 'total_amount', label: 'Сумма', right: true },
      { key: 'location', label: 'Склад' },
    ],
  },
  {
    key: '/reports/os-balance',
    endpoint: '/reports/os-balance/',
    titleKey: 'reports.osBalance',
    section: 'assignments',
    icon: <TeamOutlined />,
    fixedAssetType: 'OS',
    filters: ['search', 'category', 'group', 'dateRange'],
    columns: [
      { key: 'user_name', label: 'Сотрудник' },
      { key: 'department_name', label: 'Подразделение' },
      { key: 'asset_code', label: 'Код' },
      { key: 'asset_name', label: 'Актив', assetLink: true },
      { key: 'inventory_number', label: 'Инв. номер' },
      { key: 'quantity', label: 'Кол-во', right: true },
    ],
  },
  {
    key: '/reports/nma-balance',
    endpoint: '/reports/nma-balance/',
    titleKey: 'reports.nmaBalance',
    section: 'assignments',
    icon: <TeamOutlined />,
    fixedAssetType: 'NMA',
    filters: ['search', 'category', 'group', 'dateRange'],
    columns: [
      { key: 'user_name', label: 'Сотрудник' },
      { key: 'department_name', label: 'Подразделение' },
      { key: 'asset_code', label: 'Код' },
      { key: 'asset_name', label: 'Актив', assetLink: true },
      { key: 'inventory_number', label: 'Инв. номер' },
      { key: 'quantity', label: 'Кол-во', right: true },
    ],
  },
  {
    key: '/reports/inventory-report',
    endpoint: '/reports/inventory-report/',
    titleKey: 'reports.inventoryReport',
    section: 'assignments',
    icon: <AuditOutlined />,
    filters: ['search', 'assetType', 'category', 'group', 'department'],
    columns: [
      { key: 'user_name', label: 'Сотрудник' },
      { key: 'department_name', label: 'Подразделение' },
      { key: 'asset_type_display', label: 'Тип', badge: true },
      { key: 'asset_code', label: 'Код' },
      { key: 'asset_name', label: 'Актив', assetLink: true },
      { key: 'inventory_number', label: 'Инв. номер' },
      { key: 'quantity', label: 'Кол-во', right: true },
    ],
  },
  {
    key: '/reports/movement',
    endpoint: '/reports/movement/',
    titleKey: 'reports.movement',
    section: 'movement',
    icon: <SwapOutlined />,
    filters: ['search', 'assetType', 'category', 'group', 'dateRange', 'movementType'],
    columns: [
      { key: 'performed_at', label: 'Дата' },
      { key: 'movement_type_display', label: 'Операция', badge: true },
      { key: 'asset_code', label: 'Код' },
      { key: 'asset_name', label: 'Актив', assetLink: true },
      { key: 'quantity', label: 'Кол-во', right: true },
      { key: 'total_amount', label: 'Сумма', right: true },
      { key: 'to_user_name', label: 'Кому' },
      { key: 'performed_by_name', label: 'Выполнил' },
    ],
  },
  {
    key: '/reports/write-offs',
    endpoint: '/reports/write-offs/',
    titleKey: 'reports.writeOffs',
    section: 'movement',
    icon: <SwapOutlined />,
    filters: ['dateRange', 'actType'],
    columns: [
      { key: 'number', label: 'Номер' },
      { key: 'date', label: 'Дата' },
      { key: 'status_display', label: 'Статус', badge: true },
      { key: 'act_type_display', label: 'Тип' },
      { key: 'total_amount', label: 'Сумма', right: true },
    ],
  },
  {
    key: '/reports/request-journal',
    endpoint: '/reports/request-journal/',
    titleKey: 'reports.requestJournal',
    section: 'requests',
    icon: <FileTextOutlined />,
    filters: ['dateRange', 'requestStatus'],
    columns: [
      { key: 'number', label: 'Номер' },
      { key: 'request_type_name', label: 'Вид заявки' },
      { key: 'request_type_asset_type', label: 'Тип', badge: true },
      { key: 'status_display', label: 'Статус', badge: true },
      { key: 'initiator_name', label: 'Инициатор' },
      { key: 'created_at', label: 'Создано' },
    ],
  },
];

const EMPTY_FILTERS = {
  search: '',
  dateFrom: '',
  dateTo: '',
  assetType: '',
  category: '',
  group: '',
  movementType: '',
  requestStatus: '',
  actType: '',
  departmentId: '',
};

function formatSummaryValue(value: any): string {
  const num = typeof value === 'number' ? value : parseFloat(String(value).replace(/\s/g, ''));
  if (!Number.isNaN(num) && String(value).match(/^-?[\d.,]+$/)) {
    return num.toLocaleString('ru-RU', { maximumFractionDigits: 2 });
  }
  return String(value);
}

const ReportsPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const activeReport = useMemo(() => reports.find((r) => r.key === location.pathname), [location.pathname]);

  const [data, setData] = useState<any[]>([]);
  const [summary, setSummary] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [categories, setCategories] = useState<AssetCategory[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);

  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [searchInput, setSearchInput] = useState('');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [pageSize, setPageSize] = useState(50);
  const [page, setPage] = useState(1);

  const setFilter = (key: keyof typeof EMPTY_FILTERS, value: string) => setFilters((prev) => ({ ...prev, [key]: value }));

  // Reset local state whenever the active report changes
  useEffect(() => {
    setFilters(EMPTY_FILTERS);
    setSearchInput('');
    setSortKey(null);
    setSortDir('asc');
    setPage(1);
  }, [activeReport?.key]);

  // Debounce free-text search
  useEffect(() => {
    const timer = setTimeout(() => setFilter('search' as any, searchInput), 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const has = useCallback((key: FilterKey) => !!activeReport?.filters.includes(key), [activeReport]);

  const params = useMemo(() => {
    const next: Record<string, string> = {};
    if (!activeReport) return next;
    if (has('dateRange')) {
      if (filters.dateFrom) next.date_from = filters.dateFrom;
      if (filters.dateTo) next.date_to = filters.dateTo;
    }
    if (has('assetType') && filters.assetType) next.asset_type = filters.assetType;
    if (has('search') && filters.search) next.search = filters.search;
    if (has('category') && filters.category) next.category = filters.category;
    if (has('group') && filters.group) next.group = filters.group;
    if (has('movementType') && filters.movementType) next.movement_type = filters.movementType;
    if (has('requestStatus') && filters.requestStatus) next.status = filters.requestStatus;
    if (has('actType') && filters.actType) next.act_type = filters.actType;
    if (has('department') && filters.departmentId) next.department_id = filters.departmentId;
    return next;
  }, [activeReport, filters, has]);

  const fetchReport = useCallback(async () => {
    if (!activeReport) return;
    setLoading(true);
    try {
      const res = await api.get(activeReport.endpoint, { params });
      setData(res.data.data || []);
      setSummary(res.data.summary || {});
    } catch {
      setData([]);
      setSummary({});
    } finally {
      setLoading(false);
    }
  }, [activeReport, params]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  useEffect(() => { setPage(1); }, [data, pageSize]);

  // Categories, scoped to the report's fixed asset type (or the selected one for reports without a fixed type)
  const categoryAssetType = activeReport?.fixedAssetType || filters.assetType;
  useEffect(() => {
    if (!activeReport || !(has('category') || has('group'))) { setCategories([]); return; }
    (async () => {
      try {
        const p: Record<string, any> = { page_size: 500, ordering: 'name' };
        if (categoryAssetType) p.asset_type = categoryAssetType;
        const res = await api.get<PaginatedResponse<AssetCategory>>('/references/asset-categories/', { params: p });
        setCategories(res.data.results || []);
      } catch { setCategories([]); }
    })();
  }, [activeReport?.key, categoryAssetType, has]);

  useEffect(() => {
    if (!activeReport || !has('department')) { setDepartments([]); return; }
    (async () => {
      try {
        const res = await api.get<PaginatedResponse<Department>>('/departments/', { params: { page_size: 500, ordering: 'name' } });
        setDepartments(res.data.results || []);
      } catch { setDepartments([]); }
    })();
  }, [activeReport?.key, has]);

  const topCategories = useMemo(() => categories.filter((c: any) => !c.parent), [categories]);
  const groupOptions = useMemo(() => categories.filter((c: any) => c.parent && (!filters.category || String(c.parent) === filters.category)), [categories, filters.category]);

  const resetFilters = () => {
    setFilters(EMPTY_FILTERS);
    setSearchInput('');
  };

  const activeFilterCount = useMemo(() => Object.values(filters).filter(Boolean).length, [filters]);

  const toggleSort = (key: string) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('asc'); }
  };

  const sortedData = useMemo(() => {
    if (!sortKey) return data;
    const col = activeReport?.columns.find((c) => c.key === sortKey);
    const copy = [...data];
    copy.sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (col?.right) {
        const an = parseFloat(String(av).replace(/\s/g, '')) || 0;
        const bn = parseFloat(String(bv).replace(/\s/g, '')) || 0;
        return sortDir === 'asc' ? an - bn : bn - an;
      }
      const as = String(av ?? '');
      const bs = String(bv ?? '');
      return sortDir === 'asc' ? as.localeCompare(bs, 'ru') : bs.localeCompare(as, 'ru');
    });
    return copy;
  }, [data, sortKey, sortDir, activeReport]);

  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));
  const pagedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, page, pageSize]);

  const exportReport = async () => {
    if (!activeReport) return;
    setExporting(true);
    try {
      const res = await api.get(activeReport.endpoint, {
        params: { ...params, export: 'xlsx' },
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `${activeReport.endpoint.split('/').filter(Boolean).pop()}_${new Date().toISOString().slice(0, 10)}.xlsx`;
      link.click();
      window.URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  };

  if (!activeReport) {
    return (
      <div>
        <PageHeader title={t('reports.title')} subtitle="Готовые отчёты по складу, закреплениям, движению активов и заявкам с фильтрами и выгрузкой в Excel." />
        {SECTIONS.map((section) => {
          const items = reports.filter((r) => r.section === section.key);
          if (items.length === 0) return null;
          return (
            <div key={section.key} style={{ marginBottom: 28 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: C.secondary, textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 12 }}>
                {section.label}
              </div>
              <div className="ui-action-grid">
                {items.map((r) => (
                  <div key={r.key} className="ui-action-card" onClick={() => navigate(r.key)}>
                    <div className="ui-action-card-icon">{r.icon}</div>
                    <div style={{ fontSize: 14, fontWeight: 750, color: C.heading, lineHeight: 1.35 }}>{t(r.titleKey)}</div>
                    <div style={{ fontSize: 12, color: C.secondary }}>Таблица и Excel-выгрузка</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={t(activeReport.titleKey)}
        right={
          <>
            <Btn variant="secondary" onClick={() => navigate('/reports')}><LeftOutlined /> {t('common.back')}</Btn>
            <Btn onClick={exportReport} loading={exporting}><DownloadOutlined /> {t('common.exportExcel')}</Btn>
          </>
        }
      />

      <FilterBar style={{ marginBottom: 16 }}>
        {has('search') && (
          <div style={{ position: 'relative', minWidth: 220 }}>
            <SearchOutlined style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: C.muted, fontSize: 13, zIndex: 1 }} />
            <InputField value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder={t('common.search')} style={{ paddingLeft: 32 }} />
          </div>
        )}
        {has('dateRange') && (
          <>
            <InputField type="date" value={filters.dateFrom} onChange={(e) => setFilter('dateFrom', e.target.value)} style={{ minWidth: 150 }} />
            <InputField type="date" value={filters.dateTo} onChange={(e) => setFilter('dateTo', e.target.value)} style={{ minWidth: 150 }} />
          </>
        )}
        {has('assetType') && (
          <SelectField
            value={filters.assetType}
            onChange={(e) => { setFilter('assetType', e.target.value); setFilter('category', ''); setFilter('group', ''); }}
            options={[{ value: '', label: 'Все типы' }, { value: 'TMZ', label: 'ТМЗ' }, { value: 'OS', label: 'ОС' }, { value: 'NMA', label: 'НМА' }]}
          />
        )}
        {has('category') && (
          <SelectField
            value={filters.category}
            onChange={(e) => { setFilter('category', e.target.value); setFilter('group', ''); }}
            options={[{ value: '', label: 'Все категории' }, ...topCategories.map((c: any) => ({ value: c.id, label: c.name }))]}
          />
        )}
        {has('group') && (
          <SelectField
            value={filters.group}
            onChange={(e) => setFilter('group', e.target.value)}
            options={[{ value: '', label: 'Все группы' }, ...groupOptions.map((c: any) => ({ value: c.id, label: c.name }))]}
          />
        )}
        {has('movementType') && (
          <SelectField
            value={filters.movementType}
            onChange={(e) => setFilter('movementType', e.target.value)}
            options={[{ value: '', label: 'Все операции' }, ...MOVEMENT_TYPES]}
          />
        )}
        {has('requestStatus') && (
          <SelectField
            value={filters.requestStatus}
            onChange={(e) => setFilter('requestStatus', e.target.value)}
            options={[{ value: '', label: 'Все статусы' }, ...REQUEST_STATUSES]}
          />
        )}
        {has('actType') && (
          <SelectField
            value={filters.actType}
            onChange={(e) => setFilter('actType', e.target.value)}
            options={[{ value: '', label: 'Все типы актов' }, ...WRITE_OFF_TYPES]}
          />
        )}
        {has('department') && (
          <SelectField
            value={filters.departmentId}
            onChange={(e) => setFilter('departmentId', e.target.value)}
            options={[{ value: '', label: 'Все подразделения' }, ...departments.map((d) => ({ value: d.id, label: d.name }))]}
          />
        )}
        {activeFilterCount > 0 && (
          <Btn variant="ghost" onClick={resetFilters}><CloseCircleOutlined /> Сбросить фильтры</Btn>
        )}
      </FilterBar>

      {Object.keys(summary).length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 16 }}>
          {Object.entries(summary).map(([key, value]) => (
            <Panel key={key}>
              <div style={{ fontSize: 12, color: C.secondary, marginBottom: 6 }}>{key}</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: C.heading }}>{formatSummaryValue(value)}</div>
            </Panel>
          ))}
        </div>
      )}

      <Panel noPad>
        {loading ? <Spinner /> : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
                <thead>
                  <tr>
                    {activeReport.columns.map((c) => (
                      <Th key={c.key} right={c.right}>
                        <span
                          onClick={() => toggleSort(c.key)}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 4, cursor: 'pointer', userSelect: 'none', justifyContent: c.right ? 'flex-end' : 'flex-start' }}
                        >
                          {c.label}
                          {sortKey === c.key
                            ? (sortDir === 'asc' ? <CaretUpFilled style={{ fontSize: 9 }} /> : <CaretDownFilled style={{ fontSize: 9 }} />)
                            : <span style={{ width: 9, display: 'inline-block' }} />}
                        </span>
                      </Th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pagedData.length === 0 ? <tr><td colSpan={activeReport.columns.length}><EmptyState text={t('common.noData')} /></td></tr> :
                    pagedData.map((row, idx) => (
                      <tr key={idx} onMouseEnter={(e) => hoverRow(e, true)} onMouseLeave={(e) => hoverRow(e, false)}>
                        {activeReport.columns.map((c) => (
                          <Td key={c.key} right={c.right} muted={!row[c.key]}>
                            {c.badge && row[c.key]
                              ? <Badge status={String(row[c.key])} />
                              : c.assetLink && row.asset
                                ? <AssetLink assetId={row.asset}>{String(row[c.key] ?? '—')}</AssetLink>
                                : String(row[c.key] ?? '—')}
                          </Td>
                        ))}
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
            {data.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '12px 16px', borderTop: `1px solid ${C.rowBorder}`, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 12, color: C.secondary }}>
                  Показано {pagedData.length} из {sortedData.length} {sortedData.length === data.length ? '' : `(отфильтровано из ${data.length})`}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <SelectField
                    value={pageSize}
                    onChange={(e) => setPageSize(Number(e.target.value))}
                    options={PAGE_SIZE_OPTIONS.map((n) => ({ value: n, label: `${n} на странице` }))}
                    style={{ minWidth: 130 }}
                  />
                  <Btn variant="secondary" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>‹</Btn>
                  <span style={{ fontSize: 12, color: C.secondary }}>{page} / {totalPages}</span>
                  <Btn variant="secondary" disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>›</Btn>
                </div>
              </div>
            )}
          </>
        )}
      </Panel>
    </div>
  );
};

export default ReportsPage;
