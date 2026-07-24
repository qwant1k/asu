import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { LeftOutlined, PlusOutlined, SaveOutlined } from '@ant-design/icons';
import api from '../../api/axios';
import type { Asset, Counterparty, PaginatedResponse, User } from '../../shared/types';
import {
  Btn,
  C,
  EmptyState,
  PageHeader,
  Panel,
  Spinner,
  Surface,
  Td,
  Th,
} from '../../shared/ui/primitives';

interface InvoiceRow {
  asset: string;
  quantity: string;
  unit_price: string;
}

const baseAssetType = (value?: string) => (value === 'REPRESENTATIVE_TMZ' ? 'TMZ' : value || 'TMZ');

const IncomingInvoiceCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialAssetId = searchParams.get('asset') || '';
  const initialQuantity = searchParams.get('quantity') || '1';

  const [assets, setAssets] = useState<Asset[]>([]);
  const [counterparties, setCounterparties] = useState<Counterparty[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [assetType, setAssetType] = useState('TMZ');
  const [counterparty, setCounterparty] = useState('');
  const [molWarehouse, setMolWarehouse] = useState('');
  const [rows, setRows] = useState<InvoiceRow[]>([{ asset: initialAssetId, quantity: initialQuantity, unit_price: '0' }]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchDictionaries = useCallback(async () => {
    setLoading(true);
    try {
      const [assetsRes, counterpartiesRes, usersRes] = await Promise.allSettled([
        api.get<PaginatedResponse<Asset>>('/references/assets/', { params: { page_size: 1000, ordering: 'name' } }),
        api.get<PaginatedResponse<Counterparty>>('/references/counterparties/', { params: { page_size: 500, is_active: true, ordering: 'name' } }),
        api.get<PaginatedResponse<User>>('/users/', { params: { page_size: 500, ordering: 'last_name' } }),
      ]);
      const nextAssets = assetsRes.status === 'fulfilled' ? assetsRes.value.data.results || [] : [];
      setAssets(nextAssets);
      setCounterparties(counterpartiesRes.status === 'fulfilled' ? counterpartiesRes.value.data.results || [] : []);
      setUsers(usersRes.status === 'fulfilled' ? usersRes.value.data.results || [] : []);

      if (initialAssetId) {
        const selected = nextAssets.find((asset) => String(asset.id) === initialAssetId);
        if (selected) {
          setAssetType(baseAssetType(selected.asset_type));
          setRows([{ asset: initialAssetId, quantity: initialQuantity, unit_price: selected.unit_price || '0' }]);
        }
      }
    } catch {
      setAssets([]);
    } finally {
      setLoading(false);
    }
  }, [initialAssetId, initialQuantity]);

  useEffect(() => { fetchDictionaries(); }, [fetchDictionaries]);

  const filteredAssets = useMemo(() => (
    assets.filter((asset) => baseAssetType(asset.asset_type) === assetType)
  ), [assetType, assets]);

  const updateRow = (index: number, field: keyof InvoiceRow, value: string) => {
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

  const submit = async () => {
    if (!counterparty) {
      setErrorMsg('Выберите контрагента');
      return;
    }
    const items = rows
      .filter((row) => row.asset && Number(row.quantity) > 0)
      .map((row) => ({ asset: Number(row.asset), quantity: Number(row.quantity), unit_price: Number(row.unit_price || 0) }));
    if (!items.length) {
      setErrorMsg('Добавьте хотя бы одну позицию');
      return;
    }
    setSaving(true);
    setErrorMsg('');
    try {
      const res = await api.post('/documents/incoming-invoices/', {
        asset_type: assetType,
        counterparty: Number(counterparty),
        mol_warehouse: molWarehouse ? Number(molWarehouse) : null,
        items,
      });
      navigate(`/documents/incoming-invoices/${res.data.id}`);
    } catch (err: any) {
      setErrorMsg(err?.response?.data ? Object.values(err.response.data).flat().join('; ') : 'Не удалось создать приходную накладную');
    } finally {
      setSaving(false);
    }
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

  if (loading) return <Spinner />;

  return (
    <div>
      <PageHeader
        title="Новая приходная накладная"
        subtitle="Заполните поставщика и количество. Строка из складского аларма уже добавлена в документ."
        right={<Btn variant="secondary" onClick={() => navigate('/documents/incoming-invoices')}><LeftOutlined /> Назад</Btn>}
      />

      {errorMsg && (
        <div style={{ background: C.dangerBg, color: C.danger, padding: '10px 14px', borderRadius: C.radiusSm, marginBottom: 14 }}>
          {errorMsg}
        </div>
      )}

      <Panel title="Реквизиты" style={{ marginBottom: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
          <div style={{ display: 'grid', gap: 6 }}>
            <label style={{ fontSize: 12, fontWeight: 650, color: C.heading }}>Тип актива</label>
            <select value={assetType} onChange={(e) => setAssetType(e.target.value)} style={fieldStyle}>
              <option value="TMZ">ТМЗ</option>
              <option value="OS">ОС</option>
              <option value="NMA">НМА</option>
            </select>
          </div>
          <div style={{ display: 'grid', gap: 6 }}>
            <label style={{ fontSize: 12, fontWeight: 650, color: C.heading }}>Контрагент</label>
            <select value={counterparty} onChange={(e) => setCounterparty(e.target.value)} style={fieldStyle}>
              <option value="">Выберите контрагента</option>
              {counterparties.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
          </div>
          <div style={{ display: 'grid', gap: 6 }}>
            <label style={{ fontSize: 12, fontWeight: 650, color: C.heading }}>МОЛ склада</label>
            <select value={molWarehouse} onChange={(e) => setMolWarehouse(e.target.value)} style={fieldStyle}>
              <option value="">Не выбран</option>
              {users.map((item) => <option key={item.id} value={item.id}>{item.full_name || item.username}</option>)}
            </select>
          </div>
        </div>
      </Panel>

      <Surface>
        <div style={{ padding: '14px 16px', borderBottom: `1px solid ${C.rowBorder}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
          <div style={{ fontWeight: 800, color: C.heading }}>Позиции накладной</div>
          <Btn variant="secondary" onClick={addRow}><PlusOutlined /> Добавить строку</Btn>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 820 }}>
            <thead>
              <tr>
                <Th>Товар</Th>
                <Th right>Количество</Th>
                <Th right>Цена</Th>
                <Th right>Сумма</Th>
                <Th></Th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? <tr><td colSpan={5}><EmptyState text="Добавьте позицию" /></td></tr> : rows.map((row, index) => {
                const total = Number(row.quantity || 0) * Number(row.unit_price || 0);
                return (
                  <tr key={index}>
                    <Td>
                      <select value={row.asset} onChange={(e) => updateRow(index, 'asset', e.target.value)} style={fieldStyle}>
                        <option value="">Выберите товар</option>
                        {filteredAssets.map((asset) => <option key={asset.id} value={asset.id}>{asset.name} · {asset.code}</option>)}
                      </select>
                    </Td>
                    <Td right><input type="number" min={0} step="0.01" value={row.quantity} onChange={(e) => updateRow(index, 'quantity', e.target.value)} style={{ ...fieldStyle, width: 120 }} /></Td>
                    <Td right><input type="number" min={0} step="0.01" value={row.unit_price} onChange={(e) => updateRow(index, 'unit_price', e.target.value)} style={{ ...fieldStyle, width: 130 }} /></Td>
                    <Td right>{total.toLocaleString('ru-RU')}</Td>
                    <Td right><button onClick={() => removeRow(index)} style={{ border: 'none', background: 'transparent', color: C.danger, cursor: 'pointer' }}>Удалить</button></Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div style={{ padding: 16, display: 'flex', justifyContent: 'flex-end' }}>
          <Btn onClick={submit} loading={saving}><SaveOutlined /> Создать накладную</Btn>
        </div>
      </Surface>
    </div>
  );
};

export default IncomingInvoiceCreatePage;
