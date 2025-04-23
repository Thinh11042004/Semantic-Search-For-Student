import * as React from 'react';
import { Link, useLocation } from 'react-router-dom';

// Add JSX namespace declaration to fix linter errors
declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

const Navbar = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const links = [
    { name: 'Home', path: '/' },
    { name: 'Seach Forms', path: '/search-forms' },
    { name: 'Product', path: '/product' },
    { name: 'Integrations', path: '/integrations' },
  ];

  return (
    <nav className="bg-pink-50 px-8 py-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            {links.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-gray-700 hover:text-black transition-colors ${
                  currentPath === link.path ? "font-bold" : ""
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
