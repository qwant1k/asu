import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { DeleteOutlined, LeftOutlined, PlusOutlined } from '@ant-design/icons';
import api from '../../api/axios';
import type { Asset, AssetCategory, AssetRequest, PaginatedResponse, RequestTypeReference } from '../../shared/types';
import {
  C, PageHeader, Btn, Panel, SelectField, TextAreaField, Th, Td, Badge, hoverRow, Spinner,
} from '../../shared/ui/primitives';

interface GroupOption {
  value: number;
  label: string;
  code: string;
  assetCount: number;
  stockQty: number;
}

interface DraftRequestItem {
  key: number;
  groupId: number | null;
  assetId: number | null;
  quantity_requested: number;
  comment: string;
}

const RequestCreatePage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const [requestTypes, setRequestTypes] = useState<RequestTypeReference[]>([]);
  const [groupOptions, setGroupOptions] = useState<GroupOption[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [items, setItems] = useState<DraftRequestItem[]>([
    { key: Date.now(), groupId: null, assetId: null, quantity_requested: 1, comment: '' },
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [selectedTypeId, setSelectedTypeId] = useState('');
  const [reason, setReason] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loadingExisting, setLoadingExisting] = useState(false);

  const selectedRequestType = useMemo(
    () => requestTypes.find((i) => String(i.id) === selectedTypeId) || null,
    [requestTypes, selectedTypeId],
  );
  const isSingleUnit = selectedRequestType?.asset_type === 'OS' || selectedRequestType?.asset_type === 'NMA';
  const isTmz = selectedRequestType?.asset_type === 'TMZ' || selectedRequestType?.asset_type === 'REPRESENTATIVE_TMZ';
  const baseAssetType = selectedRequestType?.asset_type === 'REPRESENTATIVE_TMZ' ? 'TMZ' : selectedRequestType?.asset_type;

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get<PaginatedResponse<RequestTypeReference>>('/references/request-types/', {
          params: { page_size: 100, is_active: true },
        });
        setRequestTypes(res.data.results || []);
      } catch { /* */ }
    })();
  }, []);

  useEffect(() => {
    if (!selectedRequestType) { setGroupOptions([]); setAssets([]); return; }
    (async () => {
      try {
        const assetParams: Record<string, any> = { page_size: 1000, asset_type: baseAssetType, ordering: 'name' };
        if (baseAssetType === 'TMZ' && selectedRequestType.requires_long_term_use) assetParams.is_long_term_use = true;
        const [catRes, assetRes] = await Promise.all([
          api.get<PaginatedResponse<AssetCategory>>('/references/asset-categories/', {
            params: { page_size: 500, asset_type: baseAssetType, ordering: 'name' },
          }),
          api.get<PaginatedResponse<Asset>>('/references/assets/', { params: assetParams }),
        ]);
        const assetList = assetRes.data.results || [];
        setAssets(assetList);
        const aggByGroup = new Map<number, { count: number; stock: number }>();
        assetList.forEach((a) => {
          if (!a.group) return;
          const cur = aggByGroup.get(a.group) || { count: 0, stock: 0 };
          cur.count += 1;
          cur.stock += Number(a.stock_quantity || 0);
          aggByGroup.set(a.group, cur);
        });
        const opts: GroupOption[] = (catRes.data.results || []).map((cat) => {
          const agg = aggByGroup.get(cat.id);
          return {
            value: cat.id, label: cat.name, code: cat.code,
            assetCount: agg?.count ?? cat.asset_count ?? 0,
            stockQty: agg?.stock ?? Number(cat.group_total_quantity || 0),
          };
        });
        setGroupOptions(opts.sort((a, b) => a.label.localeCompare(b.label)));
        if (!isEdit) {
          setItems([{ key: Date.now(), groupId: null, assetId: null, quantity_requested: 1, comment: '' }]);
        }
      } catch { /* */ }
    })();
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
      } catch (err: any) {
        if (active) setErrorMsg(err?.response?.data?.detail || t('common.error'));
      } finally {
        if (active) setLoadingExisting(false);
      }
    })();
    return () => { active = false; };
  }, [id, isEdit, t]);

  const addItem = () => setItems((prev) => [...prev, { key: Date.now(), groupId: null, assetId: null, quantity_requested: 1, comment: '' }]);
  const removeItem = (key: number) => { if (items.length > 1) setItems(items.filter((i) => i.key !== key)); };
  const updateItem = (key: number, patch: Partial<DraftRequestItem>) => {
    setItems((prev) => prev.map((i) => (i.key === key ? { ...i, ...patch } : i)));
  };
  const assetsForGroup = (groupId: number | null) => (groupId ? assets.filter((a) => a.group === groupId) : []);

  const handleSubmit = async () => {
    if (!selectedTypeId) { setErrorMsg('Выберите вид заявки'); return; }
    const validItems = items.filter((i) => i.groupId || i.assetId);
    if (validItems.length === 0) { setErrorMsg('Добавьте хотя бы одну группу или позицию'); return; }
    setSubmitting(true); setErrorMsg('');
    try {
      const payload = {
        request_type: Number(selectedTypeId), reason,
        items: validItems.map((i) => ({
          requested_group: i.groupId || null,
          asset: i.assetId || null,
          quantity_requested: isSingleUnit ? 1 : i.quantity_requested,
          comment: i.comment || '',
        })),
      };
      const res = isEdit
        ? await api.put(`/requests/${id}/`, payload)
        : await api.post('/requests/', payload);
      navigate(isEdit ? `/requests/${res.data.id}` : '/requests');
    } catch (err: any) {
      const msg = err?.response?.data ? (typeof err.response.data === 'string' ? err.response.data : Object.values(err.response.data).flat()[0]) : t('common.error');
      setErrorMsg(String(msg));
    } finally { setSubmitting(false); }
  };

  const inputStyle: React.CSSProperties = {
    padding: '8px 12px',
    border: `1px solid ${C.inputBorder}`,
    borderRadius: C.radiusSm,
    fontSize: 13,
    width: '100%',
    outline: 'none',
    minHeight: 38,
    background: C.glassStrong,
  };

  if (loadingExisting) return <Spinner />;

  return (
    <div>
      <PageHeader
        title={isEdit ? 'Редактировать заявку' : t('requests.createNew')}
        right={<Btn variant="secondary" onClick={() => navigate(isEdit ? `/requests/${id}` : '/requests')}><LeftOutlined /> {t('common.back')}</Btn>}
      />

      {errorMsg && <div style={{ background: C.dangerBg, color: C.danger, padding: '10px 14px', borderRadius: C.radiusSm, fontSize: 13, marginBottom: 16 }}>{errorMsg}</div>}

      <Panel title={t('requests.requestType')}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 600 }}>
          <SelectField label={t('requests.requestType') + ' *'} value={selectedTypeId}
            onChange={(e) => setSelectedTypeId(e.target.value)}
            disabled={isEdit}
            options={[{ value: '', label: t('requests.selectRequestType') }, ...requestTypes.map((r) => ({ value: r.id, label: r.name }))]} />

          {selectedRequestType && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              <Badge status={selectedRequestType.asset_type_display} />
              {selectedRequestType.requires_long_term_use && <Badge status="Длительного пользования" />}
              {isSingleUnit && <Badge status="Поштучно" />}
              <span style={{ fontSize: 12, color: C.secondary }}>Группы выбираются ниже</span>
            </div>
          )}

          <TextAreaField label={t('requests.reason')} value={reason}
            onChange={(e) => setReason(e.target.value)} placeholder={t('requests.reasonPlaceholder')} />
        </div>
      </Panel>

      <Panel title={t('requests.items')} noPad titleRight={<Btn variant="secondary" onClick={addItem}><PlusOutlined /> {t('requests.addItem')}</Btn>}>
        {groupOptions.length === 0 && selectedRequestType && (
          <div style={{ background: C.warningBg, color: C.warning, padding: '10px 14px', borderRadius: C.radiusSm, fontSize: 13, margin: '14px 14px 0' }}>
            Для выбранного типа заявки нет групп в справочнике. Создайте группы в разделе «Справочники».
          </div>
        )}
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr><Th>Группа *</Th><Th>Конкретная позиция</Th><Th>{t('references.quantity')}</Th><Th>{t('common.comment')}</Th><Th></Th></tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const groupAssets = assetsForGroup(item.groupId);
              const groupOpt = groupOptions.find((g) => g.value === item.groupId) || null;
              return (
              <tr key={item.key} onMouseEnter={(e) => hoverRow(e, true)} onMouseLeave={(e) => hoverRow(e, false)}>
                <Td>
                  <select value={item.groupId || ''} onChange={(e) => updateItem(item.key, { groupId: e.target.value ? Number(e.target.value) : null, assetId: null })}
                    style={{ ...inputStyle, minWidth: 200 }}>
                    <option value="">Выберите группу</option>
                    {groupOptions.map((g) => (
                      <option key={g.value} value={g.value}>
                        {g.label} ({isSingleUnit ? `${g.assetCount} карт.` : `${g.stockQty} ед.`})
                      </option>
                    ))}
                  </select>
                  {groupOpt && groupOpt.assetCount === 0 && (
                    <div style={{ fontSize: 11, color: C.warning, marginTop: 4 }}>В группе нет позиций на складе</div>
                  )}
                </Td>
                <Td>
                  <select value={item.assetId || ''} disabled={!item.groupId}
                    onChange={(e) => updateItem(item.key, { assetId: e.target.value ? Number(e.target.value) : null })}
                    style={{ ...inputStyle, minWidth: 220 }}>
                    <option value="">— любая позиция группы —</option>
                    {groupAssets.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name} · {a.code}{a.inventory_number ? ` · ${a.inventory_number}` : ''}{isTmz ? ` (${a.stock_quantity} ${a.unit_of_measure})` : ''}
                      </option>
                    ))}
                  </select>
                </Td>
                <Td>
                  <input type="number" min={1} max={isSingleUnit ? 1 : undefined} disabled={isSingleUnit}
                    value={isSingleUnit ? 1 : item.quantity_requested}
                    onChange={(e) => updateItem(item.key, { quantity_requested: Number(e.target.value || 1) })}
                    style={{ ...inputStyle, width: 80 }} />
                </Td>
                <Td>
                  <input value={item.comment} onChange={(e) => updateItem(item.key, { comment: e.target.value })}
                    placeholder={t('common.comment')} style={{ ...inputStyle, width: 180 }} />
                </Td>
                <Td>
                  <button disabled={items.length <= 1} onClick={() => removeItem(item.key)}
                    style={{ background: 'none', border: 'none', cursor: items.length > 1 ? 'pointer' : 'default', color: C.danger, fontSize: 14, opacity: items.length > 1 ? 1 : 0.3 }}>
                    <DeleteOutlined />
                  </button>
                </Td>
              </tr>
              );
            })}
          </tbody>
        </table>
      </Panel>

      <div style={{ display: 'flex', gap: 12, marginTop: 20, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
        <Btn onClick={handleSubmit} loading={submitting}>{isEdit ? t('common.save') : t('requests.saveDraft')}</Btn>
        <Btn variant="secondary" onClick={() => navigate(isEdit ? `/requests/${id}` : '/requests')}>{t('common.cancel')}</Btn>
      </div>
    </div>
  );
};

export default RequestCreatePage;
