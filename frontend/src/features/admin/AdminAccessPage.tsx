import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  CheckCircleFilled,
  CloseCircleFilled,
  MinusCircleOutlined,
  ReloadOutlined,
  SaveOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import api from '../../api/axios';
import type {
  AccessDefinitionsResponse,
  AccessPermissionDefinition,
  EffectiveUserAccess,
  PaginatedResponse,
  PositionAccessRule,
  User,
  UserAccessOverride,
  UserRole,
} from '../../shared/types';
import {
  Badge,
  Btn,
  C,
  EmptyState,
  InputField,
  PageHeader,
  Panel,
  Spinner,
  StatCard,
  Surface,
  Tabs,
  Td,
  Th,
  hoverRow,
} from '../../shared/ui/primitives';

type AccessState = 'inherit' | 'allow' | 'deny';
type AdminAccessTab = 'positions' | 'employees' | 'roles';

const SOURCE_LABELS: Record<string, string> = {
  none: 'Нет доступа',
  role: 'По роли',
  position_allow: 'Разрешено по должности',
  position_deny: 'Запрещено по должности',
  user_grant: 'Разрешено индивидуально',
  user_deny: 'Запрещено индивидуально',
};

const ROLE_ORDER: UserRole[] = [
  'ADMIN', 'AHS_HEAD', 'AHS_WORKER', 'MOL_WAREHOUSE', 'MOL_NMA',
  'FO_HEAD', 'DEPT_HEAD', 'COMMISSION_MEMBER', 'IRD_WORKER', 'USER',
];

const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: 'Администратор',
  AHS_WORKER: 'Работник АХС',
  AHS_HEAD: 'Руководитель АХС',
  MOL_WAREHOUSE: 'МОЛ по складу',
  MOL_NMA: 'МОЛ по НМА',
  FO_HEAD: 'Руководитель ФО',
  DEPT_HEAD: 'Руководитель подразделения',
  USER: 'Пользователь',
  COMMISSION_MEMBER: 'Член комиссии',
  IRD_WORKER: 'ИРД/ОСМР',
};

const STATE_META: Record<AccessState, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  deny: { label: 'Запретить', color: C.danger, bg: C.dangerBg, icon: <CloseCircleFilled /> },
  inherit: { label: 'Как у роли', color: C.secondary, bg: C.tagBg, icon: <MinusCircleOutlined /> },
  allow: { label: 'Разрешить', color: C.success, bg: C.successBg, icon: <CheckCircleFilled /> },
};

function normalize(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

function AccessToggle({ value, onChange }: { value: AccessState; onChange: (v: AccessState) => void }) {
  return (
    <div style={{ display: 'inline-flex', border: `1px solid ${C.border}`, borderRadius: 999, padding: 3, background: C.surfaceSoft, gap: 2, flexShrink: 0 }}>
      {(['deny', 'inherit', 'allow'] as AccessState[]).map((opt) => {
        const meta = STATE_META[opt];
        const active = value === opt;
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            title={meta.label}
            style={{
              width: 30,
              height: 26,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: 'none',
              borderRadius: 999,
              background: active ? meta.bg : 'transparent',
              color: active ? meta.color : C.muted,
              cursor: 'pointer',
              fontSize: 13,
              transition: `background 0.2s ${C.ease}, color 0.2s ${C.ease}, transform 0.2s ${C.spring}`,
              transform: active ? 'scale(1.05)' : 'scale(1)',
            }}
          >
            {meta.icon}
          </button>
        );
      })}
    </div>
  );
}

