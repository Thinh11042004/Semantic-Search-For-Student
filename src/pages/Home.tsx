import React from 'react';
import { Link } from 'react-router-dom';
import SearchIcon from '../components/icons/SearchIcon';

const Home = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="text-center space-y-8 max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 tracking-tight">
            Semantic Search for Your Documents
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover insights from your documents using advanced semantic search technology
          </p>
          
          {/* Search Box */}
          <div className="mt-8 max-w-2xl mx-auto">
            <div className="flex items-center bg-white border border-gray-300 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="pl-4">
                <SearchIcon />
              </div>
              <input
                type="text"
                placeholder="Search documents..."
                className="w-full px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none"
              />
              <button className="px-6 py-3 bg-black text-white font-medium rounded-r-lg hover:bg-gray-800 transition-colors">
                Search
              </button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-12">
            <Link
              to="/search-forms"
              className="group p-6 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600">
                Search Forms
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                Access our collection of search forms
              </p>
            </Link>
            <Link
              to="/product"
              className="group p-6 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600">
                Product
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                Learn about our product features
              </p>
            </Link>
            <Link
              to="/integrations"
              className="group p-6 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600">
                Integrations
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                Explore available integrations
              </p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
