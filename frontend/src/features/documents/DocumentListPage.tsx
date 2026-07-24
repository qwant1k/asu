import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  EditOutlined,
  FileDoneOutlined,
  LeftOutlined,
  PlusOutlined,
  PrinterOutlined,
  RollbackOutlined,
  SaveOutlined,
  SendOutlined,
} from '@ant-design/icons';
import api from '../../api/axios';
import type { Asset, Counterparty, DocumentStatus, PaginatedResponse, User, Warehouse } from '../../shared/types';
import { useAppSelector } from '../../app/hooks';
import { isManagerUser } from '../../shared/auth/access';
import {
  Badge,
  Btn,
  C,
  EmptyState,
  InputField,
  Modal,
  PageHeader,
  Panel,
  Spinner,
  Surface,
  Td,
  TextAreaField,
  Th,
  hoverRow,
} from '../../shared/ui/primitives';
import AssetLink from '../../shared/components/AssetLink';

type DocumentKind = 'incoming' | 'writeOff' | 'petition' | 'protocol' | 'transfer';
type ActionKind = 'approve' | 'revision' | 'reject' | 'changeRequest';

interface DocumentConfig {
  basePath: string;
  endpoint: string;
  kind: DocumentKind;
  title: string;
  createTitle: string;
  documentName: string;
  formHint: string;
  itemKey: 'items' | 'attachment_items';
  description: string;
}

interface DocumentRow {
  asset: string;
  quantity: string;
  unit_price: string;
}

interface CommissionRow {
  user: string;
  role_label: string;
}

interface ReferencePickerItem {
  id: string;
  title: string;
  subtitle?: string;
  badge?: string;
  searchText: string;
}

interface ReferencePickerState {
  title: string;
  subtitle?: string;
  items: ReferencePickerItem[];
  selectedId: string;
  onSelect: (id: string) => void;
}

interface DocumentFormState {
  asset_type: string;
  counterparty: string;
  mol_warehouse: string;
  warehouse: string;
  act_type: string;
  commission_order_number: string;
  commission_order_date: string;
  is_representative: boolean;
  legal_basis: string;
  petition: string;
  agenda_item: string;
  decision_text: string;
  from_user: string;
  to_user: string;
}

const CONFIGS: DocumentConfig[] = [
  {
    basePath: '/documents/incoming-invoices',
    endpoint: '/documents/incoming-invoices/',
    kind: 'incoming',
    title: 'Приходные накладные',
    createTitle: 'Новая приходная накладная',
    documentName: 'Приходная накладная',
    formHint: 'Форма первичного учетного документа РК',
    itemKey: 'items',
    description: 'Оформление поступления запасов, ОС и НМА на склад.',
  },
  {
    basePath: '/documents/write-off-acts',
    endpoint: '/documents/write-off-acts/',
    kind: 'writeOff',
    title: 'Акты на списание',
    createTitle: 'Новый акт на списание',
    documentName: 'Акт на списание',
    formHint: 'Форма первичного учетного документа РК',
    itemKey: 'items',
    description: 'Списание ТМЗ, представительских ТМЗ, ОС/НМА и акт уничтожения.',
  },
  {
    basePath: '/documents/petitions',
    endpoint: '/documents/petitions/',
    kind: 'petition',
    title: 'Ходатайства',
    createTitle: 'Новое ходатайство',
    documentName: 'Ходатайство на выбытие',
    formHint: 'Документ-основание для выбытия ОС/НМА',
    itemKey: 'items',
    description: 'Инициирование выбытия ОС/НМА с правовым основанием и комиссией.',
  },
  {
    basePath: '/documents/protocols',
    endpoint: '/documents/protocols/',
    kind: 'protocol',
    title: 'Протоколы комиссии',
    createTitle: 'Новый протокол комиссии',
    documentName: 'Протокол заседания комиссии',
    formHint: 'Протокол рабочей комиссии с приложением',
    itemKey: 'attachment_items',
    description: 'Решение комиссии и приложение с перечнем активов.',
  },
  {
    basePath: '/documents/internal-transfers',
    endpoint: '/documents/internal-transfers/',
    kind: 'transfer',
    title: 'Накладные перемещения',
    createTitle: 'Новая накладная перемещения',
    documentName: 'Накладная на внутреннее перемещение',
    formHint: 'Форма З-5. Внутреннее перемещение запасов',
    itemKey: 'items',
    description: 'Передача ОС/НМА между материально ответственными лицами.',
  },
];

const emptyForm: DocumentFormState = {
  asset_type: 'TMZ',
  counterparty: '',
  mol_warehouse: '',
  warehouse: '',
  act_type: 'TMZ',
  commission_order_number: '',
  commission_order_date: '',
  is_representative: false,
  legal_basis: '',
  petition: '',
  agenda_item: '',
  decision_text: '',
  from_user: '',
  to_user: '',
};

const statusOptions: { value: DocumentStatus | ''; label: string }[] = [
  { value: '', label: 'Все статусы' },
  { value: 'DRAFT', label: 'Черновик' },
  { value: 'PENDING_AHS_APPROVAL' as DocumentStatus, label: 'На согласовании АХС' },
  { value: 'PENDING_CHANGE_APPROVAL' as DocumentStatus, label: 'Запрошено изменение' },
  { value: 'SIGNED', label: 'Подписан' },
  { value: 'SENT_FOR_REVISION', label: 'На доработке' },
  { value: 'REJECTED' as DocumentStatus, label: 'Отклонён' },
  { value: 'CANCELLED', label: 'Аннулирован' },
];

const baseAssetType = (value?: string) => (value === 'REPRESENTATIVE_TMZ' ? 'TMZ' : value || 'TMZ');
const asNumber = (value: string) => Number(value || 0);
const money = (value: string | number | null | undefined) => Number(value || 0).toLocaleString('ru-KZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const parseDateValue = (value?: string | null) => {
  if (!value) return null;
  const text = String(value).trim();
  if (!text) return null;

  const ruMatch = text.match(/^(\d{2})\.(\d{2})\.(\d{4})(?:\s+(\d{2}):(\d{2})(?::(\d{2}))?)?$/);
  if (ruMatch) {
    const [, day, month, year, hour = '0', minute = '0', second = '0'] = ruMatch;
    const date = new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute), Number(second));
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const isoDateMatch = text.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoDateMatch) {
    const [, year, month, day] = isoDateMatch;
    const date = new Date(Number(year), Number(month) - 1, Number(day));
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const date = new Date(text);
  return Number.isNaN(date.getTime()) ? null : date;
};

const dateText = (value?: string | null) => {
  const date = parseDateValue(value);
  if (date) return date.toLocaleDateString('ru-KZ');
  return value ? String(value) : '—';
};

