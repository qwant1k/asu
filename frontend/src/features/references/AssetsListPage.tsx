import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import api from '../../api/axios';
import type { Asset, AssetCategory, PaginatedResponse, UnitOfMeasure, Warehouse } from '../../shared/types';
import {
  C, PageHeader, Btn, Th, Td, Badge, Tabs, Drawer, InputField, SelectField,
  Spinner, EmptyState, Panel, StatCard, hoverRow,
} from '../../shared/ui/primitives';
import AssetLink from '../../shared/components/AssetLink';

type TabKey = 'TMZ' | 'OS' | 'NMA';
type StockFilter = '' | 'true' | 'false';
type SortDirection = 'asc' | 'desc';
type SortField =
  | 'name'
  | 'code'
  | 'category__name'
  | 'group__name'
  | 'unit_of_measure'
  | 'warehouse_stock__warehouse__name'
  | 'warehouse_stock__quantity'
  | 'warehouse_stock__total_amount'
  | 'unit_price'
  | 'created_at';

const TAB_TITLES: Record<TabKey, string> = {
  TMZ: 'Справочник ТМЗ',
  OS: 'Справочник ОС',
  NMA: 'Справочник НМА',
};
const EMPTY_FILTER = '__empty__';

const SORT_OPTIONS: { value: SortField; label: string }[] = [
  { value: 'name', label: 'Наименование' },
  { value: 'code', label: 'Код' },
  { value: 'category__name', label: 'Категория' },
  { value: 'group__name', label: 'Группа' },
  { value: 'unit_of_measure', label: 'Ед. изм.' },
  { value: 'warehouse_stock__warehouse__name', label: 'Склад' },
  { value: 'warehouse_stock__quantity', label: 'Остаток' },
  { value: 'warehouse_stock__total_amount', label: 'Сумма' },
  { value: 'unit_price', label: 'Цена' },
  { value: 'created_at', label: 'Дата создания' },
];

const tabItems = [
  { key: 'TMZ', label: 'ТМЗ' },
  { key: 'OS', label: 'ОС' },
  { key: 'NMA', label: 'НМА' },
];

const filterGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(178px, 1fr))',
  gap: 12,
  alignItems: 'end',
};

const softButtonStyle: React.CSSProperties = {
  width: 32,
  height: 32,
  borderRadius: C.radiusSm,
  border: `1px solid ${C.border}`,
  background: C.surfaceSoft,
  color: C.secondary,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  transition: `transform 0.2s ${C.spring}, color 0.18s ${C.ease}, border-color 0.18s ${C.ease}`,
};

const rowSelectStyle: React.CSSProperties = {
  width: '100%',
  minWidth: 150,
  padding: '7px 9px',
  border: `1px solid ${C.inputBorder}`,
  borderRadius: C.radiusSm,
  background: 'rgba(255, 255, 255, 0.86)',
  color: C.text,
  outline: 'none',
  fontSize: 12,
};

const groupButtonBase: React.CSSProperties = {
  width: '100%',
  minHeight: 86,
  padding: '12px 14px',
  borderRadius: C.radiusSm,
  border: `1px solid ${C.border}`,
  background: C.glassStrong,
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: 10,
  cursor: 'pointer',
  textAlign: 'left',
  transition: `transform 0.22s ${C.spring}, background 0.2s ${C.ease}, border-color 0.2s ${C.ease}`,
};

const toTabKey = (value?: string): TabKey => {
  const normalized = (value || 'tmz').toUpperCase();
  return ['TMZ', 'OS', 'NMA'].includes(normalized) ? (normalized as TabKey) : 'TMZ';
};

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
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('ru-RU');
};

const AssetsListPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { type } = useParams<{ type: string }>();
  const [activeTab, setActiveTab] = useState<TabKey>(toTabKey(type));
  const [assets, setAssets] = useState<Asset[]>([]);
  const [categories, setCategories] = useState<AssetCategory[]>([]);
  const [units, setUnits] = useState<UnitOfMeasure[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<AssetCategory | null>(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [groupFilter, setGroupFilter] = useState('');
  const [warehouseFilter, setWarehouseFilter] = useState('');
  const [unitFilter, setUnitFilter] = useState('');
  const [stockFilter, setStockFilter] = useState<StockFilter>('');
  const [longTermFilter, setLongTermFilter] = useState('');
  const [quantityMin, setQuantityMin] = useState('');
  const [quantityMax, setQuantityMax] = useState('');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [sortBy, setSortBy] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [errorMsg, setErrorMsg] = useState('');
  const [assetDrawerOpen, setAssetDrawerOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [assetErrorMsg, setAssetErrorMsg] = useState('');

  const [fName, setFName] = useState('');
  const [fCode, setFCode] = useState('');
  const [fParent, setFParent] = useState('');

  const [aName, setAName] = useState('');
  const [aCode, setACode] = useState('');
  const [aCategory, setACategory] = useState('');
  const [aGroup, setAGroup] = useState('');
  const [aUnit, setAUnit] = useState('');
  const [aPrice, setAPrice] = useState('0');
  const [aLongTerm, setALongTerm] = useState(false);
  const [aInventory, setAInventory] = useState('');
  const [aBalanceDate, setABalanceDate] = useState('');
  const [aUsefulLife, setAUsefulLife] = useState('');
  const [aDepRate, setADepRate] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const ordering = `${sortDirection === 'desc' ? '-' : ''}${sortBy}`;
      const assetParams: Record<string, any> = {
        page_size: 500,
        asset_type: activeTab,
        search: search || undefined,
        category: categoryFilter || undefined,
        group: groupFilter && groupFilter !== EMPTY_FILTER ? groupFilter : undefined,
        group_empty: groupFilter === EMPTY_FILTER ? true : undefined,
        warehouse: warehouseFilter && warehouseFilter !== EMPTY_FILTER ? warehouseFilter : undefined,
        warehouse_empty: warehouseFilter === EMPTY_FILTER ? true : undefined,
        unit_of_measure_ref: unitFilter && unitFilter !== EMPTY_FILTER ? unitFilter : undefined,
        unit_empty: unitFilter === EMPTY_FILTER ? true : undefined,
        has_stock: stockFilter || undefined,
        is_long_term_use: activeTab === 'TMZ' ? longTermFilter || undefined : undefined,
        quantity_min: quantityMin || undefined,
        quantity_max: quantityMax || undefined,
        price_min: priceMin || undefined,
        price_max: priceMax || undefined,
        ordering,
      };

      const [assetsRes, categoriesRes] = await Promise.all([
        api.get<PaginatedResponse<Asset>>('/references/assets/', { params: assetParams }),
        api.get<PaginatedResponse<AssetCategory>>('/references/asset-categories/', {
          params: { page_size: 300, asset_type: activeTab, ordering: 'name' },
        }),
      ]);
      setAssets(assetsRes.data.results || []);
      setCategories(categoriesRes.data.results || []);
    } catch {
      setAssets([]);
    } finally {
      setLoading(false);
    }
  }, [
    activeTab, categoryFilter, groupFilter, longTermFilter, priceMax, priceMin,
    quantityMax, quantityMin, search, sortBy, sortDirection, stockFilter,
    unitFilter, warehouseFilter,
  ]);

  const fetchDictionaries = useCallback(async () => {
    try {
      const [unitRes, warehouseRes] = await Promise.all([
        api.get<PaginatedResponse<UnitOfMeasure>>('/references/units-of-measure/', {
          params: { page_size: 500, is_active: true, ordering: 'name' },
        }),
        api.get<PaginatedResponse<Warehouse>>('/references/warehouses/', {
          params: { page_size: 500, is_active: true, ordering: 'name' },
        }),
      ]);
      setUnits(unitRes.data.results || []);
      setWarehouses(warehouseRes.data.results || []);
    } catch {
      setUnits([]);
      setWarehouses([]);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { fetchDictionaries(); }, [fetchDictionaries]);
  useEffect(() => {
    const nextTab = toTabKey(type);
    setActiveTab(nextTab);
    setCategoryFilter('');
    setGroupFilter('');
    setLongTermFilter('');
  }, [type]);

  const selectedGroup = useMemo(
    () => categories.find((cat) => String(cat.id) === groupFilter) || null,
    [categories, groupFilter],
  );
  const groupSelectionLabel = groupFilter === EMPTY_FILTER ? 'Без группы' : selectedGroup?.name || 'все группы';
  const positionsSubtitle = groupFilter === EMPTY_FILTER ? 'Без группы' : selectedGroup?.name || 'Все позиции';

  const stats = useMemo(() => {
    const total = assets.length;
    const withStock = assets.filter((asset) => toNumber(asset.stock_quantity) > 0).length;
    const grouped = assets.filter((asset) => Boolean(asset.group)).length;
    const totalAmount = assets.reduce((sum, asset) => sum + toNumber(asset.stock_total_amount), 0);
    return { total, withStock, grouped, totalAmount };
  }, [assets]);

  const hasAnyFilter = Boolean(
    search || categoryFilter || groupFilter || warehouseFilter || unitFilter ||
    stockFilter || longTermFilter || quantityMin || quantityMax || priceMin || priceMax,
  );

  const resetFilters = () => {
    setSearch('');
    setCategoryFilter('');
    setGroupFilter('');
    setWarehouseFilter('');
    setUnitFilter('');
    setStockFilter('');
    setLongTermFilter('');
    setQuantityMin('');
    setQuantityMax('');
    setPriceMin('');
    setPriceMax('');
    setSortBy('name');
    setSortDirection('asc');
  };

  const resetForm = (category?: AssetCategory) => {
    setFName(category?.name || '');
    setFCode(category?.code || '');
    setFParent(category?.parent ? String(category.parent) : '');
    setErrorMsg('');
  };

  const openCreate = () => {
    setEditingCategory(null);
    resetForm();
    setDrawerOpen(true);
  };

  const openEdit = (category: AssetCategory) => {
    setEditingCategory(category);
    resetForm(category);
    setDrawerOpen(true);
  };

  const handleSaveCategory = async () => {
    if (!fName.trim()) {
      setErrorMsg('Заполните наименование');
      return;
    }
    setErrorMsg('');
    try {
      const payload = {
        name: fName,
        code: fCode,
        asset_type: activeTab,
        parent: fParent ? Number(fParent) : null,
      };
      if (editingCategory) {
        await api.patch(`/references/asset-categories/${editingCategory.id}/`, payload);
      } else {
        await api.post('/references/asset-categories/', payload);
      }
      setDrawerOpen(false);
      fetchData();
    } catch (err: any) {
      setErrorMsg(err?.response?.data ? Object.values(err.response.data).flat().join('; ') : t('common.error'));
    }
  };

  const resetAssetForm = (asset?: Asset) => {
    setAName(asset?.name || '');
    setACode(asset?.code || '');
    setACategory(asset?.category ? String(asset.category) : '');
    setAGroup(asset?.group ? String(asset.group) : '');
    setAUnit(asset?.unit_of_measure_ref ? String(asset.unit_of_measure_ref) : '');
    setAPrice(asset?.unit_price || '0');
    setALongTerm(asset?.is_long_term_use || false);
    setAInventory(asset?.inventory_number || '');
    setABalanceDate(asset?.balance_date || '');
    setAUsefulLife(asset?.useful_life_months ? String(asset.useful_life_months) : '');
    setADepRate(asset?.depreciation_rate || '');
    setAssetErrorMsg('');
  };

  const openCreateAsset = () => {
    setEditingAsset(null);
    resetAssetForm();
    setAssetDrawerOpen(true);
  };

  const openEditAsset = (asset: Asset) => {
    setEditingAsset(asset);
    resetAssetForm(asset);
    setAssetDrawerOpen(true);
  };

  const handleSaveAsset = async () => {
    if (!aName.trim() || !aCategory || !aUnit || !aPrice) {
      setAssetErrorMsg('Заполните наименование, категорию, единицу измерения и цену');
      return;
    }
    if (activeTab !== 'TMZ' && !editingAsset && !aInventory.trim()) {
      setAssetErrorMsg('Инвентарный номер обязателен для ОС и НМА');
      return;
    }

    setAssetErrorMsg('');
    const payload = {
      name: aName,
      code: aCode,
      asset_type: activeTab,
      category: Number(aCategory),
      group: aGroup ? Number(aGroup) : null,
      unit_of_measure_ref: Number(aUnit),
      unit_price: aPrice,
      is_long_term_use: activeTab === 'TMZ' ? aLongTerm : false,
      inventory_number: aInventory || null,
      balance_date: aBalanceDate || null,
      useful_life_months: aUsefulLife ? Number(aUsefulLife) : null,
      depreciation_rate: aDepRate || null,
    };

    try {
      if (editingAsset) {
        await api.patch(`/references/assets/${editingAsset.id}/`, payload);
      } else {
        await api.post('/references/assets/', payload);
      }
      setAssetDrawerOpen(false);
      fetchData();
    } catch (err: any) {
      setAssetErrorMsg(err?.response?.data ? Object.values(err.response.data).flat().join('; ') : t('common.error'));
    }
  };

  const handleDeleteCategory = async (category: AssetCategory) => {
    try {
      await api.delete(`/references/asset-categories/${category.id}/`);
      if (groupFilter === String(category.id)) setGroupFilter('');
      if (categoryFilter === String(category.id)) setCategoryFilter('');
      fetchData();
    } catch {
      setErrorMsg('Не удалось удалить группу: она может использоваться в позициях');
      setDrawerOpen(true);
    }
  };

  const setAssetGroup = async (assetId: number, value: string) => {
    try {
      await api.patch(`/references/assets/${assetId}/`, { group: value ? Number(value) : null });
      fetchData();
    } catch {
      setAssetErrorMsg(t('common.error'));
    }
  };

  const stockLabel = (asset: Asset) =>
    toNumber(asset.stock_quantity) > 0 ? 'В наличии' : 'Нет остатка';

  return (
    <div>
      <PageHeader
        title={TAB_TITLES[activeTab]}
        subtitle="Единый реестр номенклатуры, складов, групп и учетных параметров"
        right={
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <Btn variant="secondary" onClick={resetFilters} disabled={!hasAnyFilter}>Сбросить</Btn>
            <Btn variant="secondary" onClick={openCreate}><PlusOutlined /> Группа</Btn>
            <Btn onClick={openCreateAsset}><PlusOutlined /> Позиция</Btn>
          </div>
        }
      />

      <Tabs
        activeKey={activeTab}
        items={tabItems}
        onChange={(key) => navigate(`/references/assets/${key.toLowerCase()}`)}
        style={{ marginBottom: 18 }}
      />

      <Panel style={{ marginBottom: 16 }}>
        <div style={filterGridStyle}>
          <InputField
            label="Поиск"
            placeholder="Наименование, код, инв. номер, склад"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <SelectField
            label="Категория"
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
            options={[{ value: '', label: 'Все категории' }, ...categories.map((cat) => ({ value: cat.id, label: cat.name }))]}
          />
          <SelectField
            label="Группа"
            value={groupFilter}
            onChange={(event) => setGroupFilter(event.target.value)}
            options={[
              { value: '', label: 'Все группы' },
              { value: EMPTY_FILTER, label: 'Не заполнено' },
              ...categories.map((cat) => ({ value: cat.id, label: cat.name })),
            ]}
          />
          <SelectField
            label="Склад"
            value={warehouseFilter}
            onChange={(event) => setWarehouseFilter(event.target.value)}
            options={[
              { value: '', label: 'Все склады' },
              { value: EMPTY_FILTER, label: 'Не заполнено' },
              ...warehouses.map((warehouse) => ({ value: warehouse.id, label: warehouse.name })),
            ]}
          />
          <SelectField
            label="Ед. изм."
            value={unitFilter}
            onChange={(event) => setUnitFilter(event.target.value)}
            options={[
              { value: '', label: 'Все единицы' },
              { value: EMPTY_FILTER, label: 'Не заполнено' },
              ...units.map((unit) => ({ value: unit.id, label: unit.name })),
            ]}
          />
          <SelectField
            label="Остаток"
            value={stockFilter}
            onChange={(event) => setStockFilter(event.target.value as StockFilter)}
            options={[
              { value: '', label: 'Любой' },
              { value: 'true', label: 'В наличии' },
              { value: 'false', label: 'Без остатка' },
            ]}
          />
          {activeTab === 'TMZ' && (
            <SelectField
              label="Длит. польз."
              value={longTermFilter}
              onChange={(event) => setLongTermFilter(event.target.value)}
              options={[
                { value: '', label: 'Любые' },
                { value: 'true', label: 'Да' },
                { value: 'false', label: 'Нет' },
              ]}
            />
          )}
          <InputField
            label="Остаток от"
            type="number"
            min="0"
            step="0.01"
            value={quantityMin}
            onChange={(event) => setQuantityMin(event.target.value)}
          />
          <InputField
            label="Остаток до"
            type="number"
            min="0"
            step="0.01"
            value={quantityMax}
            onChange={(event) => setQuantityMax(event.target.value)}
          />
          <InputField
            label="Цена от"
            type="number"
            min="0"
            step="0.01"
            value={priceMin}
            onChange={(event) => setPriceMin(event.target.value)}
          />
          <InputField
            label="Цена до"
            type="number"
            min="0"
            step="0.01"
            value={priceMax}
            onChange={(event) => setPriceMax(event.target.value)}
          />
          <SelectField
            label="Сортировка"
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value as SortField)}
            options={SORT_OPTIONS}
          />
          <SelectField
            label="Порядок"
            value={sortDirection}
            onChange={(event) => setSortDirection(event.target.value as SortDirection)}
            options={[
              { value: 'asc', label: 'По возрастанию' },
              { value: 'desc', label: 'По убыванию' },
            ]}
          />
        </div>
      </Panel>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 16 }}>
        <StatCard label="Позиции" value={stats.total} sub={activeTab} />
        <StatCard label="С остатком" value={stats.withStock} sub="по текущему отбору" color={C.success} />
        <StatCard label="В группах" value={stats.grouped} sub={groupSelectionLabel} color={C.info} />
        <StatCard label="Сумма остатка" value={formatMoney(stats.totalAmount)} sub="по текущему отбору" color={C.teal} />
      </div>

      <div
        className="assets-reference-layout"
        style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 16, alignItems: 'start', minWidth: 0 }}
      >
        <Panel
          title="Группы"
          noPad
          titleRight={<Btn variant="ghost" onClick={openCreate} style={{ minHeight: 30, padding: '6px 10px' }}><PlusOutlined /></Btn>}
        >
          <div style={{ display: 'flex', gap: 10, overflowX: 'auto', padding: 16, alignItems: 'stretch' }}>
            <div style={{ flex: '0 0 230px' }}>
              <button
                type="button"
                onClick={() => setGroupFilter('')}
                style={{
                  ...groupButtonBase,
                  background: !groupFilter ? C.accentLight : C.glassStrong,
                  borderColor: !groupFilter ? C.accent : C.border,
                }}
              >
                <span style={{ minWidth: 0 }}>
                  <span style={{ display: 'block', fontSize: 13, fontWeight: 750, color: C.heading }}>Все группы</span>
                  <span style={{ display: 'block', fontSize: 11, color: C.secondary, marginTop: 4 }}>{assets.length} позиций</span>
                </span>
                <Badge status="Все" />
              </button>
            </div>

            <div style={{ flex: '0 0 230px' }}>
              <button
                type="button"
                onClick={() => setGroupFilter(EMPTY_FILTER)}
                style={{
                  ...groupButtonBase,
                  background: groupFilter === EMPTY_FILTER ? C.accentLight : C.glassStrong,
                  borderColor: groupFilter === EMPTY_FILTER ? C.accent : C.border,
                }}
              >
                <span style={{ minWidth: 0 }}>
                  <span style={{ display: 'block', fontSize: 13, fontWeight: 750, color: C.heading }}>Без группы</span>
                  <span style={{ display: 'block', fontSize: 11, color: C.secondary, marginTop: 4 }}>Не заполнено</span>
                </span>
                <Badge status="Пусто" />
              </button>
            </div>

            {categories.length === 0 ? (
              <EmptyState text="Группы не созданы" />
            ) : categories.map((category) => {
              const isActive = groupFilter === String(category.id);
              return (
                <div key={category.id} style={{ flex: '0 0 250px', position: 'relative' }}>
                  <button
                    type="button"
                    onClick={() => setGroupFilter(String(category.id))}
                    style={{
                      ...groupButtonBase,
                      height: '100%',
                      padding: '13px 74px 13px 14px',
                      background: isActive ? C.accentLight : C.glassStrong,
                      borderColor: isActive ? C.accent : C.border,
                    }}
                  >
                    <span style={{ minWidth: 0 }}>
                      <span style={{ display: 'block', fontSize: 13, fontWeight: 750, color: C.heading, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {category.name}
                      </span>
                      <span style={{ display: 'block', fontSize: 11, color: C.secondary, marginTop: 2 }}>
                        {category.code} · {activeTab === 'TMZ' ? `${formatQuantity(category.group_total_quantity)} ед.` : `${category.asset_count || 0} карточек`}
                      </span>
                    </span>
                  </button>
                  <div style={{ position: 'absolute', top: 10, right: 10, display: 'flex', gap: 6 }}>
                    <button type="button" title="Редактировать" onClick={() => openEdit(category)} style={softButtonStyle}>
                      <EditOutlined />
                    </button>
                    <button type="button" title="Удалить" onClick={() => handleDeleteCategory(category)} style={{ ...softButtonStyle, color: C.danger }}>
                      <DeleteOutlined />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>

        <Panel
          title="Позиции"
          subtitle={positionsSubtitle}
          noPad
          style={{ minWidth: 0 }}
          titleRight={<Badge status={`${assets.length} записей`} />}
        >
          {loading ? (
            <Spinner />
          ) : assets.length === 0 ? (
            <EmptyState text="По текущему отбору позиций нет" />
          ) : (
            <div style={{ width: '100%', maxWidth: '100%', overflowX: 'auto' }}>
              <table style={{ width: '100%', minWidth: 1080, borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <Th style={{ minWidth: 220 }}>Позиция</Th>
                    <Th>Категория</Th>
                    <Th>Группа</Th>
                    <Th>Ед.</Th>
                    <Th style={{ minWidth: 160 }}>Склад</Th>
                    <Th right>Остаток</Th>
                    <Th right>Сумма</Th>
                    <Th right>Цена</Th>
                    <Th>Дата</Th>
                    <Th></Th>
                  </tr>
                </thead>
                <tbody>
                  {assets.map((asset) => (
                    <tr
                      key={asset.id}
                      onMouseEnter={(event) => hoverRow(event, true)}
                      onMouseLeave={(event) => hoverRow(event, false)}
                      style={{ transition: `background 0.18s ${C.ease}` }}
                    >
                      <Td style={{ minWidth: 220, whiteSpace: 'normal' }}>
                        <AssetLink assetId={asset.id}>{asset.name}</AssetLink>
                        <div style={{ fontSize: 11, color: C.muted, marginTop: 3, lineHeight: 1.35 }}>
                          {asset.code}{asset.inventory_number ? ` · Инв. ${asset.inventory_number}` : ''}
                        </div>
                      </Td>
                      <Td><Badge status={asset.category_name || '—'} /></Td>
                      <Td>
                        <select
                          value={asset.group || ''}
                          onChange={(event) => setAssetGroup(asset.id, event.target.value)}
                          style={rowSelectStyle}
                        >
                          <option value="">Без группы</option>
                          {categories.map((category) => (
                            <option key={category.id} value={category.id}>{category.name}</option>
                          ))}
                        </select>
                      </Td>
                      <Td muted>{asset.unit_of_measure_ref_name || asset.unit_of_measure || '—'}</Td>
                      <Td style={{ minWidth: 160, whiteSpace: 'normal' }}>
                        <div style={{ fontWeight: 650, color: asset.warehouse_name ? C.heading : C.muted }}>
                          {asset.warehouse_name || 'Не указан'}
                        </div>
                        {asset.stock_location && asset.stock_location !== asset.warehouse_name && (
                          <div style={{ fontSize: 11, color: C.secondary, marginTop: 3 }}>{asset.stock_location}</div>
                        )}
                      </Td>
                      <Td right>
                        <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                          <span style={{ fontWeight: 750, color: toNumber(asset.stock_quantity) > 0 ? C.heading : C.muted }}>
                            {formatQuantity(asset.stock_quantity)}
                          </span>
                          <Badge status={stockLabel(asset)} />
                        </div>
                      </Td>
                      <Td right>{formatMoney(asset.stock_total_amount)}</Td>
                      <Td right>{formatMoney(asset.unit_price)}</Td>
                      <Td muted>{formatDate(asset.stock_balance_date || asset.balance_date)}</Td>
                      <Td right>
                        <button type="button" title="Редактировать" onClick={() => openEditAsset(asset)} style={softButtonStyle}>
                          <EditOutlined />
                        </button>
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>
      </div>

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={editingCategory ? 'Редактирование группы' : 'Новая группа'}
        footer={(
          <>
            <Btn variant="secondary" onClick={() => setDrawerOpen(false)}>{t('common.cancel')}</Btn>
            <Btn onClick={handleSaveCategory}>{t('common.save')}</Btn>
          </>
        )}
      >
        {errorMsg && (
          <div style={{ background: C.dangerBg, color: C.danger, padding: '8px 12px', borderRadius: C.radiusSm, fontSize: 12, marginBottom: 14 }}>
            {errorMsg}
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <InputField label="Наименование *" value={fName} onChange={(event) => setFName(event.target.value)} />
          <InputField label="Код" value={fCode} onChange={(event) => setFCode(event.target.value)} placeholder="Автоматически, если оставить пустым" />
          <SelectField
            label="Родительская группа"
            value={fParent}
            onChange={(event) => setFParent(event.target.value)}
            options={[{ value: '', label: 'Нет' }, ...categories.filter((cat) => cat.id !== editingCategory?.id).map((cat) => ({ value: cat.id, label: cat.name }))]}
          />
        </div>
      </Drawer>

      <Drawer
        open={assetDrawerOpen}
        onClose={() => setAssetDrawerOpen(false)}
        title={editingAsset ? 'Редактирование позиции' : 'Новая позиция'}
        footer={(
          <>
            <Btn variant="secondary" onClick={() => setAssetDrawerOpen(false)}>{t('common.cancel')}</Btn>
            <Btn onClick={handleSaveAsset}>{t('common.save')}</Btn>
          </>
        )}
      >
        {assetErrorMsg && (
          <div style={{ background: C.dangerBg, color: C.danger, padding: '8px 12px', borderRadius: C.radiusSm, fontSize: 12, marginBottom: 14 }}>
            {assetErrorMsg}
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <InputField label="Наименование *" value={aName} onChange={(event) => setAName(event.target.value)} />
          <InputField label="Код" value={aCode} onChange={(event) => setACode(event.target.value)} placeholder="Автоматически, если оставить пустым" />
          <SelectField
            label="Категория *"
            value={aCategory}
            onChange={(event) => setACategory(event.target.value)}
            options={[{ value: '', label: 'Выберите' }, ...categories.map((cat) => ({ value: cat.id, label: cat.name }))]}
          />
          <SelectField
            label="Группа"
            value={aGroup}
            onChange={(event) => setAGroup(event.target.value)}
            options={[{ value: '', label: 'Без группы' }, ...categories.map((cat) => ({ value: cat.id, label: cat.name }))]}
          />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <SelectField
              label="Ед. изм. *"
              value={aUnit}
              onChange={(event) => setAUnit(event.target.value)}
              options={[{ value: '', label: 'Выберите' }, ...units.map((unit) => ({ value: unit.id, label: unit.name }))]}
            />
            <InputField label="Цена *" type="number" min="0" step="0.01" value={aPrice} onChange={(event) => setAPrice(event.target.value)} />
          </div>
          {activeTab === 'TMZ' ? (
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: C.heading }}>
              <input type="checkbox" checked={aLongTerm} onChange={(event) => setALongTerm(event.target.checked)} />
              ТМЗ длительного пользования
            </label>
          ) : (
            <>
              <InputField label="Инвентарный номер *" value={aInventory} onChange={(event) => setAInventory(event.target.value)} />
              <InputField label="Дата постановки на баланс" type="date" value={aBalanceDate} onChange={(event) => setABalanceDate(event.target.value)} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <InputField label="Срок, мес." type="number" min="0" value={aUsefulLife} onChange={(event) => setAUsefulLife(event.target.value)} />
                <InputField label="Амортизация, %" type="number" min="0" step="0.01" value={aDepRate} onChange={(event) => setADepRate(event.target.value)} />
              </div>
            </>
          )}
        </div>
      </Drawer>
    </div>
  );
};

export default AssetsListPage;
