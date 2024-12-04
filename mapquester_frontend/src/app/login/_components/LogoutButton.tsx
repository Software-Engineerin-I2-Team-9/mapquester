import React from 'react';
import apiClient from '@/app/api/axios';

const logout = async () => {
  try {
    const refreshToken = localStorage.getItem('refreshToken');

    const response = await apiClient.post('/api/v1/users/logout/', {
      refresh_token: refreshToken
    }, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      }
    });

    if (response.status === 205) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('id');

      window.location.href = '/login';
    }
  } catch {
    // Silently handle the error or implement proper error handling if needed
  }
};

function LogoutButton() {
  const handleLogout = async () => {
    await logout();
  };

  return (
    <button 
      className="py-2 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded transition duration-300 shadow-md" 
      onClick={handleLogout}
    >
      Logout
    </button>
  );
}

export default LogoutButton;
