import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { EditOutlined } from '@ant-design/icons';
import api from '../../api/axios';
import type { AssetCard, AssetCategory, PaginatedResponse, UnitOfMeasure, Warehouse } from '../../shared/types';
import {
  C, PageHeader, Btn, Panel, Badge, Th, Td, Spinner, EmptyState,
  Drawer, InputField, SelectField, hoverRow,
} from '../../shared/ui/primitives';

const Row = ({ label, children }: { label: string; children?: React.ReactNode }) => (
  <div style={{ display: 'flex', gap: 12, padding: '9px 0', borderBottom: `1px solid ${C.rowBorder}` }}>
    <div style={{ width: 210, fontSize: 12, fontWeight: 650, color: C.secondary, flexShrink: 0 }}>{label}</div>
    <div style={{ minWidth: 0, fontSize: 13, color: C.heading }}>{children || '—'}</div>
  </div>
);

const toNumber = (value: string | number | null | undefined) => {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
};

const formatQuantity = (value: string | number | null | undefined) =>
  toNumber(value).toLocaleString('ru-RU', { maximumFractionDigits: 2 });

const formatMoney = (value: string | number | null | undefined) =>
  `${toNumber(value).toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} тг`;

const formatDate = (value: string | null | undefined) => {
  if (!value) return '—';
  const date = new Date(value.includes('T') ? value : `${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('ru-RU');
};

const formatDateTime = (value: string | null | undefined) => {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString('ru-RU');
};

const baseAssetType = (assetType: string) => (assetType === 'REPRESENTATIVE_TMZ' ? 'TMZ' : assetType);

const AssetCardPage: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [card, setCard] = useState<AssetCard | null>(null);
  const [categories, setCategories] = useState<AssetCategory[]>([]);
  const [units, setUnits] = useState<UnitOfMeasure[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState('');

  const [fName, setFName] = useState('');
  const [fCode, setFCode] = useState('');
  const [fCategory, setFCategory] = useState('');
  const [fGroup, setFGroup] = useState('');
  const [fUnit, setFUnit] = useState('');
  const [fPrice, setFPrice] = useState('');
  const [fLongTerm, setFLongTerm] = useState(false);
  const [fInventory, setFInventory] = useState('');
  const [fBalanceDate, setFBalanceDate] = useState('');
  const [fUsefulLife, setFUsefulLife] = useState('');
  const [fDepRate, setFDepRate] = useState('');
  const [fWarehouse, setFWarehouse] = useState('');
  const [fStockQuantity, setFStockQuantity] = useState('');
  const [fStockBalanceDate, setFStockBalanceDate] = useState('');

  const isTmz = card?.asset_type === 'TMZ' || card?.asset_type === 'REPRESENTATIVE_TMZ';

  const fetchCard = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<AssetCard>(`/references/assets/${id}/card/`);
      setCard(res.data);
    } catch {
      setCard(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchDictionaries = useCallback(async (assetType: string) => {
    try {
      const [categoryRes, unitRes, warehouseRes] = await Promise.all([
        api.get<PaginatedResponse<AssetCategory>>('/references/asset-categories/', {
          params: { page_size: 300, asset_type: baseAssetType(assetType), ordering: 'name' },
        }),
        api.get<PaginatedResponse<UnitOfMeasure>>('/references/units-of-measure/', {
          params: { page_size: 500, is_active: true, ordering: 'name' },
        }),
        api.get<PaginatedResponse<Warehouse>>('/references/warehouses/', {
          params: { page_size: 500, is_active: true, ordering: 'name' },
        }),
      ]);
      setCategories(categoryRes.data.results || []);
      setUnits(unitRes.data.results || []);
      setWarehouses(warehouseRes.data.results || []);
    } catch {
      setCategories([]);
      setUnits([]);
      setWarehouses([]);
    }
  }, []);

  useEffect(() => { fetchCard(); }, [fetchCard]);
  useEffect(() => {
    if (card) fetchDictionaries(card.asset_type);
  }, [card, fetchDictionaries]);

  const groupOptions = useMemo(
    () => categories.filter((category) => !fCategory || String(category.id) !== fCategory),
    [categories, fCategory],
  );

  const resetEditForm = (asset: AssetCard) => {
    setFName(asset.name || '');
    setFCode(asset.code || '');
    setFCategory(asset.category ? String(asset.category) : '');
    setFGroup(asset.group ? String(asset.group) : '');
    setFUnit(asset.unit_of_measure_ref ? String(asset.unit_of_measure_ref) : '');
    setFPrice(asset.unit_price || '0');
    setFLongTerm(Boolean(asset.is_long_term_use));
    setFInventory(asset.inventory_number || '');
    setFBalanceDate(asset.balance_date || '');
    setFUsefulLife(asset.useful_life_months ? String(asset.useful_life_months) : '');
    setFDepRate(asset.depreciation_rate || '');
    setFWarehouse(asset.warehouse ? String(asset.warehouse) : '');
    setFStockQuantity(asset.stock_quantity || '0');
    setFStockBalanceDate(asset.stock_balance_date || '');
    setEditError('');
  };

  const openEdit = () => {
    if (!card) return;
    resetEditForm(card);
    setEditOpen(true);
  };

  const formatError = (err: any) => {
    const data = err?.response?.data;
    if (!data) return t('common.error');
    if (typeof data === 'string') return data;
    return Object.values(data).flat().join('; ');
  };

  const handleSave = async () => {
    if (!card) return;
    if (!fName.trim() || !fCategory || !fUnit || !fPrice) {
      setEditError('Заполните наименование, категорию, единицу измерения и цену');
      return;
    }

    setSaving(true);
    setEditError('');
    try {
      const payload = {
        name: fName,
        code: fCode,
        asset_type: card.asset_type,
        category: Number(fCategory),
        group: fGroup ? Number(fGroup) : null,
        unit_of_measure_ref: Number(fUnit),
        unit_price: fPrice,
        is_long_term_use: isTmz ? fLongTerm : false,
        inventory_number: fInventory || null,
        balance_date: fBalanceDate || null,
        useful_life_months: fUsefulLife ? Number(fUsefulLife) : null,
        depreciation_rate: fDepRate || null,
        warehouse: fWarehouse ? Number(fWarehouse) : null,
        stock_quantity: fStockQuantity || '0',
        stock_balance_date: fStockBalanceDate || null,
      };
      const res = await api.patch<AssetCard>(`/references/assets/${id}/card/`, payload);
      setCard(res.data);
      setEditOpen(false);
    } catch (err: any) {
      setEditError(formatError(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spinner />;
  if (!card) return <EmptyState text={t('common.notFound')} />;

  return (
    <div>
      <PageHeader
        title={card.name}
        subtitle={`${card.asset_type_display} · ${card.code}${card.inventory_number ? ` · Инв. ${card.inventory_number}` : ''}`}
        right={(
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <Btn variant="secondary" onClick={() => navigate(-1)}>← {t('common.back')}</Btn>
            <Btn onClick={openEdit}><EditOutlined /> Изменить</Btn>
          </div>
        )}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 360px), 1fr))', gap: 20, marginBottom: 20 }}>
        <Panel title="Реквизиты">
          <Row label={t('common.name')}>{card.name}</Row>
          <Row label={t('common.code')}>{card.code}</Row>
          <Row label={t('common.type')}><Badge status={card.asset_type_display} /></Row>
          <Row label="Категория">{card.category_name}</Row>
          <Row label="Группа">{card.group_name || '—'}</Row>
          <Row label={t('references.unitOfMeasure')}>{card.unit_of_measure_ref_name || card.unit_of_measure}</Row>
          <Row label={t('references.unitPrice')}>{formatMoney(card.unit_price)}</Row>
          {card.inventory_number && <Row label="Инвентарный номер">{card.inventory_number}</Row>}
          {card.is_long_term_use && <Row label="ТМЗ длит. пользования"><Badge status="Да" /></Row>}
        </Panel>

        <Panel title="Склад и учет">
          <Row label="Склад">{card.warehouse_name || 'Не указан'}</Row>
          {card.stock_location && card.stock_location !== card.warehouse_name && (
            <Row label="Место хранения">{card.stock_location}</Row>
          )}
          <Row label="Текущий остаток">
            <strong>{formatQuantity(card.stock_quantity)} {card.unit_of_measure_ref_name || card.unit_of_measure}</strong>
          </Row>
          <Row label="Сумма остатка">{formatMoney(card.stock_total_amount)}</Row>
          <Row label="Дата остатка">{formatDate(card.stock_balance_date)}</Row>
          {card.balance_date && <Row label="Дата постановки на баланс">{formatDate(card.balance_date)}</Row>}
          {card.useful_life_months != null && <Row label="Срок полезн. использ.">{card.useful_life_months} мес.</Row>}
          {card.depreciation_rate != null && <Row label="Норма амортизации">{card.depreciation_rate}%</Row>}
          <Row label="Активных закреплений">{card.assignments.length}</Row>
          {card.source_1c_id && <Row label="ID в 1С">{card.source_1c_id}</Row>}
          {card.last_sync_at && <Row label="Последняя синхронизация">{formatDateTime(card.last_sync_at)}</Row>}
        </Panel>
      </div>

      <Panel title="Закрепления" noPad style={{ marginBottom: 20 }}>
        {card.assignments.length === 0 ? <EmptyState text="Нет активных закреплений" /> : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 820 }}>
              <thead><tr>
                <Th>Сотрудник</Th><Th>Подразделение</Th><Th right>Кол-во</Th>
                <Th>Дата выдачи</Th><Th>Склад</Th><Th>{t('common.status')}</Th>
              </tr></thead>
              <tbody>
                {card.assignments.map((assignment) => (
                  <tr key={assignment.id} onMouseEnter={(event) => hoverRow(event, true)} onMouseLeave={(event) => hoverRow(event, false)}>
                    <Td bold>{assignment.user_name}</Td>
                    <Td muted>{assignment.department_name || '—'}</Td>
                    <Td right>{formatQuantity(assignment.quantity)}</Td>
                    <Td muted>{formatDate(assignment.assigned_at)}</Td>
                    <Td muted>{assignment.warehouse_name || assignment.location || '—'}</Td>
                    <Td><Badge status={assignment.status_display} /></Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      <Panel title="История движений" noPad>
        {card.movements.length === 0 ? <EmptyState text="Нет движений по позиции" /> : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 920 }}>
              <thead><tr>
                <Th>{t('common.date')}</Th><Th>Операция</Th><Th right>Кол-во</Th><Th>Склад</Th>
                <Th>От кого</Th><Th>Кому</Th><Th>Выполнил</Th><Th>{t('common.comment')}</Th>
              </tr></thead>
              <tbody>
                {card.movements.map((movement) => (
                  <tr key={movement.id} onMouseEnter={(event) => hoverRow(event, true)} onMouseLeave={(event) => hoverRow(event, false)}>
                    <Td muted>{formatDate(movement.performed_at)}</Td>
                    <Td><Badge status={movement.movement_type_display} /></Td>
                    <Td right>{formatQuantity(movement.quantity)}{isTmz ? ` ${card.unit_of_measure}` : ''}</Td>
                    <Td muted>{movement.warehouse_name || '—'}</Td>
                    <Td muted>{movement.from_user_name || '—'}</Td>
                    <Td muted>{movement.to_user_name || '—'}</Td>
                    <Td muted>{movement.performed_by_name || '—'}</Td>
                    <Td muted>{movement.comment || '—'}</Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      <Drawer
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Изменение карточки"
        footer={(
          <>
            <Btn variant="secondary" onClick={() => setEditOpen(false)}>{t('common.cancel')}</Btn>
            <Btn onClick={handleSave} loading={saving}>{t('common.save')}</Btn>
          </>
        )}
      >
        {editError && (
          <div style={{ background: C.dangerBg, color: C.danger, padding: '8px 12px', borderRadius: C.radiusSm, fontSize: 12, marginBottom: 14 }}>
            {editError}
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <InputField label="Наименование *" value={fName} onChange={(event) => setFName(event.target.value)} />
          <InputField label="Код" value={fCode} onChange={(event) => setFCode(event.target.value)} />
          <SelectField
            label="Категория *"
            value={fCategory}
            onChange={(event) => setFCategory(event.target.value)}
            options={[{ value: '', label: 'Выберите' }, ...categories.map((category) => ({ value: category.id, label: category.name }))]}
          />
          <SelectField
            label="Группа"
            value={fGroup}
            onChange={(event) => setFGroup(event.target.value)}
            options={[{ value: '', label: 'Без группы' }, ...groupOptions.map((category) => ({ value: category.id, label: category.name }))]}
          />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <SelectField
              label="Ед. изм. *"
              value={fUnit}
              onChange={(event) => setFUnit(event.target.value)}
              options={[{ value: '', label: 'Выберите' }, ...units.map((unit) => ({ value: unit.id, label: unit.name }))]}
            />
            <InputField label="Цена *" type="number" min="0" step="0.01" value={fPrice} onChange={(event) => setFPrice(event.target.value)} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <SelectField
              label="Склад"
              value={fWarehouse}
              onChange={(event) => setFWarehouse(event.target.value)}
              options={[{ value: '', label: 'Не указан' }, ...warehouses.map((warehouse) => ({ value: warehouse.id, label: warehouse.name }))]}
            />
            <InputField label="Остаток" type="number" min="0" step="0.01" value={fStockQuantity} onChange={(event) => setFStockQuantity(event.target.value)} />
          </div>
          <InputField label="Дата остатка" type="date" value={fStockBalanceDate} onChange={(event) => setFStockBalanceDate(event.target.value)} />

          {isTmz ? (
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: C.heading }}>
              <input type="checkbox" checked={fLongTerm} onChange={(event) => setFLongTerm(event.target.checked)} />
              ТМЗ длительного пользования
            </label>
          ) : (
            <>
              <InputField label="Инвентарный номер" value={fInventory} onChange={(event) => setFInventory(event.target.value)} />
              <InputField label="Дата постановки на баланс" type="date" value={fBalanceDate} onChange={(event) => setFBalanceDate(event.target.value)} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <InputField label="Срок, мес." type="number" min="0" value={fUsefulLife} onChange={(event) => setFUsefulLife(event.target.value)} />
                <InputField label="Амортизация, %" type="number" min="0" step="0.01" value={fDepRate} onChange={(event) => setFDepRate(event.target.value)} />
              </div>
            </>
          )}
        </div>
      </Drawer>
    </div>
  );
};

export default AssetCardPage;
