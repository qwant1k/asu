/* Главный компонент приложения ИС «АСУ» — роутинг */

import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useParams } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from './app/hooks';
import { fetchCurrentUser } from './features/auth/authSlice';
import { hasAnyAccess, isManagerUser } from './shared/auth/access';

import ProtectedRoute from './shared/components/ProtectedRoute';
import AppLayout from './shared/components/AppLayout';

/* Auth */
import LoginPage from './features/auth/LoginPage';

/* Pages */
import DashboardPage from './features/dashboard/DashboardPage';
import ProfilePage from './features/profile/ProfilePage';

/* Справочники */
import ReferencesPage from './features/references/ReferencesPage';
import CounterpartiesPage from './features/references/CounterpartiesPage';
import CounterpartyCardPage from './features/references/CounterpartyCardPage';
import ContractsPage from './features/references/ContractsPage';
import AssetsListPage from './features/references/AssetsListPage';
import AssetCardPage from './features/references/AssetCardPage';
import LimitsPage from './features/references/LimitsPage';
import UsersPage from './features/references/UsersPage';
import DepartmentsPage from './features/references/DepartmentsPage';
import RequestTypesPage from './features/references/RequestTypesPage';
import UnitsOfMeasurePage from './features/references/UnitsOfMeasurePage';
import WarehousesPage from './features/references/WarehousesPage';
import PositionsPage from './features/references/PositionsPage';

/* Склад */
import WarehouseStockPage from './features/warehouse/WarehouseStockPage';
import StockUploadPage from './features/warehouse/StockUploadPage';
import MovementsPage from './features/warehouse/MovementsPage';
import AssignmentsPage from './features/warehouse/AssignmentsPage';
import StockAlertsPage from './features/warehouse/StockAlertsPage';

/* Заявки */
import RequestsPage from './features/requests/RequestsPage';
import RequestCreatePage from './features/requests/RequestCreatePage';
import RequestDetailPage from './features/requests/RequestDetailPage';

/* Документы */
import DocumentsPage from './features/documents/DocumentsPage';
import DocumentListPage from './features/documents/DocumentListPage';

/* Инвентарные карты */
import InventoryPage from './features/inventory/InventoryPage';

/* Отчёты */
import ReportsPage from './features/reports/ReportsPage';

/* Администрирование */
import UsersAdminPage from './features/admin/UsersAdminPage';
import AdminAccessPage from './features/admin/AdminAccessPage';
import Sync1CPage from './features/admin/Sync1CPage';
import TrashPage from './features/admin/TrashPage';

const ManagerOnly: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { user } = useAppSelector((state) => state.auth);
  if (!user) return null;
  return isManagerUser(user) ? children : <Navigate to="/requests" replace />;
};

const AccessOnly: React.FC<{ children: React.ReactElement; anyOf: string[] }> = ({ children, anyOf }) => {
  const { user } = useAppSelector((state) => state.auth);
  if (!user) return null;
  return hasAnyAccess(user, anyOf) ? children : <Navigate to="/requests" replace />;
};

const DocumentsOnly: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { user } = useAppSelector((state) => state.auth);
  if (!user) return null;
  const permissions = user.effective_permissions || [];
  const allowed = isManagerUser(user)
    || user.role === 'AHS_HEAD'
    || permissions.includes('documents.manage')
    || permissions.includes('requests.approve_ahs')
    || permissions.includes('system.admin');
  return allowed ? children : <Navigate to="/requests" replace />;
};

const OwnProfileOnly: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAppSelector((state) => state.auth);
  if (!user) return null;
  if (!id || String(user.id) === id || isManagerUser(user)) return children;
  return <Navigate to="/profile" replace />;
};

const DefaultEntry: React.FC = () => {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!user) return null;
  return <Navigate to={isManagerUser(user) ? '/dashboard' : '/requests'} replace />;
};

