import * as React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Home: React.FC = () => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#FFF1F1]">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-8">
              <h1 className="text-2xl font-bold text-[#005BAA]">HUTECH</h1>
              <nav className="flex space-x-6">
                <Link to="/" className="text-gray-700 hover:text-[#005BAA]">Home</Link>
                <Link to="/product" className="text-gray-700 hover:text-[#005BAA]">Product</Link>
                <Link to="/search-forms" className="text-gray-700 hover:text-[#005BAA]">Search Forms</Link>
                <a href="#" className="text-gray-700 hover:text-[#005BAA]">Integrations</a>
              </nav>
            </div>
            <div className="flex space-x-4">
              {!isAuthenticated ? (
                <>
                  <Link
                    to="/login"
                    className="text-gray-700 hover:text-[#005BAA] px-4 py-2 rounded-md text-sm font-medium"
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/register"
                    className="bg-[#005BAA] text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-[#004999]"
                  >
                    Sign up
                  </Link>
                </>
              ) : (
                <button
                  onClick={handleLogout}
                  className="text-gray-700 hover:text-[#005BAA] px-4 py-2 rounded-md text-sm font-medium"
                >
                  Log out
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative bg-[#FFF1F1] overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 bg-[#FFF1F1] sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
            <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
              <div className="sm:text-center lg:text-left">
                <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                  <span className="block">Welcome to</span>
                  <span className="block text-[#005BAA]">HUTECH University</span>
                </h1>
                <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                  Discover our comprehensive range of academic programs, research opportunities, and student services.
                </p>
                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                  {!isAuthenticated ? (
                    <div className="rounded-md shadow">
                      <Link
                        to="/register"
                        className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-[#005BAA] hover:bg-[#004999] md:py-4 md:text-lg md:px-10"
                      >
                        Get Started
                      </Link>
                    </div>
                  ) : (
                    <div className="rounded-md shadow">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-[#005BAA] hover:bg-[#004999] md:py-4 md:text-lg md:px-10"
                      >
                        Log out
                      </button>
                    </div>
                  )}
                  <div className="mt-3 sm:mt-0 sm:ml-3">
                    <Link
                      to="/product"
                      className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-[#005BAA] bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10"
                    >
                      View Products
                    </Link>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white mt-12 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <img 
              src="/images/hutech-logo.svg" 
              alt="HUTECH Logo" 
              className="h-12"
            />
            <div className="flex space-x-6">
              <a href="#" className="text-gray-600 hover:text-[#005BAA]">About</a>
              <a href="#" className="text-gray-600 hover:text-[#005BAA]">Contact</a>
              <a href="#" className="text-gray-600 hover:text-[#005BAA]">Help</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home; 