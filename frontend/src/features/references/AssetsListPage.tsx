import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import api from '../../api/axios';
import type { Asset, AssetCategory, PaginatedResponse } from '../../shared/types';
import {
  C, PageHeader, Btn, Th, Td, Badge, Tabs, Drawer, InputField, SelectField,
  Spinner, EmptyState, Panel, hoverRow,
} from '../../shared/ui/primitives';
import AssetLink from '../../shared/components/AssetLink';

type TabKey = 'TMZ' | 'OS' | 'NMA';
const TAB_TITLES: Record<TabKey, string> = { TMZ: 'Номенклатура', OS: 'Основные средства', NMA: 'НМА' };

const AssetsListPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { type } = useParams<{ type: string }>();
  const [activeTab, setActiveTab] = useState<TabKey>(((type || 'tmz').toUpperCase() as TabKey));
  const [assets, setAssets] = useState<Asset[]>([]);
  const [categories, setCategories] = useState<AssetCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<AssetCategory | null>(null);
  const [draggingAssetId, setDraggingAssetId] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [ungroupedCategoryFilter, setUngroupedCategoryFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [groupFilter, setGroupFilter] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [assetDrawerOpen, setAssetDrawerOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [assetErrorMsg, setAssetErrorMsg] = useState('');

  /* form */
  const [fName, setFName] = useState('');
  const [fCode, setFCode] = useState('');
  const [fParent, setFParent] = useState('');

  const [aName, setAName] = useState('');
  const [aCode, setACode] = useState('');
  const [aCategory, setACategory] = useState('');
  const [aGroup, setAGroup] = useState('');
  const [aUnit, setAUnit] = useState('шт');
  const [aPrice, setAPrice] = useState('0');
  const [aLongTerm, setALongTerm] = useState(false);
  const [aInventory, setAInventory] = useState('');
  const [aBalanceDate, setABalanceDate] = useState('');
  const [aUsefulLife, setAUsefulLife] = useState('');
  const [aDepRate, setADepRate] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const assetParams: Record<string, any> = {
        page_size: 500,
        asset_type: activeTab,
        search: search || undefined,
        category: categoryFilter || undefined,
        group: groupFilter || undefined,
        ordering: 'name',
      };
      const [assetsRes, categoriesRes] = await Promise.all([
        api.get<PaginatedResponse<Asset>>('/references/assets/', {
          params: assetParams,
        }),
        api.get<PaginatedResponse<AssetCategory>>('/references/asset-categories/', {
          params: { page_size: 200, asset_type: activeTab, ordering: 'name' },
        }),
      ]);
      setAssets(assetsRes.data.results || []);
      setCategories(categoriesRes.data.results || []);
    } catch { /* */ } finally { setLoading(false); }
  }, [activeTab, categoryFilter, groupFilter, search]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => {
    const nextTab = (type || 'tmz').toUpperCase() as TabKey;
    if (['TMZ', 'OS', 'NMA'].includes(nextTab)) {
      setActiveTab(nextTab);
      setSelectedCategoryId(null);
      setCategoryFilter('');
      setGroupFilter('');
    }
  }, [type]);

  const groupedAssetsMap = useMemo(() => {
    const map: Record<number, Asset[]> = {};
    assets.filter((a) => a.group).forEach((a) => {
      const gid = a.group as number;
      if (!map[gid]) map[gid] = [];
      map[gid].push(a);
    });
    return map;
  }, [assets]);

  const ungroupedAssets = useMemo(() => {
    let list = assets.filter((a) => !a.group);
    if (ungroupedCategoryFilter) list = list.filter((a) => String(a.category) === ungroupedCategoryFilter);
    return list;
  }, [assets, ungroupedCategoryFilter]);
  const selectedGroupAssets = selectedCategoryId ? (groupedAssetsMap[selectedCategoryId] || []) : [];

  const getCategoryMetric = (cat: AssetCategory) =>
    activeTab === 'TMZ' ? `Остаток: ${Number(cat.group_total_quantity || 0)} ед.` : `Карточек: ${cat.asset_count || 0}`;

  const resetForm = (c?: AssetCategory) => {
    setFName(c?.name || ''); setFCode(c?.code || '');
    setFParent(c?.parent ? String(c.parent) : '');
    setErrorMsg('');
  };

  const openCreate = () => { setEditingCategory(null); resetForm(); setDrawerOpen(true); };
  const openEdit = (c: AssetCategory) => { setEditingCategory(c); resetForm(c); setDrawerOpen(true); };

  const handleSaveCategory = async () => {
    if (!fName) { setErrorMsg('Заполните обязательные поля'); return; }
    setErrorMsg('');
    try {
      const payload = { name: fName, code: fCode, asset_type: activeTab, parent: fParent ? Number(fParent) : null };
      if (editingCategory) {
        await api.patch(`/references/asset-categories/${editingCategory.id}/`, payload);
      } else {
        await api.post('/references/asset-categories/', payload);
      }
      setDrawerOpen(false); fetchData();
    } catch (err: any) {
      setErrorMsg(err?.response?.data ? Object.values(err.response.data).flat().join('; ') : t('common.error'));
    }
  };

  const resetAssetForm = (asset?: Asset) => {
    setAName(asset?.name || '');
    setACode(asset?.code || '');
    setACategory(asset?.category ? String(asset.category) : '');
    setAGroup(asset?.group ? String(asset.group) : '');
    setAUnit(asset?.unit_of_measure || 'шт');
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
    if (!aName || !aCategory || !aUnit || !aPrice) {
      setAssetErrorMsg('Заполните наименование, категорию, единицу измерения и цену');
      return;
    }
    setAssetErrorMsg('');
    const payload = {
      name: aName,
      code: aCode,
      asset_type: activeTab,
      category: Number(aCategory),
      group: aGroup ? Number(aGroup) : null,
      unit_of_measure: aUnit,
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

  const handleDeleteCategory = async (c: AssetCategory) => {
    try {
      await api.delete(`/references/asset-categories/${c.id}/`);
      if (selectedCategoryId === c.id) setSelectedCategoryId(null);
      fetchData();
    } catch { /* */ }
  };

  const assignAssetToGroup = async (assetId: number, catId: number) => {
    try {
      await api.patch(`/references/assets/${assetId}/`, { group: catId });
      setSelectedCategoryId(catId); fetchData();
    } catch { /* */ }
  };

  const handleDropToCategory = async (catId: number) => {
    if (!draggingAssetId) return;
    const assetId = draggingAssetId;
    setDraggingAssetId(null);
    await assignAssetToGroup(assetId, catId);
  };

  const handleRemoveFromGroup = async (assetId: number) => {
    try { await api.patch(`/references/assets/${assetId}/`, { group: null }); fetchData(); } catch { /* */ }
  };

  const tabItems = [
    { key: 'TMZ', label: 'Номенклатура' },
    { key: 'OS', label: 'ОС' },
    { key: 'NMA', label: 'НМА' },
  ];

  return (
    <div>
      <PageHeader
        title={TAB_TITLES[activeTab]}
        subtitle="Группировка справочников: перетаскивайте элементы из правого списка в группы слева."
        right={
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <input placeholder="Поиск…" value={search} onChange={(e) => setSearch(e.target.value)}
              style={{ padding: '8px 14px', border: `1px solid ${C.inputBorder}`, borderRadius: C.radiusSm, fontSize: 13, width: 220, outline: 'none', background: C.glassStrong }} />
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}
              style={{ padding: '8px 12px', border: `1px solid ${C.inputBorder}`, borderRadius: C.radiusSm, fontSize: 13, outline: 'none', background: C.glassStrong }}>
              <option value="">Все категории</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <select value={groupFilter} onChange={(e) => setGroupFilter(e.target.value)}
              style={{ padding: '8px 12px', border: `1px solid ${C.inputBorder}`, borderRadius: C.radiusSm, fontSize: 13, outline: 'none', background: C.glassStrong }}>
              <option value="">Все группы</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <Btn variant="secondary" onClick={openCreateAsset}><PlusOutlined /> Создать позицию</Btn>
            <Btn onClick={openCreate}><PlusOutlined /> Создать группу</Btn>
          </div>
        }
      />

      <Tabs activeKey={activeTab} items={tabItems} onChange={(k) => navigate(`/references/assets/${k.toLowerCase()}`)} style={{ marginBottom: 20 }} />

      {loading ? <Spinner /> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 420px), 1fr))', gap: 20 }}>
          {/* Left: Groups + Contents */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Panel title="Группы" subtitle="Выбери группу, чтобы увидеть её состав">
              {categories.length === 0 ? <EmptyState text="Нет групп" /> : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {categories.map((cat) => (
                    <div key={cat.id}
                      onClick={() => setSelectedCategoryId(cat.id)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => handleDropToCategory(cat.id)}
                      style={{
                        padding: '12px 14px', borderRadius: C.radiusSm, cursor: 'pointer',
                        background: selectedCategoryId === cat.id ? C.accentLight : C.glassStrong,
                        border: `1px solid ${selectedCategoryId === cat.id ? C.accent : C.border}`,
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 500, fontSize: 13, color: C.heading }}>{cat.name}</div>
                        <div style={{ fontSize: 11, color: C.muted }}>{cat.code} · {getCategoryMetric(cat)}</div>
                      </div>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button onClick={(e) => { e.stopPropagation(); openEdit(cat); }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12 }}><EditOutlined /></button>
                        <button onClick={(e) => { e.stopPropagation(); handleDeleteCategory(cat); }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: C.danger }}><DeleteOutlined /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Panel>

            <Panel title="Состав группы" noPad subtitle={selectedCategoryId ? 'Элементы в выбранной группе' : 'Выберите группу'}>
              {selectedGroupAssets.length === 0 ? <EmptyState text={selectedCategoryId ? 'В группе пока нет элементов' : 'Группа не выбрана'} /> : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead><tr><Th>Элемент</Th><Th>{activeTab === 'TMZ' ? 'Остаток' : 'Карточка'}</Th><Th>Действие</Th></tr></thead>
                  <tbody>
                    {selectedGroupAssets.map((a) => (
                      <tr key={a.id} onMouseEnter={(e) => hoverRow(e, true)} onMouseLeave={(e) => hoverRow(e, false)}>
                        <Td>
                          <AssetLink assetId={a.id}>{a.name}</AssetLink>
                          <div style={{ fontSize: 11, color: C.muted }}>{a.code}{a.inventory_number ? ` · Инв. ${a.inventory_number}` : ''}</div>
                        </Td>
                        <Td><Badge status={activeTab === 'TMZ' ? `${a.stock_quantity} ед.` : '1 карточка'} /></Td>
                        <Td>
                          <button onClick={() => openEditAsset(a)}
                            style={{ background: 'none', border: 'none', color: C.accent, cursor: 'pointer', fontSize: 12, fontWeight: 500, marginRight: 8 }}>
                            <EditOutlined />
                          </button>
                          <button onClick={() => handleRemoveFromGroup(a.id)}
                            style={{ background: 'none', border: 'none', color: C.danger, cursor: 'pointer', fontSize: 12, fontWeight: 500 }}>
                            Убрать
                          </button>
                        </Td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </Panel>
          </div>

          {/* Right: Ungrouped */}
          <Panel title="Нераспределённые элементы" noPad
            subtitle="Перетащите элемент в группу слева или выберите группу в столбце действий"
            titleRight={
              <select value={ungroupedCategoryFilter} onChange={(e) => setUngroupedCategoryFilter(e.target.value)}
                style={{ padding: '6px 10px', border: `1px solid ${C.inputBorder}`, borderRadius: C.radiusSm, fontSize: 12, outline: 'none', background: C.glassStrong }}>
                <option value="">Все категории</option>
                {Array.from(new Map(assets.filter((a) => !a.group && a.category).map((a) => [a.category, a.category_name])).entries())
                  .map(([cid, cname]) => <option key={cid} value={String(cid)}>{cname}</option>)}
              </select>
            }>
            {ungroupedAssets.length === 0 ? <EmptyState text="Все элементы распределены" /> : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <Th>Наименование</Th>
                    <Th>Категория</Th>
                    {activeTab === 'TMZ' ? <><Th right>Остаток</Th><Th>Длит. польз.</Th></> : <Th>Инв. номер</Th>}
                    <Th>Группа</Th><Th></Th>
                  </tr>
                </thead>
                <tbody>
                  {ungroupedAssets.map((a) => (
                    <tr key={a.id} draggable onDragStart={() => setDraggingAssetId(a.id)}
                      onMouseEnter={(e) => hoverRow(e, true)} onMouseLeave={(e) => hoverRow(e, false)}
                      style={{ cursor: 'grab' }}>
                      <Td>
                        <AssetLink assetId={a.id}>{a.name}</AssetLink>
                        <div style={{ fontSize: 11, color: C.muted }}>{a.code}{a.inventory_number ? ` · Инв. ${a.inventory_number}` : ''}</div>
                      </Td>
                      <Td><Badge status={a.category_name || ''} /></Td>
                      {activeTab === 'TMZ' ? (
                        <>
                          <Td right>{a.stock_quantity}</Td>
                          <Td><Badge status={a.is_long_term_use ? 'Да' : 'Нет'} /></Td>
                        </>
                      ) : (
                        <Td muted>{a.inventory_number || '—'}</Td>
                      )}
                      <Td>
                        <select value="" onClick={(e) => e.stopPropagation()}
                          onChange={(e) => { if (e.target.value) assignAssetToGroup(a.id, Number(e.target.value)); }}
                          disabled={categories.length === 0}
                          style={{ padding: '5px 8px', border: `1px solid ${C.inputBorder}`, borderRadius: C.radiusSm, fontSize: 12, outline: 'none', background: C.glassStrong }}>
                          <option value="">→ в группу…</option>
                          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                      </Td>
                      <Td>
                        <button onClick={() => openEditAsset(a)}
                          style={{ background: 'none', border: 'none', color: C.accent, cursor: 'pointer', fontSize: 13 }}>
                          <EditOutlined />
                        </button>
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Panel>
        </div>
      )}

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)}
        title={editingCategory ? 'Редактирование группы' : 'Новая группа'}
        footer={<>
          <Btn variant="secondary" onClick={() => setDrawerOpen(false)}>{t('common.cancel')}</Btn>
          <Btn onClick={handleSaveCategory}>{t('common.save')}</Btn>
        </>}
      >
        {errorMsg && <div style={{ background: C.dangerBg, color: C.danger, padding: '8px 12px', borderRadius: C.radiusSm, fontSize: 12, marginBottom: 14 }}>{errorMsg}</div>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <InputField label="Обобщённое наименование *" value={fName} onChange={(e) => setFName(e.target.value)} placeholder="Например, Стул" />
          <InputField label="Код группы" value={fCode} onChange={(e) => setFCode(e.target.value)} placeholder="Можно оставить пустым: код создастся автоматически" />
          <SelectField label="Родительская группа" value={fParent} onChange={(e) => setFParent(e.target.value)}
            options={[{ value: '', label: '— нет —' }, ...categories.filter((c) => c.id !== editingCategory?.id).map((c) => ({ value: c.id, label: c.name }))]} />
        </div>
      </Drawer>

      <Drawer open={assetDrawerOpen} onClose={() => setAssetDrawerOpen(false)}
        title={editingAsset ? 'Редактирование позиции' : 'Новая позиция'}
        footer={<>
          <Btn variant="secondary" onClick={() => setAssetDrawerOpen(false)}>{t('common.cancel')}</Btn>
          <Btn onClick={handleSaveAsset}>{t('common.save')}</Btn>
        </>}
      >
        {assetErrorMsg && <div style={{ background: C.dangerBg, color: C.danger, padding: '8px 12px', borderRadius: C.radiusSm, fontSize: 12, marginBottom: 14 }}>{assetErrorMsg}</div>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <InputField label="Наименование *" value={aName} onChange={(e) => setAName(e.target.value)} />
          <InputField label="Код" value={aCode} onChange={(e) => setACode(e.target.value)} placeholder="Можно оставить пустым: код создастся автоматически" />
          <SelectField label="Категория *" value={aCategory} onChange={(e) => setACategory(e.target.value)}
            options={[{ value: '', label: '— выберите —' }, ...categories.map((c) => ({ value: c.id, label: c.name }))]} />
          <SelectField label="Группа" value={aGroup} onChange={(e) => setAGroup(e.target.value)}
            options={[{ value: '', label: '— без группы —' }, ...categories.map((c) => ({ value: c.id, label: c.name }))]} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <InputField label="Ед. изм. *" value={aUnit} onChange={(e) => setAUnit(e.target.value)} />
            <InputField label="Цена *" type="number" min="0" step="0.01" value={aPrice} onChange={(e) => setAPrice(e.target.value)} />
          </div>
          {activeTab === 'TMZ' ? (
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: C.heading }}>
              <input type="checkbox" checked={aLongTerm} onChange={(e) => setALongTerm(e.target.checked)} />
              ТМЗ длительного пользования
            </label>
          ) : (
            <>
              <InputField label="Инвентарный номер *" value={aInventory} onChange={(e) => setAInventory(e.target.value)} />
              <InputField label="Дата постановки на баланс" type="date" value={aBalanceDate} onChange={(e) => setABalanceDate(e.target.value)} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <InputField label="Срок, мес." type="number" min="0" value={aUsefulLife} onChange={(e) => setAUsefulLife(e.target.value)} />
                <InputField label="Амортизация, %" type="number" min="0" step="0.01" value={aDepRate} onChange={(e) => setADepRate(e.target.value)} />
              </div>
            </>
          )}
        </div>
      </Drawer>
    </div>
  );
};

export default AssetsListPage;
