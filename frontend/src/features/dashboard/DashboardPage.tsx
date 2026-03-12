import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '../../app/hooks';
import { C, StatCard, PageHeader, Btn, Panel, EmptyState } from '../../shared/ui/primitives';

const DashboardPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);

  return (
    <div>
      <PageHeader
        title={t('dashboard.welcome', { name: user?.first_name || user?.username })}
        subtitle={t('dashboard.subtitle') || 'Обзор ключевых показателей системы'}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <div style={{ cursor: 'pointer' }} onClick={() => navigate('/requests')}>
          <StatCard label={t('dashboard.myRequests')} value={0} sub="📋 Заявки" />
        </div>
        <div style={{ cursor: 'pointer' }} onClick={() => navigate('/requests')}>
          <StatCard label={t('dashboard.pendingApprovals')} value={0} sub="📄 На согласовании" />
        </div>
        <div style={{ cursor: 'pointer' }} onClick={() => navigate('/warehouse/stock')}>
          <StatCard label={t('dashboard.stockSummary')} value={0} sub="📦 Склад" />
        </div>
        <div style={{ cursor: 'pointer' }} onClick={() => navigate('/profile')}>
          <StatCard label={t('dashboard.recentNotifications')} value={0} sub="🔔 Уведомления" />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <Panel
          title={t('dashboard.myRequests')}
          titleRight={
            <Btn onClick={() => navigate('/requests/new')}>+ {t('requests.createNew')}</Btn>
          }
        >
          <EmptyState text={t('common.noData')} />
        </Panel>

        <Panel title={t('dashboard.recentNotifications')}>
          <EmptyState text={t('notifications.noNotifications')} />
        </Panel>
      </div>
    </div>
  );
};

export default DashboardPage;
