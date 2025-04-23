import * as React from 'react';
import { Link } from 'react-router-dom';

// Add JSX namespace declaration to fix linter errors
declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}

interface NavLink {
  path: string;
  label: string;
}

const navLinks: NavLink[] = [
  { path: '/', label: 'Home' },
  { path: '/search-forms', label: 'Search Forms' },
  { path: '/product', label: 'Product' },
  { path: '/integrations', label: 'Integrations' },
];

const Navbar = () => {
  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center">
              <span className="text-xl font-bold text-[#005BAA]">HUTECH</span>
            </Link>
          </div>

          {/* Menu Links */}
          <div className="hidden md:flex space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="text-base font-medium text-gray-700 hover:text-[#005BAA] transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Get Started Button */}
          <div className="flex items-center">
            <Link
              to="/get-started"
              className="px-5 py-2 bg-[#005BAA] text-white rounded-md font-medium hover:bg-[#004080] transition"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
