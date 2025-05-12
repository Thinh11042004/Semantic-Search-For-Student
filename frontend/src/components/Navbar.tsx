import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar: React.FC = () => {
  const location = useLocation();
  const { isAuthenticated, logout, user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getLinkClass = (targetPath: string) =>
    `block py-2 px-4 text-white transition-all duration-300 ${
      location.pathname === targetPath
        ? 'bg-blue-500 rounded-lg font-bold'
        : 'hover:bg-blue-500 hover:translate-x-2 hover:rounded-lg'
    }`;

  return (
    <nav className="bg-blue-600 shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-3">
          <Link to="/search-forms" className="flex items-center space-x-2 transition transform hover:scale-105 duration-300">
            <div className="bg-white text-blue-600 font-bold rounded-full h-8 w-8 flex items-center justify-center">
              <span>H</span>
            </div>
            <span className="text-xl font-bold text-white tracking-wide">HUTECH Search</span>
          </Link>

          <button
            className="md:hidden text-white focus:outline-none"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          <div className="hidden md:flex items-center space-x-4">
            <Link to="/search-forms" className={getLinkClass('/search-forms')}>Search</Link>
            {isAuthenticated && (
              <>
                <Link
                  to={user?.role === 'admin' ? '/admin-history' : '/user-history'}
                  className={getLinkClass(user?.role === 'admin' ? '/admin-history' : '/user-history')}
                >
                  History
                </Link>
                <Link to="/user-profile" className={getLinkClass('/user-profile')}>Profile</Link>
                {user?.role === 'admin' && (
                  <Link to="/product" className={getLinkClass('/product')}>Product</Link>
                )}
                <button
                  onClick={logout}
                  className="ml-2 px-5 py-2 text-white rounded-lg bg-blue-500 hover:bg-blue-400 transition-all duration-300 transform hover:scale-105 flex items-center"
                >
                  Logout
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
                <div className="ml-3 bg-blue-500 text-white rounded-lg px-3 py-1 font-medium shadow-md">
                {user && user.name ? user.name.split(' ').map(n => n[0]).join('') : "?"}
                </div>
              </>
            )}
            {!isAuthenticated && (
              <>
                <Link to="/login" className={getLinkClass('/login')}>Login</Link>
                <Link to="/register" className={getLinkClass('/register')}>Register</Link>
              </>
            )}
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-blue-500 animate-fadeDown">
            <Link to="/search-forms" className={getLinkClass('/search-forms')} onClick={() => setMobileMenuOpen(false)}>Search</Link>
            {isAuthenticated && (
              <>
                <Link
                  to={user?.role === 'admin' ? '/admin-history' : '/user-history'}
                  className={getLinkClass(user?.role === 'admin' ? '/admin-history' : '/user-history')}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  History
                </Link>
                <Link to="/user-profile" className={getLinkClass('/user-profile')} onClick={() => setMobileMenuOpen(false)}>Profile</Link>
                {user?.role === 'admin' && (
                  <Link to="/product" className={getLinkClass('/product')} onClick={() => setMobileMenuOpen(false)}>Product</Link>
                )}
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left py-2 px-4 text-white transition-all duration-300 bg-blue-500 my-2 rounded-lg hover:bg-blue-400"
                >
                  Logout
                </button>
              </>
            )}
            {!isAuthenticated && (
              <>
                <Link to="/login" className={getLinkClass('/login')} onClick={() => setMobileMenuOpen(false)}>Login</Link>
                <Link to="/register" className={getLinkClass('/register')} onClick={() => setMobileMenuOpen(false)}>Register</Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
