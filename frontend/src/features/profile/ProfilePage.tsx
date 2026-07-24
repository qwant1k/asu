import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeftOutlined,
  BellOutlined,
  CameraOutlined,
  CheckCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  FileTextOutlined,
  IdcardOutlined,
  MailOutlined,
  PhoneOutlined,
  SaveOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import api from '../../api/axios';
import { authApi } from '../../api/auth';
import { fetchCurrentUser } from '../auth/authSlice';
import type { AssetRequest, Department, Notification, PaginatedResponse, User } from '../../shared/types';
import {
  C, Btn, Badge, InputField, SelectField, StatCard, Spinner, EmptyState, Modal, Tabs,
} from '../../shared/ui/primitives';
import './profile.css';

type ProfileTab = 'work' | 'history' | 'notifications';

const fmt = (value?: string | null) => {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString('ru-RU');
};

const getInitials = (u: User | null) => {
  if (!u) return 'U';
  const parts = [u.last_name, u.first_name].filter(Boolean);
  if (parts.length) return parts.map((part) => part[0]).join('').slice(0, 2).toUpperCase();
  return (u.username || 'U').slice(0, 2).toUpperCase();
};

const InfoItem = ({ label, value, icon }: { label: string; value: React.ReactNode; icon: React.ReactNode }) => (
  <div className="profile-info-item">
    <div className="profile-info-item__icon">{icon}</div>
    <div className="profile-info-item__body">
      <span>{label}</span>
      <strong>{value || '—'}</strong>
    </div>
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
  const [saveError, setSaveError] = useState('');
  const [editOpen, setEditOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<ProfileTab>('work');

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
    setFLastName(u.last_name || '');
    setFFirstName(u.first_name || '');
    setFPatronymic(u.patronymic || '');
    setFEmail(u.email || '');
    setFPhone(u.phone || '');
    setFPosition(u.position_ref_name || u.position || '');
    setFDept(u.department ? String(u.department) : '');
    setPhotoPreview(null);
    setPhotoFile(null);
    setRemovePhoto(false);
    setSaveError('');
  };

  useEffect(() => {
    let active = true;
    const fetchData = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const profileReq = isOwnProfile ? authApi.getMe() : api.get<User>(`/users/${viewedUserId}/`);
        const reqsReq = api.get<PaginatedResponse<AssetRequest>>('/requests/', {
          params: {
            initiator: isOwnProfile ? user.id : viewedUserId,
            page_size: 100,
            ordering: '-created_at',
          },
        });
        const tasks: Promise<any>[] = [
          api.get('/departments/', { params: { page_size: 300, ordering: 'name' } }),
          profileReq,
          reqsReq,
        ];
        if (isOwnProfile) tasks.push(api.get('/notifications/', { params: { page_size: 20 } }));

        const responses = await Promise.all(tasks);
        if (!active) return;
        setDepartments(responses[0].data.results || []);
        const pUser = responses[1].data;
        setProfileUser(pUser);
        resetFormFields(pUser);
        setRequests(responses[2].data.results || []);
        setNotifications(isOwnProfile ? (responses[3]?.data.results || []) : []);
      } catch {
        if (active) setProfileUser(null);
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchData();
    return () => { active = false; };
  }, [id, isOwnProfile, user, viewedUserId]);

  useEffect(() => () => {
    if (photoPreview) URL.revokeObjectURL(photoPreview);
  }, [photoPreview]);

  const completionPercent = useMemo(() => {
    if (!profileUser) return 0;
    const fields = [
      profileUser.photo,
      profileUser.last_name,
      profileUser.first_name,
      profileUser.patronymic,
      profileUser.position_ref_name || profileUser.position,
      profileUser.phone,
      profileUser.email,
      profileUser.department,
    ];
    return Math.round((fields.filter(Boolean).length / fields.length) * 100);
  }, [profileUser]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;
  const currentPhoto = removePhoto ? null : photoPreview || profileUser?.photo || null;

  const handlePhotoInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
    setRemovePhoto(false);
  };

  const removeCurrentPhoto = () => {
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoPreview(null);
    setPhotoFile(null);
    setRemovePhoto(true);
  };

  const openEditProfile = () => {
    if (!profileUser) return;
    resetFormFields(profileUser);
    setEditOpen(true);
  };

  const closeEditProfile = () => {
    if (profileUser) resetFormFields(profileUser);
    setEditOpen(false);
  };

  const formatError = (err: any) => {
    const data = err?.response?.data;
    if (!data) return t('common.error');
    if (typeof data === 'string') return data;
    return Object.values(data).flat().join('; ');
  };

  const handleSave = async () => {
    if (!isOwnProfile) return;
    setSaving(true);
    setSaveError('');
    try {
      const fd = new FormData();
      fd.append('first_name', fFirstName);
      fd.append('last_name', fLastName);
      fd.append('patronymic', fPatronymic);
      fd.append('email', fEmail);
      fd.append('phone', fPhone);
      fd.append('position', fPosition);
      fd.append('department', fDept || '');
      if (photoFile) fd.append('photo', photoFile);
      if (removePhoto) fd.append('remove_photo', 'true');

      await authApi.updateProfile(fd);
      const refreshed = await dispatch(fetchCurrentUser()).unwrap();
      setProfileUser(refreshed);
      resetFormFields(refreshed);
      setEditOpen(false);
    } catch (err: any) {
      setSaveError(formatError(err));
    } finally {
      setSaving(false);
    }
  };

  const markAllRead = async () => {
    try {
      await api.post('/notifications/mark-all-read/');
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch { /* ignore */ }
  };

  const openNotification = async (notification: Notification) => {
    try {
      if (!notification.is_read) {
        await api.patch(`/notifications/${notification.id}/read/`);
        setNotifications((prev) => prev.map((n) => (
          n.id === notification.id ? { ...n, is_read: true } : n
        )));
      }
    } catch { /* ignore */ }

    if (notification.related_model === 'assetrequest' && notification.related_object_id) {
      navigate(`/requests/${notification.related_object_id}`);
    }
  };

  if (loading) return <Spinner />;
  if (!profileUser) return <EmptyState text={t('common.notFound')} />;

  const roleLabel = t(`roles.${profileUser.role}`, { defaultValue: profileUser.role });
  const displayPosition = profileUser.position_ref_name || profileUser.position || 'Должность не указана';
  const profileTabs = [
    { key: 'work', label: 'Рабочая информация' },
    { key: 'history', label: 'История' },
    { key: 'notifications', label: 'Уведомления' },
  ];

  return (
    <div className="profile-page">
      <section className="profile-hero">
        <div className="profile-hero__top">
          {!isOwnProfile && (
            <Btn variant="secondary" onClick={() => navigate(-1)}>
              <ArrowLeftOutlined /> {t('common.back')}
            </Btn>
          )}
          {isOwnProfile && (
            <Btn onClick={openEditProfile}>
              <EditOutlined /> Изменить профиль
            </Btn>
          )}
        </div>

        <div className="profile-hero__main">
          <div className="profile-photo">
            {currentPhoto ? (
              <img src={currentPhoto} alt={profileUser.full_name || profileUser.username} />
            ) : (
              <span>{getInitials(profileUser)}</span>
            )}
          </div>

          <div className="profile-identity">
            <div className="profile-identity__badges">
              <Badge status={roleLabel} />
              <Badge status={profileUser.is_active ? 'Активен' : 'Неактивен'} />
            </div>
            <h1>{profileUser.full_name || profileUser.username}</h1>
            <p>{displayPosition}</p>
            <div className="profile-identity__meta">
              <span><TeamOutlined /> {profileUser.department_name || 'Подразделение не указано'}</span>
              <span><IdcardOutlined /> {profileUser.username}</span>
              <span><UserOutlined /> {profileUser.supervisor_name || 'Руководитель не назначен'}</span>
            </div>
          </div>

          <div className="profile-completion">
            <div className="profile-completion__value">{completionPercent}%</div>
            <div className="profile-completion__label">Заполнение профиля</div>
            <div className="profile-progress">
              <span style={{ width: `${completionPercent}%` }} />
            </div>
          </div>
        </div>

      </section>

      <div className="profile-stats">
        <StatCard label="Заявки" value={requests.length} sub="история сотрудника" />
        <StatCard label={isOwnProfile ? 'Непрочитанные' : 'Последний вход'} value={isOwnProfile ? unreadCount : fmt(profileUser.last_login)} sub={isOwnProfile ? 'в колокольчике' : 'активность'} color={C.info} />
        <StatCard label="Права доступа" value={profileUser.effective_permissions?.length || 0} sub={roleLabel} color={C.teal} />
      </div>

      <div className="profile-tabs-bar">
        <Tabs
          activeKey={activeTab}
          items={profileTabs}
          onChange={(key) => setActiveTab(key as ProfileTab)}
        />
      </div>

      <div className="profile-grid profile-grid--tabs">
        <div className="profile-main-column" style={{ display: activeTab === 'history' ? undefined : 'none' }}>
          <section className="profile-panel">
            <div className="profile-panel__head">
              <div>
                <h2>История заявок</h2>
                <p>Последние заявки, созданные сотрудником</p>
              </div>
              <Badge status={`${requests.length} записей`} />
            </div>

            {requests.length === 0 ? <EmptyState text="Заявки не найдены" /> : (
              <div className="profile-request-list">
                {requests.map((request) => (
                  <button
                    key={request.id}
                    type="button"
                    className="profile-request-item"
                    onClick={() => navigate(`/requests/${request.id}`)}
                  >
                    <div className="profile-request-item__icon"><FileTextOutlined /></div>
                    <div className="profile-request-item__body">
                      <div className="profile-request-item__title">
                        <strong>{request.number}</strong>
                        <Badge status={request.status_display} />
                      </div>
                      <span>{request.request_type_name} · {fmt(request.created_at)}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </section>
        </div>

        <aside className="profile-side-column" style={{ display: activeTab === 'work' || activeTab === 'notifications' ? undefined : 'none' }}>
          <section className="profile-panel" style={{ display: activeTab === 'work' ? undefined : 'none' }}>
            <div className="profile-panel__head">
              <div>
                <h2>Рабочая информация</h2>
                <p>Роль, подразделение и активность</p>
              </div>
            </div>
            <div className="profile-info-list">
              <InfoItem label="Логин" value={profileUser.username} icon={<IdcardOutlined />} />
              <InfoItem label="Роль" value={roleLabel} icon={<CheckCircleOutlined />} />
              <InfoItem label="Подразделение" value={profileUser.department_name || 'Не указано'} icon={<TeamOutlined />} />
              <InfoItem label="Руководитель" value={profileUser.supervisor_name || 'Не указан'} icon={<UserOutlined />} />
              <InfoItem label="Email" value={profileUser.email || 'Не указан'} icon={<MailOutlined />} />
              <InfoItem label="Телефон" value={profileUser.phone || 'Не указан'} icon={<PhoneOutlined />} />
              <InfoItem label="Дата регистрации" value={fmt(profileUser.date_joined)} icon={<CheckCircleOutlined />} />
              <InfoItem label="Последний вход" value={fmt(profileUser.last_login)} icon={<CheckCircleOutlined />} />
            </div>
          </section>

          {isOwnProfile && (
            <section className="profile-panel" style={{ display: activeTab === 'notifications' ? undefined : 'none' }}>
              <div className="profile-panel__head profile-panel__head--compact">
                <div>
                  <h2>{t('notifications.title')}</h2>
                  <p>Последние события</p>
                </div>
                <Btn variant="secondary" onClick={markAllRead} disabled={!unreadCount}>
                  <BellOutlined /> Прочитано
                </Btn>
              </div>

              {notifications.length === 0 ? <EmptyState text={t('notifications.noNotifications')} /> : (
                <div className="profile-notification-list">
                  {notifications.map((notification) => (
                    <button
                      key={notification.id}
                      type="button"
                      className={`profile-notification ${notification.is_read ? '' : 'profile-notification--unread'}`}
                      onClick={() => openNotification(notification)}
                    >
                      <div className="profile-notification__icon"><BellOutlined /></div>
                      <div className="profile-notification__body">
                        <strong>{notification.title}</strong>
                        <span>{notification.body}</span>
                        <small>{fmt(notification.created_at)}</small>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </section>
          )}

          {!isOwnProfile && (
            <section className="profile-panel" style={{ display: activeTab === 'notifications' ? undefined : 'none' }}>
              <div className="profile-panel__head profile-panel__head--compact">
                <div>
                  <h2>{t('notifications.title')}</h2>
                  <p>Персональные уведомления</p>
                </div>
              </div>
              <EmptyState text="Уведомления доступны только в собственном личном кабинете" />
            </section>
          )}
        </aside>
      </div>

      <Modal
        open={editOpen}
        onClose={closeEditProfile}
        title="Изменить профиль"
        width={760}
        footer={(
          <>
            <Btn variant="secondary" onClick={closeEditProfile}>{t('common.cancel')}</Btn>
            <Btn onClick={handleSave} loading={saving}>
              <SaveOutlined /> {t('common.save')}
            </Btn>
          </>
        )}
      >
        {saveError && <div className="profile-error">{saveError}</div>}

        <div className="profile-edit-photo">
          <div className="profile-edit-photo__preview">
            {currentPhoto ? (
              <img src={currentPhoto} alt={profileUser.full_name || profileUser.username} />
            ) : (
              <span>{getInitials(profileUser)}</span>
            )}
          </div>
          <div className="profile-edit-photo__body">
            <strong>Фотография профиля</strong>
            <span>Используйте портретное фото в JPG или PNG.</span>
            <div className="profile-photo-actions profile-photo-actions--modal">
              <label className="profile-upload-button">
                <CameraOutlined /> Загрузить фото
                <input type="file" accept="image/*" onChange={handlePhotoInput} />
              </label>
              {currentPhoto && (
                <button type="button" className="profile-remove-photo" onClick={removeCurrentPhoto}>
                  <DeleteOutlined /> Удалить фото
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="profile-form-grid profile-form-grid--three">
          <InputField label={t('profile.lastName')} value={fLastName} onChange={(e) => setFLastName(e.target.value)} />
          <InputField label={t('profile.firstName')} value={fFirstName} onChange={(e) => setFFirstName(e.target.value)} />
          <InputField label={t('profile.patronymic')} value={fPatronymic} onChange={(e) => setFPatronymic(e.target.value)} />
        </div>

        <div className="profile-form-grid">
          <InputField label={t('profile.position')} value={fPosition} onChange={(e) => setFPosition(e.target.value)} />
          <SelectField
            label={t('profile.department')}
            value={fDept}
            onChange={(e) => setFDept(e.target.value)}
            options={[
              { value: '', label: 'Не выбрано' },
              ...departments.map((d) => ({ value: d.id, label: `${d.name}${d.code ? ` (${d.code})` : ''}` })),
            ]}
          />
        </div>

        <div className="profile-form-grid">
          <InputField label={t('profile.email')} value={fEmail} onChange={(e) => setFEmail(e.target.value)} />
          <InputField label={t('profile.phone')} value={fPhone} onChange={(e) => setFPhone(e.target.value)} />
        </div>
      </Modal>
    </div>
  );
};

export default ProfilePage;
