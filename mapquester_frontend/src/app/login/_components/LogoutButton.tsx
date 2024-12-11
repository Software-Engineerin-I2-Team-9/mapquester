import React from 'react';
import apiClient from '@/app/api/axios';

const logout = async () => {
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    const accessToken = localStorage.getItem('accessToken');

    if (!refreshToken || !accessToken) {
      // If tokens are missing, just clear everything
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('id');
      window.location.href = '/login';
      return;
    }

    const response = await apiClient.post('/api/v1/users/logout/', {
      refresh_token: refreshToken
    }, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    // Handle both successful status codes
    if (response.status === 205 || response.status === 200) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('id');
      window.location.href = '/login';
    }
  } catch (error) {
    console.error('Logout error:', error);
    // Even if the logout request fails, clear local storage and redirect
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('id');
    window.location.href = '/login';
  }
};

interface LogoutButtonProps {
  className?: string;
}

const LogoutButton: React.FC<LogoutButtonProps> = ({ className }) => {
  const handleLogout = async () => {
    await logout();
  };

  return (
    <button 
      className={className} 
      onClick={handleLogout}
    >
      Logout
    </button>
  );
}

export default LogoutButton;
