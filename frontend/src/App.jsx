import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import ProtectedRoute from './auth/ProtectedRoute';
import AppLayout from './layout/AppLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import VehicleList from './pages/VehicleList';
import VehicleDetail from './pages/VehicleDetail';
import ServiceRecordList from './pages/ServiceRecordList';
import ServiceRecordDetail from './pages/ServiceRecordDetail';
import BulkUpload from './pages/BulkUpload';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/vehicles" element={<VehicleList />} />
            <Route path="/vehicles/:id" element={<VehicleDetail />} />
            <Route path="/service-records" element={<ServiceRecordList />} />
            <Route path="/service-records/:id" element={<ServiceRecordDetail />} />
            <Route
              path="/bulk-upload"
              element={
                <ProtectedRoute allowedRoles={['FLEET_MANAGER']}>
                  <BulkUpload />
                </ProtectedRoute>
              }
            />
          </Route>

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}