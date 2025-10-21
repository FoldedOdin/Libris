import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import './styles/global.css';
import './styles/components.css';
import './styles/pages.css';

// Import page components
import Home from './pages/Home';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';

// User pages
import UserDashboard from './pages/User/UserDashboard';
import BookCatalog from './pages/User/BookCatalog';
import BorrowedBooks from './pages/User/BorrowedBooks';
import DonateBook from './pages/User/DonateBook';
import SellBook from './pages/User/SellBook';

// Admin pages
import AdminDashboard from './pages/Admin/AdminDashboard';
import BookManagement from './pages/Admin/BookManagement';
import UserManagement from './pages/Admin/UserManagement';
import DonationManagement from './pages/Admin/DonationManagement';
import SalesManagement from './pages/Admin/SalesManagement';
import BorrowedBooksTracking from './pages/Admin/BorrowedBooksTracking';

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <div className="App">
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
          </div>
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
