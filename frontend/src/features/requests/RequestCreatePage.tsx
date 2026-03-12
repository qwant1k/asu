import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../../api/axios';
import type { Asset, AssetType, PaginatedResponse, RequestTypeReference } from '../../shared/types';
import {
  C, PageHeader, Btn, Panel, SelectField, TextAreaField, Th, Td, Badge, hoverRow,
} from '../../shared/ui/primitives';

interface GroupOption {
  value: number;
  label: string;
  assetType: AssetType;
  measureValue: number;
  measureLabel: string;
}

interface DraftRequestItem {
  key: number;
  groupId: number | null;
  quantity_requested: number;
  comment: string;
}

const RequestCreatePage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [requestTypes, setRequestTypes] = useState<RequestTypeReference[]>([]);
  const [groupOptions, setGroupOptions] = useState<GroupOption[]>([]);
  const [items, setItems] = useState<DraftRequestItem[]>([
    { key: Date.now(), groupId: null, quantity_requested: 1, comment: '' },
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [selectedTypeId, setSelectedTypeId] = useState('');
  const [reason, setReason] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const selectedRequestType = useMemo(
    () => requestTypes.find((i) => String(i.id) === selectedTypeId) || null,
    [requestTypes, selectedTypeId],
  );
  const isSingleUnit = selectedRequestType?.asset_type === 'OS' || selectedRequestType?.asset_type === 'NMA';

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
    if (!selectedRequestType) { setGroupOptions([]); return; }
    (async () => {
      try {
        const params: Record<string, any> = { page_size: 500, asset_type: selectedRequestType.asset_type, grouped: true };
        if (selectedRequestType.asset_type === 'TMZ' && selectedRequestType.requires_long_term_use) params.is_long_term_use = true;
        const res = await api.get<PaginatedResponse<Asset>>('/references/assets/', { params });
        const grouped = new Map<number, GroupOption>();
        (res.data.results || []).forEach((asset) => {
          if (!asset.group) return;
          if (!grouped.has(asset.group)) {
            grouped.set(asset.group, {
              value: asset.group, label: asset.group_name || asset.category_name,
              assetType: asset.asset_type, measureValue: 0,
              measureLabel: asset.asset_type === 'TMZ' ? 'остаток' : 'карточек',
            });
          }
          const cur = grouped.get(asset.group)!;
          cur.measureValue += asset.asset_type === 'TMZ' ? Number(asset.stock_quantity || 0) : 1;
        });
        setGroupOptions(Array.from(grouped.values()).sort((a, b) => a.label.localeCompare(b.label)));
        setItems([{ key: Date.now(), groupId: null, quantity_requested: 1, comment: '' }]);
      } catch { /* */ }
    })();
  }, [selectedRequestType]);

  const addItem = () => setItems([...items, { key: Date.now(), groupId: null, quantity_requested: 1, comment: '' }]);
  const removeItem = (key: number) => { if (items.length > 1) setItems(items.filter((i) => i.key !== key)); };
  const updateItem = (key: number, field: keyof DraftRequestItem, value: number | string | null) => {
    setItems(items.map((i) => {
      if (i.key !== key) return i;
      if (field === 'groupId') return { ...i, groupId: value as number | null, quantity_requested: isSingleUnit ? 1 : i.quantity_requested };
      return { ...i, [field]: value };
    }));
  };

  const handleSubmit = async () => {
    if (!selectedTypeId) { setErrorMsg('Выберите вид заявки'); return; }
    const validItems = items.filter((i) => i.groupId);
    if (validItems.length === 0) { setErrorMsg('Добавьте хотя бы одну группу'); return; }
    setSubmitting(true); setErrorMsg('');
    try {
      const payload = {
        request_type: Number(selectedTypeId), reason,
        items: validItems.map((i) => ({ requested_group: i.groupId, quantity_requested: isSingleUnit ? 1 : i.quantity_requested, comment: i.comment || '' })),
      };
      const res = await api.post('/requests/', payload);
      navigate(`/requests/${res.data.id}`);
    } catch (err: any) {
      const msg = err?.response?.data ? (typeof err.response.data === 'string' ? err.response.data : Object.values(err.response.data).flat()[0]) : t('common.error');
      setErrorMsg(String(msg));
    } finally { setSubmitting(false); }
  };

  const inputStyle: React.CSSProperties = { padding: '7px 12px', border: `1px solid ${C.inputBorder}`, borderRadius: 6, fontSize: 13, width: '100%', outline: 'none' };

  return (
    <div>
      <PageHeader
        title={t('requests.createNew')}
        right={<Btn variant="secondary" onClick={() => navigate('/requests')}>← {t('common.back')}</Btn>}
      />

      {errorMsg && <div style={{ background: C.dangerBg, color: C.danger, padding: '10px 14px', borderRadius: 6, fontSize: 13, marginBottom: 16 }}>{errorMsg}</div>}

      <Panel title={t('requests.requestType')}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 600 }}>
          <SelectField label={t('requests.requestType') + ' *'} value={selectedTypeId}
            onChange={(e) => setSelectedTypeId(e.target.value)}
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

      <Panel title={t('requests.items')} noPad titleRight={<Btn variant="secondary" onClick={addItem}>+ {t('requests.addItem')}</Btn>}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr><Th>Группа</Th><Th>Тип</Th><Th>{t('references.quantity')}</Th><Th>{t('common.comment')}</Th><Th></Th></tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.key} onMouseEnter={(e) => hoverRow(e, true)} onMouseLeave={(e) => hoverRow(e, false)}>
                <Td>
                  <select value={item.groupId || ''} onChange={(e) => updateItem(item.key, 'groupId', e.target.value ? Number(e.target.value) : null)}
                    style={{ ...inputStyle }}>
                    <option value="">Выберите группу</option>
                    {groupOptions.map((g) => <option key={g.value} value={g.value}>{g.label} ({g.measureValue} {g.measureLabel})</option>)}
                  </select>
                </Td>
                <Td><Badge status={selectedRequestType?.asset_type_display || '—'} /></Td>
                <Td>
                  <input type="number" min={1} max={isSingleUnit ? 1 : undefined} disabled={isSingleUnit}
                    value={isSingleUnit ? 1 : item.quantity_requested}
                    onChange={(e) => updateItem(item.key, 'quantity_requested', Number(e.target.value || 1))}
                    style={{ ...inputStyle, width: 80 }} />
                </Td>
                <Td>
                  <input value={item.comment} onChange={(e) => updateItem(item.key, 'comment', e.target.value)}
                    placeholder={t('common.comment')} style={{ ...inputStyle, width: 180 }} />
                </Td>
                <Td>
                  <button disabled={items.length <= 1} onClick={() => removeItem(item.key)}
                    style={{ background: 'none', border: 'none', cursor: items.length > 1 ? 'pointer' : 'default', color: C.danger, fontSize: 14, opacity: items.length > 1 ? 1 : 0.3 }}>
                    🗑️
                  </button>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>

      <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
        <Btn onClick={handleSubmit} loading={submitting}>{t('requests.saveDraft')}</Btn>
        <Btn variant="secondary" onClick={() => navigate('/requests')}>{t('common.cancel')}</Btn>
      </div>
    </div>
  );
};

export default RequestCreatePage;
