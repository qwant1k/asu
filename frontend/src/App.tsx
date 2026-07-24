/* Главный компонент приложения ИС «АСУ» — роутинг */

import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useParams } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from './app/hooks';
import { fetchCurrentUser } from './features/auth/authSlice';
import { isManagerUser } from './shared/auth/access';

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

const ManagerOnly: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { user } = useAppSelector((state) => state.auth);
  if (!user) return null;
  return isManagerUser(user) ? children : <Navigate to="/requests" replace />;
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
          <Route path="/references" element={<ManagerOnly><ReferencesPage /></ManagerOnly>} />
          <Route path="/references/counterparties" element={<ManagerOnly><CounterpartiesPage /></ManagerOnly>} />
          <Route path="/references/counterparties/:id" element={<ManagerOnly><CounterpartyCardPage /></ManagerOnly>} />
          <Route path="/references/contracts" element={<ManagerOnly><ContractsPage /></ManagerOnly>} />
          <Route path="/references/limits" element={<ManagerOnly><LimitsPage /></ManagerOnly>} />
          <Route path="/references/users" element={<ManagerOnly><UsersPage /></ManagerOnly>} />
          <Route path="/references/departments" element={<ManagerOnly><DepartmentsPage /></ManagerOnly>} />
          <Route path="/references/request-types" element={<ManagerOnly><RequestTypesPage /></ManagerOnly>} />
          <Route path="/references/units-of-measure" element={<ManagerOnly><UnitsOfMeasurePage /></ManagerOnly>} />
          <Route path="/references/warehouses" element={<ManagerOnly><WarehousesPage /></ManagerOnly>} />
          <Route path="/references/positions" element={<ManagerOnly><PositionsPage /></ManagerOnly>} />
          <Route path="/references/assets/:type" element={<ManagerOnly><AssetsListPage /></ManagerOnly>} />

          {/* Карточка позиции (ОС/НМА/ТМЗ) */}
          <Route path="/assets/:id" element={<ManagerOnly><AssetCardPage /></ManagerOnly>} />

          {/* Склад */}
          <Route path="/warehouse/stock" element={<ManagerOnly><WarehouseStockPage /></ManagerOnly>} />
          <Route path="/warehouse/stock/upload" element={<ManagerOnly><StockUploadPage /></ManagerOnly>} />
          <Route path="/warehouse/stock-alerts" element={<ManagerOnly><StockAlertsPage /></ManagerOnly>} />
          <Route path="/warehouse/movements" element={<ManagerOnly><MovementsPage /></ManagerOnly>} />
          <Route path="/warehouse/assignments" element={<ManagerOnly><AssignmentsPage /></ManagerOnly>} />

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
          <Route path="/inventory" element={<ManagerOnly><InventoryPage /></ManagerOnly>} />

          {/* Отчёты */}
          <Route path="/reports" element={<ManagerOnly><ReportsPage /></ManagerOnly>} />
          <Route path="/reports/tmz-stock" element={<ManagerOnly><ReportsPage /></ManagerOnly>} />
          <Route path="/reports/os-balance" element={<ManagerOnly><ReportsPage /></ManagerOnly>} />
          <Route path="/reports/os-stock" element={<ManagerOnly><ReportsPage /></ManagerOnly>} />
          <Route path="/reports/nma-balance" element={<ManagerOnly><ReportsPage /></ManagerOnly>} />
          <Route path="/reports/movement" element={<ManagerOnly><ReportsPage /></ManagerOnly>} />
          <Route path="/reports/write-offs" element={<ManagerOnly><ReportsPage /></ManagerOnly>} />
          <Route path="/reports/request-journal" element={<ManagerOnly><ReportsPage /></ManagerOnly>} />
          <Route path="/reports/inventory-report" element={<ManagerOnly><ReportsPage /></ManagerOnly>} />

          {/* Администрирование */}
          <Route path="/admin/users" element={<ManagerOnly><UsersAdminPage /></ManagerOnly>} />
          <Route path="/admin/access" element={<ManagerOnly><AdminAccessPage /></ManagerOnly>} />
          <Route path="/admin/sync-1c" element={<ManagerOnly><Sync1CPage /></ManagerOnly>} />
        </Route>
      </Route>

      {/* Редирект с корня */}
      <Route path="/" element={<DefaultEntry />} />
      <Route path="*" element={<DefaultEntry />} />
    </Routes>
  );
};

export default App;
