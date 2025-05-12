import * as React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import SearchForms from './pages/SearchForms';
import Product from './components/Product';  
import Login from './pages/Login';
import Register from './pages/Register';
import AdminRequired from './components/AdminRequired';
import UserProfile from './components/UserProfile';
import AdminHistory from './components/AdminHistory';
import UserHistory  from './components/UserHistory';
import MainLayout from './components/MainLayout';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import OpenFile from './pages/OpenFile'; 


const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {

    const checkAuth = async () => {
      await new Promise(resolve => setTimeout(resolve, 300)); 
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
    return <Navigate to="/login" />;
  }
  
  return <>{children}</>;
};


const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  console.log("🔒 AdminRoute - user:", user);
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (user?.role !== "admin") {
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
            <Route path="/" element={<SearchForms />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/get-started" element={<Navigate to="/register" />} />
            <Route path="/search-forms" element={<SearchForms />} />

            {/* Admin routes */}
            <Route path="/product" 
              element={
                <AdminRoute>
                  <Product />
                </AdminRoute>
              } 
            />
            <Route path="/admin-history" 
              element={
                // <AdminRoute>
                  <AdminHistory />
                /* </AdminRoute> */
              } 
            />

            {/* User routes */}
            <Route path="/user-profile" 
              element={
                <ProtectedRoute>
                  <UserProfile />
                </ProtectedRoute>
              } 
            />
            <Route path="/user-history" 
              element={
                <ProtectedRoute>
                  <UserHistory />
                </ProtectedRoute>
              } 
            />

            {/* Redirect routes */}
            <Route path="/admin-required" element={<AdminRequired />} />
            <Route path="/open-file/:id" element={<OpenFile />} />
          </Routes>
        </MainLayout>
      </Router>
    </AuthProvider>
  );
};

export default App;
