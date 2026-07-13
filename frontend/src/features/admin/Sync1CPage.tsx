import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../api/axios';
import { C, PageHeader, Panel, Btn, Badge, Spinner } from '../../shared/ui/primitives';

const DescRow = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div style={{ display: 'flex', gap: 12, padding: '8px 0', borderBottom: `1px solid ${C.rowBorder}` }}>
    <div style={{ width: 220, fontSize: 12, fontWeight: 500, color: C.secondary, flexShrink: 0 }}>{label}</div>
    <div style={{ fontSize: 13, color: C.heading }}>{children}</div>
  </div>
);

const Sync1CPage: React.FC = () => {
  const { t } = useTranslation();
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const fetchStatus = async () => {
    setLoading(true);
    try { const res = await api.get('/integrations/one-c/sync-status/'); setStatus(res.data.last_sync); } catch { setStatus(null); } finally { setLoading(false); }
  };

  const triggerSync = async () => {
    setSyncing(true);
    try { await api.post('/integrations/one-c/sync/'); setTimeout(fetchStatus, 3000); } catch { /* */ } finally { setSyncing(false); }
  };

  useEffect(() => { fetchStatus(); }, []);

  return (
    <div>
      <PageHeader title={t('nav.sync1c')} />
      <Panel>
        <Btn onClick={triggerSync} loading={syncing} style={{ marginBottom: 20 }}>🔄 {t('admin.triggerSync')}</Btn>

        {loading ? <Spinner /> : status ? (
          <div>
            <DescRow label={t('admin.lastSyncStatus')}>
              <Badge status={
                status.status === 'SUCCESS' ? `✅ ${t('admin.syncSuccess')}` :
                status.status === 'FAILED' ? `❌ ${t('admin.syncFailed')}` :
                `🔄 ${t('admin.syncInProgress')}`
              } />
            </DescRow>
            <DescRow label={t('admin.syncStartedAt')}>{status.started_at ? new Date(status.started_at).toLocaleString('ru-KZ') : '—'}</DescRow>
            <DescRow label={t('admin.syncFinishedAt')}>{status.finished_at ? new Date(status.finished_at).toLocaleString('ru-KZ') : '—'}</DescRow>
            <DescRow label={t('admin.syncRecordsProcessed')}>{Number(status.created_count || 0) + Number(status.updated_count || 0)}</DescRow>
            {status.error_message && (
              <DescRow label={t('admin.syncError')}>
                <span style={{ color: C.danger }}>{status.error_message}</span>
              </DescRow>
            )}
          </div>
        ) : (
          <div style={{ fontSize: 13, color: C.muted }}>{t('admin.noSyncHistory')}</div>
        )}
      </Panel>
    </div>
  );
};

export default Sync1CPage;
