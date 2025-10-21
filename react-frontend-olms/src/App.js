import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import LoadingSpinner from './components/common/LoadingSpinner';
import ErrorBoundary from './components/common/ErrorBoundary';
import PerformanceMonitor from './components/common/PerformanceMonitor';
import { useWebVitals } from './hooks/usePerformance';
import './styles/global.css';
import './styles/components.css';
import './styles/pages.css';

// Import critical pages (loaded immediately for better UX)
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';

// Lazy load pages for code splitting and better performance
const Home = React.lazy(() => import('./pages/Home'));

// User pages (lazy loaded)
const UserDashboard = React.lazy(() => import('./pages/User/UserDashboard'));
const BookCatalog = React.lazy(() => import('./pages/User/BookCatalog'));
const BorrowedBooks = React.lazy(() => import('./pages/User/BorrowedBooks'));
const DonateBook = React.lazy(() => import('./pages/User/DonateBook'));
const SellBook = React.lazy(() => import('./pages/User/SellBook'));

// Admin pages (lazy loaded)
const AdminDashboard = React.lazy(() => import('./pages/Admin/AdminDashboard'));
const BookManagement = React.lazy(() => import('./pages/Admin/BookManagement'));
const UserManagement = React.lazy(() => import('./pages/Admin/UserManagement'));
const DonationManagement = React.lazy(() => import('./pages/Admin/DonationManagement'));
const SalesManagement = React.lazy(() => import('./pages/Admin/SalesManagement'));
const BorrowedBooksTracking = React.lazy(() => import('./pages/Admin/BorrowedBooksTracking'));

function App() {
  // Initialize Web Vitals monitoring
  useWebVitals();

  return (
    <ErrorBoundary>
      <AuthProvider>
        <ToastProvider>
          <Router>
            <div className="App">
              <Suspense fallback={<LoadingSpinner />}>
                <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            
            {/* Authentication routes - redirect if already logged in */}
            <Route 
              path="/login" 
              element={
                <ProtectedRoute requireAuth={false}>
                  <Login />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/register" 
              element={
                <ProtectedRoute requireAuth={false}>
                  <Register />
                </ProtectedRoute>
              } 
            />

            {/* User protected routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <UserDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/books" 
              element={
                <ProtectedRoute>
                  <BookCatalog />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/my-books" 
              element={
                <ProtectedRoute>
                  <BorrowedBooks />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/donate" 
              element={
                <ProtectedRoute>
                  <DonateBook />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/sell" 
              element={
                <ProtectedRoute>
                  <SellBook />
                </ProtectedRoute>
              } 
            />

            {/* Admin protected routes */}
            <Route 
              path="/admin/dashboard" 
              element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/books" 
              element={
                <ProtectedRoute requireAdmin={true}>
                  <BookManagement />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/users" 
              element={
                <ProtectedRoute requireAdmin={true}>
                  <UserManagement />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/donations" 
              element={
                <ProtectedRoute requireAdmin={true}>
                  <DonationManagement />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/sales" 
              element={
                <ProtectedRoute requireAdmin={true}>
                  <SalesManagement />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/borrowed-books" 
              element={
                <ProtectedRoute requireAdmin={true}>
                  <BorrowedBooksTracking />
                </ProtectedRoute>
              } 
            />

            {/* Legacy route redirects */}
            <Route path="/user-dashboard" element={<Navigate to="/dashboard" replace />} />
            <Route path="/admin-dashboard" element={<Navigate to="/admin/dashboard" replace />} />

            {/* Catch all route - redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Suspense>
              <PerformanceMonitor />
            </div>
          </Router>
        </ToastProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
