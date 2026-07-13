import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  AppstoreOutlined,
  BellOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  DatabaseOutlined,
  FormOutlined,
  InboxOutlined,
  RiseOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { PageHeader } from '../../shared/ui/primitives';
import './DesignPreviewPage.css';

type VariantId = 'soft-glass' | 'liquid-glass' | 'graphite-pro' | 'compact-native';

interface Variant {
  id: VariantId;
  title: string;
  subtitle: string;
  badge: string;
  accent: string;
}

const variants: Variant[] = [
  {
    id: 'soft-glass',
    title: 'macOS Soft Glass',
    subtitle: 'Светлый, аккуратный интерфейс для ежедневной работы с заявками и складом.',
    badge: 'Рекомендую',
    accent: '#2454D6',
  },
  {
    id: 'liquid-glass',
    title: 'Liquid Glass Premium',
    subtitle: 'Более выразительные стеклянные панели, световые кромки и плавная физика.',
    badge: 'Эффектно',
    accent: '#0E7490',
  },
  {
    id: 'graphite-pro',
    title: 'Graphite macOS Pro',
    subtitle: 'Темная навигация, светлый контент и строгий executive control center.',
    badge: 'Солидно',
    accent: '#38BDF8',
  },
  {
    id: 'compact-native',
    title: 'Compact Native',
    subtitle: 'Плотный деловой вариант для сотрудников, которые работают в журналах весь день.',
    badge: 'Практично',
    accent: '#2563EB',
  },
];

const navItems = [
  { icon: <AppstoreOutlined />, label: 'Главная' },
  { icon: <FormOutlined />, label: 'Заявки' },
  { icon: <InboxOutlined />, label: 'Склад' },
  { icon: <DatabaseOutlined />, label: 'Справочники' },
];

const requests = [
  { number: '024/2026', type: 'ТМЗ', owner: 'Айдана Сейтова', status: 'На согласовании', tone: 'info' },
  { number: '023/2026', type: 'ОС', owner: 'Ерлан Ким', status: 'На выдаче', tone: 'success' },
  { number: '022/2026', type: 'ТМЗ', owner: 'Мария Ли', status: 'Корректировка', tone: 'warning' },
];

const workflow = [
  { label: 'Создана', done: true },
  { label: 'Руководитель', done: true },
  { label: 'АХС', done: true },
  { label: 'Выдача', done: false },
];

const metrics = [
  { label: 'Ожидают согласования', value: '7', sub: '2 срочные заявки', icon: <ClockCircleOutlined /> },
  { label: 'Переданы на выдачу', value: '3', sub: 'назначены ответственные', icon: <CheckCircleOutlined /> },
  { label: 'Остатки склада', value: '18.4M', sub: 'ТМЗ + ОС, ₸', icon: <RiseOutlined /> },
];

const getVariant = (variantId?: string): Variant => (
  variants.find((variant) => variant.id === variantId) || variants[0]
);

const DesignPreviewPage: React.FC = () => {
  const navigate = useNavigate();
  const { variantId } = useParams<{ variantId?: string }>();
  const activeVariant = getVariant(variantId);

  return (
    <div className="design-preview-page">
      <PageHeader
        title="Дизайн-превью"
        subtitle="Наглядные варианты оформления АСУ: навигация, заявки, workflow, таблицы и уведомления."
      />

      <div className="design-preview-tabs">
        {variants.map((variant) => (
          <button
            key={variant.id}
            className={`design-preview-tab ${variant.id === activeVariant.id ? 'is-active' : ''}`}
            onClick={() => navigate(`/admin/design-preview/${variant.id}`)}
          >
            <span>{variant.title}</span>
            <small>{variant.badge}</small>
          </button>
        ))}
      </div>

      <DesignStage variant={activeVariant} />
    </div>
  );
};

const DesignStage: React.FC<{ variant: Variant }> = ({ variant }) => (
  <section className={`design-stage design-${variant.id}`}>
    <div className="design-stage__intro">
      <div>
        <div className="design-stage__badge">{variant.badge}</div>
        <h2>{variant.title}</h2>
        <p>{variant.subtitle}</p>
      </div>
      <div className="design-stage__tokens">
        <span>radius 18-28</span>
        <span>spring motion</span>
        <span>glass edge</span>
      </div>
    </div>

    <div className="design-shell">
      <aside className="design-shell__sidebar">
        <div className="design-logo">
          <DatabaseOutlined />
          <div>
            <strong>АСУ</strong>
            <span>Учет активов</span>
          </div>
        </div>

        <nav className="design-nav">
          {navItems.map((item, index) => (
            <button key={item.label} className={index === 1 ? 'is-active' : ''}>
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="design-user">
          <span className="design-avatar"><UserOutlined /></span>
          <div>
            <strong>Ю. Чипликов</strong>
            <span>Руководитель АХС</span>
          </div>
        </div>
      </aside>

      <main className="design-shell__main">
        <header className="design-toolbar">
          <div>
            <span>Журнал заявок</span>
            <strong>Контроль согласования и выдачи</strong>
          </div>
          <div className="design-toolbar__actions">
            <button className="design-search">Поиск по номеру или сотруднику</button>
            <button className="design-bell">
              <BellOutlined />
              <span>4</span>
            </button>
          </div>
        </header>

        <div className="design-metrics">
          {metrics.map((metric) => (
            <article key={metric.label} className="design-metric">
              <span style={{ color: variant.accent }}>{metric.icon}</span>
              <div>
                <small>{metric.label}</small>
                <strong>{metric.value}</strong>
                <em>{metric.sub}</em>
              </div>
            </article>
          ))}
        </div>

        <div className="design-content">
          <article className="design-panel design-panel--workflow">
            <div className="design-panel__head">
              <div>
                <span>Заявка 023/2026</span>
                <strong>Передача ноутбука сотруднику</strong>
              </div>
              <button>Отправить на выдачу</button>
            </div>

            <div className="design-workflow">
              {workflow.map((step, index) => (
                <div key={step.label} className={step.done ? 'is-done' : 'is-current'}>
                  <span>{index + 1}</span>
                  <strong>{step.label}</strong>
                </div>
              ))}
            </div>

            <div className="design-assignee">
              <span className="design-avatar">АС</span>
              <div>
                <strong>Ответственный за выдачу</strong>
                <p>Александр Смирнов, сотрудник АХС</p>
              </div>
            </div>
          </article>

          <article className="design-panel design-panel--table">
            <div className="design-panel__head">
              <div>
                <span>Последние заявки</span>
                <strong>Очередь действий</strong>
              </div>
              <button>Все заявки</button>
            </div>

            <div className="design-table">
              {requests.map((request) => (
                <div key={request.number} className="design-table__row">
                  <strong>{request.number}</strong>
                  <span>{request.type}</span>
                  <span>{request.owner}</span>
                  <em className={`tone-${request.tone}`}>{request.status}</em>
                </div>
              ))}
            </div>
          </article>
        </div>
      </main>
    </div>
  </section>
);

export default DesignPreviewPage;
