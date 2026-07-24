import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AppstoreOutlined,
  CloseOutlined,
  DeleteOutlined,
  EditOutlined,
  HomeOutlined,
  PlusCircleOutlined,
  PlusOutlined,
  SearchOutlined,
  ShoppingOutlined,
  UserOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import api from '../../api/axios';
import type {
  Asset,
  AssetCategory,
  PaginatedResponse,
  StockAlertRule,
  User,
  Warehouse,
} from '../../shared/types';
import {
  Badge,
  Btn,
  C,
  EmptyState,
  InputField,
  Modal,
  PageHeader,
  Popconfirm,
  Spinner,
  Surface,
  Td,
  TextAreaField,
  Th,
  hoverRow,
} from '../../shared/ui/primitives';

interface AlertForm {
  name: string;
  is_active: boolean;
  threshold_quantity: string;
  recipients: number[];
  groups: number[];
  assets: number[];
  warehouses: number[];
  message_template: string;
}

const emptyForm: AlertForm = {
  name: '',
  is_active: true,
  threshold_quantity: '10',
  recipients: [],
  groups: [],
  assets: [],
  warehouses: [],
  message_template: '{asset_name} на исходе, требуется срочное пополнение склада. Остаток: {quantity} {unit}.',
};

interface PickerItem {
  id: number;
  title: string;
  subtitle?: string;
  badge?: string;
}

type PickerKey = 'recipients' | 'groups' | 'assets' | 'warehouses';
type DropZone = 'available' | 'selected';

interface DragPayload {
  picker: PickerKey;
  itemId: number;
}

interface DragPickerProps {
  picker: PickerKey;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  items: PickerItem[];
  selectedIds: number[];
  onChange: (ids: number[]) => void;
  emptySelectedText: string;
  emptyAvailableText: string;
}

const dragMimeType = 'application/x-stock-alert-picker';

const compactJoin = (parts: Array<string | number | null | undefined>) => (
  parts
    .map((part) => (part === null || part === undefined ? '' : String(part).trim()))
    .filter(Boolean)
    .join(' · ')
);

const matchesQuery = (item: PickerItem, query: string) => {
  if (!query.trim()) return true;
  const text = compactJoin([item.title, item.subtitle, item.badge]).toLowerCase();
  return text.includes(query.trim().toLowerCase());
};

