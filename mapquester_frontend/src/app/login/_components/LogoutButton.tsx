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
