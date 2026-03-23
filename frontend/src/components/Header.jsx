import React from 'react';
import { useNavigate } from 'react-router-dom';

function Header({ role }) {
  const navigate = useNavigate();

  // Enhanced role-based color schemes with gradients and effects
  const colorSchemes = {
    admin: {
      bg: 'bg-gradient-to-r from-blue-600 to-blue-700',
      text: 'text-white',
      shadow: 'shadow-lg',
      hover: 'hover:from-blue-700 hover:to-blue-800',
    },
    user: {
      bg: 'bg-gradient-to-r from-green-600 to-green-700',
      text: 'text-white',
      shadow: 'shadow-lg',
      hover: 'hover:from-green-700 hover:to-green-800',
    },
    driver: {
      bg: 'bg-gradient-to-r from-yellow-500 to-yellow-600',
      text: 'text-black',
      shadow: 'shadow-lg',
      hover: 'hover:from-yellow-600 hover:to-yellow-700',
    }
  };

  const colors = colorSchemes[role] || colorSchemes.user;

  const handleLogout = () => {
    if (role === 'admin') {
      navigate('/admin/login');
    } else if (role === 'user') {
      navigate('/login');
    } else if (role === 'driver') {
      navigate('/login');
    } else {
      navigate('/login');
    }
  };

  return (
    <header className={`flex justify-between items-center ${colors.bg} p-4 ${colors.shadow}`}>
      <div className={`text-lg font-semibold ${colors.text} select-none`}>Smart Waste Management System</div>
      <div className="flex items-center space-x-4">
        <button
          onClick={handleLogout}
          className={`bg-white font-semibold px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition duration-300`}
          aria-label="Logout"
          style={{ color: colors.text.includes('text-white') ? '#1e40af' : colors.text.includes('text-black') ? '#000000' : '#065f46' }}
        >
          Logout
        </button>

      </div>
    </header>
  );
}

export default Header;
