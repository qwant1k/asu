import React, { createContext, useContext, useEffect } from 'react';

export interface AppBreadcrumbItem {
  label: string;
  path?: string;
}

export interface ResolvedBreadcrumbs {
  items: AppBreadcrumbItem[];
  usePageTitle?: boolean;
}

interface BreadcrumbContextValue {
  setPageTitle: React.Dispatch<React.SetStateAction<string>>;
  setCustomItems: React.Dispatch<React.SetStateAction<AppBreadcrumbItem[] | null>>;
}

export const BreadcrumbContext = createContext<BreadcrumbContextValue | null>(null);

export function useBreadcrumbPageTitle(title: string) {
  const context = useContext(BreadcrumbContext);
  useEffect(() => {
    if (!context) return undefined;
    context.setPageTitle(title);
    return () => context.setPageTitle('');
  }, [context, title]);
}

export function usePageBreadcrumbs(items: AppBreadcrumbItem[] | null) {
  const context = useContext(BreadcrumbContext);
  const signature = JSON.stringify(items);
  useEffect(() => {
    if (!context) return undefined;
    context.setCustomItems(items);
    return () => context.setCustomItems(null);
  }, [context, signature]);
}

const exactRoutes: Record<string, AppBreadcrumbItem[]> = {
  '/dashboard': [{ label: 'Главная', path: '/dashboard' }],
  '/profile': [{ label: 'Профиль', path: '/profile' }],
  '/references': [{ label: 'Справочники', path: '/references' }],
  '/references/counterparties': [
    { label: 'Справочники', path: '/references' },
    { label: 'Контрагенты', path: '/references/counterparties' },
  ],
  '/references/contracts': [
    { label: 'Справочники', path: '/references' },
    { label: 'Договоры', path: '/references/contracts' },
  ],
  '/references/limits': [
    { label: 'Справочники', path: '/references' },
    { label: 'Лимиты и нормативы', path: '/references/limits' },
  ],
  '/references/users': [
    { label: 'Справочники', path: '/references' },
    { label: 'Сотрудники', path: '/references/users' },
  ],
  '/references/departments': [
    { label: 'Справочники', path: '/references' },
    { label: 'Подразделения', path: '/references/departments' },
  ],
  '/references/request-types': [
    { label: 'Справочники', path: '/references' },
    { label: 'Виды заявок', path: '/references/request-types' },
  ],
  '/references/units-of-measure': [
    { label: 'Справочники', path: '/references' },
    { label: 'Единицы измерения', path: '/references/units-of-measure' },
  ],
  '/references/warehouses': [
    { label: 'Справочники', path: '/references' },
    { label: 'Склады', path: '/references/warehouses' },
  ],
  '/references/positions': [
    { label: 'Справочники', path: '/references' },
    { label: 'Должности', path: '/references/positions' },
  ],
  '/warehouse': [{ label: 'Склад', path: '/warehouse' }],
  '/warehouse/stock': [
    { label: 'Склад', path: '/warehouse' },
    { label: 'Остатки', path: '/warehouse/stock' },
  ],
  '/warehouse/stock/upload': [
    { label: 'Администрирование', path: '/admin' },
    { label: 'Загрузка остатков из Excel', path: '/admin/stock-upload' },
  ],
  '/warehouse/stock-alerts': [
    { label: 'Склад', path: '/warehouse' },
    { label: 'Алармы остатков', path: '/warehouse/stock-alerts' },
  ],
  '/warehouse/movements': [
    { label: 'Склад', path: '/warehouse' },
    { label: 'Движения', path: '/warehouse/movements' },
  ],
  '/warehouse/assignments': [
    { label: 'Склад', path: '/warehouse' },
    { label: 'Закрепления', path: '/warehouse/assignments' },
  ],
  '/requests': [{ label: 'Заявки', path: '/requests' }],
  '/requests/journal': [
    { label: 'Заявки', path: '/requests' },
    { label: 'Журнал заявок', path: '/requests/journal' },
  ],
  '/requests/new': [
    { label: 'Заявки', path: '/requests' },
    { label: 'Новая заявка', path: '/requests/new' },
  ],
  '/documents': [{ label: 'Документы', path: '/documents' }],
  '/inventory': [{ label: 'Инвентаризация', path: '/inventory' }],
  '/admin': [{ label: 'Администрирование', path: '/admin' }],
  '/admin/users': [
    { label: 'Администрирование', path: '/admin' },
    { label: 'Пользователи', path: '/admin/users' },
  ],
  '/admin/access': [
    { label: 'Администрирование', path: '/admin' },
    { label: 'Права доступа', path: '/admin/access' },
  ],
  '/admin/sync-1c': [
    { label: 'Администрирование', path: '/admin' },
    { label: 'Синхронизация с 1С', path: '/admin/sync-1c' },
  ],
  '/admin/stock-upload': [
    { label: 'Администрирование', path: '/admin' },
    { label: 'Загрузка остатков из Excel', path: '/admin/stock-upload' },
  ],
  '/admin/trash': [
    { label: 'Администрирование', path: '/admin' },
    { label: 'Удалённые объекты', path: '/admin/trash' },
  ],
};

