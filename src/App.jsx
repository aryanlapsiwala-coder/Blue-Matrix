import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { AppLayout } from './components/layout/AppLayout';

import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { KnowledgeBase } from './pages/KnowledgeBase';
import { Contribute } from './pages/Contribute';
import { Chat } from './pages/Chat';
import { Placements } from './pages/Placements';
import { Leaderboard } from './pages/Leaderboard';
import { EquipmentWiki } from './pages/EquipmentWiki';
import { Admin } from './pages/Admin';
import { Profile } from './pages/Profile';
import { Privileges } from './pages/Privileges';
import { NotFound } from './pages/NotFound';

import { ROUTES } from './constants/routes';
import { ROLES } from './constants/roles';

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Authentication Routes */}
          <Route path="/" element={<Navigate to={ROUTES.LOGIN} replace />} />
          <Route path={ROUTES.LOGIN} element={<Login />} />
          <Route path={ROUTES.REGISTER} element={<Register />} />

          {/* Protected Application Routes with Standard App Layout */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
            <Route path={ROUTES.KNOWLEDGE_BASE} element={<KnowledgeBase />} />
            <Route path={ROUTES.CONTRIBUTE} element={<Contribute />} />
            <Route path={ROUTES.CHAT} element={<Chat />} />
            <Route path={ROUTES.PLACEMENTS} element={<Placements />} />
            <Route path={ROUTES.LEADERBOARD} element={<Leaderboard />} />
            <Route path={ROUTES.EQUIPMENT} element={<EquipmentWiki />} />
            <Route path={ROUTES.PRIVILEGES} element={<Privileges />} />
            <Route path={ROUTES.PROFILE} element={<Profile />} />

            {/* Admin Protected Route (Restricted strictly to ADMIN role) */}
            <Route
              path={ROUTES.ADMIN}
              element={
                <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                  <Admin />
                </ProtectedRoute>
              }
            />

            {/* 404 Fallback */}
            <Route path={ROUTES.NOT_FOUND} element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
