'use client'

import LogoutButton from '@/app/login/_components/LogoutButton';
import Footer from '../_components/Footer';

const Settings = () => {

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="flex-1">
        <h1 className="text-2xl font-semibold text-gray-800 mb-6">Settings</h1>
        <LogoutButton/>
      </div>
      <Footer currentPage="profile" />
    </div>
  );
};

export default Settings;
