import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  EditOutlined,
  LeftOutlined,
  RollbackOutlined,
  SendOutlined,
  StopOutlined,
} from '@ant-design/icons';
import { useAppSelector } from '../../app/hooks';
import api from '../../api/axios';
import AssetLink from '../../shared/components/AssetLink';
import type { Asset, AssetRequest, PaginatedResponse, User } from '../../shared/types';
import {
  C, PageHeader, Btn, Panel, Badge, Th, Td, Spinner, EmptyState, Popconfirm, Modal, hoverRow,
} from '../../shared/ui/primitives';

interface IssueDraftRow { id: number; issued_asset: number | null; quantity_issued: number; }
type ApprovalAction = 'approve' | 'reject' | 'revision';
type SimpleAction = 'withdraw' | 'cancel' | 'delete';

const parseDateValue = (value?: string | null) => {
  if (!value) return null;
  const text = String(value).trim();
  const localMatch = text.match(/^(\d{2})\.(\d{2})\.(\d{4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?$/);
  if (localMatch) {
    const [, day, month, year, hour = '0', minute = '0', second = '0'] = localMatch;
    return new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute), Number(second));
  }
  const date = new Date(text);
  return Number.isNaN(date.getTime()) ? null : date;
};

const formatDateTime = (value?: string | null) => {
  const date = parseDateValue(value);
  if (!date) return '—';
  return date.toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

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
  const [approvalAction, setApprovalAction] = useState<ApprovalAction | null>(null);
  const [simpleAction, setSimpleAction] = useState<SimpleAction | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionComment, setActionComment] = useState('');
  const [groupedAssets, setGroupedAssets] = useState<Asset[]>([]);
  const [issueRows, setIssueRows] = useState<Record<number, IssueDraftRow>>({});
  const [issueResponsibleCandidates, setIssueResponsibleCandidates] = useState<User[]>([]);
  const [selectedIssueResponsibles, setSelectedIssueResponsibles] = useState<number[]>([]);

  const canIssue = !!request?.pending_my_issue;
  const userPermissions = user?.effective_permissions || [];
  const isAdmin = user?.role === 'ADMIN' || user?.is_superuser || userPermissions.includes('system.admin');
  const isAhsIssueApprovalStep = request?.required_approver_role === 'AHS_HEAD'
    && (user?.role === 'AHS_HEAD' || user?.role === 'ADMIN' || userPermissions.includes('requests.approve_ahs'));

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

  const fetchGroupedAssets = useCallback(async (assetType?: string) => {
    const baseAssetType = assetType === 'REPRESENTATIVE_TMZ' ? 'TMZ' : assetType;
    try {
      const res = await api.get<PaginatedResponse<Asset>>('/references/assets/', {
        params: { page_size: 1000, grouped: true, asset_type: baseAssetType },
      });
      setGroupedAssets(res.data.results || []);
    } catch { setGroupedAssets([]); }
  }, []);

  useEffect(() => { fetchRequest(); }, [fetchRequest]);
  useEffect(() => { if (request?.status === 'APPROVED') fetchGroupedAssets(request.request_type_asset_type); }, [fetchGroupedAssets, request]);
  useEffect(() => {
    if (!request?.pending_my_approval || !isAhsIssueApprovalStep) {
      setIssueResponsibleCandidates([]);
      setSelectedIssueResponsibles([]);
      return;
    }
    (async () => {
      try {
        const res = await api.get<User[]>('/requests/issue-responsible-candidates/');
        setIssueResponsibleCandidates(res.data || []);
      } catch { setIssueResponsibleCandidates([]); }
    })();
  }, [request?.pending_my_approval, isAhsIssueApprovalStep]);

  const groupedAssetsMap = useMemo(() => {
    const map: Record<number, Asset[]> = {};
    groupedAssets.forEach((a) => { if (!a.group || Number(a.stock_quantity || 0) <= 0) return; if (!map[a.group]) map[a.group] = []; map[a.group].push(a); });
    return map;
  }, [groupedAssets]);

  const handleSubmit = async () => {
    setActionError(null);
    setActionLoading(true);
    try {
      await api.post(`/requests/${id}/submit/`);
      fetchRequest();
    } catch (err: any) {
      setActionError(err?.response?.data?.detail || t('common.error'));
    } finally { setActionLoading(false); }
  };

  const openApprovalAction = (action: ApprovalAction) => {
    setActionError(null);
    setActionComment('');
    setApprovalAction(action);
    if (action === 'approve' && isAhsIssueApprovalStep) {
      const existing = request?.issue_responsibles || [];
      setSelectedIssueResponsibles(existing);
    } else {
      setSelectedIssueResponsibles([]);
    }
  };

  const handleApprovalAction = async (action: ApprovalAction) => {
    if (action === 'revision' && !actionComment.trim()) {
      setActionError('Укажите комментарий для корректировки');
      return;
    }
    if (action === 'approve' && isAhsIssueApprovalStep && selectedIssueResponsibles.length === 0) {
      setActionError('Выберите ответственного за выдачу');
      return;
    }
    setActionError(null);
    setActionLoading(true);
    try {
      const endpoint = action === 'revision' ? 'send-to-revision' : action;
      const payload = action === 'approve' && isAhsIssueApprovalStep
        ? { issue_responsibles: selectedIssueResponsibles }
        : action === 'approve'
          ? {}
          : { comment: actionComment };
      await api.post(`/requests/${id}/${endpoint}/`, payload);
      setApprovalAction(null);
      setActionComment('');
      fetchRequest();
    } catch (err: any) {
      setActionError(err?.response?.data?.detail || t('common.error'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleSimpleAction = async () => {
    if (!simpleAction) return;
    setActionError(null);
    setActionLoading(true);
    try {
      if (simpleAction === 'delete') {
        await api.delete(`/requests/${id}/`);
        navigate('/requests');
        return;
      }
      await api.post(`/requests/${id}/${simpleAction}/`);
      setSimpleAction(null);
      fetchRequest();
    } catch (err: any) {
      setActionError(err?.response?.data?.detail || t('common.error'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleIssueRowChange = (itemId: number, field: keyof IssueDraftRow, value: number | null) => {
    setIssueRows((prev) => ({ ...prev, [itemId]: { ...prev[itemId], [field]: value } }));
  };

  const handleIssueItems = async () => {
    if (!request) return;
    setActionError(null);
    setActionLoading(true);
    try {
      await api.post(`/requests/${id}/issue-items/`, {
        items: request.items.map((item) => ({ id: item.id, issued_asset: issueRows[item.id]?.issued_asset, quantity_issued: issueRows[item.id]?.quantity_issued })),
      });
      fetchRequest();
    } catch (err: any) {
      setActionError(err?.response?.data?.detail || t('common.error'));
    } finally { setActionLoading(false); }
  };

  if (loading) return <Spinner />;
  if (!request) return <EmptyState text={t('common.notFound')} />;

  const isInitiator = user?.id === request.initiator;
  const isDraft = request.status === 'DRAFT';
  const isRevision = request.status === 'SENT_FOR_REVISION';
  const canSubmit = isInitiator && (isDraft || isRevision);
  const canEdit = isInitiator && (isDraft || isRevision);
  const canWithdraw = isInitiator && request.status === 'PENDING_SUPERVISOR';
  const canCancel = (isInitiator && isDraft) || (isAdmin && !['EXECUTED', 'CANCELLED'].includes(request.status));
  const canDelete = isAdmin;
  const canApprove = request.pending_my_approval;
  const workflowSteps = [
    { label: 'Создана', done: true, active: isDraft || isRevision },
    {
      label: isRevision ? 'На корректировке' : 'Отправлена на согласование',
      done: !['DRAFT', 'SENT_FOR_REVISION'].includes(request.status),
      active: ['SENT_FOR_REVISION', 'PENDING_SUPERVISOR', 'APPROVED_SUPERVISOR'].includes(request.status),
    },
    {
      label: request.status === 'APPROVED' ? 'На выдаче' : 'Согласована',
      done: ['APPROVED', 'EXECUTED'].includes(request.status),
      active: request.status === 'APPROVED',
    },
    {
      label: 'Выдана',
      done: request.status === 'EXECUTED',
      active: request.status === 'EXECUTED',
    },
  ];

  const inputStyle: React.CSSProperties = {
    padding: '8px 12px',
    border: `1px solid ${C.inputBorder}`,
    borderRadius: C.radiusSm,
    fontSize: 13,
    width: '100%',
    outline: 'none',
    minHeight: 38,
    background: C.glassStrong,
  };

  return (
    <div>
      <PageHeader
        title={t('requests.requestNumber', { number: request.number })}
        right={
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <Badge status={request.status} />
            <Btn variant="secondary" onClick={() => navigate('/requests')}><LeftOutlined /> {t('common.back')}</Btn>
          </div>
        }
      />

      <Panel title="Процесс заявки" style={{ marginBottom: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 10 }}>
          {workflowSteps.map((step, idx) => (
            <div key={step.label} style={{
              border: `1px solid ${step.active ? C.accent : step.done ? C.successBg : C.border}`,
              background: step.active ? C.accentLight : step.done ? C.successBg : C.surfaceSoft,
              borderRadius: C.radiusSm,
              padding: '12px 14px',
              minHeight: 62,
            }}>
              <div style={{ fontSize: 11, color: C.secondary, marginBottom: 4 }}>Этап {idx + 1}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: step.active ? C.accent : step.done ? C.success : C.text }}>{step.label}</div>
            </div>
          ))}
        </div>
      </Panel>

      <Panel title={t('requests.requestType')} style={{ marginBottom: 16 }}>
        <DescRow label={t('requests.requestType')}>{request.request_type_name}</DescRow>
        <DescRow label={t('requests.initiator')}>{request.initiator_name}</DescRow>
        <DescRow label={t('common.date')}>{formatDateTime(request.created_at)}</DescRow>
        <DescRow label={t('common.status')}><Badge status={request.status} /></DescRow>
        {request.issue_responsible_names?.length > 0 && (
          <DescRow label="Ответственные за выдачу">{request.issue_responsible_names.join(', ')}</DescRow>
        )}
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
                  <Td><AssetLink assetId={item.issued_asset || item.asset}>{item.asset_name || '—'}</AssetLink></Td>
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
          <div style={{ background: C.accentLight, color: C.accent, padding: '10px 14px', borderRadius: C.radiusSm, fontSize: 13, margin: '16px 16px 16px 16px' }}>
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
          <div style={{ background: C.warningBg, color: C.warning, padding: '10px 14px', borderRadius: C.radiusSm, fontSize: 13 }}>
            Заявка согласована и ожидает фактическую выдачу со стороны ответственных АХС.
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
                  {approval.signed_at && <div style={{ fontSize: 11, color: C.muted }}>{formatDateTime(approval.signed_at)}</div>}
                </div>
              </div>
            ))}
          </div>
        </Panel>
      )}

      <div style={{ display: 'flex', gap: 10, marginTop: 8, flexWrap: 'wrap' }}>
        {canEdit && <Btn variant="secondary" onClick={() => navigate(`/requests/${request.id}/edit`)}><EditOutlined /> {t('common.edit')}</Btn>}
        {canSubmit && <Btn onClick={handleSubmit} loading={actionLoading}><SendOutlined /> {isRevision ? 'Повторно отправить' : t('requests.submit')}</Btn>}
        {canWithdraw && <Btn variant="secondary" onClick={() => setSimpleAction('withdraw')}><RollbackOutlined /> Отозвать</Btn>}
        {canCancel && <Btn variant="danger" onClick={() => setSimpleAction('cancel')}><StopOutlined /> Отменить заявку</Btn>}
        {canDelete && <Btn variant="danger" onClick={() => setSimpleAction('delete')}><DeleteOutlined /> Удалить полностью</Btn>}
        {canApprove && (
          <>
            <Btn onClick={() => openApprovalAction('approve')}><CheckOutlined /> {t('requests.approve')}</Btn>
            <Btn variant="secondary" onClick={() => openApprovalAction('revision')}><RollbackOutlined /> На корректировку</Btn>
            <Btn variant="secondary" onClick={() => openApprovalAction('reject')} style={{ color: C.danger, borderColor: C.danger }}>
              <CloseOutlined /> {t('requests.reject')}
            </Btn>
          </>
        )}
      </div>

      {actionError && (
        <div style={{ background: C.dangerBg, color: C.danger, padding: '10px 14px', borderRadius: C.radiusSm, fontSize: 13, marginTop: 12 }}>
          {actionError}
        </div>
      )}

      <Popconfirm
        open={!!simpleAction}
        onClose={() => setSimpleAction(null)}
        onConfirm={handleSimpleAction}
        title={
          simpleAction === 'withdraw'
            ? 'Отозвать отправку на согласование?'
            : simpleAction === 'delete'
              ? 'Удалить заявку полностью?'
              : 'Отменить заявку?'
        }
        confirmText={simpleAction === 'withdraw' ? 'Отозвать' : simpleAction === 'delete' ? 'Удалить' : 'Отменить'}
      />

      <Modal
        open={!!approvalAction}
        onClose={() => setApprovalAction(null)}
        title={
          approvalAction === 'approve'
            ? isAhsIssueApprovalStep ? 'Отправить на выдачу' : 'Согласовать заявку'
            : approvalAction === 'revision'
              ? 'Отправить на корректировку'
              : 'Отклонить заявку'
        }
        footer={(
          <>
            <Btn variant="secondary" onClick={() => setApprovalAction(null)}>Отмена</Btn>
            <Btn
              variant={approvalAction === 'reject' ? 'danger' : 'primary'}
              loading={actionLoading}
              onClick={() => approvalAction && handleApprovalAction(approvalAction)}
            >
              {approvalAction === 'approve' ? isAhsIssueApprovalStep ? 'Отправить на выдачу' : 'Согласовать' : approvalAction === 'revision' ? 'Отправить' : 'Отклонить'}
            </Btn>
          </>
        )}
      >
        {actionError && (
          <div style={{ background: C.dangerBg, color: C.danger, padding: '10px 12px', borderRadius: C.radiusSm, fontSize: 13, marginBottom: 14 }}>
            {actionError}
          </div>
        )}
        {approvalAction === 'approve' && isAhsIssueApprovalStep && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.heading }}>Ответственные за выдачу</div>
            {issueResponsibleCandidates.length === 0 ? (
              <div style={{ fontSize: 13, color: C.secondary }}>Сотрудники АХС не найдены</div>
            ) : issueResponsibleCandidates.map((candidate) => (
              <label key={candidate.id} style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: 13, color: C.text }}>
                <input
                  type="checkbox"
                  checked={selectedIssueResponsibles.includes(candidate.id)}
                  onChange={(e) => {
                    setSelectedIssueResponsibles((prev) => (
                      e.target.checked
                        ? (prev.includes(candidate.id) ? prev : [...prev, candidate.id])
                        : prev.filter((idValue) => idValue !== candidate.id)
                    ));
                  }}
                />
                <span>{candidate.full_name || candidate.username}{candidate.position ? ` · ${candidate.position}` : ''}</span>
              </label>
            ))}
          </div>
        )}

        {approvalAction !== 'approve' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: C.heading }}>
              {approvalAction === 'revision' ? 'Комментарий для корректировки *' : 'Комментарий'}
            </label>
            <textarea
              value={actionComment}
              onChange={(e) => setActionComment(e.target.value)}
              style={{ ...inputStyle, minHeight: 110, resize: 'vertical' }}
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default RequestDetailPage;
