import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Teachers from './pages/Teachers';
import Students from './pages/Students';
import Classes from './pages/Classes';
import MyClasses from './pages/MyClasses';
import Sessions from './pages/Sessions';
import StudentProfile from './pages/StudentProfile';
import './App.css';

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
      
      <Route path="/" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      
      {/* Admin Routes */}
      <Route path="/teachers" element={
        <ProtectedRoute requiredRole="admin">
          <Teachers />
        </ProtectedRoute>
      } />
      <Route path="/students" element={
        <ProtectedRoute requiredRole="admin">
          <Students />
        </ProtectedRoute>
      } />
      <Route path="/classes" element={
        <ProtectedRoute requiredRole="admin">
          <Classes />
        </ProtectedRoute>
      } />
      
      {/* Teacher Routes */}
      <Route path="/my-classes" element={
        <ProtectedRoute requiredRole="teacher">
          <MyClasses />
        </ProtectedRoute>
      } />
      <Route path="/sessions" element={
        <ProtectedRoute requiredRole="teacher">
          <Sessions />
        </ProtectedRoute>
      } />
      
      <Route path="/students/:id" element={
        <ProtectedRoute>
          <StudentProfile />
        </ProtectedRoute>
      } />
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <div className="App">
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
          <Toaster
            position="top-right"
            theme="dark"
            toastOptions={{
              style: {
                background: '#1A0B2E',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#F4F0FA',
                borderRadius: '0'
              }
            }}
          />
        </BrowserRouter>
      </AuthProvider>
    </div>
  );
}

export default App;