function DragPicker({
  picker,
  title,
  subtitle,
  icon,
  items,
  selectedIds,
  onChange,
  emptySelectedText,
  emptyAvailableText,
}: DragPickerProps) {
  const [query, setQuery] = useState('');
  const [activeDropZone, setActiveDropZone] = useState<DropZone | null>(null);

  const itemById = useMemo(() => new Map(items.map((item) => [item.id, item])), [items]);
  const selectedIdSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const selectedItems = useMemo(
    () => selectedIds.map((id) => itemById.get(id)).filter((item): item is PickerItem => Boolean(item)),
    [itemById, selectedIds],
  );
  const availableItems = useMemo(
    () => items.filter((item) => !selectedIdSet.has(item.id)),
    [items, selectedIdSet],
  );
  const visibleAvailableItems = useMemo(
    () => availableItems.filter((item) => matchesQuery(item, query)).slice(0, 80),
    [availableItems, query],
  );
  const visibleSelectedItems = useMemo(
    () => selectedItems.filter((item) => matchesQuery(item, query)),
    [selectedItems, query],
  );

  const addItem = (itemId: number) => {
    if (selectedIdSet.has(itemId)) return;
    onChange([...selectedIds, itemId]);
  };

  const removeItem = (itemId: number) => {
    onChange(selectedIds.filter((id) => id !== itemId));
  };

  const addVisible = () => {
    const idsToAdd = visibleAvailableItems.map((item) => item.id).filter((id) => !selectedIdSet.has(id));
    if (!idsToAdd.length) return;
    onChange([...selectedIds, ...idsToAdd]);
  };

  const readDragPayload = (event: React.DragEvent): DragPayload | null => {
    try {
      const raw = event.dataTransfer.getData(dragMimeType);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  };

  const handleDrop = (event: React.DragEvent, zone: DropZone) => {
    event.preventDefault();
    event.stopPropagation();
    const payload = readDragPayload(event);
    setActiveDropZone(null);
    if (!payload || payload.picker !== picker) return;
    if (zone === 'selected') {
      addItem(payload.itemId);
      return;
    }
    removeItem(payload.itemId);
  };

  const dropZoneStyle = (zone: DropZone): React.CSSProperties => ({
    minHeight: 222,
    maxHeight: 286,
    overflow: 'auto',
    padding: 8,
    borderRadius: C.radiusMd,
    border: `1px dashed ${activeDropZone === zone ? C.accent : C.border}`,
    background: activeDropZone === zone ? C.accentSubtle : 'rgba(255, 255, 255, 0.62)',
    boxShadow: C.shadowInset,
    transition: `border-color 0.2s ${C.ease}, background 0.2s ${C.ease}`,
  });

  const renderItem = (item: PickerItem, source: DropZone) => (
    <div
      key={`${source}-${item.id}`}
      draggable
      onDragStart={(event) => {
        event.dataTransfer.effectAllowed = source === 'available' ? 'copy' : 'move';
        event.dataTransfer.setData(dragMimeType, JSON.stringify({ picker, itemId: item.id }));
        event.dataTransfer.setData('text/plain', String(item.id));
      }}
      onDragEnd={() => setActiveDropZone(null)}
      style={{
        display: 'grid',
        gridTemplateColumns: '18px minmax(0, 1fr) auto auto',
        alignItems: 'center',
        gap: 8,
        padding: '9px 10px',
        marginBottom: 7,
        borderRadius: C.radiusSm,
        border: `1px solid ${source === 'selected' ? 'rgba(37, 99, 235, 0.24)' : C.rowBorder}`,
        background: source === 'selected' ? 'rgba(234, 243, 255, 0.86)' : 'rgba(255, 255, 255, 0.88)',
        cursor: 'grab',
        userSelect: 'none',
        boxShadow: '0 8px 20px rgba(15, 23, 42, 0.05)',
      }}
      title="Перетащите в соседнюю колонку"
    >
      <span style={{ color: C.muted, fontSize: 15, lineHeight: 1 }}>⋮⋮</span>
      <span style={{ minWidth: 0 }}>
        <span style={{ display: 'block', color: C.heading, fontWeight: 700, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {item.title}
        </span>
        {item.subtitle && (
          <span style={{ display: 'block', color: C.secondary, fontSize: 11, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {item.subtitle}
          </span>
        )}
      </span>
      {item.badge && <Badge status={item.badge} />}
      <button
        type="button"
        onClick={() => (source === 'available' ? addItem(item.id) : removeItem(item.id))}
        title={source === 'available' ? 'Добавить' : 'Убрать'}
        aria-label={source === 'available' ? 'Добавить' : 'Убрать'}
        style={{
          width: 28,
          height: 28,
          borderRadius: 999,
          border: `1px solid ${source === 'available' ? C.border : 'rgba(220, 38, 38, 0.16)'}`,
          background: source === 'available' ? C.surfaceSoft : C.dangerBg,
          color: source === 'available' ? C.accent : C.danger,
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {source === 'available' ? <PlusOutlined /> : <CloseOutlined />}
      </button>
    </div>
  );

  const renderEmpty = (text: string) => (
    <div style={{ padding: '28px 12px', textAlign: 'center', color: C.muted, fontSize: 12, lineHeight: 1.45 }}>
      {text}
    </div>
  );

  return (
    <div
      style={{
        border: `1px solid ${C.border}`,
        borderRadius: C.radiusLg,
        background: 'rgba(255, 255, 255, 0.58)',
        padding: 14,
        boxShadow: C.shadowInset,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', minWidth: 0 }}>
          <span style={{ width: 34, height: 34, borderRadius: C.radiusSm, background: C.accentLight, color: C.accent, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
            {icon}
          </span>
          <span style={{ minWidth: 0 }}>
            <span style={{ display: 'block', fontWeight: 800, color: C.heading, fontSize: 14 }}>{title}</span>
            <span style={{ display: 'block', color: C.secondary, fontSize: 12, marginTop: 2, lineHeight: 1.35 }}>{subtitle}</span>
          </span>
        </div>
        <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={addVisible}
            disabled={!visibleAvailableItems.length}
            title="Добавить найденные"
            style={{
              border: `1px solid ${C.border}`,
              background: C.surfaceSoft,
              color: C.accent,
              borderRadius: C.radiusSm,
              minHeight: 32,
              padding: '0 10px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              cursor: visibleAvailableItems.length ? 'pointer' : 'not-allowed',
              opacity: visibleAvailableItems.length ? 1 : 0.5,
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            <PlusCircleOutlined /> Видимые
          </button>
          <button
            type="button"
            onClick={() => onChange([])}
            disabled={!selectedIds.length}
            title="Очистить выбранные"
            style={{
              border: `1px solid ${C.border}`,
              background: C.surfaceSoft,
              color: C.secondary,
              borderRadius: C.radiusSm,
              minHeight: 32,
              padding: '0 10px',
              cursor: selectedIds.length ? 'pointer' : 'not-allowed',
              opacity: selectedIds.length ? 1 : 0.5,
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            Очистить
          </button>
        </div>
      </div>

      <div style={{ position: 'relative', marginBottom: 12 }}>
        <SearchOutlined style={{ position: 'absolute', left: 12, top: 10, color: C.muted, fontSize: 13 }} />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Поиск по названию, коду, подразделению, складу"
          style={{
            width: '100%',
            border: `1px solid ${C.inputBorder}`,
            borderRadius: C.radiusSm,
            background: 'rgba(255, 255, 255, 0.86)',
            padding: '9px 12px 9px 34px',
            fontSize: 13,
            color: C.heading,
            outline: 'none',
            boxShadow: C.shadowInset,
          }}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginBottom: 7, color: C.secondary, fontSize: 11, fontWeight: 800, textTransform: 'uppercase' }}>
            <span>Доступно</span>
            <span>{availableItems.length}</span>
          </div>
          <div
            onDragOver={(event) => {
              event.preventDefault();
              event.dataTransfer.dropEffect = 'move';
              setActiveDropZone('available');
            }}
            onDragLeave={() => setActiveDropZone(null)}
            onDrop={(event) => handleDrop(event, 'available')}
            style={dropZoneStyle('available')}
          >
            {visibleAvailableItems.length ? visibleAvailableItems.map((item) => renderItem(item, 'available')) : renderEmpty(emptyAvailableText)}
            {availableItems.filter((item) => matchesQuery(item, query)).length > visibleAvailableItems.length && (
              <div style={{ textAlign: 'center', color: C.muted, fontSize: 11, padding: '6px 4px' }}>
                Показаны первые 80 совпадений, уточните поиск.
              </div>
            )}
          </div>
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginBottom: 7, color: C.secondary, fontSize: 11, fontWeight: 800, textTransform: 'uppercase' }}>
            <span>Выбрано</span>
            <span>{selectedItems.length}</span>
          </div>
          <div
            onDragOver={(event) => {
              event.preventDefault();
              event.dataTransfer.dropEffect = 'copy';
              setActiveDropZone('selected');
            }}
            onDragLeave={() => setActiveDropZone(null)}
            onDrop={(event) => handleDrop(event, 'selected')}
            style={dropZoneStyle('selected')}
          >
            {visibleSelectedItems.length ? visibleSelectedItems.map((item) => renderItem(item, 'selected')) : renderEmpty(emptySelectedText)}
          </div>
        </div>
      </div>
    </div>
  );
}

const StockAlertsPage: React.FC = () => {
  const [rules, setRules] = useState<StockAlertRule[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [groups, setGroups] = useState<AssetCategory[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editItem, setEditItem] = useState<StockAlertRule | null>(null);
  const [deleteItem, setDeleteItem] = useState<StockAlertRule | null>(null);
  const [form, setForm] = useState<AlertForm>(emptyForm);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [rulesRes, usersRes, groupsRes, assetsRes, warehousesRes] = await Promise.all([
        api.get<PaginatedResponse<StockAlertRule>>('/assets/stock-alert-rules/', { params: { page_size: 500, ordering: 'name' } }),
        api.get<PaginatedResponse<User>>('/users/', { params: { page_size: 500, ordering: 'last_name' } }),
        api.get<PaginatedResponse<AssetCategory>>('/references/asset-categories/', { params: { page_size: 1000, ordering: 'name' } }),
        api.get<PaginatedResponse<Asset>>('/references/assets/', { params: { page_size: 1000, ordering: 'name' } }),
        api.get<PaginatedResponse<Warehouse>>('/references/warehouses/', { params: { page_size: 500, ordering: 'name' } }),
      ]);
      setRules(rulesRes.data.results || []);
      setUsers(usersRes.data.results || []);
      setGroups(groupsRes.data.results || []);
      setAssets(assetsRes.data.results || []);
      setWarehouses(warehousesRes.data.results || []);
    } catch {
      setRules([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openCreate = () => {
    setEditItem(null);
    setForm(emptyForm);
    setErrorMsg('');
    setModalOpen(true);
  };

  const openEdit = (rule: StockAlertRule) => {
    setEditItem(rule);
    setForm({
      name: rule.name,
      is_active: rule.is_active,
      threshold_quantity: rule.threshold_quantity,
      recipients: rule.recipients,
      groups: rule.groups,
      assets: rule.assets,
      warehouses: rule.warehouses,
      message_template: rule.message_template,
    });
    setErrorMsg('');
    setModalOpen(true);
  };

  const saveRule = async () => {
    if (!form.name.trim()) {
      setErrorMsg('Укажите наименование правила');
      return;
    }
    if (!form.recipients.length) {
      setErrorMsg('Выберите хотя бы одного получателя');
      return;
    }
    setSaving(true);
    setErrorMsg('');
    try {
      const payload = {
        ...form,
        threshold_quantity: Number(form.threshold_quantity || 0),
      };
      if (editItem) {
        await api.put(`/assets/stock-alert-rules/${editItem.id}/`, payload);
      } else {
        await api.post('/assets/stock-alert-rules/', payload);
      }
      setModalOpen(false);
      await fetchData();
    } catch (err: any) {
      setErrorMsg(err?.response?.data ? Object.values(err.response.data).flat().join('; ') : 'Не удалось сохранить правило');
    } finally {
      setSaving(false);
    }
  };

  const deleteRule = async () => {
    if (!deleteItem) return;
    try {
      await api.delete(`/assets/stock-alert-rules/${deleteItem.id}/`);
      setDeleteItem(null);
      fetchData();
    } catch {
      setDeleteItem(null);
    }
  };

  const activeCount = useMemo(() => rules.reduce((sum, rule) => sum + rule.active_alert_count, 0), [rules]);
  const userItems = useMemo<PickerItem[]>(() => users.map((user) => ({
    id: user.id,
    title: user.full_name || user.username,
    subtitle: compactJoin([user.position_ref_name || user.position, user.department_name, user.email]),
    badge: user.role,
  })), [users]);
  const groupItems = useMemo<PickerItem[]>(() => groups.map((group) => ({
    id: group.id,
    title: group.name,
    subtitle: compactJoin([group.code, group.parent_name, group.asset_type_display || group.asset_type]),
    badge: `${group.asset_count || 0} поз.`,
  })), [groups]);
  const assetItems = useMemo<PickerItem[]>(() => assets.map((asset) => ({
    id: asset.id,
    title: asset.name,
    subtitle: compactJoin([asset.code, asset.group_name || asset.category_name, asset.warehouse_name || 'Без склада']),
    badge: asset.asset_type_display || asset.asset_type,
  })), [assets]);
  const warehouseItems = useMemo<PickerItem[]>(() => warehouses.map((warehouse) => ({
    id: warehouse.id,
    title: warehouse.name,
    subtitle: compactJoin([warehouse.code, warehouse.department_name, warehouse.address]),
    badge: warehouse.is_active ? 'Активен' : 'Неактивен',
  })), [warehouses]);

  return (
    <div>
      <PageHeader
        title="Алармы остатков"
        subtitle="Настройка критических количеств, получателей и товаров для красного складского баннера."
        right={<Btn onClick={openCreate}><PlusOutlined /> Добавить правило</Btn>}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 16 }}>
        <Surface style={{ padding: 16 }}>
          <div style={{ fontSize: 12, color: C.secondary, fontWeight: 750 }}>Правил</div>
          <div style={{ fontSize: 28, fontWeight: 850, color: C.heading }}>{rules.length}</div>
        </Surface>
        <Surface style={{ padding: 16 }}>
          <div style={{ fontSize: 12, color: C.secondary, fontWeight: 750 }}>Активных срабатываний</div>
          <div style={{ fontSize: 28, fontWeight: 850, color: activeCount ? C.danger : C.success }}>{activeCount}</div>
        </Surface>
      </div>

      <Surface>
        {loading ? <Spinner /> : rules.length === 0 ? <EmptyState text="Настроек алармов пока нет" /> : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 920 }}>
              <thead>
                <tr>
                  <Th>Правило</Th>
                  <Th>Порог</Th>
                  <Th>Получатели</Th>
                  <Th>Товары / группы</Th>
                  <Th>Склад</Th>
                  <Th>Статус</Th>
                  <Th>Действия</Th>
                </tr>
              </thead>
              <tbody>
                {rules.map((rule) => (
                  <tr key={rule.id} onMouseEnter={(e) => hoverRow(e, true)} onMouseLeave={(e) => hoverRow(e, false)}>
                    <Td bold>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        {rule.active_alert_count > 0 && <WarningOutlined style={{ color: C.danger }} />}
                        {rule.name}
                      </div>
                      <div style={{ color: C.muted, fontSize: 11, marginTop: 3 }}>{rule.message_template}</div>
                    </Td>
                    <Td>{rule.threshold_quantity}</Td>
                    <Td muted>{rule.recipient_names.join(', ') || '—'}</Td>
                    <Td>
                      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                        {rule.asset_names.slice(0, 3).map((name) => <Badge key={name} status={name} />)}
                        {rule.group_names.slice(0, 3).map((name) => <Badge key={name} status={name} />)}
                        {!rule.asset_names.length && !rule.group_names.length && <Badge status="Все товары" />}
                      </div>
                    </Td>
                    <Td muted>{rule.warehouse_names.join(', ') || 'Все склады'}</Td>
                    <Td>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        <Badge status={rule.is_active ? 'Активно' : 'Неактивно'} />
                        {rule.active_alert_count > 0 && <Badge status={`${rule.active_alert_count} аларм`} style={{ background: C.dangerBg, color: C.danger }} />}
                      </div>
                    </Td>
                    <Td>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => openEdit(rule)} title="Изменить" style={{ background: 'none', border: 'none', color: C.accent, cursor: 'pointer' }}><EditOutlined /></button>
                        <button onClick={() => setDeleteItem(rule)} title="Удалить" style={{ background: 'none', border: 'none', color: C.danger, cursor: 'pointer' }}><DeleteOutlined /></button>
                      </div>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Surface>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editItem ? 'Изменить аларм остатка' : 'Новый аларм остатка'}
        width={1120}
        footer={(
          <>
            <Btn variant="secondary" onClick={() => setModalOpen(false)}>Отмена</Btn>
            <Btn onClick={saveRule} loading={saving}>Сохранить</Btn>
          </>
        )}
      >
        {errorMsg && <div style={{ background: C.dangerBg, color: C.danger, padding: '10px 12px', borderRadius: C.radiusSm, marginBottom: 12 }}>{errorMsg}</div>}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 180px', gap: 12 }}>
          <InputField label="Наименование" value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} />
          <InputField label="Критическое количество" type="number" min={0} step="0.01" value={form.threshold_quantity} onChange={(e) => setForm((prev) => ({ ...prev, threshold_quantity: e.target.value }))} />
        </div>
        <label style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 12, fontSize: 13, color: C.text, fontWeight: 650 }}>
          <input type="checkbox" checked={form.is_active} onChange={(e) => setForm((prev) => ({ ...prev, is_active: e.target.checked }))} />
          Правило активно
        </label>
        <div style={{ display: 'grid', gap: 14, marginTop: 14 }}>
          <DragPicker
            picker="recipients"
            title="Получатели аларма"
            subtitle="Кому показывать красный баннер и отправлять уведомление в колокольчик."
            icon={<UserOutlined />}
            items={userItems}
            selectedIds={form.recipients}
            onChange={(ids) => setForm((prev) => ({ ...prev, recipients: ids }))}
            emptySelectedText="Перетащите сюда сотрудников, которые должны видеть аларм."
            emptyAvailableText="Сотрудники не найдены."
          />
          <DragPicker
            picker="warehouses"
            title="Склады"
            subtitle="Если ничего не выбрано, правило проверяет остатки по всем складам."
            icon={<HomeOutlined />}
            items={warehouseItems}
            selectedIds={form.warehouses}
            onChange={(ids) => setForm((prev) => ({ ...prev, warehouses: ids }))}
            emptySelectedText="Склады не выбраны: правило будет работать по всем складам."
            emptyAvailableText="Склады не найдены."
          />
          <DragPicker
            picker="groups"
            title="Группы / категории"
            subtitle="Можно выбрать целые группы товаров, ОС или НМА для общего правила."
            icon={<AppstoreOutlined />}
            items={groupItems}
            selectedIds={form.groups}
            onChange={(ids) => setForm((prev) => ({ ...prev, groups: ids }))}
            emptySelectedText="Группы не выбраны: фильтр по группам не ограничивает правило."
            emptyAvailableText="Группы не найдены."
          />
          <DragPicker
            picker="assets"
            title="Индивидуальные товары"
            subtitle="Добавьте отдельные позиции, если правило должно следить за конкретными карточками."
            icon={<ShoppingOutlined />}
            items={assetItems}
            selectedIds={form.assets}
            onChange={(ids) => setForm((prev) => ({ ...prev, assets: ids }))}
            emptySelectedText="Товары не выбраны: правило может работать по выбранным группам или по всем товарам."
            emptyAvailableText="Товары не найдены."
          />
        </div>
        <TextAreaField
          label="Текст баннера"
          value={form.message_template}
          onChange={(e) => setForm((prev) => ({ ...prev, message_template: e.target.value }))}
          style={{ marginTop: 12 }}
        />
        <div style={{ fontSize: 11, color: C.muted, marginTop: 6 }}>
          Можно использовать переменные: {'{asset_name}'}, {'{asset_code}'}, {'{quantity}'}, {'{threshold}'}, {'{unit}'}, {'{warehouse}'}.
        </div>
      </Modal>

      <Popconfirm
        open={!!deleteItem}
        onClose={() => setDeleteItem(null)}
        onConfirm={deleteRule}
        title={`Удалить правило "${deleteItem?.name}"?`}
        confirmText="Удалить"
      />
    </div>
  );
};

export default StockAlertsPage;
