import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import DashboardPage from '../pages/DashboardPage';
import CompaniesPage from '../pages/CompaniesPage';
import TasksPage from '../pages/TasksPage';
import WorkerDashboardPage from '../pages/WorkerDashboardPage';
import UsersPage from '../pages/UsersPage';
import ProtectedRoute from '../components/ProtectedRoute';
import ReportsPage from '../pages/ReportsPage';
import CompanyDistributionPage from '../pages/CompanyDistributionPage';
import TaskCategoriesPage from '../pages/TaskCategoriesPage';
import ProfilePage from '../pages/ProfilePage';

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={ <LoginPage /> } />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/companies"
          element={
            <ProtectedRoute>
              <CompaniesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/companies/distribute"
          element={
            <ProtectedRoute>
              <CompanyDistributionPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/task-categories"
          element={
            <ProtectedRoute>
              <TaskCategoriesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-tasks"
          element={
            <ProtectedRoute>
              <TasksPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/worker-dashboard"
          element={
            <ProtectedRoute>
              <WorkerDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <ReportsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/users"
          element={
            <ProtectedRoute>
              <UsersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={ <Navigate to="/login" replace /> } />
        <Route path="*" element={ <Navigate to="/login" replace /> } />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
