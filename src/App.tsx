import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ClientLoginPage } from './pages/auth/ClientLoginPage';
import { AdminLoginPage } from './pages/auth/AdminLoginPage';
import { ClientDashboardPage } from './pages/client/ClientDashboardPage';
import { AdminDashboardOverviewPage } from './pages/admin/AdminDashboardOverviewPage';
import { AdminClientsPage } from './pages/admin/AdminClientsPage';
import { AdminClientDetailPage } from './pages/admin/AdminClientDetailPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminLayout } from './components/layout/AdminLayout';
import { ProtectedRoute } from './routes/ProtectedRoute';

function RootRedirect() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-apple-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-apple-blue" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={user.role === 'admin' ? '/admin' : '/cliente'} replace />;
}

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Rota Raiz com redirecionamento inteligente */}
          <Route path="/" element={<RootRedirect />} />

          {/* Rotas de Login Separadas */}
          <Route path="/login" element={<ClientLoginPage />} />
          <Route path="/login/cliente" element={<Navigate to="/login" replace />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />

          {/* Área do Cliente (Protegida) */}
          <Route
            path="/cliente/*"
            element={
              <ProtectedRoute allowedRole="client">
                <ClientDashboardPage />
              </ProtectedRoute>
            }
          />

          {/* Área do Administrador com Menu Lateral (Sidebar) */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRole="admin">
                <AdminLayout>
                  <AdminDashboardOverviewPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRole="admin">
                <AdminLayout>
                  <AdminDashboardOverviewPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/clientes"
            element={
              <ProtectedRoute allowedRole="admin">
                <AdminLayout>
                  <AdminClientsPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/clientes/:clientId"
            element={
              <ProtectedRoute allowedRole="admin">
                <AdminLayout>
                  <AdminClientDetailPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/usuarios"
            element={
              <ProtectedRoute allowedRole="admin">
                <AdminLayout>
                  <AdminUsersPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