const dateTimeText = (value?: string | null) => {
  const date = parseDateValue(value);
  if (date) return date.toLocaleString('ru-KZ');
  return value ? String(value) : '—';
};

const fieldStyle: React.CSSProperties = {
  padding: '9px 12px',
  border: `1px solid ${C.inputBorder}`,
  borderRadius: C.radiusSm,
  fontSize: 13,
  color: C.text,
  background: C.glassStrong,
  minHeight: 38,
  outline: 'none',
  width: '100%',
};

const showAllButtonStyle: React.CSSProperties = {
  border: `1px solid ${C.border}`,
  borderRadius: C.radiusSm,
  background: C.surfaceSoft,
  color: C.accent,
  minHeight: 38,
  padding: '0 12px',
  fontSize: 12,
  fontWeight: 750,
  cursor: 'pointer',
  whiteSpace: 'nowrap',
};

const getConfig = (pathname: string) => (
  CONFIGS.find((config) => pathname.startsWith(config.basePath)) || CONFIGS[0]
);

const itemTotal = (row: DocumentRow) => asNumber(row.quantity) * asNumber(row.unit_price);
const getItems = (detail: any, config: DocumentConfig) => detail?.[config.itemKey] || detail?.items || detail?.attachment_items || [];

const toReferenceSearch = (parts: Array<string | number | null | undefined>) => (
  parts.map((part) => (part === null || part === undefined ? '' : String(part).trim())).filter(Boolean).join(' ').toLowerCase()
);

function ReferencePickerModal({
  picker,
  onClose,
}: {
  picker: ReferencePickerState | null;
  onClose: () => void;
}) {
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState('');

  useEffect(() => {
    setQuery('');
    setSelectedId(picker?.selectedId || '');
  }, [picker]);

  const filteredItems = useMemo(() => {
    if (!picker) return [];
    const needle = query.trim().toLowerCase();
    const items = needle ? picker.items.filter((item) => item.searchText.includes(needle)) : picker.items;
    return items.slice(0, 300);
  }, [picker, query]);

  if (!picker) return null;

  const choose = (id = selectedId) => {
    if (!id) return;
    picker.onSelect(id);
    onClose();
  };

  return (
    <Modal
      open={!!picker}
      onClose={onClose}
      title={picker.title}
      width={860}
      footer={(
        <>
          <Btn variant="secondary" onClick={onClose}>Закрыть</Btn>
          <Btn onClick={() => choose()} disabled={!selectedId}>Выбрать</Btn>
        </>
      )}
    >
      {picker.subtitle && <div style={{ color: C.secondary, fontSize: 13, marginBottom: 12 }}>{picker.subtitle}</div>}
      <input
        autoFocus
        placeholder="Поиск по справочнику"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        style={{ ...fieldStyle, marginBottom: 12 }}
      />
      <div style={{ border: `1px solid ${C.border}`, borderRadius: C.radiusMd, overflow: 'hidden', background: C.surfaceSoft }}>
        <div style={{ maxHeight: 460, overflow: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 680 }}>
            <thead>
              <tr>
                <Th>Наименование</Th>
                <Th>Детали</Th>
                <Th>Тип</Th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.length === 0 ? (
                <tr><td colSpan={3}><EmptyState text="В справочнике ничего не найдено" /></td></tr>
              ) : filteredItems.map((item) => {
                const active = item.id === selectedId;
                return (
                  <tr
                    key={item.id}
                    onClick={() => setSelectedId(item.id)}
                    onDoubleClick={() => choose(item.id)}
                    style={{ cursor: 'pointer', background: active ? C.accentSubtle : undefined }}
                  >
                    <Td bold>{item.title}</Td>
                    <Td muted>{item.subtitle || '—'}</Td>
                    <Td>{item.badge ? <Badge status={item.badge} /> : '—'}</Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      {picker.items.length > filteredItems.length && (
        <div style={{ color: C.muted, fontSize: 12, marginTop: 8 }}>
          Показаны первые {filteredItems.length} записей. Уточните поиск, чтобы сузить список.
        </div>
      )}
    </Modal>
  );
}

function DocumentPrintView({ detail, config }: { detail: any; config: DocumentConfig }) {
  const items = getItems(detail, config);
  const total = detail.total_amount || items.reduce((sum: number, item: any) => sum + Number(item.total || 0), 0);
  const approvedSignature = (detail.signatures || []).find((sig: any) => sig.signed_at);

  return (
    <div className="document-print-area">
      <section className="document-print-sheet">
        <div className="document-print-topline">
          <span>Республика Казахстан</span>
          <span>{config.formHint}</span>
        </div>

        <div className="document-print-approval">
          <div />
          <div>
            <div className="document-print-small">УТВЕРЖДАЮ</div>
            <div className="document-print-line">Руководитель АХС</div>
            <div className="document-print-line">{approvedSignature?.signer_name || ''}</div>
            <div className="document-print-small">{approvedSignature?.signed_at ? dateText(approvedSignature.signed_at) : '"___" __________ 20__ г.'}</div>
          </div>
        </div>

        <h1>{config.documentName}</h1>
        <div className="document-print-number">
          № {detail.number || 'б/н'} от {dateText(detail.date || detail.created_at)}
        </div>

        <div className="document-print-grid">
          <div>
            <span>Организация</span>
            <strong>ИС «АСУ»</strong>
          </div>
          <div>
            <span>БИН</span>
            <strong>________________</strong>
          </div>
          {detail.counterparty_name && (
            <div>
              <span>Контрагент</span>
              <strong>{detail.counterparty_name}{detail.counterparty_bin ? `, БИН ${detail.counterparty_bin}` : ''}</strong>
            </div>
          )}
          {detail.mol_name && (
            <div>
              <span>МОЛ склада</span>
              <strong>{detail.mol_name}</strong>
            </div>
          )}
          {detail.warehouse_name && (
            <div>
              <span>Склад</span>
              <strong>{detail.warehouse_name}</strong>
            </div>
          )}
          {detail.from_user_name && (
            <div>
              <span>Отправитель</span>
              <strong>{detail.from_user_name}</strong>
            </div>
          )}
          {detail.to_user_name && (
            <div>
              <span>Получатель</span>
              <strong>{detail.to_user_name}</strong>
            </div>
          )}
          {detail.legal_basis && (
            <div className="document-print-grid-wide">
              <span>Основание</span>
              <strong>{detail.legal_basis}</strong>
            </div>
          )}
          {detail.agenda_item && (
            <div className="document-print-grid-wide">
              <span>Повестка</span>
              <strong>{detail.agenda_item}</strong>
            </div>
          )}
          {detail.decision_text && (
            <div className="document-print-grid-wide">
              <span>Решение комиссии</span>
              <strong>{detail.decision_text}</strong>
            </div>
          )}
        </div>

        <table className="document-print-table">
          <thead>
            <tr>
              <th>№</th>
              <th>Наименование</th>
              <th>Код</th>
              <th>Ед.</th>
              <th>Кол-во</th>
              <th>Цена</th>
              <th>Сумма</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item: any, index: number) => (
              <tr key={item.id || index}>
                <td>{index + 1}</td>
                <td>{item.asset_name}</td>
                <td>{item.asset_code}</td>
                <td>{item.unit_of_measure || '—'}</td>
                <td>{item.quantity}</td>
                <td>{item.unit_price ? money(item.unit_price) : '—'}</td>
                <td>{item.total ? money(item.total) : '—'}</td>
              </tr>
            ))}
            <tr>
              <td colSpan={6}><strong>Итого</strong></td>
              <td><strong>{money(total)}</strong></td>
            </tr>
          </tbody>
        </table>

        {detail.commission_members?.length > 0 && (
          <div className="document-print-commission">
            <strong>Состав комиссии</strong>
            {detail.commission_members.map((member: any) => (
              <div key={member.id}>{member.role_label || 'Член комиссии'}: {member.user_name}</div>
            ))}
          </div>
        )}

        <div className="document-print-signatures">
          <div>
            <span>Документ подготовил</span>
            <strong>{detail.created_by_name || ''}</strong>
            <em>подпись</em>
          </div>
          <div>
            <span>Материально ответственное лицо</span>
            <strong>{detail.mol_name || detail.to_user_name || ''}</strong>
            <em>подпись</em>
          </div>
          <div>
            <span>Согласовано</span>
            <strong>{approvedSignature?.signer_name || ''}</strong>
            <em>подпись</em>
          </div>
        </div>
      </section>
    </div>
  );
}

const DocumentListPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAppSelector((state) => state.auth);
  const [searchParams] = useSearchParams();
  const config = useMemo(() => getConfig(location.pathname), [location.pathname]);
  const tail = location.pathname.slice(config.basePath.length).replace(/^\/+/, '');
  const isCreateMode = tail === 'new';
  const detailId = tail && tail !== 'new' ? tail : '';

  const initialAssetId = searchParams.get('asset') || '';
  const initialQuantity = searchParams.get('quantity') || '1';
  const userPermissions = user?.effective_permissions || [];
  const canEditDocuments = Boolean(
    user
    && (
      isManagerUser(user)
      || user.role === 'ADMIN'
      || userPermissions.includes('documents.manage')
      || userPermissions.includes('system.admin')
    ),
  );

  const [data, setData] = useState<any[]>([]);
  const [detail, setDetail] = useState<any | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [counterparties, setCounterparties] = useState<Counterparty[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [petitions, setPetitions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateAfter, setDateAfter] = useState('');
  const [dateBefore, setDateBefore] = useState('');
  const [form, setForm] = useState<DocumentFormState>(emptyForm);
  const [rows, setRows] = useState<DocumentRow[]>([{ asset: initialAssetId, quantity: initialQuantity, unit_price: '0' }]);
  const [commissionRows, setCommissionRows] = useState<CommissionRow[]>([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [actionKind, setActionKind] = useState<ActionKind | null>(null);
  const [actionComment, setActionComment] = useState('');
  const [editingDetail, setEditingDetail] = useState(false);
  const [referencePicker, setReferencePicker] = useState<ReferencePickerState | null>(null);

  const fetchDictionaries = useCallback(async () => {
    const [assetsRes, counterpartiesRes, usersRes, warehousesRes, petitionsRes] = await Promise.allSettled([
      api.get<PaginatedResponse<Asset>>('/references/assets/', { params: { page_size: 1000, ordering: 'name' } }),
      api.get<PaginatedResponse<Counterparty>>('/references/counterparties/', { params: { page_size: 500, is_active: true, ordering: 'name' } }),
      api.get<PaginatedResponse<User>>('/users/', { params: { page_size: 500, ordering: 'last_name' } }),
      api.get<PaginatedResponse<Warehouse>>('/references/warehouses/', { params: { page_size: 500, is_active: true, ordering: 'name' } }),
      api.get<PaginatedResponse<any>>('/documents/petitions/', { params: { page_size: 500, ordering: '-created_at' } }),
    ]);

    const nextAssets = assetsRes.status === 'fulfilled' ? assetsRes.value.data.results || [] : [];
    setAssets(nextAssets);
    setCounterparties(counterpartiesRes.status === 'fulfilled' ? counterpartiesRes.value.data.results || [] : []);
    setUsers(usersRes.status === 'fulfilled' ? usersRes.value.data.results || [] : []);
    setWarehouses(warehousesRes.status === 'fulfilled' ? warehousesRes.value.data.results || [] : []);
    setPetitions(petitionsRes.status === 'fulfilled' ? petitionsRes.value.data.results || [] : []);

    if (initialAssetId && config.kind === 'incoming') {
      const selected = nextAssets.find((asset) => String(asset.id) === initialAssetId);
      if (selected) {
        setForm((prev) => ({ ...prev, asset_type: baseAssetType(selected.asset_type) }));
        setRows([{ asset: initialAssetId, quantity: initialQuantity, unit_price: selected.unit_price || '0' }]);
      }
    }
  }, [config.kind, initialAssetId, initialQuantity]);

  const fetchData = useCallback(async () => {
    if (detailId || isCreateMode) return;
    setLoading(true);
    try {
      const params: any = { page, page_size: 20, ordering: '-created_at' };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (dateAfter) params.date_after = dateAfter;
      if (dateBefore) params.date_before = dateBefore;
      const res = await api.get(config.endpoint, { params });
      setData(res.data.results || []);
      setTotal(res.data.count || 0);
    } catch {
      setData([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [config.endpoint, dateAfter, dateBefore, detailId, isCreateMode, page, search, statusFilter]);

  const fetchDetail = useCallback(async () => {
    if (!detailId) {
      setDetail(null);
      return;
    }
    setDetailLoading(true);
    try {
      const res = await api.get(`${config.endpoint}${detailId}/`);
      setDetail(res.data);
    } catch {
      setDetail(null);
    } finally {
      setDetailLoading(false);
    }
  }, [config.endpoint, detailId]);

  useEffect(() => { fetchDictionaries(); }, [fetchDictionaries]);
  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { fetchDetail(); }, [fetchDetail]);
  useEffect(() => {
    setPage(1);
    setSearch('');
    setStatusFilter('');
    setDateAfter('');
    setDateBefore('');
    setErrorMsg('');
    setForm(emptyForm);
    setRows([{ asset: '', quantity: '1', unit_price: '0' }]);
    setCommissionRows([]);
    setEditingDetail(false);
  }, [config.basePath]);

  const allowedAssetTypes = useMemo(() => {
    if (config.kind === 'writeOff') {
      if (form.act_type === 'OS_NMA' || form.act_type === 'DESTRUCTION') return ['OS', 'NMA'];
      if (form.act_type === 'REPRESENTATIVE_TMZ') return ['REPRESENTATIVE_TMZ', 'TMZ'];
      return ['TMZ', 'REPRESENTATIVE_TMZ'];
    }
    if (config.kind === 'petition' || config.kind === 'protocol' || config.kind === 'transfer') return ['OS', 'NMA'];
    return [form.asset_type];
  }, [config.kind, form.act_type, form.asset_type]);

  const filteredAssets = useMemo(() => (
    assets.filter((asset) => allowedAssetTypes.includes(config.kind === 'incoming' ? baseAssetType(asset.asset_type) : asset.asset_type))
  ), [allowedAssetTypes, assets, config.kind]);

  const assetPickerItems = useMemo<ReferencePickerItem[]>(() => filteredAssets.map((asset) => ({
    id: String(asset.id),
    title: asset.name,
    subtitle: [asset.code, asset.group_name || asset.category_name, asset.warehouse_name || 'Без склада', asset.unit_of_measure].filter(Boolean).join(' · '),
    badge: asset.asset_type_display || asset.asset_type,
    searchText: toReferenceSearch([asset.name, asset.code, asset.category_name, asset.group_name, asset.warehouse_name, asset.unit_of_measure]),
  })), [filteredAssets]);

  const counterpartyPickerItems = useMemo<ReferencePickerItem[]>(() => counterparties.map((item) => ({
    id: String(item.id),
    title: item.name,
    subtitle: [item.bin, item.address, item.phone].filter(Boolean).join(' · '),
    badge: item.is_active ? 'Активен' : 'Неактивен',
    searchText: toReferenceSearch([item.name, item.bin, item.address, item.phone, item.email]),
  })), [counterparties]);

  const userPickerItems = useMemo<ReferencePickerItem[]>(() => users.map((item) => ({
    id: String(item.id),
    title: item.full_name || item.username,
    subtitle: [item.position_ref_name || item.position, item.department_name, item.email].filter(Boolean).join(' · '),
    badge: item.role,
    searchText: toReferenceSearch([item.full_name, item.username, item.position_ref_name, item.position, item.department_name, item.email]),
  })), [users]);

  const warehousePickerItems = useMemo<ReferencePickerItem[]>(() => warehouses.map((item) => ({
    id: String(item.id),
    title: item.name,
    subtitle: [item.code, item.department_name, item.address].filter(Boolean).join(' · '),
    badge: item.is_active ? 'Активен' : 'Неактивен',
    searchText: toReferenceSearch([item.name, item.code, item.department_name, item.address]),
  })), [warehouses]);

  const petitionPickerItems = useMemo<ReferencePickerItem[]>(() => petitions.map((item) => ({
    id: String(item.id),
    title: `№ ${item.number || 'б/н'}`,
    subtitle: [dateText(item.date || item.created_at), item.status_display || item.status, item.created_by_name].filter(Boolean).join(' · '),
    badge: item.status,
    searchText: toReferenceSearch([item.number, item.status_display, item.status, item.created_by_name, item.created_at]),
  })), [petitions]);

  const updateForm = (field: keyof DocumentFormState, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const openReferencePicker = (
    title: string,
    items: ReferencePickerItem[],
    selectedId: string,
    onSelect: (id: string) => void,
    subtitle?: string,
  ) => {
    setReferencePicker({ title, items, selectedId, onSelect, subtitle });
  };

  const openFormReferencePicker = (
    field: keyof DocumentFormState,
    title: string,
    items: ReferencePickerItem[],
    subtitle?: string,
  ) => {
    openReferencePicker(title, items, String(form[field] || ''), (id) => updateForm(field, id), subtitle);
  };

  const openRowAssetPicker = (rowIndex: number) => {
    openReferencePicker(
      'Справочник ТМЗ / ОС / НМА',
      assetPickerItems,
      rows[rowIndex]?.asset || '',
      (id) => updateRow(rowIndex, 'asset', id),
      'Выберите позицию двойным кликом или кнопкой "Выбрать".',
    );
  };

  const openCommissionUserPicker = (rowIndex: number) => {
    openReferencePicker(
      'Справочник сотрудников',
      userPickerItems,
      commissionRows[rowIndex]?.user || '',
      (id) => setCommissionRows((prev) => prev.map((item, idx) => idx === rowIndex ? { ...item, user: id } : item)),
    );
  };

  const renderShowAllButton = (onClick: () => void) => (
    <button type="button" onClick={onClick} style={showAllButtonStyle}>
      Показать все
    </button>
  );

  const fillFormFromDetail = (item: any) => {
    const detailItems = getItems(item, config);
    setForm({
      asset_type: item.asset_type || 'TMZ',
      counterparty: item.counterparty ? String(item.counterparty) : '',
      mol_warehouse: item.mol_warehouse ? String(item.mol_warehouse) : '',
      warehouse: item.warehouse ? String(item.warehouse) : '',
      act_type: item.act_type || 'TMZ',
      commission_order_number: item.commission_order_number || '',
      commission_order_date: item.commission_order_date || '',
      is_representative: Boolean(item.is_representative),
      legal_basis: item.legal_basis || '',
      petition: item.petition ? String(item.petition) : '',
      agenda_item: item.agenda_item || '',
      decision_text: item.decision_text || '',
      from_user: item.from_user ? String(item.from_user) : '',
      to_user: item.to_user ? String(item.to_user) : '',
    });
    setRows(detailItems.length ? detailItems.map((row: any) => ({
      asset: row.asset ? String(row.asset) : '',
      quantity: String(row.quantity || '1'),
      unit_price: String(row.unit_price || '0'),
    })) : [{ asset: '', quantity: '1', unit_price: '0' }]);
    setCommissionRows((item.commission_members || []).map((member: any) => ({
      user: member.user ? String(member.user) : '',
      role_label: member.role_label || 'Член комиссии',
    })));
    setEditingDetail(true);
    setErrorMsg('');
  };

  const updateRow = (index: number, field: keyof DocumentRow, value: string) => {
    setRows((prev) => prev.map((row, idx) => {
      if (idx !== index) return row;
      const next = { ...row, [field]: value };
      if (field === 'asset') {
        const selected = assets.find((asset) => String(asset.id) === value);
        if (selected) next.unit_price = selected.unit_price || next.unit_price;
      }
      return next;
    }));
  };

  const addRow = () => setRows((prev) => [...prev, { asset: '', quantity: '1', unit_price: '0' }]);
  const removeRow = (index: number) => setRows((prev) => prev.filter((_, idx) => idx !== index));
  const addCommissionRow = () => setCommissionRows((prev) => [...prev, { user: '', role_label: 'Член комиссии' }]);
  const removeCommissionRow = (index: number) => setCommissionRows((prev) => prev.filter((_, idx) => idx !== index));

  const buildItems = () => rows
    .filter((row) => row.asset && asNumber(row.quantity) > 0)
    .map((row) => ({
      asset: Number(row.asset),
      quantity: asNumber(row.quantity),
      ...(config.kind !== 'transfer' ? { unit_price: asNumber(row.unit_price) } : {}),
    }));

  const buildCommissionMembers = () => commissionRows
    .filter((row) => row.user)
    .map((row) => ({ user: Number(row.user), role_label: row.role_label }));

  const validate = () => {
    if (config.kind === 'incoming' && !form.counterparty) return 'Выберите контрагента';
    if (config.kind === 'incoming' && !form.warehouse) return 'Выберите склад';
    if (config.kind === 'transfer' && (!form.from_user || !form.to_user)) return 'Выберите отправителя и получателя';
    if (!buildItems().length) return 'Добавьте хотя бы одну позицию';
    return '';
  };

  const submit = async () => {
    const validation = validate();
    if (validation) {
      setErrorMsg(validation);
      return;
    }

    const items = buildItems();
    const commission_members = buildCommissionMembers();
    let payload: any = {};

    if (config.kind === 'incoming') {
      payload = {
        asset_type: form.asset_type,
        counterparty: Number(form.counterparty),
        mol_warehouse: form.mol_warehouse ? Number(form.mol_warehouse) : null,
        warehouse: Number(form.warehouse),
        items,
      };
    } else if (config.kind === 'writeOff') {
      payload = {
        act_type: form.act_type,
        commission_order_number: form.commission_order_number,
        commission_order_date: form.commission_order_date || null,
        is_representative: form.is_representative,
        items,
        commission_members,
      };
    } else if (config.kind === 'petition') {
      payload = { legal_basis: form.legal_basis, items, commission_members };
    } else if (config.kind === 'protocol') {
      payload = {
        petition: form.petition ? Number(form.petition) : null,
        agenda_item: form.agenda_item,
        commission_order_number: form.commission_order_number,
        commission_order_date: form.commission_order_date || null,
        decision_text: form.decision_text,
        attachment_items: items,
        commission_members,
      };
    } else if (config.kind === 'transfer') {
      payload = {
        asset_type: form.asset_type === 'NMA' ? 'NMA' : 'OS',
        from_user: Number(form.from_user),
        to_user: Number(form.to_user),
        items,
      };
    }

    setSaving(true);
    setErrorMsg('');
    try {
      if (editingDetail && detail) {
        await api.put(`${config.endpoint}${detail.id}/`, payload);
        setEditingDetail(false);
        await fetchDetail();
      } else {
        const res = await api.post(config.endpoint, payload);
        navigate(`${config.basePath}/${res.data.id}`);
      }
    } catch (err: any) {
      setErrorMsg(err?.response?.data ? Object.values(err.response.data).flat().join('; ') : 'Не удалось сохранить документ');
    } finally {
      setSaving(false);
    }
  };

  const runDocumentAction = async (kind: ActionKind) => {
    if (!detail) return;
    const isChangeApproval = detail.status === 'PENDING_CHANGE_APPROVAL';
    const url = kind === 'changeRequest'
      ? `${config.endpoint}${detail.id}/request-change/`
      : kind === 'approve'
        ? `${config.endpoint}${detail.id}/${isChangeApproval ? 'approve-change-request' : 'approve-ahs'}/`
        : kind === 'revision'
          ? `${config.endpoint}${detail.id}/send-for-revision/`
          : `${config.endpoint}${detail.id}/${isChangeApproval ? 'reject-change-request' : 'reject-ahs'}/`;
    const payload = kind === 'approve'
      ? { comment: actionComment }
      : { reason: actionComment };

    setSaving(true);
    setErrorMsg('');
    try {
      const res = await api.post(url, payload);
      setDetail(res.data);
      setActionKind(null);
      setActionComment('');
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.detail || 'Не удалось выполнить действие');
    } finally {
      setSaving(false);
    }
  };

  const submitForApproval = async () => {
    if (!detail) return;
    setSaving(true);
    setErrorMsg('');
    try {
      const res = await api.post(`${config.endpoint}${detail.id}/submit-for-approval/`);
      setDetail(res.data);
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.detail || 'Не удалось отправить документ на согласование');
    } finally {
      setSaving(false);
    }
  };

  const renderRowsEditor = () => (
    <Surface>
      <div style={{ padding: '14px 16px', borderBottom: `1px solid ${C.rowBorder}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
        <div>
          <div style={{ fontWeight: 850, color: C.heading }}>Позиции документа</div>
          <div style={{ color: C.secondary, fontSize: 12, marginTop: 2 }}>Подберите активы из справочника и укажите количество.</div>
        </div>
        <Btn variant="secondary" onClick={addRow}><PlusOutlined /> Добавить строку</Btn>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 920 }}>
          <thead>
            <tr>
              <Th>Товар / ОС / НМА</Th>
              <Th right>Количество</Th>
              {config.kind !== 'transfer' && <Th right>Цена</Th>}
              {config.kind !== 'transfer' && <Th right>Сумма</Th>}
              <Th></Th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? <tr><td colSpan={5}><EmptyState text="Добавьте позицию" /></td></tr> : rows.map((row, index) => (
              <tr key={index}>
                <Td>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <select value={row.asset} onChange={(event) => updateRow(index, 'asset', event.target.value)} style={fieldStyle}>
                      <option value="">Выберите позицию</option>
                      {filteredAssets.map((asset) => <option key={asset.id} value={asset.id}>{asset.name} · {asset.code} · {asset.unit_of_measure}</option>)}
                    </select>
                    {renderShowAllButton(() => openRowAssetPicker(index))}
                  </div>
                </Td>
                <Td right><input type="number" min={0} step="0.01" value={row.quantity} onChange={(event) => updateRow(index, 'quantity', event.target.value)} style={{ ...fieldStyle, width: 130 }} /></Td>
                {config.kind !== 'transfer' && <Td right><input type="number" min={0} step="0.01" value={row.unit_price} onChange={(event) => updateRow(index, 'unit_price', event.target.value)} style={{ ...fieldStyle, width: 140 }} /></Td>}
                {config.kind !== 'transfer' && <Td right>{money(itemTotal(row))}</Td>}
                <Td right><button onClick={() => removeRow(index)} style={{ border: 'none', background: 'transparent', color: C.danger, cursor: 'pointer' }}>Удалить</button></Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Surface>
  );

  const renderCommissionEditor = () => {
    if (!['writeOff', 'petition', 'protocol'].includes(config.kind)) return null;
    return (
      <Panel
        title="Комиссия"
        subtitle="Добавьте участников комиссии, которые будут отображаться в печатной форме."
        titleRight={<Btn variant="secondary" onClick={addCommissionRow}><PlusOutlined /> Участник</Btn>}
        style={{ marginTop: 16 }}
      >
        <div style={{ display: 'grid', gap: 10 }}>
          {commissionRows.length === 0 ? <EmptyState text="Комиссия не заполнена" /> : commissionRows.map((row, index) => (
            <div key={index} style={{ display: 'grid', gridTemplateColumns: 'minmax(220px, 1fr) minmax(180px, 260px) auto', gap: 10, alignItems: 'end' }}>
              <div style={{ display: 'grid', gap: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 650, color: C.heading }}>Сотрудник</label>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <select
                    value={row.user}
                    onChange={(event) => setCommissionRows((prev) => prev.map((item, idx) => idx === index ? { ...item, user: event.target.value } : item))}
                    style={fieldStyle}
                  >
                    <option value="">Выберите сотрудника</option>
                    {users.map((user) => <option key={user.id} value={user.id}>{user.full_name || user.username}</option>)}
                  </select>
                  {renderShowAllButton(() => openCommissionUserPicker(index))}
                </div>
              </div>
              <InputField
                label="Роль"
                value={row.role_label}
                onChange={(event) => setCommissionRows((prev) => prev.map((item, idx) => idx === index ? { ...item, role_label: event.target.value } : item))}
              />
              <Btn variant="ghost" onClick={() => removeCommissionRow(index)}>Убрать</Btn>
            </div>
          ))}
        </div>
      </Panel>
    );
  };

  const renderCreateForm = () => (
    <div>
      <PageHeader
        title={editingDetail ? `Изменить ${config.documentName.toLowerCase()}` : config.createTitle}
        subtitle={editingDetail ? 'Редактирование доступно только для черновика или документа, возвращённого на доработку.' : config.description}
        right={<Btn variant="secondary" onClick={() => editingDetail ? setEditingDetail(false) : navigate(config.basePath)}><LeftOutlined /> Назад</Btn>}
      />
      {errorMsg && <div style={{ background: C.dangerBg, color: C.danger, padding: '10px 14px', borderRadius: C.radiusSm, marginBottom: 14 }}>{errorMsg}</div>}

      <Panel title="Реквизиты документа" style={{ marginBottom: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
          {config.kind === 'incoming' && (
            <>
              <div style={{ display: 'grid', gap: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 650, color: C.heading }}>Тип актива</label>
                <select value={form.asset_type} onChange={(event) => updateForm('asset_type', event.target.value)} style={fieldStyle}>
                  <option value="TMZ">ТМЗ</option>
                  <option value="OS">ОС</option>
                  <option value="NMA">НМА</option>
                </select>
              </div>
              <div style={{ display: 'grid', gap: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 650, color: C.heading }}>Контрагент</label>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <select value={form.counterparty} onChange={(event) => updateForm('counterparty', event.target.value)} style={fieldStyle}>
                    <option value="">Выберите контрагента</option>
                    {counterparties.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                  </select>
                  {renderShowAllButton(() => openFormReferencePicker('counterparty', 'Справочник контрагентов', counterpartyPickerItems))}
                </div>
              </div>
              <div style={{ display: 'grid', gap: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 650, color: C.heading }}>МОЛ склада</label>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <select value={form.mol_warehouse} onChange={(event) => updateForm('mol_warehouse', event.target.value)} style={fieldStyle}>
                    <option value="">Не выбран</option>
                    {users.map((user) => <option key={user.id} value={user.id}>{user.full_name || user.username}</option>)}
                  </select>
                  {renderShowAllButton(() => openFormReferencePicker('mol_warehouse', 'Справочник сотрудников', userPickerItems))}
                </div>
              </div>
              <div style={{ display: 'grid', gap: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 650, color: C.heading }}>Склад</label>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <select value={form.warehouse} onChange={(event) => updateForm('warehouse', event.target.value)} style={fieldStyle}>
                    <option value="">Выберите склад</option>
                    {warehouses.map((warehouse) => <option key={warehouse.id} value={warehouse.id}>{warehouse.name}</option>)}
                  </select>
                  {renderShowAllButton(() => openFormReferencePicker('warehouse', 'Справочник складов', warehousePickerItems))}
                </div>
              </div>
            </>
          )}

          {config.kind === 'writeOff' && (
            <>
              <div style={{ display: 'grid', gap: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 650, color: C.heading }}>Тип списания</label>
                <select value={form.act_type} onChange={(event) => updateForm('act_type', event.target.value)} style={fieldStyle}>
                  <option value="TMZ">Списание ТМЗ</option>
                  <option value="REPRESENTATIVE_TMZ">Представительские ТМЗ</option>
                  <option value="OS_NMA">Списание ОС/НМА</option>
                  <option value="DESTRUCTION">Акт уничтожения</option>
                </select>
              </div>
              <InputField label="№ приказа о комиссии" value={form.commission_order_number} onChange={(event) => updateForm('commission_order_number', event.target.value)} />
              <InputField label="Дата приказа" type="date" value={form.commission_order_date} onChange={(event) => updateForm('commission_order_date', event.target.value)} />
              <label style={{ display: 'flex', gap: 8, alignItems: 'center', color: C.text, fontSize: 13, fontWeight: 650, paddingTop: 22 }}>
                <input type="checkbox" checked={form.is_representative} onChange={(event) => updateForm('is_representative', event.target.checked)} />
                Представительские расходы
              </label>
            </>
          )}

          {config.kind === 'transfer' && (
            <>
              <div style={{ display: 'grid', gap: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 650, color: C.heading }}>Тип актива</label>
                <select value={form.asset_type} onChange={(event) => updateForm('asset_type', event.target.value)} style={fieldStyle}>
                  <option value="OS">ОС</option>
                  <option value="NMA">НМА</option>
                </select>
              </div>
              <div style={{ display: 'grid', gap: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 650, color: C.heading }}>От кого</label>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <select value={form.from_user} onChange={(event) => updateForm('from_user', event.target.value)} style={fieldStyle}>
                    <option value="">Выберите сотрудника</option>
                    {users.map((user) => <option key={user.id} value={user.id}>{user.full_name || user.username}</option>)}
                  </select>
                  {renderShowAllButton(() => openFormReferencePicker('from_user', 'Справочник сотрудников', userPickerItems))}
                </div>
              </div>
              <div style={{ display: 'grid', gap: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 650, color: C.heading }}>Кому</label>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <select value={form.to_user} onChange={(event) => updateForm('to_user', event.target.value)} style={fieldStyle}>
                    <option value="">Выберите сотрудника</option>
                    {users.map((user) => <option key={user.id} value={user.id}>{user.full_name || user.username}</option>)}
                  </select>
                  {renderShowAllButton(() => openFormReferencePicker('to_user', 'Справочник сотрудников', userPickerItems))}
                </div>
              </div>
            </>
          )}

          {config.kind === 'protocol' && (
            <>
              <div style={{ display: 'grid', gap: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 650, color: C.heading }}>Связанное ходатайство</label>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <select value={form.petition} onChange={(event) => updateForm('petition', event.target.value)} style={fieldStyle}>
                    <option value="">Без привязки</option>
                    {petitions.map((petition) => <option key={petition.id} value={petition.id}>№ {petition.number || 'б/н'} от {dateText(petition.date || petition.created_at)}</option>)}
                  </select>
                  {renderShowAllButton(() => openFormReferencePicker('petition', 'Справочник ходатайств', petitionPickerItems))}
                </div>
              </div>
              <InputField label="№ приказа о комиссии" value={form.commission_order_number} onChange={(event) => updateForm('commission_order_number', event.target.value)} />
              <InputField label="Дата приказа" type="date" value={form.commission_order_date} onChange={(event) => updateForm('commission_order_date', event.target.value)} />
            </>
          )}
        </div>

        {config.kind === 'petition' && (
          <TextAreaField label="Правовое основание" value={form.legal_basis} onChange={(event) => updateForm('legal_basis', event.target.value)} style={{ marginTop: 12 }} />
        )}
        {config.kind === 'protocol' && (
          <div style={{ display: 'grid', gap: 12, marginTop: 12 }}>
            <TextAreaField label="Пункт повестки дня" value={form.agenda_item} onChange={(event) => updateForm('agenda_item', event.target.value)} />
            <TextAreaField label="Решение комиссии" value={form.decision_text} onChange={(event) => updateForm('decision_text', event.target.value)} />
          </div>
        )}
      </Panel>

      {renderRowsEditor()}
      {renderCommissionEditor()}

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
        <Btn variant="secondary" onClick={() => editingDetail ? setEditingDetail(false) : navigate(config.basePath)}>Отмена</Btn>
        <Btn onClick={submit} loading={saving}><SaveOutlined /> {editingDetail ? 'Сохранить изменения' : 'Создать документ'}</Btn>
      </div>
      <ReferencePickerModal picker={referencePicker} onClose={() => setReferencePicker(null)} />
    </div>
  );

  const renderDetail = () => {
    const items = detail ? getItems(detail, config) : [];
    const canSubmit = canEditDocuments && detail && ['DRAFT', 'SENT_FOR_REVISION'].includes(detail.status);
    const canEdit = canEditDocuments && detail && ['DRAFT', 'SENT_FOR_REVISION'].includes(detail.status);
    const canRequestChange = canEditDocuments && detail && config.kind === 'incoming' && detail.status === 'SIGNED';
    const canApprove = detail?.pending_my_approval;
    const isChangeApproval = detail?.status === 'PENDING_CHANGE_APPROVAL';

    return (
      <div>
        <PageHeader
          title={`${config.documentName} ${detail?.number ? `№${detail.number}` : 'б/н'}`}
          subtitle={detail ? `${detail.status_display || detail.status} · создан ${dateTimeText(detail.created_at)}` : config.description}
          right={(
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <Btn variant="secondary" onClick={() => navigate(config.basePath)}><LeftOutlined /> Назад</Btn>
              {detail && <Btn variant="secondary" onClick={() => window.print()}><PrinterOutlined /> Печать</Btn>}
              {canEdit && <Btn variant="secondary" onClick={() => fillFormFromDetail(detail)}><EditOutlined /> Изменить</Btn>}
              {canSubmit && <Btn onClick={submitForApproval} loading={saving}><SendOutlined /> На согласование АХС</Btn>}
              {canRequestChange && <Btn onClick={() => setActionKind('changeRequest')}><EditOutlined /> Запрос на изменение</Btn>}
              {canApprove && <Btn onClick={() => setActionKind('approve')}><CheckCircleOutlined /> {isChangeApproval ? 'Разрешить изменение' : 'Согласовать'}</Btn>}
              {canApprove && !isChangeApproval && <Btn variant="secondary" onClick={() => setActionKind('revision')}><RollbackOutlined /> На доработку</Btn>}
              {canApprove && <Btn variant="danger" onClick={() => setActionKind('reject')}><CloseCircleOutlined /> {isChangeApproval ? 'Отклонить изменение' : 'Отклонить'}</Btn>}
            </div>
          )}
        />
        {errorMsg && <div style={{ background: C.dangerBg, color: C.danger, padding: '10px 14px', borderRadius: C.radiusSm, marginBottom: 14 }}>{errorMsg}</div>}
        {detailLoading ? <Spinner /> : !detail ? <EmptyState text="Документ не найден" /> : (
          <div className="document-workspace">
            <div className="document-screen-panel">
              <Surface style={{ marginBottom: 16 }}>
                <div style={{ padding: 16, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
                  <div><div style={{ color: C.secondary, fontSize: 12 }}>Статус</div><Badge status={detail.status} /></div>
                  <div><div style={{ color: C.secondary, fontSize: 12 }}>Дата</div><div style={{ fontWeight: 750 }}>{dateText(detail.date || detail.created_at)}</div></div>
                  <div><div style={{ color: C.secondary, fontSize: 12 }}>Создал</div><div style={{ fontWeight: 750 }}>{detail.created_by_name || '—'}</div></div>
                  {detail.warehouse_name && <div><div style={{ color: C.secondary, fontSize: 12 }}>Склад</div><div style={{ fontWeight: 750 }}>{detail.warehouse_name}</div></div>}
                  <div><div style={{ color: C.secondary, fontSize: 12 }}>Сумма</div><div style={{ fontWeight: 850, color: C.heading }}>{money(detail.total_amount || items.reduce((sum: number, item: any) => sum + Number(item.total || 0), 0))}</div></div>
                </div>
              </Surface>

              <Surface style={{ marginBottom: 16 }}>
                <div style={{ padding: '14px 16px', borderBottom: `1px solid ${C.rowBorder}`, fontWeight: 850, color: C.heading }}>Позиции</div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 780 }}>
                    <thead>
                      <tr>
                        <Th>Актив</Th>
                        <Th>Код</Th>
                        <Th>Ед.</Th>
                        <Th right>Количество</Th>
                        <Th right>Цена</Th>
                        <Th right>Сумма</Th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.length === 0 ? <tr><td colSpan={6}><EmptyState text="Позиции не заполнены" /></td></tr> : items.map((item: any) => (
                        <tr key={item.id} onMouseEnter={(event) => hoverRow(event, true)} onMouseLeave={(event) => hoverRow(event, false)}>
                          <Td><AssetLink assetId={item.asset}>{item.asset_name || '—'}</AssetLink></Td>
                          <Td muted>{item.asset_code || '—'}</Td>
                          <Td muted>{item.unit_of_measure || '—'}</Td>
                          <Td right>{item.quantity || '—'}</Td>
                          <Td right>{item.unit_price ? money(item.unit_price) : '—'}</Td>
                          <Td right>{item.total ? money(item.total) : '—'}</Td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Surface>

              <Panel title="Маршрут согласования" subtitle="Фиксация действий руководителя АХС и возвратов на доработку.">
                {detail.signatures?.length ? (
                  <div style={{ display: 'grid', gap: 10 }}>
                    {detail.signatures.map((signature: any) => (
                      <div key={signature.id} style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto', gap: 12, padding: 12, borderRadius: C.radiusSm, background: C.surfaceSoft, border: `1px solid ${C.border}` }}>
                        <div>
                          <div style={{ fontWeight: 800, color: C.heading }}>{signature.signer_name || '—'}</div>
                          <div style={{ color: C.secondary, fontSize: 12 }}>{signature.role_label || signature.signer_position || 'Согласующий'}</div>
                          {signature.revision_reason && <div style={{ color: C.warning, fontSize: 12, marginTop: 6 }}>{signature.revision_reason}</div>}
                        </div>
                        <Badge status={signature.signed_at ? 'SIGNED' : signature.sent_for_revision_at ? 'SENT_FOR_REVISION' : 'PENDING_SIGNATURE'} />
                      </div>
                    ))}
                  </div>
                ) : <EmptyState text="Документ ещё не отправлялся на согласование" />}
              </Panel>
            </div>

            <DocumentPrintView detail={detail} config={config} />
          </div>
        )}

        <Modal
          open={!!actionKind}
          onClose={() => setActionKind(null)}
          title={
            actionKind === 'changeRequest'
              ? 'Запрос на изменение'
              : actionKind === 'approve'
                ? isChangeApproval ? 'Разрешить изменение' : 'Согласовать документ'
                : actionKind === 'revision' ? 'Вернуть на доработку' : isChangeApproval ? 'Отклонить изменение' : 'Отклонить документ'
          }
          footer={(
            <>
              <Btn variant="secondary" onClick={() => setActionKind(null)}>Отмена</Btn>
              <Btn
                variant={actionKind === 'reject' ? 'danger' : 'primary'}
                loading={saving}
                onClick={() => actionKind && runDocumentAction(actionKind)}
              >
                {actionKind === 'changeRequest'
                  ? 'Отправить запрос'
                  : actionKind === 'approve'
                    ? isChangeApproval ? 'Разрешить' : 'Согласовать'
                    : actionKind === 'revision' ? 'Вернуть' : 'Отклонить'}
              </Btn>
            </>
          )}
        >
          <TextAreaField
            label={actionKind === 'approve' ? 'Комментарий' : 'Причина'}
            value={actionComment}
            onChange={(event) => setActionComment(event.target.value)}
          />
        </Modal>
      </div>
    );
  };

  if ((isCreateMode || editingDetail) && !canEditDocuments) {
    return (
      <div>
        <PageHeader title={config.title} right={<Btn variant="secondary" onClick={() => navigate(config.basePath)}><LeftOutlined /> Назад</Btn>} />
        <EmptyState text="Недостаточно прав для создания или изменения документов" />
      </div>
    );
  }
  if (isCreateMode || editingDetail) return renderCreateForm();
  if (detailId) return renderDetail();

  return (
    <div>
      <PageHeader
        title={config.title}
        subtitle={config.description}
        right={(
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <input placeholder="Поиск" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} style={{ ...fieldStyle, width: 220 }} />
            <select value={statusFilter} onChange={(event) => { setStatusFilter(event.target.value); setPage(1); }} style={{ ...fieldStyle, width: 210 }}>
              {statusOptions.map((item) => <option key={item.value || 'all'} value={item.value}>{item.label}</option>)}
            </select>
            <input type="date" value={dateAfter} onChange={(event) => { setDateAfter(event.target.value); setPage(1); }} style={{ ...fieldStyle, width: 150 }} />
            <input type="date" value={dateBefore} onChange={(event) => { setDateBefore(event.target.value); setPage(1); }} style={{ ...fieldStyle, width: 150 }} />
            {canEditDocuments && <Btn onClick={() => navigate(`${config.basePath}/new`)}><FileDoneOutlined /> Создать</Btn>}
          </div>
        )}
      />

      {loading ? <Spinner /> : (
        <Surface>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
              <thead>
                <tr>
                  <Th>Документ</Th>
                  <Th>Дата</Th>
                  <Th>Статус</Th>
                  <Th right>Позиций</Th>
                  <Th right>Сумма</Th>
                  <Th>Создал</Th>
                  <Th>Создан</Th>
                  <Th></Th>
                </tr>
              </thead>
              <tbody>
                {data.length === 0 ? <tr><td colSpan={8}><EmptyState text="Документы не найдены" /></td></tr> : data.map((row) => (
                  <tr key={row.id} onMouseEnter={(event) => hoverRow(event, true)} onMouseLeave={(event) => hoverRow(event, false)} style={{ cursor: 'pointer' }} onClick={() => navigate(`${config.basePath}/${row.id}`)}>
                    <Td bold>{row.number || 'б/н'}</Td>
                    <Td muted>{dateText(row.date)}</Td>
                    <Td><Badge status={row.status} /></Td>
                    <Td right>{row.items_count || '—'}</Td>
                    <Td right>{row.total_amount ? money(row.total_amount) : '—'}</Td>
                    <Td>{row.created_by_name || '—'}</Td>
                    <Td muted>{dateTimeText(row.created_at)}</Td>
                    <Td><span style={{ color: row.pending_my_approval ? C.danger : C.accent, fontSize: 13 }}>{row.pending_my_approval ? 'Согласовать' : 'Открыть'}</span></Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ padding: '10px 16px', fontSize: 12, color: C.muted, borderTop: `1px solid ${C.border}` }}>
            Всего: {total} · Стр. {page}
            {page > 1 && <button onClick={() => setPage(page - 1)} style={{ marginLeft: 8, background: 'none', border: 'none', color: C.accent, cursor: 'pointer' }}>Назад</button>}
            {total > page * 20 && <button onClick={() => setPage(page + 1)} style={{ marginLeft: 8, background: 'none', border: 'none', color: C.accent, cursor: 'pointer' }}>Далее</button>}
          </div>
        </Surface>
      )}
    </div>
  );
};

export default DocumentListPage;
