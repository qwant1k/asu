import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  AppstoreOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  DeleteOutlined,
  InboxOutlined,
  LeftOutlined,
  SearchOutlined,
  ShoppingCartOutlined,
  TagsOutlined,
} from '@ant-design/icons';
import api from '../../api/axios';
import type { Asset, AssetCategory, AssetRequest, PaginatedResponse, RequestTypeReference } from '../../shared/types';
import {
  C, PageHeader, Btn, Panel, TextAreaField, Badge, Spinner, EmptyState,
} from '../../shared/ui/primitives';

interface DraftRequestItem {
  key: number;
  groupId: number | null;
  assetId: number | null;
  quantity_requested: number;
  comment: string;
}

type WizardStep = 'type' | 'category' | 'group' | 'product';

const newItemKey = () => Date.now() + Math.random();

const toNumber = (value: string | number | null | undefined) => {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
};

const formatQty = (value: string | number | null | undefined) =>
  toNumber(value).toLocaleString('ru-RU', { maximumFractionDigits: 2 });

const formatLocalDateTime = (value: Date) =>
  value.toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

const requestTypeTone = (index: number) => {
  const tones = [
    { bg: 'linear-gradient(135deg, #EAF3FF, #F8FBFF)', color: C.accent, iconBg: 'rgba(37, 99, 235, 0.12)' },
    { bg: 'linear-gradient(135deg, #ECFDF5, #F8FBFF)', color: C.success, iconBg: 'rgba(4, 120, 87, 0.12)' },
    { bg: 'linear-gradient(135deg, #FFF7ED, #F8FBFF)', color: C.warning, iconBg: 'rgba(180, 83, 9, 0.12)' },
    { bg: 'linear-gradient(135deg, #F0FDFA, #F8FBFF)', color: C.teal, iconBg: 'rgba(15, 118, 110, 0.12)' },
  ];
  return tones[index % tones.length];
};

const shopCardBase: React.CSSProperties = {
  border: `1px solid ${C.border}`,
  borderRadius: 28,
  background: 'linear-gradient(180deg, rgba(255,255,255,0.96), rgba(248,250,252,0.88))',
  boxShadow: '0 1px 1px rgba(15, 23, 42, 0.04), 0 14px 34px rgba(15, 23, 42, 0.08)',
  cursor: 'pointer',
  textAlign: 'left',
  transition: `transform 0.24s ${C.spring}, box-shadow 0.24s ${C.ease}, border-color 0.2s ${C.ease}, background 0.2s ${C.ease}`,
};

const compactInputStyle: React.CSSProperties = {
  width: '100%',
  border: `1px solid ${C.inputBorder}`,
  borderRadius: C.radiusSm,
  background: 'rgba(255, 255, 255, 0.9)',
  color: C.text,
  outline: 'none',
  fontSize: 13,
  minHeight: 36,
  padding: '8px 10px',
};

