import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { DisconnectOutlined, EditOutlined, UserAddOutlined } from '@ant-design/icons';
import api from '../../api/axios';
import { useAppSelector } from '../../app/hooks';
import type { AssetCard, AssetCategory, PaginatedResponse, UnitOfMeasure, User, Warehouse } from '../../shared/types';
import {
  C, PageHeader, Btn, Panel, Badge, Th, Td, Spinner, EmptyState, Modal,
  Drawer, InputField, SelectField, hoverRow,
} from '../../shared/ui/primitives';
import { formatApiDate, formatApiDateTime } from '../../shared/utils/date';
import { usePageBreadcrumbs } from '../../shared/navigation/breadcrumbs';

const Row = ({ label, children }: { label: string; children?: React.ReactNode }) => (
  <div className="asset-detail-row" style={{ display: 'flex', gap: 12, padding: '10px 12px' }}>
    <div className="asset-detail-label" style={{ width: 210, fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{label}</div>
    <div className="asset-detail-value" style={{ minWidth: 0, fontSize: 13, fontWeight: 550 }}>{children || '—'}</div>
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

const baseAssetType = (assetType: string) => (assetType === 'REPRESENTATIVE_TMZ' ? 'TMZ' : assetType);

const AssetCardPage: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const [card, setCard] = useState<AssetCard | null>(null);
  const [categories, setCategories] = useState<AssetCategory[]>([]);
  const [units, setUnits] = useState<UnitOfMeasure[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignSaving, setAssignSaving] = useState(false);
  const [assignError, setAssignError] = useState('');

  const assetBreadcrumbs = useMemo(() => {
    if (!card) return null;
    const routeType = card.asset_type === 'REPRESENTATIVE_TMZ'
      ? 'tmz'
      : card.asset_type.toLowerCase();
    const typeLabel = routeType === 'tmz'
      ? 'ТМЗ'
      : routeType === 'os'
        ? 'Основные средства'
        : 'Нематериальные активы';
    return [
      { label: 'Справочники', path: '/references' },
      { label: typeLabel, path: `/references/assets/${routeType}` },
      { label: card.name, path: `/assets/${card.id}` },
    ];
  }, [card]);
  usePageBreadcrumbs(assetBreadcrumbs);
  const [assignUser, setAssignUser] = useState('');
  const [assignQuantity, setAssignQuantity] = useState('1');
  const [assignWarehouse, setAssignWarehouse] = useState('');
  const [assignLocation, setAssignLocation] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState('');
  const [releaseLoading, setReleaseLoading] = useState<number | null>(null);
  const [releaseError, setReleaseError] = useState('');

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
  const isAdmin = Boolean(
    user?.is_superuser
    || user?.role === 'ADMIN'
    || (user?.effective_permissions || []).includes('system.admin'),
  );

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

  const fetchUsers = useCallback(async () => {
    try {
      const res = await api.get<PaginatedResponse<User>>('/users/', {
        params: { page_size: 500, is_active: true, ordering: 'last_name' },
      });
      setUsers(res.data.results || []);
    } catch {
      setUsers([]);
    }
  }, []);

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

  const openAssign = () => {
    setAssignUser('');
    setAssignQuantity('1');
    setAssignWarehouse(card?.warehouse ? String(card.warehouse) : '');
    setAssignLocation(card?.stock_location || '');
    setAssignError('');
    fetchUsers();
    setAssignOpen(true);
  };

  const handleAssign = async () => {
    if (!card || !assignUser) {
      setAssignError('Выберите сотрудника');
      return;
    }
    setAssignSaving(true);
    setAssignError('');
    try {
      await api.post('/assets/assignments/', {
        asset: Number(id),
        user: Number(assignUser),
        quantity: Number(assignQuantity) || 1,
        warehouse: assignWarehouse ? Number(assignWarehouse) : null,
        location: assignLocation || '',
      });
      setAssignOpen(false);
      await fetchCard();
    } catch (err: any) {
      setAssignError(formatError(err));
    } finally {
      setAssignSaving(false);
    }
  };

  const handleRelease = async (assignmentId: number) => {
    const reason = window.prompt(
      'Укажите причину снятия закрепления. Оставьте поле пустым, если пояснение не требуется.',
      '',
    );
    if (reason === null) return;
    if (!window.confirm('Снять актив с сотрудника? История закрепления будет сохранена.')) return;
    setReleaseLoading(assignmentId);
    setReleaseError('');
    try {
      await api.post(`/assets/assignments/${assignmentId}/release/`, { reason });
      await fetchCard();
    } catch (err: any) {
      setReleaseError(formatError(err));
    } finally {
      setReleaseLoading(null);
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
        <Panel title="Реквизиты актива" subtitle="Основные сведения и классификация" className="asset-card-panel asset-card-panel--identity">
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

        <Panel title="Склад и учёт" subtitle="Остаток, стоимость и балансовые параметры" className="asset-card-panel asset-card-panel--accounting">
          <Row label="Склад">{card.warehouse_name || 'Не указан'}</Row>
          {card.stock_location && card.stock_location !== card.warehouse_name && (
            <Row label="Место хранения">{card.stock_location}</Row>
          )}
          <Row label="Текущий остаток">
            <strong>{formatQuantity(card.stock_quantity)} {card.unit_of_measure_ref_name || card.unit_of_measure}</strong>
          </Row>
          <Row label="Сумма остатка">{formatMoney(card.stock_total_amount)}</Row>
          <Row label="Дата остатка">{formatApiDate(card.stock_balance_date)}</Row>
          {card.balance_date && <Row label="Дата постановки на баланс">{formatApiDate(card.balance_date)}</Row>}
          {card.useful_life_months != null && <Row label="Срок полезн. использ.">{card.useful_life_months} мес.</Row>}
          {card.depreciation_rate != null && <Row label="Норма амортизации">{card.depreciation_rate}%</Row>}
          <Row label="Активных закреплений">{card.assignments.length}</Row>
          {card.source_1c_id && <Row label="ID в 1С">{card.source_1c_id}</Row>}
          {card.last_sync_at && <Row label="Последняя синхронизация">{formatApiDateTime(card.last_sync_at)}</Row>}
        </Panel>
      </div>

      <Panel title="Закрепления" subtitle="Действующие материально ответственные лица" className="asset-card-panel asset-card-panel--assignments" noPad style={{ marginBottom: 20 }}>
        {releaseError && (
          <div style={{ background: C.dangerBg, color: C.danger, padding: '10px 14px', fontSize: 12 }}>
            {releaseError}
          </div>
        )}
        {card.assignments.length === 0 ? <EmptyState text="Нет активных закреплений" /> : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 820 }}>
              <thead><tr>
                <Th>Сотрудник</Th><Th>Подразделение</Th><Th right>Кол-во</Th>
                <Th>Дата выдачи</Th><Th>Склад</Th><Th>{t('common.status')}</Th>
                {isAdmin && <Th>Действия</Th>}
              </tr></thead>
              <tbody>
                {card.assignments.map((assignment) => (
                  <tr key={assignment.id} onMouseEnter={(event) => hoverRow(event, true)} onMouseLeave={(event) => hoverRow(event, false)}>
                    <Td bold>{assignment.user_name}</Td>
                    <Td muted>{assignment.department_name || '—'}</Td>
                    <Td right>{formatQuantity(assignment.quantity)}</Td>
                    <Td muted>{formatApiDate(assignment.assigned_at)}</Td>
                    <Td muted>{assignment.warehouse_name || assignment.location || '—'}</Td>
                    <Td><Badge status={assignment.status_display} /></Td>
                    {isAdmin && (
                      <Td>
                        <Btn
                          variant="danger"
                          onClick={() => handleRelease(assignment.id)}
                          loading={releaseLoading === assignment.id}
                        >
                          <DisconnectOutlined /> Снять
                        </Btn>
                      </Td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      <div style={{ marginBottom: 20 }}>
        <Btn onClick={openAssign}><UserAddOutlined /> Закрепить за сотрудником</Btn>
      </div>

      <Panel title="История движений" subtitle="Полный хронологический журнал операций" className="asset-card-panel asset-card-panel--movements" noPad>
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
                    <Td muted>{formatApiDateTime(movement.performed_at)}</Td>
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

      <Modal
        open={assignOpen}
        onClose={() => setAssignOpen(false)}
        title="Закрепить за сотрудником"
        footer={(
          <>
            <Btn variant="secondary" onClick={() => setAssignOpen(false)}>{t('common.cancel')}</Btn>
            <Btn onClick={handleAssign} loading={assignSaving}>Закрепить</Btn>
          </>
        )}
      >
        {assignError && (
          <div style={{ background: C.dangerBg, color: C.danger, padding: '8px 12px', borderRadius: C.radiusSm, fontSize: 12, marginBottom: 14 }}>
            {assignError}
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: C.heading, display: 'block', marginBottom: 6 }}>Сотрудник *</label>
            <select
              value={assignUser}
              onChange={(e) => setAssignUser(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', border: `1px solid ${C.inputBorder}`, borderRadius: C.radiusSm, fontSize: 13, minHeight: 38, background: C.glassStrong, outline: 'none' }}
            >
              <option value="">Выберите сотрудника</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>{u.full_name || u.username}{u.department_name ? ` · ${u.department_name}` : ''}</option>
              ))}
            </select>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: C.heading, display: 'block', marginBottom: 6 }}>Количество</label>
              <input
                type="number"
                min="1"
                value={assignQuantity}
                onChange={(e) => setAssignQuantity(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', border: `1px solid ${C.inputBorder}`, borderRadius: C.radiusSm, fontSize: 13, minHeight: 38, background: C.glassStrong, outline: 'none' }}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: C.heading, display: 'block', marginBottom: 6 }}>Склад</label>
              <select
                value={assignWarehouse}
                onChange={(e) => setAssignWarehouse(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', border: `1px solid ${C.inputBorder}`, borderRadius: C.radiusSm, fontSize: 13, minHeight: 38, background: C.glassStrong, outline: 'none' }}
              >
                <option value="">Не указан</option>
                {warehouses.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: C.heading, display: 'block', marginBottom: 6 }}>Место хранения</label>
            <input
              type="text"
              value={assignLocation}
              onChange={(e) => setAssignLocation(e.target.value)}
              placeholder="Кабинет, полка и т.д."
              style={{ width: '100%', padding: '8px 12px', border: `1px solid ${C.inputBorder}`, borderRadius: C.radiusSm, fontSize: 13, minHeight: 38, background: C.glassStrong, outline: 'none' }}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AssetCardPage;