const AdminAccessPage: React.FC = () => {
  const [definitions, setDefinitions] = useState<AccessPermissionDefinition[]>([]);
  const [roleDefaults, setRoleDefaults] = useState<Record<string, string[]>>({});
  const [positionRules, setPositionRules] = useState<PositionAccessRule[]>([]);
  const [userOverrides, setUserOverrides] = useState<UserAccessOverride[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [activeTab, setActiveTab] = useState<AdminAccessTab>('positions');
  const [permissionSearch, setPermissionSearch] = useState('');

  const [positionListSearch, setPositionListSearch] = useState('');
  const [newPositionInput, setNewPositionInput] = useState('');
  const [selectedPosition, setSelectedPosition] = useState('');
  const [positionMatrix, setPositionMatrix] = useState<Record<string, AccessState>>({});
  const [positionComment, setPositionComment] = useState('');

  const [employeeSearch, setEmployeeSearch] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [userMatrix, setUserMatrix] = useState<Record<string, AccessState>>({});
  const [userComment, setUserComment] = useState('');
  const [effectiveAccess, setEffectiveAccess] = useState<EffectiveUserAccess | null>(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const [defsRes, rulesRes, overridesRes, usersRes] = await Promise.all([
        api.get<AccessDefinitionsResponse>('/users/access/definitions/'),
        api.get<PaginatedResponse<PositionAccessRule>>('/users/access/position-rules/', { params: { page_size: 500, ordering: 'position' } }),
        api.get<PaginatedResponse<UserAccessOverride>>('/users/access/user-overrides/', { params: { page_size: 500, ordering: 'user__last_name' } }),
        api.get<PaginatedResponse<User>>('/users/', { params: { page_size: 500, ordering: 'last_name' } }),
      ]);
      setDefinitions(defsRes.data.permissions || []);
      setRoleDefaults(defsRes.data.role_defaults || {});
      setPositionRules(rulesRes.data.results || []);
      setUserOverrides(overridesRes.data.results || []);
      setUsers(usersRes.data.results || []);
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.detail || 'Не удалось загрузить настройки прав');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const groupedDefinitions = useMemo(() => {
    const q = normalize(permissionSearch);
    const groups: Record<string, AccessPermissionDefinition[]> = {};
    definitions.forEach((item) => {
      if (q && !normalize(`${item.name} ${item.category} ${item.code}`).includes(q)) return;
      if (!groups[item.category]) groups[item.category] = [];
      groups[item.category].push(item);
    });
    return groups;
  }, [definitions, permissionSearch]);

  const loadEffectiveAccess = useCallback(async (userId: string) => {
    if (!userId) {
      setEffectiveAccess(null);
      return;
    }
    try {
      const res = await api.get<EffectiveUserAccess>(`/users/access/effective/${userId}/`);
      setEffectiveAccess(res.data);
    } catch {
      setEffectiveAccess(null);
    }
  }, []);

  // --- positions ---
  const positionOptions = useMemo(() => {
    const set = new Set<string>();
    positionRules.forEach((r) => { if (r.position) set.add(r.position); });
    users.forEach((u) => { if (u.position) set.add(u.position); });
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'ru'));
  }, [positionRules, users]);

  const filteredPositions = useMemo(() => {
    const q = normalize(positionListSearch);
    return q ? positionOptions.filter((p) => normalize(p).includes(q)) : positionOptions;
  }, [positionOptions, positionListSearch]);

  const positionUserCount = useCallback((position: string) => (
    users.filter((u) => normalize(u.position) === normalize(position)).length
  ), [users]);

  const positionRuleCount = useCallback((position: string) => (
    positionRules.filter((r) => normalize(r.position) === normalize(position)).length
  ), [positionRules]);

  const buildPositionMatrix = useCallback((position: string) => {
    const matrix: Record<string, AccessState> = {};
    if (!position) return matrix;
    positionRules
      .filter((r) => normalize(r.position) === normalize(position) && r.is_active)
      .forEach((r) => { matrix[r.permission_code] = r.is_allowed ? 'allow' : 'deny'; });
    return matrix;
  }, [positionRules]);

  useEffect(() => {
    setPositionMatrix(buildPositionMatrix(selectedPosition));
    setPositionComment('');
  }, [selectedPosition, buildPositionMatrix]);

  const positionExistingRule = useCallback((position: string, code: string) => (
    positionRules.find((r) => normalize(r.position) === normalize(position) && r.permission_code === code)
  ), [positionRules]);

  const selectPosition = (value: string) => {
    setSelectedPosition(value);
    setActiveTab('positions');
  };

  const savePositionMatrix = async () => {
    if (!selectedPosition.trim()) {
      setErrorMsg('Укажите должность');
      return;
    }
    setSaving(true);
    setErrorMsg('');
    try {
      const tasks: Promise<any>[] = [];
      definitions.forEach((def) => {
        const desired = positionMatrix[def.code] || 'inherit';
        const existing = positionExistingRule(selectedPosition, def.code);
        if (desired === 'inherit') {
          if (existing) tasks.push(api.delete(`/users/access/position-rules/${existing.id}/`));
          return;
        }
        const payload = {
          position: selectedPosition.trim(),
          permission_code: def.code,
          is_allowed: desired === 'allow',
          is_active: true,
          comment: positionComment,
        };
        if (existing) {
          if (existing.is_allowed !== payload.is_allowed || !existing.is_active) {
            tasks.push(api.patch(`/users/access/position-rules/${existing.id}/`, payload));
          }
        } else {
          tasks.push(api.post('/users/access/position-rules/', payload));
        }
      });
      await Promise.all(tasks);
      await loadAll();
    } catch (err: any) {
      setErrorMsg(err?.response?.data ? Object.values(err.response.data).flat().join('; ') : 'Не удалось сохранить права должности');
    } finally {
      setSaving(false);
    }
  };

  const clearPositionRules = async () => {
    const rules = positionRules.filter((r) => normalize(r.position) === normalize(selectedPosition));
    if (!rules.length) return;
    setSaving(true);
    try {
      await Promise.all(rules.map((r) => api.delete(`/users/access/position-rules/${r.id}/`)));
      await loadAll();
    } finally {
      setSaving(false);
    }
  };

  // --- employees ---
  const filteredUsers = useMemo(() => {
    const q = normalize(employeeSearch);
    const sorted = users.slice().sort((a, b) => (a.full_name || a.username).localeCompare(b.full_name || b.username, 'ru'));
    return q ? sorted.filter((u) => normalize(`${u.full_name} ${u.username} ${u.position}`).includes(q)) : sorted;
  }, [users, employeeSearch]);

  const selectedUser = useMemo(() => users.find((u) => String(u.id) === selectedUserId) || null, [users, selectedUserId]);

  const userOverrideCount = useCallback((userId: number) => (
    userOverrides.filter((o) => o.user === userId).length
  ), [userOverrides]);

  const buildUserMatrix = useCallback((userId: string) => {
    const matrix: Record<string, AccessState> = {};
    if (!userId) return matrix;
    userOverrides
      .filter((o) => String(o.user) === userId)
      .forEach((o) => { matrix[o.permission_code] = o.mode === 'GRANT' ? 'allow' : 'deny'; });
    return matrix;
  }, [userOverrides]);

  useEffect(() => {
    setUserMatrix(buildUserMatrix(selectedUserId));
    setUserComment('');
    loadEffectiveAccess(selectedUserId);
  }, [selectedUserId, buildUserMatrix, loadEffectiveAccess]);

  const userExistingOverride = useCallback((userId: string, code: string) => (
    userOverrides.find((o) => String(o.user) === userId && o.permission_code === code)
  ), [userOverrides]);

  const saveUserMatrix = async () => {
    if (!selectedUserId) {
      setErrorMsg('Выберите сотрудника');
      return;
    }
    setSaving(true);
    setErrorMsg('');
    try {
      const tasks: Promise<any>[] = [];
      definitions.forEach((def) => {
        const desired = userMatrix[def.code] || 'inherit';
        const existing = userExistingOverride(selectedUserId, def.code);
        if (desired === 'inherit') {
          if (existing) tasks.push(api.delete(`/users/access/user-overrides/${existing.id}/`));
          return;
        }
        const payload = {
          user: Number(selectedUserId),
          permission_code: def.code,
          mode: desired === 'allow' ? 'GRANT' : 'DENY',
          comment: userComment,
        };
        if (existing) {
          if (existing.mode !== payload.mode) {
            tasks.push(api.patch(`/users/access/user-overrides/${existing.id}/`, payload));
          }
        } else {
          tasks.push(api.post('/users/access/user-overrides/', payload));
        }
      });
      await Promise.all(tasks);
      await loadAll();
      await loadEffectiveAccess(selectedUserId);
    } catch (err: any) {
      setErrorMsg(err?.response?.data ? Object.values(err.response.data).flat().join('; ') : 'Не удалось сохранить индивидуальные права');
    } finally {
      setSaving(false);
    }
  };

  const clearUserOverrides = async () => {
    const overrides = userOverrides.filter((o) => String(o.user) === selectedUserId);
    if (!overrides.length) return;
    setSaving(true);
    try {
      await Promise.all(overrides.map((o) => api.delete(`/users/access/user-overrides/${o.id}/`)));
      await loadAll();
      await loadEffectiveAccess(selectedUserId);
    } finally {
      setSaving(false);
    }
  };

  const renderPermissionGroups = (matrix: Record<string, AccessState>, setMatrix: React.Dispatch<React.SetStateAction<Record<string, AccessState>>>) => {
    const entries = Object.entries(groupedDefinitions);
    if (entries.length === 0) return <EmptyState text="Ничего не найдено" />;
    return entries.map(([category, items]) => (
      <div key={category} style={{ marginBottom: 6 }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: C.secondary, textTransform: 'uppercase', letterSpacing: 0.4, padding: '10px 2px 8px' }}>
          {category}
        </div>
        <div style={{ display: 'grid', gap: 6 }}>
          {items.map((def) => (
            <div
              key={def.code}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
                padding: '9px 12px',
                borderRadius: C.radiusSm,
                border: `1px solid ${C.rowBorder}`,
                background: C.surfaceSolid,
              }}
            >
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 650, color: C.heading }}>{def.name}</div>
                {def.description && <div style={{ fontSize: 11, color: C.muted, marginTop: 2, lineHeight: 1.35 }}>{def.description}</div>}
              </div>
              <AccessToggle
                value={matrix[def.code] || 'inherit'}
                onChange={(v) => setMatrix((prev) => ({ ...prev, [def.code]: v }))}
              />
            </div>
          ))}
        </div>
      </div>
    ));
  };

  if (loading) return <Spinner />;

  const listButtonBase: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    width: '100%',
    padding: '9px 10px',
    border: '1px solid transparent',
    borderRadius: C.radiusSm,
    background: 'transparent',
    cursor: 'pointer',
    textAlign: 'left',
    transition: `background 0.18s ${C.ease}, color 0.18s ${C.ease}`,
  };

  return (
    <div>
      <PageHeader
        title="Управление правами"
        subtitle="Права применяются в порядке: роль сотрудника → правила по должности → индивидуальные разрешения или запреты."
        right={<Btn variant="secondary" onClick={loadAll}><ReloadOutlined /> Обновить</Btn>}
      />

      {errorMsg && (
        <div style={{ background: C.dangerBg, color: C.danger, padding: '10px 14px', borderRadius: C.radiusSm, marginBottom: 16, fontSize: 13 }}>
          {errorMsg}
        </div>
      )}

      <Panel title="Текущие положения прав" subtitle="Сводка по правам пользователей и должностей." style={{ marginBottom: 20 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
          <StatCard label="Должностей с правилами" value={positionOptions.length} sub="Уникальные должности" color={C.accent} />
          <StatCard label="Правил по должностям" value={positionRules.length} sub="Активные записи" color={C.teal} />
          <StatCard label="Сотрудников с исключениями" value={new Set(userOverrides.map((o) => o.user)).size} sub="Индивидуальные права" color={C.success} />
          <StatCard label="Пользователей" value={users.length} sub="В системе" color={C.secondary} />
        </div>
      </Panel>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 18, flexWrap: 'wrap' }}>
        <Tabs
          items={[
            { key: 'positions', label: 'По должностям' },
            { key: 'employees', label: 'По сотрудникам' },
            { key: 'roles', label: 'Права ролей' },
          ]}
          activeKey={activeTab}
          onChange={(k) => setActiveTab(k as AdminAccessTab)}
        />
        {activeTab !== 'roles' && (
          <div style={{ position: 'relative', minWidth: 220 }}>
            <SearchOutlined style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: C.muted, fontSize: 13 }} />
            <input
              value={permissionSearch}
              onChange={(e) => setPermissionSearch(e.target.value)}
              placeholder="Поиск права..."
              style={{ padding: '8px 12px 8px 32px', border: `1px solid ${C.inputBorder}`, borderRadius: C.radiusSm, fontSize: 13, background: C.white, width: '100%', outline: 'none' }}
            />
          </div>
        )}
      </div>

      {activeTab === 'positions' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(220px, 280px) 1fr', gap: 20, alignItems: 'start' }}>
          <Surface style={{ padding: 12 }}>
            <InputField
              value={positionListSearch}
              onChange={(e) => setPositionListSearch(e.target.value)}
              placeholder="Поиск должности"
              style={{ marginBottom: 10 }}
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3, maxHeight: 460, overflowY: 'auto' }}>
              {filteredPositions.length === 0 && <EmptyState text="Должности не найдены" />}
              {filteredPositions.map((p) => {
                const active = normalize(p) === normalize(selectedPosition);
                const ruleCount = positionRuleCount(p);
                return (
                  <button
                    key={p}
                    onClick={() => selectPosition(p)}
                    style={{
                      ...listButtonBase,
                      background: active ? C.accentLight : 'transparent',
                      color: active ? C.accent : C.text,
                      fontWeight: active ? 700 : 600,
                      fontSize: 13,
                    }}
                  >
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p}</span>
                    {ruleCount > 0 && <Badge status={String(ruleCount)} style={{ background: active ? C.white : C.tagBg, color: active ? C.accent : C.secondary }} />}
                  </button>
                );
              })}
            </div>
            <div style={{ borderTop: `1px solid ${C.rowBorder}`, marginTop: 10, paddingTop: 10, display: 'flex', gap: 6 }}>
              <InputField
                value={newPositionInput}
                onChange={(e) => setNewPositionInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newPositionInput.trim()) {
                    selectPosition(newPositionInput.trim());
                    setNewPositionInput('');
                  }
                }}
                placeholder="+ новая должность"
                style={{ flex: 1 }}
              />
            </div>
          </Surface>

          <Panel
            title={selectedPosition || 'Выберите должность'}
            subtitle={selectedPosition ? `Сотрудников с такой должностью: ${positionUserCount(selectedPosition)}` : 'Права применяются ко всем сотрудникам с этой должностью и переопределяют права роли.'}
          >
            {!selectedPosition ? <EmptyState text="Выберите должность слева или введите новую" /> : (
              <>
                {renderPermissionGroups(positionMatrix, setPositionMatrix)}
                <InputField
                  label="Комментарий"
                  value={positionComment}
                  onChange={(e) => setPositionComment(e.target.value)}
                  style={{ marginTop: 8 }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
                  <Btn variant="ghost" onClick={clearPositionRules} disabled={saving}>Сбросить к правам роли</Btn>
                  <Btn onClick={savePositionMatrix} loading={saving}><SaveOutlined /> Сохранить</Btn>
                </div>
              </>
            )}
          </Panel>
        </div>
      )}

      {activeTab === 'employees' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(240px, 300px) 1fr', gap: 20, alignItems: 'start' }}>
          <Surface style={{ padding: 12 }}>
            <InputField
              value={employeeSearch}
              onChange={(e) => setEmployeeSearch(e.target.value)}
              placeholder="Поиск сотрудника"
              style={{ marginBottom: 10 }}
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3, maxHeight: 520, overflowY: 'auto' }}>
              {filteredUsers.length === 0 && <EmptyState text="Сотрудники не найдены" />}
              {filteredUsers.map((u) => {
                const active = String(u.id) === selectedUserId;
                const count = userOverrideCount(u.id);
                return (
                  <button
                    key={u.id}
                    onClick={() => setSelectedUserId(String(u.id))}
                    style={{
                      ...listButtonBase,
                      background: active ? C.accentLight : 'transparent',
                    }}
                  >
                    <span style={{ minWidth: 0, overflow: 'hidden' }}>
                      <span style={{ display: 'block', fontSize: 13, fontWeight: active ? 700 : 650, color: active ? C.accent : C.heading, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {u.full_name || u.username}
                      </span>
                      <span style={{ display: 'block', fontSize: 11, color: C.muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {u.position || 'Без должности'}
                      </span>
                    </span>
                    {count > 0 && <Badge status={String(count)} style={{ background: active ? C.white : C.tealBg, color: active ? C.accent : C.teal }} />}
                  </button>
                );
              })}
            </div>
          </Surface>

          <div style={{ display: 'grid', gap: 20 }}>
            <Panel
              title={selectedUser ? (selectedUser.full_name || selectedUser.username) : 'Выберите сотрудника'}
              subtitle="Индивидуальные права переопределяют роль и должность для одного сотрудника."
            >
              {!selectedUserId ? <EmptyState text="Выберите сотрудника слева" /> : (
                <>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                    <Badge status={selectedUser?.role || 'USER'} />
                    <span style={{ fontSize: 12, color: C.secondary }}>{selectedUser?.position || 'Должность не указана'}</span>
                  </div>
                  {renderPermissionGroups(userMatrix, setUserMatrix)}
                  <InputField
                    label="Комментарий"
                    value={userComment}
                    onChange={(e) => setUserComment(e.target.value)}
                    style={{ marginTop: 8 }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
                    <Btn variant="ghost" onClick={clearUserOverrides} disabled={saving}>Сбросить индивидуальные права</Btn>
                    <Btn onClick={saveUserMatrix} loading={saving}><SaveOutlined /> Сохранить</Btn>
                  </div>
                </>
              )}
            </Panel>

            {selectedUserId && effectiveAccess && (
              <Panel title="Итоговый доступ" subtitle="Финальный результат с учётом роли, должности и индивидуальных правил.">
                <div style={{ display: 'grid', gap: 14 }}>
                  {Object.entries(groupedDefinitions).map(([category, items]) => (
                    <div key={category}>
                      <div style={{ fontSize: 11, fontWeight: 800, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 6 }}>{category}</div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 8 }}>
                        {items.map((def) => {
                          const access = effectiveAccess.permissions.find((p) => p.code === def.code);
                          const source = access?.source || 'none';
                          return (
                            <div
                              key={def.code}
                              title={SOURCE_LABELS[source]}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: 8,
                                padding: '8px 10px',
                                borderRadius: C.radiusSm,
                                border: `1px solid ${C.rowBorder}`,
                                background: access?.allowed ? C.successBg : C.tagBg,
                              }}
                            >
                              <span style={{ fontSize: 12, color: C.heading, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{def.name}</span>
                              {access?.allowed
                                ? <CheckCircleFilled style={{ color: C.success, flexShrink: 0 }} />
                                : <CloseCircleFilled style={{ color: C.muted, flexShrink: 0 }} />}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>
            )}
          </div>
        </div>
      )}

      {activeTab === 'roles' && (
        <Surface>
          <div style={{ padding: '15px 16px', borderBottom: `1px solid ${C.rowBorder}`, fontWeight: 800, color: C.heading }}>
            Права по умолчанию для каждой роли
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 960 }}>
              <thead>
                <tr>
                  <Th>Право</Th>
                  {ROLE_ORDER.map((role) => <Th key={role} right>{ROLE_LABELS[role]}</Th>)}
                </tr>
              </thead>
              <tbody>
                {definitions.map((def) => (
                  <tr key={def.code} onMouseEnter={(e) => hoverRow(e, true)} onMouseLeave={(e) => hoverRow(e, false)}>
                    <Td bold>
                      {def.name}
                      <div style={{ fontSize: 11, color: C.muted, fontWeight: 500, marginTop: 2 }}>{def.category}</div>
                    </Td>
                    {ROLE_ORDER.map((role) => {
                      const has = (roleDefaults[role] || []).includes(def.code);
                      return (
                        <Td key={role} right>
                          {has ? <CheckCircleFilled style={{ color: C.success }} /> : <span style={{ color: C.rowBorder }}>—</span>}
                        </Td>
                      );
                    })}
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

export default AdminAccessPage;
