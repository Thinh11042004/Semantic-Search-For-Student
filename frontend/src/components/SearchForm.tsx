/// <reference types="react" />
import * as React from 'react';
import { Link } from 'react-router-dom';
// @ts-ignore
import { Search, Filter, SlidersHorizontal, Clock, Star } from 'lucide-react';


// Add JSX namespace declaration to fix linter errors
declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

const SearchForm: React.FC = () => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedFilter, setSelectedFilter] = React.useState('all');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Searching for:', searchQuery);
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
            <div className="flex items-center space-x-4">
              <button className="text-gray-600 hover:text-[#005BAA]">
                <Filter className="h-5 w-5" />
              </button>
              <button className="text-gray-600 hover:text-[#005BAA]">
                <SlidersHorizontal className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Search Forms</h2>
          <p className="text-xl text-gray-600">Find the form you need quickly and easily</p>
        </div>

        {/* Search Section */}
        <div className="max-w-3xl mx-auto mb-12">
          <form onSubmit={handleSearch} className="relative">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-6 w-6 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl text-lg bg-white placeholder-gray-500 focus:outline-none focus:border-[#005BAA] focus:ring-1 focus:ring-[#005BAA]"
                placeholder="Type to search forms..."
              />
            </div>
          </form>
        </div>

        {/* Categories */}
        <div className="mb-12">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Popular Categories</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-4 mb-4">
                <div className="bg-[#005BAA] bg-opacity-10 p-3 rounded-lg">
                  <Star className="h-6 w-6 text-[#005BAA]" />
                </div>
                <h4 className="text-lg font-medium text-gray-900">Most Used Forms</h4>
              </div>
              <p className="text-gray-600">Quick access to frequently used forms</p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-4 mb-4">
                <div className="bg-[#005BAA] bg-opacity-10 p-3 rounded-lg">
                  <Clock className="h-6 w-6 text-[#005BAA]" />
                </div>
                <h4 className="text-lg font-medium text-gray-900">Recent Forms</h4>
              </div>
              <p className="text-gray-600">Your recently accessed forms</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-4 mb-4">
                <div className="bg-[#005BAA] bg-opacity-10 p-3 rounded-lg">
                  <Star className="h-6 w-6 text-[#005BAA]" />
                </div>
                <h4 className="text-lg font-medium text-gray-900">Saved Forms</h4>
              </div>
              <p className="text-gray-600">Forms you've bookmarked</p>
            </div>
          </div>
        </div>

        {/* Recent Searches */}
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Recent Searches</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <h4 className="text-lg font-medium text-[#005BAA] mb-2">Student Registration Form</h4>
                <p className="text-sm text-gray-500">Last searched: 2 hours ago</p>
              </div>
            ))}
          </div>
        </div>
      </main>

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

export default SearchForm; 