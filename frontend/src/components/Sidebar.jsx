import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';




const menuItems = {
  admin: [
    { name: 'Dashboard', path: '/admin/dashboard' },
    { name: 'Bin Management', path: '/admin/tasks' },
    { name: 'Complaint Management', path: '/admin/vehicles' },
    { name: 'Driver Management', path: '/admin/employees' },
    { name: 'Admin Profile', path: '/admin/alerts' },
    { name: 'Logout', path: '/logout', isLogout: true },
  ],
  user: [
    { name: 'Dashboard', path: '/user/dashboard' },
    { name: 'My Complaints', path: '/user/complaints' },
    { name: 'Profile', path: '/user/profile' },
    { name: 'Logout', path: '/logout', isLogout: true },
  ],
  driver: [
    { name: 'Dashboard', path: '/driver/dashboard' },
    { name: 'Completed Tasks', path: '/driver/tasks' },
    { name: 'Profile', path: '/driver/profile' },
    { name: 'Logout', path: '/logout', isLogout: true },
  ],
};

function Sidebar({ role, isOpen: propIsOpen, setIsOpen: propSetIsOpen }) {
  const [isOpen, setIsOpen] = useState(propIsOpen !== undefined ? propIsOpen : true);
  const [openMenu, setOpenMenu] = useState(null);
  const items = menuItems[role] || [];

  // Use prop values if provided, otherwise use internal state
  const effectiveIsOpen = propIsOpen !== undefined ? propIsOpen : isOpen;
  const effectiveSetIsOpen = propSetIsOpen !== undefined ? propSetIsOpen : setIsOpen;

  // Role-based color schemes
  const colorSchemes = {
    admin: {
      primary: 'blue',
      secondary: 'gray',
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      hover: 'hover:bg-blue-100',
      active: 'bg-blue-200',
      focus: 'focus:ring-blue-400'
    },
    user: {
      primary: 'green',
      secondary: 'orange',
      bg: 'bg-green-50',
      text: 'text-green-700',
      hover: 'hover:bg-green-100',
      active: 'bg-green-200',
      focus: 'focus:ring-green-400'
    },
    driver: {
      primary: 'yellow',
      secondary: 'black',
      bg: 'bg-yellow-50',
      text: 'text-yellow-700',
      hover: 'hover:bg-yellow-100',
      active: 'bg-yellow-200',
      focus: 'focus:ring-yellow-400'
    }
  };

  const colors = colorSchemes[role] || colorSchemes.user; // default to user if role not found

  return (
    <>
      {/* Hamburger button removed - using the one from AdminDashboard component */}

      {/* Sidebar */}
      <aside
        className={`${colors.bg} shadow-md min-h-screen p-4 w-64 fixed z-20 transition-all duration-300 ease-in-out transform ${
          effectiveIsOpen ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0 pointer-events-none'
        }`}
      >
        {/* Smart Waste title removed since it's already in the top bar */}
        <nav className="flex flex-col space-y-2">
          {items.map((item) => (
            item.isLogout ? (
              <button
                key={item.path}
                onClick={() => {
                  localStorage.removeItem('user');
                  localStorage.removeItem('token');
                  window.location.href = '/';
                }}
                className={`block px-4 py-2 rounded ${colors.hover} text-gray-700 w-full text-left`}
              >
                {item.name}
              </button>
            ) : (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `block px-4 py-2 rounded ${colors.hover} ${
                    isActive ? `${colors.active} font-semibold` : 'text-gray-700'
                  }`
                }
              >
                {item.name}
              </NavLink>
            )
          ))}
        </nav>
      </aside>
    </>
  );
}

export default Sidebar;

