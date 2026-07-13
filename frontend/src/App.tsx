/* Главный компонент приложения ИС «АСУ» — роутинг */

import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from './app/hooks';
import { fetchCurrentUser } from './features/auth/authSlice';

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
import AssetsListPage from './features/references/AssetsListPage';
import AssetCardPage from './features/references/AssetCardPage';
import LimitsPage from './features/references/LimitsPage';
import UsersPage from './features/references/UsersPage';
import RequestTypesPage from './features/references/RequestTypesPage';
import UnitsOfMeasurePage from './features/references/UnitsOfMeasurePage';
import WarehousesPage from './features/references/WarehousesPage';
import PositionsPage from './features/references/PositionsPage';

/* Склад */
import WarehouseStockPage from './features/warehouse/WarehouseStockPage';
import StockUploadPage from './features/warehouse/StockUploadPage';
import MovementsPage from './features/warehouse/MovementsPage';
import AssignmentsPage from './features/warehouse/AssignmentsPage';

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
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/profile/:id" element={<ProfilePage />} />

          {/* Справочники */}
          <Route path="/references" element={<ReferencesPage />} />
          <Route path="/references/counterparties" element={<CounterpartiesPage />} />
          <Route path="/references/limits" element={<LimitsPage />} />
          <Route path="/references/users" element={<UsersPage />} />
          <Route path="/references/request-types" element={<RequestTypesPage />} />
          <Route path="/references/units-of-measure" element={<UnitsOfMeasurePage />} />
          <Route path="/references/warehouses" element={<WarehousesPage />} />
          <Route path="/references/positions" element={<PositionsPage />} />
          <Route path="/references/assets/:type" element={<AssetsListPage />} />

          {/* Карточка позиции (ОС/НМА/ТМЗ) */}
          <Route path="/assets/:id" element={<AssetCardPage />} />

          {/* Склад */}
          <Route path="/warehouse/stock" element={<WarehouseStockPage />} />
          <Route path="/warehouse/stock/upload" element={<StockUploadPage />} />
          <Route path="/warehouse/movements" element={<MovementsPage />} />
          <Route path="/warehouse/assignments" element={<AssignmentsPage />} />

          {/* Заявки */}
          <Route path="/requests" element={<RequestsPage />} />
          <Route path="/requests/new" element={<RequestCreatePage />} />
          <Route path="/requests/:id/edit" element={<RequestCreatePage />} />
          <Route path="/requests/:id" element={<RequestDetailPage />} />

          {/* Документы */}
          <Route path="/documents" element={<DocumentsPage />} />
          <Route path="/documents/incoming-invoices" element={<DocumentListPage />} />
          <Route path="/documents/incoming-invoices/new" element={<DocumentListPage />} />
          <Route path="/documents/incoming-invoices/:id" element={<DocumentListPage />} />
          <Route path="/documents/write-off-acts" element={<DocumentListPage />} />
          <Route path="/documents/write-off-acts/new" element={<DocumentListPage />} />
          <Route path="/documents/write-off-acts/:id" element={<DocumentListPage />} />
          <Route path="/documents/petitions" element={<DocumentListPage />} />
          <Route path="/documents/petitions/:id" element={<DocumentListPage />} />
          <Route path="/documents/protocols" element={<DocumentListPage />} />
          <Route path="/documents/protocols/new" element={<DocumentListPage />} />
          <Route path="/documents/protocols/:id" element={<DocumentListPage />} />
          <Route path="/documents/internal-transfers" element={<DocumentListPage />} />

          {/* Инвентарные карты */}
          <Route path="/inventory" element={<InventoryPage />} />

          {/* Отчёты */}
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/reports/tmz-stock" element={<ReportsPage />} />
          <Route path="/reports/os-balance" element={<ReportsPage />} />
          <Route path="/reports/os-stock" element={<ReportsPage />} />
          <Route path="/reports/nma-balance" element={<ReportsPage />} />
          <Route path="/reports/movement" element={<ReportsPage />} />
          <Route path="/reports/write-offs" element={<ReportsPage />} />
          <Route path="/reports/request-journal" element={<ReportsPage />} />
          <Route path="/reports/inventory-report" element={<ReportsPage />} />

          {/* Администрирование */}
          <Route path="/admin/users" element={<UsersAdminPage />} />
          <Route path="/admin/access" element={<AdminAccessPage />} />
          <Route path="/admin/sync-1c" element={<Sync1CPage />} />
        </Route>
      </Route>

      {/* Редирект с корня */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default App;