const RequestCreatePage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const [requestTypes, setRequestTypes] = useState<RequestTypeReference[]>([]);
  const [categories, setCategories] = useState<AssetCategory[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [items, setItems] = useState<DraftRequestItem[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<WizardStep>('type');
  const [currentDateTime, setCurrentDateTime] = useState(() => new Date());
  const [selectedTypeId, setSelectedTypeId] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [reason, setReason] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loadingExisting, setLoadingExisting] = useState(false);

  const selectedRequestType = useMemo(
    () => requestTypes.find((i) => String(i.id) === selectedTypeId) || null,
    [requestTypes, selectedTypeId],
  );
  const isSingleUnit = selectedRequestType?.asset_type === 'OS' || selectedRequestType?.asset_type === 'NMA';
  const baseAssetType = selectedRequestType?.asset_type === 'REPRESENTATIVE_TMZ' ? 'TMZ' : selectedRequestType?.asset_type;

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get<PaginatedResponse<RequestTypeReference>>('/references/request-types/', {
          params: { page_size: 100, is_active: true, ordering: 'name' },
        });
        setRequestTypes(res.data.results || []);
      } catch {
        setRequestTypes([]);
      }
    })();
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => setCurrentDateTime(new Date()), 30000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!selectedRequestType) {
      setCategories([]);
      setAssets([]);
      setSelectedCategoryId(null);
      setSelectedGroupId(null);
      if (!isEdit) setCurrentStep('type');
      return;
    }

    let active = true;
    (async () => {
      setCatalogLoading(true);
      try {
        const assetParams: Record<string, any> = { page_size: 1000, asset_type: baseAssetType, ordering: 'name' };
        if (baseAssetType === 'TMZ' && selectedRequestType.requires_long_term_use) assetParams.is_long_term_use = true;
        const [catRes, assetRes] = await Promise.all([
          api.get<PaginatedResponse<AssetCategory>>('/references/asset-categories/', {
            params: { page_size: 500, asset_type: baseAssetType, ordering: 'name' },
          }),
          api.get<PaginatedResponse<Asset>>('/references/assets/', { params: assetParams }),
        ]);
        if (!active) return;
        setCategories(catRes.data.results || []);
        setAssets(assetRes.data.results || []);
        setSelectedCategoryId(null);
        setSelectedGroupId(null);
        setSearch('');
        if (!isEdit) setItems([]);
      } catch {
        if (!active) return;
        setCategories([]);
        setAssets([]);
      } finally {
        if (active) setCatalogLoading(false);
      }
    })();

    return () => { active = false; };
  }, [baseAssetType, isEdit, selectedRequestType]);

  useEffect(() => {
    if (!isEdit || !id) return;
    let active = true;
    (async () => {
      setLoadingExisting(true);
      try {
        const res = await api.get<AssetRequest>(`/requests/${id}/`);
        if (!active) return;
        setSelectedTypeId(String(res.data.request_type));
        setReason(res.data.reason || '');
        setItems((res.data.items || []).map((item, idx) => ({
          key: item.id || Date.now() + idx,
          groupId: item.requested_group,
          assetId: item.asset,
          quantity_requested: Number(item.quantity_requested || 1),
          comment: item.comment || '',
        })));
        setCurrentStep('category');
      } catch (err: any) {
        if (active) setErrorMsg(err?.response?.data?.detail || t('common.error'));
      } finally {
        if (active) setLoadingExisting(false);
      }
    })();
    return () => { active = false; };
  }, [id, isEdit, t]);

  const categoryStats = useMemo(() => {
    const map = new Map<number, { count: number; stock: number }>();
    assets.forEach((asset) => {
      const cur = map.get(asset.category) || { count: 0, stock: 0 };
      cur.count += 1;
      cur.stock += toNumber(asset.stock_quantity);
      map.set(asset.category, cur);
    });
    return map;
  }, [assets]);

  const categoryCards = useMemo(() => {
    const usedIds = new Set(assets.map((asset) => asset.category));
    return categories
      .filter((cat) => usedIds.has(cat.id) || toNumber(cat.group_total_quantity) > 0 || cat.asset_count > 0)
      .map((cat) => ({
        ...cat,
        count: categoryStats.get(cat.id)?.count || cat.asset_count || 0,
        stock: categoryStats.get(cat.id)?.stock || toNumber(cat.group_total_quantity),
      }));
  }, [assets, categories, categoryStats]);

  const selectedCategoryAssets = useMemo(
    () => (selectedCategoryId ? assets.filter((asset) => asset.category === selectedCategoryId) : assets),
    [assets, selectedCategoryId],
  );

  const groupStats = useMemo(() => {
    const map = new Map<number, { count: number; stock: number }>();
    selectedCategoryAssets.forEach((asset) => {
      if (!asset.group) return;
      const cur = map.get(asset.group) || { count: 0, stock: 0 };
      cur.count += 1;
      cur.stock += toNumber(asset.stock_quantity);
      map.set(asset.group, cur);
    });
    return map;
  }, [selectedCategoryAssets]);

  const groupCards = useMemo(
    () => Array.from(groupStats.entries()).map(([groupId, stat]) => {
      const group = categories.find((cat) => cat.id === groupId);
      return {
        id: groupId,
        name: group?.name || 'Без названия',
        code: group?.code || '',
        count: stat.count,
        stock: stat.stock,
      };
    }).sort((a, b) => a.name.localeCompare(b.name)),
    [categories, groupStats],
  );

  const visibleAssets = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return selectedCategoryAssets
      .filter((asset) => (selectedGroupId ? asset.group === selectedGroupId : true))
      .filter((asset) => {
        if (!normalizedSearch) return true;
        return [asset.name, asset.code, asset.inventory_number, asset.warehouse_name]
          .some((value) => String(value || '').toLowerCase().includes(normalizedSearch));
      });
  }, [search, selectedCategoryAssets, selectedGroupId]);

  const assetById = useMemo(() => new Map(assets.map((asset) => [asset.id, asset])), [assets]);
  const categoryById = useMemo(() => new Map(categories.map((category) => [category.id, category])), [categories]);
  const selectedCategory = selectedCategoryId ? categoryById.get(selectedCategoryId) : null;
  const selectedGroup = selectedGroupId ? categoryById.get(selectedGroupId) : null;
  const cartCount = items.filter((item) => item.groupId || item.assetId).length;

  const handleSelectType = (typeId: string) => {
    if (isEdit) return;
    setSelectedTypeId(typeId);
    setCurrentStep('category');
    setErrorMsg('');
  };

  const handleClearType = () => {
    if (isEdit) return;
    setSelectedTypeId('');
    setSelectedCategoryId(null);
    setSelectedGroupId(null);
    setItems([]);
    setSearch('');
    setCurrentStep('type');
    setErrorMsg('');
  };

  const handleSelectCategory = (categoryId: number | null) => {
    setSelectedCategoryId(categoryId);
    setSelectedGroupId(null);
    setCurrentStep('group');
    setSearch('');
    setErrorMsg('');
  };

  const handleSelectGroup = (groupId: number | null) => {
    setSelectedGroupId(groupId);
    setCurrentStep('product');
  };

  const addAsset = (asset: Asset) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.assetId === asset.id);
      if (existing) {
        return prev.map((item) => {
          if (item.key !== existing.key) return item;
          return {
            ...item,
            quantity_requested: isSingleUnit ? 1 : item.quantity_requested + 1,
          };
        });
      }
      return [
        ...prev,
        {
          key: newItemKey(),
          groupId: asset.group || selectedGroupId || null,
          assetId: asset.id,
          quantity_requested: 1,
          comment: '',
        },
      ];
    });
  };

  const addGroup = (groupId: number) => {
    setItems((prev) => [
      ...prev,
      {
        key: newItemKey(),
        groupId,
        assetId: null,
        quantity_requested: 1,
        comment: '',
      },
    ]);
  };

  const removeItem = (key: number) => setItems((prev) => prev.filter((item) => item.key !== key));

  const updateItem = (key: number, patch: Partial<DraftRequestItem>) => {
    setItems((prev) => prev.map((item) => (item.key === key ? { ...item, ...patch } : item)));
  };

  const handleSubmit = async () => {
    if (!selectedTypeId) { setErrorMsg('Выберите тип заявки'); return; }
    const validItems = items.filter((item) => item.groupId || item.assetId);
    if (validItems.length === 0) { setErrorMsg('Добавьте хотя бы одну позицию в заявку'); return; }

    setSubmitting(true);
    setErrorMsg('');
    try {
      const payload = {
        request_type: Number(selectedTypeId),
        reason,
        client_created_at: isEdit ? undefined : new Date().toISOString(),
        items: validItems.map((item) => ({
          requested_group: item.groupId || null,
          asset: item.assetId || null,
          quantity_requested: isSingleUnit ? 1 : Math.max(1, item.quantity_requested || 1),
          comment: item.comment || '',
        })),
      };
      const res = isEdit
        ? await api.put(`/requests/${id}/`, payload)
        : await api.post('/requests/', payload);
      navigate(isEdit ? `/requests/${res.data.id}` : '/requests');
    } catch (err: any) {
      const msg = err?.response?.data
        ? (typeof err.response.data === 'string' ? err.response.data : Object.values(err.response.data).flat()[0])
        : t('common.error');
      setErrorMsg(String(msg));
    } finally {
      setSubmitting(false);
    }
  };

  const categoryComplete = Boolean(selectedTypeId) && (currentStep === 'group' || currentStep === 'product' || Boolean(selectedCategoryId));
  const groupComplete = Boolean(selectedTypeId) && currentStep === 'product';
  const steps: { key: WizardStep; label: string; icon: React.ReactNode; enabled: boolean; complete: boolean }[] = [
    { key: 'type', label: 'Тип', icon: <AppstoreOutlined />, enabled: true, complete: Boolean(selectedTypeId) },
    { key: 'category', label: 'Категория', icon: <TagsOutlined />, enabled: Boolean(selectedTypeId), complete: categoryComplete },
    { key: 'group', label: 'Группа', icon: <InboxOutlined />, enabled: Boolean(selectedTypeId), complete: groupComplete },
    { key: 'product', label: 'Товар / ОС / НМА', icon: <ShoppingCartOutlined />, enabled: Boolean(selectedTypeId), complete: cartCount > 0 },
  ];

  if (loadingExisting) return <Spinner />;

  return (
    <div>
      <PageHeader
        title={isEdit ? 'Редактировать заявку' : 'Новая заявка'}
        subtitle="Выберите тип, категорию, группу и добавьте нужные позиции в заявку"
        right={<Btn variant="secondary" onClick={() => navigate(isEdit ? `/requests/${id}` : '/requests')}><LeftOutlined /> {t('common.back')}</Btn>}
      />

      {errorMsg && (
        <div style={{ background: C.dangerBg, color: C.danger, padding: '10px 14px', borderRadius: C.radiusSm, fontSize: 13, marginBottom: 16 }}>
          {errorMsg}
        </div>
      )}

      <div className="request-shop-layout">
        <div style={{ minWidth: 0 }}>
          <Panel style={{ marginBottom: 16 }}>
            <div className="request-shop-steps">
              {steps.map((step, index) => (
                <button
                  key={step.key}
                  type="button"
                  disabled={!step.enabled}
                  onClick={() => step.enabled && setCurrentStep(step.key)}
                  className={`request-shop-step${currentStep === step.key ? ' active' : ''}${step.complete ? ' complete' : ''}`}
                >
                  <span>{step.icon}</span>
                  <strong>{index + 1}. {step.label}</strong>
                </button>
              ))}
            </div>
          </Panel>

          {currentStep !== 'type' && (
            <div className="request-shop-path">
              <button type="button" onClick={() => setCurrentStep('type')}>{selectedRequestType?.name || 'Тип заявки'}</button>
              {(currentStep === 'group' || currentStep === 'product') && (
                <button type="button" onClick={() => setCurrentStep('category')}>{selectedCategory?.name || 'Без категории'}</button>
              )}
              {currentStep === 'product' && (
                <button type="button" onClick={() => setCurrentStep('group')}>{selectedGroup?.name || 'Без группы'}</button>
              )}
            </div>
          )}

          {currentStep === 'type' && (
          <Panel
            title="1. Тип заявки"
            subtitle="Выберите сценарий заявки"
            style={{ marginBottom: 16 }}
            titleRight={<Btn variant="secondary" onClick={() => navigate('/requests')}><LeftOutlined /> Назад</Btn>}
          >
            <div className="request-shop-type-grid">
              <button
                type="button"
                className="request-shop-card"
                onClick={handleClearType}
                disabled={isEdit}
                style={{
                  ...shopCardBase,
                  minHeight: 118,
                  padding: 16,
                  background: !selectedTypeId ? 'linear-gradient(135deg, #FFFFFF, #F1F5F9)' : C.surface,
                  borderColor: !selectedTypeId ? C.accent : C.border,
                  opacity: isEdit ? 0.55 : 1,
                }}
              >
                <span style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' }}>
                  <span style={{ width: 42, height: 42, borderRadius: 16, background: C.tagBg, color: C.secondary, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                    <AppstoreOutlined />
                  </span>
                  {!selectedTypeId && <CheckCircleOutlined style={{ color: C.accent, fontSize: 18 }} />}
                </span>
                <span style={{ display: 'block', marginTop: 14, color: C.heading, fontSize: 14, fontWeight: 800, lineHeight: 1.25 }}>
                  Без типа
                </span>
                <span style={{ display: 'block', marginTop: 8, color: C.secondary, fontSize: 12, lineHeight: 1.35 }}>
                  Сбросить выбор типа заявки
                </span>
              </button>
              {requestTypes.map((type, index) => {
                const selected = String(type.id) === selectedTypeId;
                const tone = requestTypeTone(index);
                return (
                  <button
                    key={type.id}
                    type="button"
                    className="request-shop-card"
                    onClick={() => handleSelectType(String(type.id))}
                    disabled={isEdit}
                    style={{
                      ...shopCardBase,
                      minHeight: 118,
                      padding: 16,
                      background: selected ? tone.bg : C.surface,
                      borderColor: selected ? tone.color : C.border,
                      opacity: isEdit && !selected ? 0.55 : 1,
                    }}
                  >
                    <span style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' }}>
                      <span style={{ width: 42, height: 42, borderRadius: 16, background: tone.iconBg, color: tone.color, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                        <AppstoreOutlined />
                      </span>
                      {selected && <CheckCircleOutlined style={{ color: tone.color, fontSize: 18 }} />}
                    </span>
                    <span style={{ display: 'block', marginTop: 14, color: C.heading, fontSize: 14, fontWeight: 800, lineHeight: 1.25 }}>
                      {type.name}
                    </span>
                    <span style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
                      <Badge status={type.asset_type_display} />
                      {type.requires_long_term_use && <Badge status="Длит. польз." />}
                    </span>
                  </button>
                );
              })}
            </div>
          </Panel>
          )}

          {selectedRequestType && currentStep === 'category' && (
            <Panel
              title="2. Категория"
              subtitle="Выберите направление, как в каталоге магазина"
              style={{ marginBottom: 16 }}
              titleRight={<Btn variant="secondary" onClick={() => setCurrentStep('type')}><LeftOutlined /> Назад</Btn>}
            >
              {catalogLoading ? <Spinner /> : (
                <div className="request-shop-category-grid">
                  <button
                    type="button"
                    className="request-shop-card"
                    onClick={() => handleSelectCategory(null)}
                    style={{
                      ...shopCardBase,
                      padding: 15,
                      minHeight: 104,
                      background: !selectedCategoryId ? 'linear-gradient(135deg, #FFFFFF, #EAF3FF)' : C.surface,
                      borderColor: !selectedCategoryId ? C.accent : C.border,
                    }}
                  >
                    <span style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                      <span style={{ width: 36, height: 36, borderRadius: 14, background: C.accentLight, color: C.accent, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                        <TagsOutlined />
                      </span>
                      {!selectedCategoryId && <CheckCircleOutlined style={{ color: C.accent, fontSize: 17 }} />}
                    </span>
                    <span style={{ display: 'block', marginTop: 12, color: C.heading, fontSize: 13, fontWeight: 800, lineHeight: 1.25 }}>
                      Без категории
                    </span>
                    <span style={{ display: 'block', marginTop: 5, color: C.secondary, fontSize: 11 }}>Показать весь каталог типа</span>
                  </button>
                  {categoryCards.map((category, index) => {
                    const active = category.id === selectedCategoryId;
                    const tone = requestTypeTone(index + 1);
                    return (
                      <button
                        key={category.id}
                        type="button"
                        className="request-shop-card"
                        onClick={() => handleSelectCategory(category.id)}
                        style={{
                          ...shopCardBase,
                          padding: 15,
                          minHeight: 104,
                          background: active ? 'linear-gradient(135deg, #FFFFFF, #EAF3FF)' : C.surface,
                          borderColor: active ? C.accent : C.border,
                        }}
                      >
                        <span style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                          <span style={{ width: 36, height: 36, borderRadius: 14, background: tone.iconBg, color: tone.color, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                            <TagsOutlined />
                          </span>
                          <Badge status={isSingleUnit ? `${category.count} карт.` : `${formatQty(category.stock)} ед.`} />
                        </span>
                        <span style={{ display: 'block', marginTop: 12, color: C.heading, fontSize: 13, fontWeight: 800, lineHeight: 1.25 }}>
                          {category.name}
                        </span>
                        <span style={{ display: 'block', marginTop: 5, color: C.secondary, fontSize: 11 }}>{category.code}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </Panel>
          )}

          {selectedRequestType && currentStep === 'group' && (
            <Panel
              title="3. Группа"
              subtitle={selectedCategory?.name || 'Без категории'}
              style={{ marginBottom: 16 }}
              titleRight={<Btn variant="secondary" onClick={() => setCurrentStep('category')}><LeftOutlined /> Назад</Btn>}
            >
                <div className="request-shop-group-row">
                  <button
                    type="button"
                    className="request-shop-card"
                    onClick={() => handleSelectGroup(null)}
                    style={{
                      ...shopCardBase,
                      flex: '0 0 190px',
                      minHeight: 92,
                      padding: 14,
                      background: !selectedGroupId ? C.accentLight : C.surface,
                      borderColor: !selectedGroupId ? C.accent : C.border,
                    }}
                  >
                    <strong style={{ color: C.heading, fontSize: 13 }}>Без группы</strong>
                    <span style={{ display: 'block', marginTop: 8, color: C.secondary, fontSize: 12 }}>Показать все позиции без фильтра по группе</span>
                  </button>

                  {groupCards.map((group) => {
                    const active = group.id === selectedGroupId;
                    return (
                      <button
                        key={group.id}
                        type="button"
                        className="request-shop-card"
                        onClick={() => handleSelectGroup(group.id)}
                        style={{
                          ...shopCardBase,
                          flex: '0 0 230px',
                          minHeight: 92,
                          padding: 14,
                          background: active ? 'linear-gradient(135deg, #FFFFFF, #ECFDF5)' : C.surface,
                          borderColor: active ? C.success : C.border,
                        }}
                      >
                        <span style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                          <strong style={{ color: C.heading, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{group.name}</strong>
                          {active && <CheckCircleOutlined style={{ color: C.success }} />}
                        </span>
                        <span style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
                          <Badge status={isSingleUnit ? `${group.count} карт.` : `${formatQty(group.stock)} ед.`} />
                          <button
                            type="button"
                            onClick={(event) => { event.stopPropagation(); addGroup(group.id); }}
                            style={{ border: 'none', background: C.successBg, color: C.success, borderRadius: 999, padding: '3px 9px', fontSize: 11, fontWeight: 800, cursor: 'pointer' }}
                          >
                            В заявку
                          </button>
                        </span>
                      </button>
                    );
                  })}
                </div>
                {groupCards.length === 0 && (
                  <div style={{ marginTop: 14 }}>
                    <EmptyState text="Группы не найдены, можно перейти к позициям без фильтра по группе" />
                  </div>
                )}
            </Panel>
          )}

          {selectedRequestType && currentStep === 'product' && (
            <Panel
              title="4. Товар / ОС / НМА"
              subtitle={selectedGroup?.name || selectedCategory?.name || 'Без группы'}
              style={{ marginBottom: 16 }}
              titleRight={(
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                  <Btn variant="secondary" onClick={() => setCurrentStep('group')}><LeftOutlined /> Назад</Btn>
                  <div style={{ position: 'relative', width: 280, maxWidth: '100%' }}>
                    <SearchOutlined style={{ position: 'absolute', left: 11, top: 10, color: C.muted, fontSize: 13 }} />
                    <input
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Поиск по каталогу"
                      style={{ ...compactInputStyle, paddingLeft: 32 }}
                    />
                  </div>
                </div>
              )}
            >
              {visibleAssets.length === 0 ? (
                <EmptyState text="По выбранным условиям позиции не найдены" />
              ) : (
                <div className="request-shop-product-grid">
                  {visibleAssets.map((asset, index) => {
                    const inCart = items.some((item) => item.assetId === asset.id);
                    const stock = toNumber(asset.stock_quantity);
                    const tone = requestTypeTone(index + 2);
                    return (
                      <div key={asset.id} className="request-shop-product-card">
                        <div
                          className="request-shop-product-visual"
                          style={{ background: `linear-gradient(145deg, ${tone.iconBg}, rgba(255,255,255,0.92))`, color: tone.color }}
                        >
                          <span>{asset.name.slice(0, 2).toUpperCase()}</span>
                        </div>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'flex-start' }}>
                            <div style={{ minWidth: 0 }}>
                              <h3 style={{ margin: 0, color: C.heading, fontSize: 14, lineHeight: 1.25, fontWeight: 850 }}>{asset.name}</h3>
                              <div style={{ marginTop: 5, color: C.secondary, fontSize: 11, lineHeight: 1.35 }}>
                                {asset.code}{asset.inventory_number ? ` · Инв. ${asset.inventory_number}` : ''}
                              </div>
                            </div>
                            {inCart && <Badge status="В заявке" />}
                          </div>
                          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 12 }}>
                            <Badge status={asset.group_name || 'Без группы'} />
                            <Badge status={asset.warehouse_name || 'Склад не указан'} />
                            <Badge status={isSingleUnit ? '1 карточка' : `${formatQty(stock)} ${asset.unit_of_measure_ref_name || asset.unit_of_measure || 'ед.'}`} />
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginTop: 14 }}>
                            <div>
                              <div style={{ fontSize: 11, color: C.secondary }}>Цена</div>
                              <strong style={{ color: C.heading, fontSize: 14 }}>
                                {toNumber(asset.unit_price).toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} тг
                              </strong>
                            </div>
                            <Btn
                              onClick={() => addAsset(asset)}
                              variant={inCart ? 'secondary' : 'primary'}
                              style={{ minHeight: 34, padding: '7px 12px', whiteSpace: 'nowrap' }}
                            >
                              <ShoppingCartOutlined /> {inCart ? 'Добавить еще' : 'В заявку'}
                            </Btn>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Panel>
          )}
        </div>

        <aside className="request-shop-cart">
          <Panel
            title="Заявка"
            subtitle={cartCount ? `${cartCount} поз.` : 'Корзина пуста'}
            titleRight={<ShoppingCartOutlined style={{ color: C.accent, fontSize: 18 }} />}
          >
            <div className="request-shop-date-chip">
              <ClockCircleOutlined />
              <span>{isEdit ? 'Дата заявки сохранена' : formatLocalDateTime(currentDateTime)}</span>
            </div>

            <TextAreaField
              label={t('requests.reason')}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder={t('requests.reasonPlaceholder')}
              style={{ minHeight: 88, marginBottom: 14 }}
            />

            {cartCount === 0 ? (
              <EmptyState text="Добавьте позиции из каталога" />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {items.filter((item) => item.groupId || item.assetId).map((item) => {
                  const asset = item.assetId ? assetById.get(item.assetId) : null;
                  const group = item.groupId ? categoryById.get(item.groupId) : null;
                  return (
                    <div key={item.key} className="request-shop-cart-item">
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'flex-start' }}>
                        <div style={{ minWidth: 0 }}>
                          <strong style={{ color: C.heading, fontSize: 13, lineHeight: 1.3 }}>
                            {asset?.name || group?.name || 'Позиция заявки'}
                          </strong>
                          <div style={{ color: C.secondary, fontSize: 11, marginTop: 4 }}>
                            {asset ? asset.code : 'Любая позиция группы'}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeItem(item.key)}
                          style={{ width: 30, height: 30, border: `1px solid ${C.border}`, borderRadius: 12, background: C.surfaceSoft, color: C.danger, cursor: 'pointer' }}
                          title="Удалить"
                        >
                          <DeleteOutlined />
                        </button>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: isSingleUnit ? '1fr' : '96px minmax(0, 1fr)', gap: 8, marginTop: 10 }}>
                        {!isSingleUnit && (
                          <input
                            type="number"
                            min={1}
                            value={item.quantity_requested}
                            onChange={(event) => updateItem(item.key, { quantity_requested: Number(event.target.value || 1) })}
                            style={compactInputStyle}
                            title="Количество"
                          />
                        )}
                        <input
                          value={item.comment}
                          onChange={(event) => updateItem(item.key, { comment: event.target.value })}
                          placeholder="Комментарий"
                          style={compactInputStyle}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div style={{ display: 'flex', gap: 10, marginTop: 18, flexWrap: 'wrap' }}>
              <Btn onClick={handleSubmit} loading={submitting} disabled={cartCount === 0} style={{ flex: '1 1 180px' }}>
                {isEdit ? t('common.save') : t('requests.saveDraft')}
              </Btn>
              <Btn variant="secondary" onClick={() => navigate(isEdit ? `/requests/${id}` : '/requests')}>
                {t('common.cancel')}
              </Btn>
            </div>
          </Panel>
        </aside>
      </div>
    </div>
  );
};

export default RequestCreatePage;
