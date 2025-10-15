import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();

  const linkClasses = (path) =>
    `block px-4 py-2 rounded-lg transition ${location.pathname === path
      ? 'bg-gray-200 text-gray-900 font-semibold'
      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
    }`;

  return (
    <div className="h-screen w-64 bg-white text-gray-900 flex flex-col p-6">
      <h1 className="text-xl font-bold text-gray-900 mb-8">My App</h1>
      <nav>
        <ul className="space-y-4">
          <li>
            <Link to="/profile" className={linkClasses('/profile')}>
              Profile
            </Link>
          </li>
          <li>
            <Link to="/dashboard" className={linkClasses('/dashboard')}>
              Dashboard
            </Link>
          </li>
          <li>
            <Link to="/admin" className={linkClasses('/admin')}>Admin</Link>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;