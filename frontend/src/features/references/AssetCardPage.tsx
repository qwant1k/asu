/* Карточка позиции (ОС/НМА/ТМЗ): реквизиты, остаток, закрепления и история движений.
   Открывается по ссылке /assets/:id из заявок, документов, отчётов, склада. */

import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../../api/axios';
import type { AssetCard } from '../../shared/types';
import {
  C, PageHeader, Btn, Panel, Badge, Th, Td, Spinner, EmptyState, hoverRow,
} from '../../shared/ui/primitives';

const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div style={{ display: 'flex', gap: 12, padding: '8px 0', borderBottom: `1px solid ${C.rowBorder}` }}>
    <div style={{ width: 210, fontSize: 12, fontWeight: 500, color: C.secondary, flexShrink: 0 }}>{label}</div>
    <div style={{ fontSize: 13, color: C.heading }}>{children || '—'}</div>
  </div>
);

const AssetCardPage: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [card, setCard] = useState<AssetCard | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCard = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<AssetCard>(`/references/assets/${id}/card/`);
      setCard(res.data);
    } catch { setCard(null); } finally { setLoading(false); }
  }, [id]);

  useEffect(() => { fetchCard(); }, [fetchCard]);

  if (loading) return <Spinner />;
  if (!card) return <EmptyState text={t('common.notFound')} />;

  const isTmz = card.asset_type === 'TMZ' || card.asset_type === 'REPRESENTATIVE_TMZ';

  return (
    <div>
      <PageHeader
        title={card.name}
        subtitle={`${card.asset_type_display} · ${card.code}${card.inventory_number ? ` · Инв. ${card.inventory_number}` : ''}`}
        right={<Btn variant="secondary" onClick={() => navigate(-1)}>← {t('common.back')}</Btn>}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        <Panel title="Реквизиты">
          <Row label={t('common.name')}>{card.name}</Row>
          <Row label={t('common.code')}>{card.code}</Row>
          <Row label={t('common.type')}><Badge status={card.asset_type_display} /></Row>
          <Row label="Категория">{card.category_name}</Row>
          <Row label="Группа">{card.group_name || '—'}</Row>
          <Row label={t('references.unitOfMeasure')}>{card.unit_of_measure}</Row>
          <Row label={t('references.unitPrice')}>{card.unit_price}</Row>
          {card.inventory_number && <Row label="Инвентарный номер">{card.inventory_number}</Row>}
          {card.is_long_term_use && <Row label="ТМЗ длит. пользования"><Badge status="Да" /></Row>}
        </Panel>

        <Panel title="Учёт и склад">
          <Row label="Текущий остаток на складе">
            <strong>{card.stock_quantity} {card.unit_of_measure}</strong>
          </Row>
          {card.balance_date && <Row label="Дата постановки на баланс">{card.balance_date}</Row>}
          {card.useful_life_months != null && <Row label="Срок полезн. использ. (мес.)">{card.useful_life_months}</Row>}
          {card.depreciation_rate != null && <Row label="Норма амортизации">{card.depreciation_rate}</Row>}
          <Row label="Активных закреплений">{card.assignments.length}</Row>
          {card.source_1c_id && <Row label="ID в 1С">{card.source_1c_id}</Row>}
          {card.last_sync_at && <Row label="Последняя синхронизация">{new Date(card.last_sync_at).toLocaleString('ru-KZ')}</Row>}
        </Panel>
      </div>

      <Panel title="Закрепления" noPad style={{ marginBottom: 20 }}>
        {card.assignments.length === 0 ? <EmptyState text="Нет активных закреплений" /> : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr>
              <Th>Сотрудник</Th><Th>Подразделение</Th><Th right>Кол-во</Th>
              <Th>Дата выдачи</Th><Th>Местоположение</Th><Th>{t('common.status')}</Th>
            </tr></thead>
            <tbody>
              {card.assignments.map((a) => (
                <tr key={a.id} onMouseEnter={(e) => hoverRow(e, true)} onMouseLeave={(e) => hoverRow(e, false)}>
                  <Td bold>{a.user_name}</Td>
                  <Td muted>{a.department_name || '—'}</Td>
                  <Td right>{a.quantity}</Td>
                  <Td muted>{new Date(a.assigned_at).toLocaleDateString('ru-KZ')}</Td>
                  <Td muted>{a.location || '—'}</Td>
                  <Td><Badge status={a.status_display} /></Td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Panel>

      <Panel title="История движений" noPad>
        {card.movements.length === 0 ? <EmptyState text="Нет движений по позиции" /> : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 800 }}>
              <thead><tr>
                <Th>{t('common.date')}</Th><Th>Операция</Th><Th right>Кол-во</Th>
                <Th>От кого</Th><Th>Кому</Th><Th>Выполнил</Th><Th>{t('common.comment')}</Th>
              </tr></thead>
              <tbody>
                {card.movements.map((m) => (
                  <tr key={m.id} onMouseEnter={(e) => hoverRow(e, true)} onMouseLeave={(e) => hoverRow(e, false)}>
                    <Td muted>{new Date(m.performed_at).toLocaleDateString('ru-KZ')}</Td>
                    <Td><Badge status={m.movement_type_display} /></Td>
                    <Td right>{m.quantity}{isTmz ? ` ${card.unit_of_measure}` : ''}</Td>
                    <Td muted>{m.from_user_name || '—'}</Td>
                    <Td muted>{m.to_user_name || '—'}</Td>
                    <Td muted>{m.performed_by_name || '—'}</Td>
                    <Td muted>{m.comment || '—'}</Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
};

export default AssetCardPage;
