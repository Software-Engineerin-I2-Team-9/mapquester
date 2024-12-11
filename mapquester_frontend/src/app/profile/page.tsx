'use client'

import { useState, useEffect } from 'react';
import { useRecoilState } from 'recoil';
import { authState } from '../atoms/authState';
import LogoutButton from '../login/_components/LogoutButton';
import Footer from '../_components/Footer';
import apiClient from '../api/axios';
import { fetchFollowCounts } from '../utils/userUtils';

const Settings = () => {
  const [auth, setAuth] = useRecoilState(authState);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    profile_info: ''
  });
  const [followCounts, setFollowCounts] = useState({
    followerCount: 0,
    followingCount: 0
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const [userData, counts] = await Promise.all([
          apiClient.get(`/api/v1/users/exact-user/${auth.id}/`),
          fetchFollowCounts(auth.id)
        ]);
        
        setFormData({
          username: userData.data.username || '',
          email: userData.data.email || '',
          profile_info: userData.data.profile_info || ''
        });
        
        setFollowCounts(counts);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    if (auth.id) {
      fetchUserData();
    }
  }, [auth.id]);

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post('/api/v1/users/edit-profile/', formData);
      setAuth({ ...auth, ...formData });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete your account? This cannot be undone.')) {
      try {
        await apiClient.post('/api/v1/users/delete-account/');
        setAuth({ isLoggedIn: false, id: '', accessToken: '', refreshToken: '' });
      } catch (error) {
        console.error('Error deleting account:', error);
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <h1 className="text-center text-lg font-semibold">Profile</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        <div className="max-w-2xl mx-auto p-4">
          {/* Profile Card */}
          <div className="bg-white rounded-lg shadow p-6 mb-4">
            <h2 className="text-2xl font-bold mb-4">{formData.username}</h2>
            {formData.profile_info ? (
              <p className="text-gray-600 mb-4">{formData.profile_info}</p>
            ) : (
              <p className="text-gray-600 mb-4">No bio yet</p>
            )}
            <div className="flex space-x-4 mb-4">
              <div>
                <span className="font-bold">{followCounts.followerCount}</span> followers
              </div>
              <div>
                <span className="font-bold">{followCounts.followingCount}</span> following
              </div>
            </div>
            <button
              onClick={() => setIsEditing(true)}
              className="w-full bg-[#C91C1C] text-white px-4 py-2 rounded-md hover:bg-red-700"
            >
              Edit Profile
            </button>
          </div>

          {/* Edit Form */}
          {isEditing && (
            <div className="bg-white rounded-lg shadow p-6 mb-4">
              <form onSubmit={handleEdit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Username</label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#C91C1C] focus:border-[#C91C1C]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#C91C1C] focus:border-[#C91C1C]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Bio</label>
                  <textarea
                    value={formData.profile_info}
                    onChange={(e) => setFormData(prev => ({ ...prev, profile_info: e.target.value }))}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#C91C1C] focus:border-[#C91C1C]"
                    rows={3}
                  />
                </div>
                <div className="flex space-x-2">
                  <button
                    type="submit"
                    className="flex-1 bg-[#C91C1C] text-white px-4 py-2 rounded-md hover:bg-red-700"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Account Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="space-y-4">
              <LogoutButton className="w-full bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600" />
              <button
                onClick={handleDelete}
                className="w-full bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer currentPage="profile" />
    </div>
  );
};

export default Settings;
