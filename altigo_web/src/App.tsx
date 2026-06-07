import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './shared/layout/AppLayout';
import { RequireAuth } from './shared/components/RequireAuth';
import { LoginPage } from './features/auth/pages/LoginPage';
import { RegisterPage } from './features/auth/pages/RegisterPage';
import { RouteListPage } from './features/routes/pages/RouteListPage';
import { RouteDetailPage } from './features/routes/pages/RouteDetailPage';
import { ActiveRoutePage } from './features/tracking/pages/ActiveRoutePage';
import { UpgradePage } from './features/premium/pages/UpgradePage';
import './App.css';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route element={<AppLayout />}>
        <Route path="/" element={<Navigate to="/routes" replace />} />
        <Route
          path="/routes"
          element={
            <RequireAuth>
              <RouteListPage />
            </RequireAuth>
          }
        />
        <Route
          path="/routes/:routeId"
          element={
            <RequireAuth>
              <RouteDetailPage />
            </RequireAuth>
          }
        />
        <Route
          path="/routes/:routeId/active"
          element={
            <RequireAuth>
              <ActiveRoutePage />
            </RequireAuth>
          }
        />
        <Route
          path="/upgrade"
          element={
            <RequireAuth>
              <UpgradePage />
            </RequireAuth>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/routes" replace />} />
    </Routes>
  );
}

export default App;