const assetTypeLabels: Record<string, string> = {
  tmz: 'ТМЗ',
  os: 'Основные средства',
  nma: 'Нематериальные активы',
};

const reportLabels: Record<string, string> = {
  'tmz-stock': 'Остатки ТМЗ',
  'os-balance': 'Баланс ОС',
  'os-stock': 'Остатки ОС',
  'nma-balance': 'Баланс НМА',
  movement: 'Движение активов',
  'write-offs': 'Списания',
  'request-journal': 'Журнал заявок',
  'inventory-report': 'Инвентаризационный отчёт',
};

const documentLabels: Record<string, { list: string; item: string }> = {
  'incoming-invoices': { list: 'Приходные накладные', item: 'Приходная накладная' },
  'write-off-acts': { list: 'Акты на списание', item: 'Акт на списание' },
  petitions: { list: 'Ходатайства', item: 'Ходатайство' },
  protocols: { list: 'Протоколы комиссии', item: 'Протокол комиссии' },
  'internal-transfers': { list: 'Накладные перемещения', item: 'Накладная перемещения' },
};

export function resolveBreadcrumbs(pathname: string): ResolvedBreadcrumbs {
  const normalized = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
  if (exactRoutes[normalized]) return { items: exactRoutes[normalized] };

  let match = normalized.match(/^\/references\/assets\/(tmz|os|nma)$/i);
  if (match) {
    const type = match[1].toLowerCase();
    return {
      items: [
        { label: 'Справочники', path: '/references' },
        { label: assetTypeLabels[type], path: normalized },
      ],
    };
  }

  match = normalized.match(/^\/references\/counterparties\/(\d+)$/);
  if (match) {
    return {
      items: [
        { label: 'Справочники', path: '/references' },
        { label: 'Контрагенты', path: '/references/counterparties' },
        { label: `Контрагент #${match[1]}`, path: normalized },
      ],
      usePageTitle: true,
    };
  }

  match = normalized.match(/^\/assets\/(\d+)$/);
  if (match) {
    return {
      items: [
        { label: 'Справочники', path: '/references' },
        { label: 'Активы', path: '/references/assets/tmz' },
        { label: `Карточка актива #${match[1]}`, path: normalized },
      ],
      usePageTitle: true,
    };
  }

  match = normalized.match(/^\/profile\/(\d+)$/);
  if (match) {
    return {
      items: [
        { label: 'Сотрудники', path: '/admin/users' },
        { label: `Профиль сотрудника #${match[1]}`, path: normalized },
      ],
      usePageTitle: true,
    };
  }

  match = normalized.match(/^\/requests\/(\d+)\/edit$/);
  if (match) {
    return {
      items: [
        { label: 'Заявки', path: '/requests' },
        { label: `Заявка #${match[1]}`, path: `/requests/${match[1]}` },
        { label: 'Редактирование', path: normalized },
      ],
    };
  }

  match = normalized.match(/^\/requests\/(\d+)$/);
  if (match) {
    return {
      items: [
        { label: 'Заявки', path: '/requests' },
        { label: `Заявка #${match[1]}`, path: normalized },
      ],
      usePageTitle: true,
    };
  }

  match = normalized.match(/^\/documents\/([^/]+)(?:\/([^/]+))?$/);
  if (match && documentLabels[match[1]]) {
    const segment = match[1];
    const tail = match[2];
    const config = documentLabels[segment];
    const basePath = `/documents/${segment}`;
    const items: AppBreadcrumbItem[] = [
      { label: 'Документы', path: '/documents' },
      { label: config.list, path: basePath },
    ];
    if (tail === 'new') {
      items.push({ label: `Новый документ: ${config.item.toLowerCase()}`, path: normalized });
      return { items, usePageTitle: true };
    }
    if (tail) {
      items.push({ label: `${config.item} #${tail}`, path: normalized });
      return { items, usePageTitle: true };
    }
    return { items };
  }

  match = normalized.match(/^\/reports\/([^/]+)$/);
  if (match) {
    const report = reportLabels[match[1]] || match[1];
    return {
      items: [
        { label: 'Отчёты', path: '/reports/tmz-stock' },
        { label: report, path: normalized },
      ],
    };
  }

  return {
    items: [{ label: 'ИС «АСУ»', path: normalized || '/' }],
    usePageTitle: true,
  };
}
