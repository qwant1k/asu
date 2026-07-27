import React, { useCallback, useEffect, useState } from 'react';
import { DeleteOutlined, ReloadOutlined, UndoOutlined } from '@ant-design/icons';

import api from '../../api/axios';
import type { PaginatedResponse } from '../../shared/types';
import { Btn, C, EmptyState, FilterBar, InputField, PageHeader, Spinner, Surface, Td, Th, hoverRow } from '../../shared/ui/primitives';
import { formatApiDateTime } from '../../shared/utils/date';

interface TrashItem {
  id: number;
  status: 'DELETED';
  app_label: string;
  model: string;
  model_label: string;
  object_id: string;
  object_repr: string;
  deleted_by_name: string;
  deleted_at: string;
  reason: string;
  recoverable: boolean;
}

const TrashPage: React.FC = () => {
  const [items, setItems] = useState<TrashItem[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<number | null>(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get<PaginatedResponse<TrashItem>>('/trash/', {
        params: { page_size: 200, search, ordering: '-deleted_at' },
      });
      setItems(response.data.results || []);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Не удалось загрузить корзину.');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const timer = window.setTimeout(load, 250);
    return () => window.clearTimeout(timer);
  }, [load]);

  const restore = async (item: TrashItem) => {
    setActingId(item.id);
    setError('');
    try {
      await api.post(`/trash/${item.id}/restore/`);
      await load();
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Не удалось восстановить объект.');
    } finally {
      setActingId(null);
    }
  };

  const purge = async (item: TrashItem) => {
    const confirmed = window.confirm(
      `Удалить «${item.object_repr}» из базы навсегда? Это действие нельзя отменить.`,
    );
    if (!confirmed) return;
    setActingId(item.id);
    setError('');
    try {
      await api.delete(`/trash/${item.id}/purge/`);
      await load();
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Окончательное удаление невозможно.');
    } finally {
      setActingId(null);
    }
  };

  return (
    <div>
      <PageHeader
        title="Удалённые объекты"
        subtitle="Объекты скрыты из рабочих разделов. Их можно восстановить или удалить из базы окончательно."
        right={<Btn variant="secondary" onClick={load}><ReloadOutlined /> Обновить</Btn>}
      />

      <FilterBar style={{ marginBottom: 16 }}>
        <InputField
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Поиск по названию, типу или идентификатору"
          style={{ minWidth: 320 }}
        />
      </FilterBar>

      {error && (
        <div style={{ padding: '11px 14px', marginBottom: 14, borderRadius: C.radiusSm, background: C.dangerBg, color: C.danger }}>
          {error}
        </div>
      )}

      {loading ? <Spinner /> : (
        <Surface>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 960 }}>
              <thead>
                <tr>
                  <Th>Тип</Th>
                  <Th>Статус</Th>
                  <Th>Объект</Th>
                  <Th>ID</Th>
                  <Th>Удалил</Th>
                  <Th>Дата удаления</Th>
                  <Th>Причина</Th>
                  <Th>Действия</Th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr><td colSpan={8}><EmptyState text="Корзина пуста" /></td></tr>
                ) : items.map((item) => (
                  <tr key={item.id} onMouseEnter={(e) => hoverRow(e, true)} onMouseLeave={(e) => hoverRow(e, false)}>
                    <Td><strong>{item.model_label}</strong><div style={{ fontSize: 11, color: C.muted }}>{item.app_label}.{item.model}</div></Td>
                    <Td><span className="trash-status-badge">Удалён</span></Td>
                    <Td>{item.object_repr}</Td>
                    <Td muted>{item.object_id}</Td>
                    <Td>{item.deleted_by_name || '—'}</Td>
                    <Td muted>{formatApiDateTime(item.deleted_at)}</Td>
                    <Td muted>{item.reason || '—'}</Td>
                    <Td>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <Btn
                          variant="secondary"
                          disabled={!item.recoverable || actingId === item.id}
                          loading={actingId === item.id}
                          onClick={() => restore(item)}
                        >
                          <UndoOutlined /> Восстановить
                        </Btn>
                        <Btn
                          variant="danger"
                          disabled={actingId === item.id}
                          onClick={() => purge(item)}
                        >
                          <DeleteOutlined /> Навсегда
                        </Btn>
                      </div>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Surface>
      )}
    </div>
  );
};

export default TrashPage;