const App: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated && !user) {
      dispatch(fetchCurrentUser());
    }
  }, [isAuthenticated, user, dispatch]);

  return (
    <Routes>
      {/* Публичные роуты */}
      <Route path="/login" element={<LoginPage />} />

      {/* Защищённые роуты */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<ManagerOnly><DashboardPage /></ManagerOnly>} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/profile/:id" element={<OwnProfileOnly><ProfilePage /></OwnProfileOnly>} />

          {/* Справочники */}
          <Route path="/references" element={<AccessOnly anyOf={['references.manage', 'warehouse.view']}><ReferencesPage /></AccessOnly>} />
          <Route path="/references/counterparties" element={<AccessOnly anyOf={['references.manage']}><CounterpartiesPage /></AccessOnly>} />
          <Route path="/references/counterparties/:id" element={<AccessOnly anyOf={['references.manage']}><CounterpartyCardPage /></AccessOnly>} />
          <Route path="/references/contracts" element={<AccessOnly anyOf={['references.manage']}><ContractsPage /></AccessOnly>} />
          <Route path="/references/limits" element={<AccessOnly anyOf={['references.manage']}><LimitsPage /></AccessOnly>} />
          <Route path="/references/users" element={<AccessOnly anyOf={['users.manage']}><UsersPage /></AccessOnly>} />
          <Route path="/references/departments" element={<AccessOnly anyOf={['references.manage']}><DepartmentsPage /></AccessOnly>} />
          <Route path="/references/request-types" element={<AccessOnly anyOf={['references.manage']}><RequestTypesPage /></AccessOnly>} />
          <Route path="/references/units-of-measure" element={<AccessOnly anyOf={['references.manage']}><UnitsOfMeasurePage /></AccessOnly>} />
          <Route path="/references/warehouses" element={<AccessOnly anyOf={['references.manage']}><WarehousesPage /></AccessOnly>} />
          <Route path="/references/positions" element={<AccessOnly anyOf={['references.manage']}><PositionsPage /></AccessOnly>} />
          <Route path="/references/assets/:type" element={<AccessOnly anyOf={['references.manage', 'warehouse.view']}><AssetsListPage /></AccessOnly>} />

          {/* Карточка позиции (ОС/НМА/ТМЗ) */}
          <Route path="/assets/:id" element={<AccessOnly anyOf={['references.manage', 'warehouse.view']}><AssetCardPage /></AccessOnly>} />

          {/* Склад */}
          <Route path="/warehouse/stock" element={<AccessOnly anyOf={['warehouse.view']}><WarehouseStockPage /></AccessOnly>} />
          <Route path="/warehouse/stock/upload" element={<Navigate to="/admin/stock-upload" replace />} />
          <Route path="/warehouse/stock-alerts" element={<AccessOnly anyOf={['warehouse.view']}><StockAlertsPage /></AccessOnly>} />
          <Route path="/warehouse/movements" element={<AccessOnly anyOf={['warehouse.view']}><MovementsPage /></AccessOnly>} />
          <Route path="/warehouse/assignments" element={<AccessOnly anyOf={['warehouse.view']}><AssignmentsPage /></AccessOnly>} />

          {/* Заявки */}
          <Route path="/requests" element={<RequestsPage />} />
          <Route path="/requests/new" element={<RequestCreatePage />} />
          <Route path="/requests/:id/edit" element={<RequestCreatePage />} />
          <Route path="/requests/:id" element={<RequestDetailPage />} />

          {/* Документы */}
          <Route path="/documents" element={<DocumentsOnly><DocumentsPage /></DocumentsOnly>} />
          <Route path="/documents/incoming-invoices" element={<DocumentsOnly><DocumentListPage /></DocumentsOnly>} />
          <Route path="/documents/incoming-invoices/new" element={<DocumentsOnly><DocumentListPage /></DocumentsOnly>} />
          <Route path="/documents/incoming-invoices/:id" element={<DocumentsOnly><DocumentListPage /></DocumentsOnly>} />
          <Route path="/documents/write-off-acts" element={<DocumentsOnly><DocumentListPage /></DocumentsOnly>} />
          <Route path="/documents/write-off-acts/new" element={<DocumentsOnly><DocumentListPage /></DocumentsOnly>} />
          <Route path="/documents/write-off-acts/:id" element={<DocumentsOnly><DocumentListPage /></DocumentsOnly>} />
          <Route path="/documents/petitions" element={<DocumentsOnly><DocumentListPage /></DocumentsOnly>} />
          <Route path="/documents/petitions/new" element={<DocumentsOnly><DocumentListPage /></DocumentsOnly>} />
          <Route path="/documents/petitions/:id" element={<DocumentsOnly><DocumentListPage /></DocumentsOnly>} />
          <Route path="/documents/protocols" element={<DocumentsOnly><DocumentListPage /></DocumentsOnly>} />
          <Route path="/documents/protocols/new" element={<DocumentsOnly><DocumentListPage /></DocumentsOnly>} />
          <Route path="/documents/protocols/:id" element={<DocumentsOnly><DocumentListPage /></DocumentsOnly>} />
          <Route path="/documents/internal-transfers" element={<DocumentsOnly><DocumentListPage /></DocumentsOnly>} />
          <Route path="/documents/internal-transfers/new" element={<DocumentsOnly><DocumentListPage /></DocumentsOnly>} />
          <Route path="/documents/internal-transfers/:id" element={<DocumentsOnly><DocumentListPage /></DocumentsOnly>} />

          {/* Инвентарные карты */}
          <Route path="/inventory" element={<AccessOnly anyOf={['inventory.view_all']}><InventoryPage /></AccessOnly>} />

          {/* Отчёты */}
          <Route path="/reports/*" element={<AccessOnly anyOf={['reports.view']}><ReportsPage /></AccessOnly>} />

          {/* Администрирование */}
          <Route path="/admin/users" element={<AccessOnly anyOf={['users.manage']}><UsersAdminPage /></AccessOnly>} />
          <Route path="/admin/access" element={<AccessOnly anyOf={['access.manage']}><AdminAccessPage /></AccessOnly>} />
          <Route path="/admin/sync-1c" element={<ManagerOnly><Sync1CPage /></ManagerOnly>} />
          <Route path="/admin/stock-upload" element={<AccessOnly anyOf={['system.admin']}><StockUploadPage /></AccessOnly>} />
          <Route path="/admin/trash" element={<AccessOnly anyOf={['system.admin']}><TrashPage /></AccessOnly>} />
        </Route>
      </Route>

      {/* Редирект с корня */}
      <Route path="/" element={<DefaultEntry />} />
      <Route path="*" element={<DefaultEntry />} />
    </Routes>
  );
};

export default App;
