import * as React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import SearchForm from './components/SearchForm';
import Product from './components/Product';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Protected Route component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route 
            path="/search-forms" 
            element={
              <ProtectedRoute>
                <SearchForm />
              </ProtectedRoute>
            } 
          />
          <Route path="/product" element={<Product />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
