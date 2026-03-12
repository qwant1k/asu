import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import api from '../../api/axios';
import { authApi } from '../../api/auth';
import { fetchCurrentUser } from '../auth/authSlice';
import type { AssetRequest, Department, Notification, PaginatedResponse, User } from '../../shared/types';
import {
  C, PageHeader, Panel, Btn, Badge, InputField, SelectField, StatCard,
  Spinner, EmptyState,
} from '../../shared/ui/primitives';

const fmt = (v?: string | null) => {
  if (!v) return '—';
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? v : d.toLocaleString('ru-KZ');
};

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: `1px solid ${C.rowBorder}`, fontSize: 13 }}>
    <span style={{ color: C.secondary }}>{label}</span>
    <strong style={{ color: C.heading }}>{value}</strong>
  </div>
);

const ProfilePage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [requests, setRequests] = useState<AssetRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  /* form fields */
  const [fLastName, setFLastName] = useState('');
  const [fFirstName, setFFirstName] = useState('');
  const [fPatronymic, setFPatronymic] = useState('');
  const [fEmail, setFEmail] = useState('');
  const [fPhone, setFPhone] = useState('');
  const [fPosition, setFPosition] = useState('');
  const [fDept, setFDept] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [removePhoto, setRemovePhoto] = useState(false);

  const viewedUserId = id ? Number(id) : null;
  const isOwnProfile = !viewedUserId || viewedUserId === user?.id;

  const resetFormFields = (u: User) => {
    setFLastName(u.last_name || ''); setFFirstName(u.first_name || '');
    setFPatronymic(u.patronymic || ''); setFEmail(u.email || '');
    setFPhone(u.phone || ''); setFPosition(u.position || '');
    setFDept(u.department ? String(u.department) : '');
    setPhotoPreview(null); setPhotoFile(null); setRemovePhoto(false);
  };

  useEffect(() => {
    let active = true;
    const fetchData = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const profileReq = isOwnProfile ? authApi.getMe() : api.get<User>(`/users/${viewedUserId}/`);
        const reqsReq = api.get<PaginatedResponse<AssetRequest>>('/requests/', { params: { initiator: isOwnProfile ? user.id : viewedUserId, page_size: 100, ordering: '-created_at' } });
        const tasks: Promise<any>[] = [api.get('/departments/', { params: { page_size: 200 } }), profileReq, reqsReq];
        if (isOwnProfile) tasks.push(api.get('/notifications/', { params: { page_size: 20 } }));
        const responses = await Promise.all(tasks);
        if (!active) return;
        setDepartments(responses[0].data.results || []);
        const pUser = responses[1].data;
        setProfileUser(pUser);
        resetFormFields(pUser);
        setRequests(responses[2].data.results || []);
        setNotifications(isOwnProfile ? (responses[3]?.data.results || []) : []);
      } catch { /* */ } finally { if (active) setLoading(false); }
    };
    fetchData();
    return () => { active = false; };
  }, [id, isOwnProfile, user, viewedUserId]);

  useEffect(() => () => { if (photoPreview) URL.revokeObjectURL(photoPreview); }, [photoPreview]);

  const completionPercent = useMemo(() => {
    if (!profileUser) return 0;
    const fields = [profileUser.photo, profileUser.last_name, profileUser.first_name, profileUser.patronymic, profileUser.position, profileUser.phone, profileUser.email, profileUser.department];
    return Math.round((fields.filter(Boolean).length / fields.length) * 100);
  }, [profileUser]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;
  const currentPhoto = removePhoto ? null : photoPreview || profileUser?.photo || null;

  const handlePhotoInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoFile(file); setPhotoPreview(URL.createObjectURL(file)); setRemovePhoto(false);
  };

  const handleSave = async () => {
    if (!isOwnProfile) return;
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('first_name', fFirstName); fd.append('last_name', fLastName);
      fd.append('patronymic', fPatronymic); fd.append('email', fEmail);
      fd.append('phone', fPhone); fd.append('position', fPosition);
      fd.append('department', fDept || '');
      if (photoFile) fd.append('photo', photoFile);
      if (removePhoto) fd.append('remove_photo', 'true');
      await authApi.updateProfile(fd);
      const refreshed = await dispatch(fetchCurrentUser()).unwrap();
      setProfileUser(refreshed);
    } catch { /* */ } finally { setSaving(false); }
  };

  const markAllRead = async () => {
    try { await api.post('/notifications/mark-all-read/'); setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true }))); } catch { /* */ }
  };

  if (loading || !profileUser) return <Spinner />;

  return (
    <div>
      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #1A56CC 0%, #0f3d8c 100%)', borderRadius: 12, padding: '32px 36px', marginBottom: 24, color: '#fff' }}>
        <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{
            width: 88, height: 88, borderRadius: '50%', background: 'rgba(255,255,255,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 700, flexShrink: 0,
            overflow: 'hidden',
          }}>
            {currentPhoto ? <img src={currentPhoto} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (profileUser.full_name?.[0] || '👤')}
          </div>
          <div style={{ flex: 1 }}>
            <Badge status={t(`roles.${profileUser.role}`)} />
            <h2 style={{ fontSize: 22, fontWeight: 700, margin: '4px 0' }}>{profileUser.full_name || profileUser.username}</h2>
            <p style={{ fontSize: 13, opacity: 0.85, margin: 0 }}>
              {profileUser.position || 'Сотрудник'}{profileUser.department_name ? ` · ${profileUser.department_name}` : ''}
            </p>
            <div style={{ display: 'flex', gap: 16, marginTop: 8, flexWrap: 'wrap', fontSize: 12, opacity: 0.8 }}>
              <span>📧 {profileUser.email || 'Email не указан'}</span>
              <span>📞 {profileUser.phone || 'Телефон не указан'}</span>
              <span>👔 {profileUser.supervisor_name || 'Руководитель не назначен'}</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        <StatCard label="Профиль заполнен" value={`${completionPercent}%`} />
        <StatCard label="История заявок" value={requests.length} />
        <StatCard label={isOwnProfile ? 'Непрочитанные' : 'Дата регистрации'} value={isOwnProfile ? unreadCount : fmt(profileUser.date_joined)} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
        {/* Left */}
        <div>
          <Panel title={t('profile.personalInfo')}
            subtitle={isOwnProfile ? 'Актуализируйте контакты, ФИО, должность и подразделение.' : 'Просмотр данных сотрудника.'}
            titleRight={isOwnProfile ? <Btn onClick={handleSave} loading={saving}>💾 {t('common.save')}</Btn> : undefined}
          >
            {/* Photo */}
            <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 20 }}>
              <div style={{ width: 72, height: 72, borderRadius: '50%', background: C.accentLight, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                {currentPhoto ? <img src={currentPhoto} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: 28 }}>👤</span>}
              </div>
              {isOwnProfile && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ cursor: 'pointer', color: C.accent, fontSize: 13, fontWeight: 500 }}>
                    📷 Загрузить фото
                    <input type="file" accept="image/*" onChange={handlePhotoInput} style={{ display: 'none' }} />
                  </label>
                  {currentPhoto && <button onClick={() => { if (photoPreview) URL.revokeObjectURL(photoPreview); setPhotoPreview(null); setPhotoFile(null); setRemovePhoto(true); }} style={{ background: 'none', border: 'none', color: C.danger, fontSize: 12, cursor: 'pointer', textAlign: 'left', padding: 0 }}>Удалить фото</button>}
                  <span style={{ fontSize: 11, color: C.muted }}>JPG, PNG</span>
                </div>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 14 }}>
              <InputField label={t('profile.lastName')} value={fLastName} onChange={(e) => setFLastName(e.target.value)} disabled={!isOwnProfile} />
              <InputField label={t('profile.firstName')} value={fFirstName} onChange={(e) => setFFirstName(e.target.value)} disabled={!isOwnProfile} />
              <InputField label={t('profile.patronymic')} value={fPatronymic} onChange={(e) => setFPatronymic(e.target.value)} disabled={!isOwnProfile} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
              <InputField label={t('profile.position')} value={fPosition} onChange={(e) => setFPosition(e.target.value)} disabled={!isOwnProfile} />
              <SelectField label={t('profile.department')} value={fDept} onChange={(e) => setFDept(e.target.value)} disabled={!isOwnProfile}
                options={[{ value: '', label: '— не выбрано —' }, ...departments.map((d) => ({ value: d.id, label: `${d.name} (${d.code})` }))]} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <InputField label={t('profile.email')} value={fEmail} onChange={(e) => setFEmail(e.target.value)} disabled={!isOwnProfile} />
              <InputField label={t('profile.phone')} value={fPhone} onChange={(e) => setFPhone(e.target.value)} disabled={!isOwnProfile} />
            </div>
          </Panel>

          <Panel title="История заявок" subtitle="Все заявки сотрудника" style={{ marginTop: 20 }}>
            {requests.length === 0 ? <EmptyState text="Заявки не найдены" /> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {requests.map((r) => (
                  <div key={r.id} onClick={() => navigate(`/requests/${r.id}`)} style={{
                    padding: '10px 14px', borderRadius: 6, cursor: 'pointer',
                    border: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    transition: 'border-color 0.15s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.accent; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.border; }}>
                    <div>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <strong style={{ fontSize: 13, color: C.heading }}>{r.number}</strong>
                        <Badge status={r.request_type_name} />
                        <Badge status={r.status_display} />
                      </div>
                      <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>Создана: {fmt(r.created_at)} · Обновлена: {fmt(r.updated_at)}</div>
                    </div>
                    <span style={{ color: C.accent, fontSize: 13, fontWeight: 500 }}>Открыть →</span>
                  </div>
                ))}
              </div>
            )}
          </Panel>
        </div>

        {/* Right */}
        <div>
          <Panel title={isOwnProfile ? 'Рабочая информация' : 'Карточка сотрудника'}>
            <InfoRow label="Логин" value={profileUser.username} />
            <InfoRow label="Роль" value={t(`roles.${profileUser.role}`)} />
            <InfoRow label="Подразделение" value={profileUser.department_name || 'Не указано'} />
            <InfoRow label="Руководитель" value={profileUser.supervisor_name || 'Не указан'} />
            <InfoRow label="Дата регистрации" value={fmt(profileUser.date_joined)} />
          </Panel>

          {isOwnProfile && (
            <Panel title={t('notifications.title')} subtitle="Последние системные уведомления."
              titleRight={<Btn variant="secondary" onClick={markAllRead} disabled={!unreadCount}>✓ {t('notifications.markAllRead')}</Btn>}
              style={{ marginTop: 20 }}
            >
              {notifications.length === 0 ? <EmptyState text={t('notifications.noNotifications')} /> : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {notifications.map((n) => (
                    <div key={n.id} style={{ padding: '8px 12px', borderRadius: 6, background: n.is_read ? '#fff' : C.accentLight, border: `1px solid ${C.border}` }}>
                      <div style={{ fontSize: 13, fontWeight: n.is_read ? 400 : 600, color: C.heading }}>{n.title}</div>
                      <div style={{ fontSize: 12, color: C.secondary }}>{n.body}</div>
                      <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{fmt(n.created_at)}</div>
                    </div>
                  ))}
                </div>
              )}
            </Panel>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
