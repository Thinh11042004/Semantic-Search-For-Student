import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Add JSX namespace declaration to fix linter errors
declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

const Navbar: React.FC = () => {
  const location = useLocation();
  const { isAuthenticated, logout, user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);




  return (
    <nav className="bg-blue-600 shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-3">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 transition transform hover:scale-105 duration-300">
            <div className="bg-white text-blue-600 font-bold rounded-full h-8 w-8 flex items-center justify-center">
              <span>H</span>
            </div>
            <span className="text-xl font-bold text-white tracking-wide">HUTECH Search</span>
          </Link>

          {/* Mobile menu button */}
          <button 
            className="md:hidden text-white focus:outline-none"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <NavLink to="/search-forms" current={location.pathname}>Search</NavLink>            
            {isAuthenticated && (
              <>
                <NavLink to="/history" current={location.pathname}>History</NavLink>
                <NavLink to="/user-profile" current={location.pathname}>Profile</NavLink>
                {user?.role === "admin" && (
                      <NavLink to="/product" current={location.pathname}>Product</NavLink> 
                )}
                {/* Logout Button */}
                <button 
                  onClick={logout} 
                  className="flex items-center space-x-1 ml-2 px-5 py-2 text-white rounded-lg bg-blue-500 hover:bg-blue-400 transition-all duration-300 transform hover:scale-105"
                >
                  <span>Logout</span>
                  <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
                
                {user && (
                  <div className="ml-3 bg-blue-500 text-white rounded-lg px-3 py-1 font-medium shadow-md transition transform hover:scale-105 duration-300">
              {(user && user.name) ? user.name.split(' ').map(n => n[0]).join('') : "?"}


                  </div>
                )}
              </>
            )}
            
            {!isAuthenticated && (
              <>
                <NavLink to="/login" current={location.pathname}>Login</NavLink>
                <NavLink to="/register" current={location.pathname} highlighted={true}>Register</NavLink>
              </>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-blue-500 animate-fadeDown">
            <Link 
              to="/search-forms" 
              className={`block py-2 px-4 text-white transition-all duration-300 ${location.pathname === '/search-forms' ? 'bg-blue-500 rounded-lg font-bold' : 'hover:bg-blue-500 hover:translate-x-2 hover:rounded-lg'}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Search
            </Link>
            <Link 
              to="/product" 
              className={`block py-2 px-4 text-white transition-all duration-300 ${location.pathname === '/product' ? 'bg-blue-500 rounded-lg font-bold' : 'hover:bg-blue-500 hover:translate-x-2 hover:rounded-lg'}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Product
            </Link>
            
            {isAuthenticated ? (
              <>
                <Link 
                  to="/history" 
                  className={`block py-2 px-4 text-white transition-all duration-300 ${location.pathname === '/history' ? 'bg-blue-500 rounded-lg font-bold' : 'hover:bg-blue-500 hover:translate-x-2 hover:rounded-lg'}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  History
                </Link>
                <Link 
                  to="/user-profile" 
                  className={`block py-2 px-4 text-white transition-all duration-300 ${location.pathname === '/user-profile' ? 'bg-blue-500 rounded-lg font-bold' : 'hover:bg-blue-500 hover:translate-x-2 hover:rounded-lg'}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Profile
                </Link>
                
                {/* Mobile Logout Button */}
                <button 
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }} 
                  className="flex items-center justify-between w-full text-left py-2 px-4 text-white transition-all duration-300 bg-blue-500 my-2 rounded-lg hover:bg-blue-400"
                >
                  <span>Logout</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className={`block py-2 px-4 text-white transition-all duration-300 ${location.pathname === '/login' ? 'bg-blue-500 rounded-lg font-bold' : 'hover:bg-blue-500 hover:translate-x-2 hover:rounded-lg'}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className={`block py-2 px-4 text-white transition-all duration-300 ${location.pathname === '/register' ? 'bg-blue-500 rounded-lg font-bold' : 'bg-blue-400 hover:bg-blue-500 hover:rounded-lg'}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Register
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

interface NavLinkProps {
  to: string;
  current: string;
  children: React.ReactNode;
  highlighted?: boolean;
  special?: boolean;
}

const NavLink: React.FC<NavLinkProps> = ({ to, current, children, highlighted }) => {
  const isActive = current === to;
  
  return (
    <Link 
      to={to} 
      className={`
        py-2 px-4 transition-all duration-300 rounded-lg
        ${isActive 
          ? 'bg-blue-500 text-white font-medium shadow-sm' 
          : highlighted 
            ? 'bg-blue-500 text-white hover:bg-blue-400' 
            : 'text-white hover:bg-blue-500 transform hover:scale-105'
        }
      `}
    >
      {children}
    </Link>
  );
};

export default Navbar;
