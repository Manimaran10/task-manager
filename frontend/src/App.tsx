import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';

// Layouts
import MainLayout from './layouts/MainLayout';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
// import Tasks from './pages/Tasks';

// Components
import ProtectedRoute from './components/ProtectedRoute';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <div className="min-h-screen bg-gray-50">
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected routes */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <MainLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Dashboard />} />
                {/* <Route path="tasks" element={<Tasks />} /> */}
                <Route path="tasks/assigned" element={<div>My Tasks</div>} />
                <Route path="tasks/created" element={<div>Created Tasks</div>} />
                <Route path="tasks/overdue" element={<div>Overdue Tasks</div>} />
                <Route path="team" element={<div>Team</div>} />
                <Route path="reports" element={<div>Reports</div>} />
                <Route path="settings" element={<div>Settings</div>} />
              </Route>

              {/* Catch all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>

            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  duration: 3000,
                  style: {
                    background: '#10B981',
                  },
                },
                error: {
                  duration: 4000,
                  style: {
                    background: '#EF4444',
                  },
                },
              }}
            />
          </div>
        </AuthProvider>
      </Router>
      
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;