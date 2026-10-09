import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Layout from './components/Layout';
import DashboardPage from './pages/DashboardPage';

// Authentication
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ForbiddenPage from './pages/ForbiddenPage';

// Players Pages
import AllPlayersPage from './pages/AllPlayersPage';
import CreatePlayerPage from './pages/CreatePlayerPage';
import EditPlayerPage from './pages/EditPlayerPage';
import ActivePlayersPage from './pages/ActivePlayersPage';
import BlockedPlayersPage from './pages/BlockedPlayersPage';
import PlayerDetailPage from './pages/PlayerDetailPage';

// Games Pages
import AllGamesPage from './pages/AllGamesPage';
import CreateGamePage from './pages/CreateGamePage';
import EditGamePage from './pages/EditGamePage';
import GameDetailPage from './pages/GameDetailPage';
import LiveGamesPage from './pages/LiveGamesPage';
import GameHistoryPage from './pages/SimpleGameHistoryPage';
import GameSessionDetailPage from './pages/GameSessionDetailPage';

// Transactions Pages
import DepositsPage from './pages/DepositsPage';
import WithdrawalsPage from './pages/WithdrawalsPage';
import WithdrawalDetailPage from './pages/WithdrawalDetailPage';
import TransactionHistoryPage from './pages/TransactionHistoryPage';

// Reports Pages
import PlayerReportsPage from './pages/PlayerReportsPage';
import GameReportsPage from './pages/GameReportsPage';
import FinancialReportsPage from './pages/FinancialReportsPage';

// Settings Page
import SettingsPage from './pages/SettingsPage';

// Payments Pages
import PaymentGatewayPage from './pages/PaymentGatewayPage';
import UpiQrPaymentsPage from './pages/UpiQrPaymentsPage';
import PaymentSettingsPage from './pages/PaymentSettingsPage';

// Compliance & KYC Module
import KycDashboard from './modules/kyc/pages/KycDashboard';

// Context & Providers
import { ToastProvider } from './context/ToastContext';


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 5000,
    },
  },
});

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
            <Routes>
              {/* Root redirect to /admin index controller */}
              <Route path="/" element={<Navigate to="/admin" replace />} />

              {/* Public Admin Login Route */}
              <Route path="/admin/login" element={<LoginPage />} />
              <Route path="/admin/forgot-password" element={<ForgotPasswordPage />} />

              {/* Protected Admin Shell */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <Layout isBackendConnected />
                  </ProtectedRoute>
                }
              >
                {/* Index route: /admin -> /admin/dashboard */}
                <Route index element={<Navigate to="dashboard" replace />} />

                {/* Overview */}
                <Route path="dashboard" element={<DashboardPage />} />

                {/* Players */}
                <Route path="players" element={<AllPlayersPage />} />
                <Route path="players/new" element={<CreatePlayerPage />} />
                <Route path="players/active" element={<ActivePlayersPage />} />
                <Route path="players/blocked" element={<BlockedPlayersPage />} />
                <Route path="players/:playerId" element={<PlayerDetailPage />} />
                <Route path="players/:playerId/edit" element={<EditPlayerPage />} />

                {/* Games Management Module */}
                <Route path="games" element={<AllGamesPage />} />
                <Route path="games/new" element={<CreateGamePage />} />
                <Route path="games/:gameId" element={<GameDetailPage />} />
                <Route path="games/:gameId/edit" element={<EditGamePage />} />
                <Route path="games/live" element={<LiveGamesPage />} />
                <Route path="games/history" element={<GameHistoryPage />} />
                <Route path="games/history/:sessionId" element={<GameSessionDetailPage />} />

                {/* Payments Module */}
                <Route path="payments/gateway" element={<PaymentGatewayPage />} />
                <Route path="payments/upi" element={<UpiQrPaymentsPage />} />
                <Route path="payments/settings" element={<PaymentSettingsPage />} />

                {/* Transactions */}
                <Route path="transactions/deposits" element={<DepositsPage />} />
                <Route path="transactions/withdrawals" element={<WithdrawalsPage />} />
                <Route path="transactions/withdrawals/:withdrawalId" element={<WithdrawalDetailPage />} />
                <Route path="transactions/history" element={<TransactionHistoryPage />} />

                {/* Compliance & KYC */}
                <Route path="compliance/kyc" element={<KycDashboard />} />

                {/* Reports */}
                <Route path="reports/players" element={<PlayerReportsPage />} />
                <Route path="reports/games" element={<GameReportsPage />} />
                <Route path="reports/financial" element={<FinancialReportsPage />} />

                {/* Settings & Sub-tabs */}
                <Route path="settings" element={<SettingsPage />} />
                <Route path="settings/profile" element={<SettingsPage />} />
                <Route path="settings/security" element={<SettingsPage />} />
                <Route path="settings/activity" element={<SettingsPage />} />

                {/* 403 Forbidden Page */}
                <Route path="403" element={<ForbiddenPage />} />

                {/* In-Admin Fallback */}
                <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
              </Route>

              {/* Legacy route fallbacks */}
              <Route path="/players/*" element={<Navigate to="/admin/players" replace />} />
              <Route path="/games/*" element={<Navigate to="/admin/games" replace />} />
              <Route path="/payments/*" element={<Navigate to="/admin/payments/gateway" replace />} />
              <Route path="/transactions/*" element={<Navigate to="/admin/transactions/history" replace />} />
              <Route path="/compliance/*" element={<Navigate to="/admin/compliance/kyc" replace />} />
              <Route path="/reports/*" element={<Navigate to="/admin/reports/financial" replace />} />
              <Route path="/settings/*" element={<Navigate to="/admin/settings" replace />} />

              {/* Global Fallback */}
              <Route path="*" element={<Navigate to="/admin" replace />} />
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
