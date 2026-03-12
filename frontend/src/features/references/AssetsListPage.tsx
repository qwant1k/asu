import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../../api/axios';
import type { Asset, AssetCategory, PaginatedResponse } from '../../shared/types';
import {
  C, PageHeader, Btn, Th, Td, Badge, Tabs, Drawer, InputField, SelectField,
  Spinner, EmptyState, Panel, hoverRow,
} from '../../shared/ui/primitives';

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
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  /* form */
  const [fName, setFName] = useState('');
  const [fCode, setFCode] = useState('');
  const [fParent, setFParent] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [assetsRes, categoriesRes] = await Promise.all([
        api.get<PaginatedResponse<Asset>>('/references/assets/', {
          params: { page_size: 500, asset_type: activeTab, search: search || undefined, ordering: 'name' },
        }),
        api.get<PaginatedResponse<AssetCategory>>('/references/asset-categories/', {
          params: { page_size: 200, asset_type: activeTab, ordering: 'name' },
        }),
      ]);
      setAssets(assetsRes.data.results || []);
      setCategories(categoriesRes.data.results || []);
    } catch { /* */ } finally { setLoading(false); }
  }, [activeTab, search]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => {
    const nextTab = (type || 'tmz').toUpperCase() as TabKey;
    if (['TMZ', 'OS', 'NMA'].includes(nextTab)) { setActiveTab(nextTab); setSelectedCategoryId(null); }
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

  const ungroupedAssets = useMemo(() => assets.filter((a) => !a.group), [assets]);
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
    if (!fName || !fCode) { setErrorMsg('Заполните обязательные поля'); return; }
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

  const handleDeleteCategory = async (c: AssetCategory) => {
    try {
      await api.delete(`/references/asset-categories/${c.id}/`);
      if (selectedCategoryId === c.id) setSelectedCategoryId(null);
      fetchData();
    } catch { /* */ }
  };

  const handleDropToCategory = async (catId: number) => {
    if (!draggingAssetId) return;
    try {
      await api.patch(`/references/assets/${draggingAssetId}/`, { group: catId });
      setDraggingAssetId(null); setSelectedCategoryId(catId); fetchData();
    } catch { /* */ }
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
          <div style={{ display: 'flex', gap: 10 }}>
            <input placeholder="Поиск…" value={search} onChange={(e) => setSearch(e.target.value)}
              style={{ padding: '8px 14px', border: `1px solid ${C.inputBorder}`, borderRadius: 6, fontSize: 13, width: 220, outline: 'none' }} />
            <Btn onClick={openCreate}>+ Создать группу</Btn>
          </div>
        }
      />

      <Tabs activeKey={activeTab} items={tabItems} onChange={(k) => navigate(`/references/assets/${k.toLowerCase()}`)} style={{ marginBottom: 20 }} />

      {loading ? <Spinner /> : (
        <div style={{ display: 'grid', gridTemplateColumns: '5fr 7fr', gap: 20 }}>
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
                        padding: '10px 14px', borderRadius: 6, cursor: 'pointer',
                        background: selectedCategoryId === cat.id ? C.accentLight : '#fff',
                        border: `1px solid ${selectedCategoryId === cat.id ? C.accent : C.border}`,
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 500, fontSize: 13, color: C.heading }}>{cat.name}</div>
                        <div style={{ fontSize: 11, color: C.muted }}>{cat.code} · {getCategoryMetric(cat)}</div>
                      </div>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button onClick={(e) => { e.stopPropagation(); openEdit(cat); }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12 }}>✏️</button>
                        <button onClick={(e) => { e.stopPropagation(); handleDeleteCategory(cat); }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: C.danger }}>🗑️</button>
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
                          <div style={{ fontWeight: 500, color: C.heading }}>{a.name}</div>
                          <div style={{ fontSize: 11, color: C.muted }}>{a.code}{a.inventory_number ? ` · Инв. ${a.inventory_number}` : ''}</div>
                        </Td>
                        <Td><Badge status={activeTab === 'TMZ' ? `${a.stock_quantity} ед.` : '1 карточка'} /></Td>
                        <Td>
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
          <Panel title="Нераспределённые элементы" noPad subtitle="Перетащите элемент в группу слева">
            {ungroupedAssets.length === 0 ? <EmptyState text="Все элементы распределены" /> : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <Th>Наименование</Th>
                    <Th>Категория</Th>
                    {activeTab === 'TMZ' ? <><Th right>Остаток</Th><Th>Длит. польз.</Th></> : <Th>Инв. номер</Th>}
                  </tr>
                </thead>
                <tbody>
                  {ungroupedAssets.map((a) => (
                    <tr key={a.id} draggable onDragStart={() => setDraggingAssetId(a.id)}
                      onMouseEnter={(e) => hoverRow(e, true)} onMouseLeave={(e) => hoverRow(e, false)}
                      style={{ cursor: 'grab' }}>
                      <Td>
                        <div style={{ fontWeight: 500, color: C.heading }}>{a.name}</div>
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
        {errorMsg && <div style={{ background: C.dangerBg, color: C.danger, padding: '8px 12px', borderRadius: 6, fontSize: 12, marginBottom: 14 }}>{errorMsg}</div>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <InputField label="Обобщённое наименование *" value={fName} onChange={(e) => setFName(e.target.value)} placeholder="Например, Стул" />
          <InputField label="Код группы *" value={fCode} onChange={(e) => setFCode(e.target.value)} placeholder="CHAIR_GROUP" />
          <SelectField label="Родительская группа" value={fParent} onChange={(e) => setFParent(e.target.value)}
            options={[{ value: '', label: '— нет —' }, ...categories.filter((c) => c.id !== editingCategory?.id).map((c) => ({ value: c.id, label: c.name }))]} />
        </div>
      </Drawer>
    </div>
  );
};

export default AssetsListPage;
