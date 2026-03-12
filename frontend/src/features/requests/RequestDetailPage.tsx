import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '../../app/hooks';
import api from '../../api/axios';
import OTPSignModal from '../../shared/components/OTPSignModal';
import type { Asset, AssetRequest, AssetRequestItem, PaginatedResponse, UserRole } from '../../shared/types';
import {
  C, PageHeader, Btn, Panel, Badge, Th, Td, Spinner, EmptyState, hoverRow,
} from '../../shared/ui/primitives';

interface IssueDraftRow { id: number; issued_asset: number | null; quantity_issued: number; }
const ISSUE_ROLES: UserRole[] = ['ADMIN', 'AHS_WORKER', 'AHS_HEAD', 'MOL_WAREHOUSE', 'MOL_NMA'];

const DescRow = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div style={{ display: 'flex', gap: 12, padding: '8px 0', borderBottom: `1px solid ${C.rowBorder}` }}>
    <div style={{ width: 200, fontSize: 12, fontWeight: 500, color: C.secondary, flexShrink: 0 }}>{label}</div>
    <div style={{ fontSize: 13, color: C.heading }}>{children}</div>
  </div>
);

const RequestDetailPage: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);

  const [request, setRequest] = useState<AssetRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [otpAction, setOtpAction] = useState<'approve' | 'reject'>('approve');
  const [actionLoading, setActionLoading] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [groupedAssets, setGroupedAssets] = useState<Asset[]>([]);
  const [issueRows, setIssueRows] = useState<Record<number, IssueDraftRow>>({});

  const canIssue = !!user?.role && ISSUE_ROLES.includes(user.role) && request?.status === 'APPROVED';

  const fetchRequest = useCallback(async () => {
    try {
      const res = await api.get<AssetRequest>(`/requests/${id}/`);
      setRequest(res.data);
      const nextRows: Record<number, IssueDraftRow> = {};
      (res.data.items || []).forEach((item) => {
        nextRows[item.id] = { id: item.id, issued_asset: item.issued_asset, quantity_issued: Number(item.quantity_issued || item.quantity_requested || 1) };
      });
      setIssueRows(nextRows);
    } catch { /* */ } finally { setLoading(false); }
  }, [id]);

  const fetchGroupedAssets = useCallback(async () => {
    try { const res = await api.get<PaginatedResponse<Asset>>('/references/assets/', { params: { page_size: 1000, grouped: true } }); setGroupedAssets(res.data.results || []); } catch { setGroupedAssets([]); }
  }, []);

  useEffect(() => { fetchRequest(); }, [fetchRequest]);
  useEffect(() => { if (request?.status === 'APPROVED') fetchGroupedAssets(); }, [fetchGroupedAssets, request?.status]);

  const groupedAssetsMap = useMemo(() => {
    const map: Record<number, Asset[]> = {};
    groupedAssets.forEach((a) => { if (!a.group || Number(a.stock_quantity || 0) <= 0) return; if (!map[a.group]) map[a.group] = []; map[a.group].push(a); });
    return map;
  }, [groupedAssets]);

  const handleSubmit = async () => {
    setActionLoading(true);
    try { await api.post(`/requests/${id}/submit/`); fetchRequest(); } catch { /* */ } finally { setActionLoading(false); }
  };

  const handleRequestOtp = async () => { setOtpError(null); await api.post(`/requests/${id}/generate-otp/`); };

  const handleSign = async (otpCode: string) => {
    setOtpError(null);
    try {
      await api.post(`/requests/${id}/${otpAction === 'approve' ? 'approve' : 'reject'}/`, { otp_code: otpCode });
      setOtpModalOpen(false); fetchRequest();
    } catch (err: any) { setOtpError(err?.response?.data?.detail || t('common.error')); }
  };

  const handleIssueRowChange = (itemId: number, field: keyof IssueDraftRow, value: number | null) => {
    setIssueRows((prev) => ({ ...prev, [itemId]: { ...prev[itemId], [field]: value } }));
  };

  const handleIssueItems = async () => {
    if (!request) return;
    setActionLoading(true);
    try {
      await api.post(`/requests/${id}/issue-items/`, {
        items: request.items.map((item) => ({ id: item.id, issued_asset: issueRows[item.id]?.issued_asset, quantity_issued: issueRows[item.id]?.quantity_issued })),
      });
      fetchRequest();
    } catch { /* */ } finally { setActionLoading(false); }
  };

  if (loading) return <Spinner />;
  if (!request) return <EmptyState text={t('common.notFound')} />;

  const isInitiator = user?.id === request.initiator;
  const isDraft = request.status === 'DRAFT';
  const canSubmit = isInitiator && isDraft;
  const canApprove = ['PENDING_SUPERVISOR', 'APPROVED_SUPERVISOR', 'APPROVED_MOL'].includes(request.status);

  const inputStyle: React.CSSProperties = { padding: '7px 12px', border: `1px solid ${C.inputBorder}`, borderRadius: 6, fontSize: 13, width: '100%', outline: 'none' };

  return (
    <div>
      <PageHeader
        title={t('requests.requestNumber', { number: request.number })}
        right={
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <Badge status={request.status} />
            <Btn variant="secondary" onClick={() => navigate('/requests')}>← {t('common.back')}</Btn>
          </div>
        }
      />

      <Panel title={t('requests.requestType')} style={{ marginBottom: 16 }}>
        <DescRow label={t('requests.requestType')}>{request.request_type_name}</DescRow>
        <DescRow label={t('requests.initiator')}>{request.initiator_name}</DescRow>
        <DescRow label={t('common.date')}>{new Date(request.created_at).toLocaleString('ru-KZ')}</DescRow>
        <DescRow label={t('common.status')}><Badge status={request.status} /></DescRow>
        {request.reason && <DescRow label={t('requests.reason')}>{request.reason}</DescRow>}
      </Panel>

      <Panel title={t('requests.items')} noPad style={{ marginBottom: 16 }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 800 }}>
            <thead>
              <tr>
                <Th>Запрошенная группа</Th>
                <Th>Выданный справочник</Th>
                <Th>{t('common.code')}</Th>
                <Th>{t('references.unitOfMeasure')}</Th>
                <Th right>{t('requests.quantityRequested')}</Th>
                <Th right>{t('requests.quantityIssued')}</Th>
                <Th>{t('common.comment')}</Th>
              </tr>
            </thead>
            <tbody>
              {(request.items || []).map((item) => (
                <tr key={item.id} onMouseEnter={(e) => hoverRow(e, true)} onMouseLeave={(e) => hoverRow(e, false)}>
                  <Td bold>{item.requested_group_name || '—'}</Td>
                  <Td>{item.asset_name}</Td>
                  <Td muted>{item.asset_code}</Td>
                  <Td muted>{item.unit_of_measure}</Td>
                  <Td right>{item.quantity_requested}</Td>
                  <Td right>{item.quantity_issued}</Td>
                  <Td muted>{item.comment}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      {canIssue && (
        <Panel title="Точная выдача по заявке" noPad style={{ marginBottom: 16 }}>
          <div style={{ background: C.accentLight, color: C.accent, padding: '10px 14px', borderRadius: 6, fontSize: 13, margin: '16px 16px 16px 16px' }}>
            Заявка хранит группы. Выдача выполняется по конкретной карточке и точному количеству.
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr><Th>Группа заявки</Th><Th>Точный справочник</Th><Th>Кол-во к выдаче</Th></tr></thead>
            <tbody>
              {(request.items || []).map((item) => {
                const options = ((item.requested_group && groupedAssetsMap[item.requested_group]) || []);
                const selAsset = groupedAssets.find((a) => a.id === issueRows[item.id]?.issued_asset);
                const isSingle = selAsset?.asset_type === 'OS' || selAsset?.asset_type === 'NMA';
                return (
                  <tr key={item.id} onMouseEnter={(e) => hoverRow(e, true)} onMouseLeave={(e) => hoverRow(e, false)}>
                    <Td>
                      <div style={{ fontWeight: 500 }}>{item.requested_group_name}</div>
                      <div style={{ fontSize: 11, color: C.muted }}>Запрошено: {item.quantity_requested}</div>
                    </Td>
                    <Td>
                      <select value={issueRows[item.id]?.issued_asset ?? ''} onChange={(e) => handleIssueRowChange(item.id, 'issued_asset', e.target.value ? Number(e.target.value) : null)} style={inputStyle}>
                        <option value="">Выберите карточку</option>
                        {options.map((a) => <option key={a.id} value={a.id}>{a.name} · {a.code}{a.inventory_number ? ` · ${a.inventory_number}` : ''}</option>)}
                      </select>
                    </Td>
                    <Td>
                      <input type="number" min={1} max={isSingle ? 1 : Number(item.quantity_requested)} disabled={isSingle}
                        value={isSingle ? 1 : issueRows[item.id]?.quantity_issued}
                        onChange={(e) => handleIssueRowChange(item.id, 'quantity_issued', Number(e.target.value || 1))}
                        style={{ ...inputStyle, width: 100 }} />
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div style={{ padding: 16 }}>
            <Btn onClick={handleIssueItems} loading={actionLoading}>Зафиксировать выдачу</Btn>
          </div>
        </Panel>
      )}

      {request.status === 'APPROVED' && isInitiator && !canIssue && (
        <Panel style={{ marginBottom: 16 }}>
          <div style={{ background: '#FFF8E1', color: '#F57F17', padding: '10px 14px', borderRadius: 6, fontSize: 13 }}>
            Заявка утверждена и ожидает фактическую выдачу со стороны АХС/МОЛ.
          </div>
        </Panel>
      )}

      {request.approvals?.length > 0 && (
        <Panel title={t('requests.approvalHistory')} style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {(request.approvals || []).map((approval, idx) => (
              <div key={idx} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{
                  width: 10, height: 10, borderRadius: '50%', marginTop: 4, flexShrink: 0,
                  background: approval.action === 'APPROVED' ? C.success : approval.action === 'REJECTED' ? C.danger : C.accent,
                }} />
                <div>
                  <div style={{ fontSize: 13 }}><strong>{approval.approver_name}</strong> — {approval.action_display}</div>
                  {approval.comment && <div style={{ fontSize: 12, color: C.secondary }}>{approval.comment}</div>}
                  {approval.signed_at && <div style={{ fontSize: 11, color: C.muted }}>{new Date(approval.signed_at).toLocaleString('ru-KZ')}</div>}
                </div>
              </div>
            ))}
          </div>
        </Panel>
      )}

      <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
        {canSubmit && <Btn onClick={handleSubmit} loading={actionLoading}>📤 {t('requests.submit')}</Btn>}
        {canApprove && (
          <>
            <Btn onClick={() => { setOtpAction('approve'); setOtpModalOpen(true); }}>✅ {t('requests.approve')}</Btn>
            <Btn variant="secondary" onClick={() => { setOtpAction('reject'); setOtpModalOpen(true); }} style={{ color: C.danger, borderColor: C.danger }}>
              ❌ {t('requests.reject')}
            </Btn>
          </>
        )}
      </div>

      <OTPSignModal
        open={otpModalOpen}
        onCancel={() => { setOtpModalOpen(false); setOtpError(null); }}
        onRequestOtp={handleRequestOtp}
        onSign={handleSign}
        loading={actionLoading}
        error={otpError}
      />
    </div>
  );
};

export default RequestDetailPage;
