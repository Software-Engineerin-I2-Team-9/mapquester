'use client'

import LogoutButton from '@/app/login/_components/LogoutButton';

const Settings = () => {

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Settings</h1>
      <LogoutButton/>
    </div>
  );
};

export default Settings;
