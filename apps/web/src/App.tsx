import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import { AppLayout } from '@/components/layout/AppLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuthStore } from '@/store/authStore';
import { useNotificationStore } from '@/store/notificationStore';
import { useSocket } from '@/hooks/useSocket';
import { api } from '@/lib/axios';

// Pages
import Login from '@/pages/Login';
import Unauthorized from '@/pages/Unauthorized';
import Dashboard from '@/pages/Dashboard';
import Reports from '@/pages/Reports';

// Modules
import VisitorList from '@/modules/visitor/pages/VisitorList';
import VisitorForm from '@/modules/visitor/pages/VisitorForm';
import TravelList from '@/modules/travel/pages/TravelList';
import VisaList from '@/modules/visa/pages/VisaList';
import ShipmentList from '@/modules/shipment/pages/ShipmentList';
import GrievanceList from '@/modules/grievance/pages/GrievanceList';
import ResourceList from '@/modules/resource/pages/ResourceList';
import AssetList from '@/modules/asset/pages/AssetList';
import InventoryList from '@/modules/inventory/pages/InventoryList';
import IDCardList from '@/modules/idcard/pages/IDCardList';

function AppInitializer({ children }: { children: React.ReactNode }) {
  const { setUser, setAccessToken, isAuthenticated } = useAuthStore();
  const { setNotifications } = useNotificationStore();
  useSocket();

  // On mount: try silent refresh to restore an existing session.
  // IMPORTANT: use a raw axios call (not the `api` instance) so the 401
  // response interceptor does NOT fire and trigger a redirect loop.
  useEffect(() => {
    (async () => {
      const apiBase = import.meta.env.VITE_API_URL
        ? `${import.meta.env.VITE_API_URL}/api`
        : '/api';
      try {
        let token: string;
        try {
          const { data } = await axios.post(
            `${apiBase}/auth/refresh`,
            {},
            { withCredentials: true },
          );
          token = data.data.accessToken;
        } catch {
          // TEMP: auto-login as admin while login screen is disabled (remove this fallback to restore login)
          const { data } = await axios.post(
            `${apiBase}/auth/local-login`,
            { email: 'admin@utthunga.com', password: 'Admin@123' },
            { withCredentials: true },
          );
          token = data.data.accessToken;
        }
        setAccessToken(token);
        // Use the api instance (with token now set) for subsequent calls
        const me = await api.get('/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(me.data.data);
        const notifs = await api.get('/notifications?limit=30', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setNotifications(notifs.data.data ?? []);
      } catch {
        // No active session — stay on login page, do nothing
      }
    })();
  }, []);

  return <>{children}</>;
}

export default function App() {
  return (
    <AppInitializer>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Protected — all authenticated users */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />

            {/* Visitor Management */}
            <Route path="/visitors" element={<VisitorList />} />
            <Route path="/visitors/new" element={<VisitorForm />} />

            {/* Travel */}
            <Route path="/travel" element={<TravelList />} />

            {/* Visa */}
            <Route path="/visa" element={<VisaList />} />

            {/* Shipments */}
            <Route path="/shipments" element={<ShipmentList />} />

            {/* Grievances */}
            <Route path="/grievances" element={<GrievanceList />} />

            {/* Resources */}
            <Route path="/resources" element={<ResourceList />} />

            {/* Assets — admin only */}
            <Route element={<ProtectedRoute roles={['SUPER_ADMIN','FACILITY_MANAGER','ADMIN_EXECUTIVE','FINANCE_TEAM']} />}>
              <Route path="/assets" element={<AssetList />} />
            </Route>

            {/* Inventory — admin only */}
            <Route element={<ProtectedRoute roles={['SUPER_ADMIN','FACILITY_MANAGER','ADMIN_EXECUTIVE']} />}>
              <Route path="/inventory" element={<InventoryList />} />
            </Route>

            {/* ID Cards — admin + HR */}
            <Route element={<ProtectedRoute roles={['SUPER_ADMIN','FACILITY_MANAGER','ADMIN_EXECUTIVE','HR_TEAM']} />}>
              <Route path="/idcards" element={<IDCardList />} />
            </Route>

            {/* Reports */}
            <Route element={<ProtectedRoute roles={['SUPER_ADMIN','FACILITY_MANAGER','ADMIN_EXECUTIVE','FINANCE_TEAM','REPORTING_MANAGER','BU_HEAD']} />}>
              <Route path="/reports" element={<Reports />} />
            </Route>
          </Route>
        </Route>

        {/* 404 fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AppInitializer>
  );
}
