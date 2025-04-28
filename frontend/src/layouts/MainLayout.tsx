import React from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  return (
    <div className="min-h-screen flex flex-col">
      {isHomePage && <Navbar />}
      {children}
    </div>
  );
};

export default MainLayout; 