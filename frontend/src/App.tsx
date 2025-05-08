import * as React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import SearchForms from './pages/SearchForms';
import Product from './components/Product';  
import Login from './pages/Login';
import Register from './pages/Register';
import AdminRequired from './components/AdminRequired';
import UserProfile from './components/UserProfile';
import SearchHistory from './components/SearchHistory';
import MainLayout from './components/MainLayout';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AdminRoute from './components/AdminRoute';

// Protected Route component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    // Check if auth has been initialized
    const checkAuth = async () => {
      await new Promise(resolve => setTimeout(resolve, 300)); // Brief delay to ensure auth state is loaded
      setLoading(false);
    };
    checkAuth();
  }, []);
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1976d2]"></div>
    </div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/admin-required" />;
  }
  
  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <MainLayout>
          <Routes>
            <Route 
              path="/" 
              element={<SearchForms />} 
            />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/get-started" element={<Navigate to="/register" />} />
            <Route 
              path="/search-forms" 
              element={<SearchForms />} 
            />
            
            <Route path="/product" 
              element={
                      <AdminRoute>
                      <Product />
                      </AdminRoute>
              } 
            />
            
            <Route path="/user-profile" 
              element={
                <ProtectedRoute>
                      <UserProfile />
                 </ProtectedRoute>
              } 
            />
            
            <Route path="/history" 
              element={
                <ProtectedRoute>
                      <SearchHistory />
                </ProtectedRoute>
              } 
            />
            
            <Route path="/admin-required" element={<AdminRequired />} />
          
          </Routes>
        </MainLayout>
      </Router>
    </AuthProvider>
  );
};

export default App;
