'use client'

import { useState, useEffect } from 'react';
import { useRecoilState } from 'recoil';
import { authState } from '../atoms/authState';
import LogoutButton from '../login/_components/LogoutButton';
import Footer from '../_components/Footer';
import apiClient from '../api/axios';
import { fetchFollowMetadata } from '../utils/userUtils';
import { UserProfile, FollowMetadata } from '../utils/types';
import { useRouter } from 'next/navigation';
import FollowButton from '@/app/profile/_components/FollowButton'

const Profile = () => {
  const [auth, setAuth] = useRecoilState(authState);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    profile_info: ''
  });
  const [followMetadata, setFollowMetadata] = useState<FollowMetadata>({
    followers: [],
    followings: [],
    followerCount: 0,
    followingCount: 0
  });
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);

  const [showFollowModal, setShowFollowModal] = useState(false);
  const [modalType, setModalType] = useState<'followers' | 'following'>('followers');

  const router = useRouter();

  console.log("auth: ", auth);


  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const [userData, metadata] = await Promise.all([
          apiClient.get(`/api/v1/users/exact-user/${auth.id}/`),
          fetchFollowMetadata(auth.id)
        ]);
        
        setFormData({
          username: userData.data.username || '',
          email: userData.data.email || '',
          profile_info: userData.data.profile_info || ''
        });
        
        setFollowMetadata(metadata);
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

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    try {
      const response = await apiClient.get(`/api/v1/users/user/${searchQuery}/`);
      setSearchResults(response.data.users);
      setIsSearching(true);
    } catch (error) {
      console.error('Error searching users:', error);
    }
  };

  const handleUserClick = (userId: string) => {
    router.push(`/profile/${userId}`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search users..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#C91C1C]"
              />
              <button
                onClick={handleSearch}
                className="absolute right-2 top-1/2 -translate-y-1/2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        <div className="max-w-2xl mx-auto p-4">
          {isSearching ? (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Found {searchResults.length} users</h2>
              {searchResults
                .filter(user => String(user.id) !== String(auth.id))
                .map((user) => (
                  <div
                    key={user.id}
                    className="bg-white rounded-lg shadow p-4 relative"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p 
                        className="text-lg font-bold cursor-pointer"
                        onClick={() => handleUserClick(user.id)}
                      >
                        {user.username}
                      </p>
                      <FollowButton
                        followerId={auth.id}
                        followingId={user.id}
                        isFollowing={followMetadata.followings.some(
                          following => String(following.following__id) === String(user.id)
                        )}                      
                        onFollowChange={async () => {
                          const metadata = await fetchFollowMetadata(auth.id);
                          setFollowMetadata(metadata);
                        }}
                        size="sm"
                      />
                    </div>
                    {user.profile_info && (
                      <p className="text-gray-600">{user.profile_info}</p>
                    )}
                  </div>
                ))}
              <button
                onClick={() => setIsSearching(false)}
                className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200"
              >
                Back to Profile
              </button>
            </div>
          ) : (
            // Your existing profile content here
            <div>
              {/* Profile Card */}
              <div className="bg-white rounded-lg shadow p-6 mb-4">
                <h2 className="text-2xl font-bold mb-4">{formData.username}</h2>
                {formData.profile_info ? (
                  <p className="text-gray-600 mb-4">{formData.profile_info}</p>
                ) : (
                  <p className="text-gray-600 mb-4">No bio yet</p>
                )}
                <div className="flex space-x-4 mb-4">
                  <div
                    className="cursor-pointer hover:text-[#C91C1C]"
                    onClick={() => {
                      setModalType('followers');
                      setShowFollowModal(true);
                    }}
                  >
                    <span className="font-bold">{followMetadata.followerCount}</span> followers
                  </div>
                  <div
                    className="cursor-pointer hover:text-[#C91C1C]"
                    onClick={() => {
                      setModalType('following');
                      setShowFollowModal(true);
                    }}
                  >
                    <span className="font-bold">{followMetadata.followingCount}</span> following
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
          )}
        </div>
      </div>

      {/* Follow Modal */}
  {showFollowModal && (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={() => setShowFollowModal(false)}
      />
      <div className="relative bg-white rounded-lg p-6 mx-4 shadow-xl max-w-[90%] w-[400px] z-10 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">
            {modalType === 'followers' ? 'Followers' : 'Following'}
          </h3>
          <button
            onClick={() => setShowFollowModal(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="space-y-3">
          {modalType === 'followers'
            ? followMetadata.followers.map((follower) => (
                <div key={follower.follower__id} className="flex items-center justify-between">
                  <div
                    className="font-medium cursor-pointer hover:text-[#C91C1C]"
                    onClick={() => {
                      handleUserClick(follower.follower__id);
                      setShowFollowModal(false);
                    }}
                  >
                    {follower.follower__username}
                  </div>
                  <FollowButton
                    followerId={auth.id}
                    followingId={follower.follower__id}
                    isFollowing={followMetadata.followings.some(
                      following => String(following.following__id) === String(follower.follower__id)
                    )}
                    onFollowChange={async () => {
                      const metadata = await fetchFollowMetadata(auth.id);
                      setFollowMetadata(metadata);
                    }}
                    size="sm"
                  />
                </div>
              ))
            : followMetadata.followings.map((following) => (
                <div key={following.following__id} className="flex items-center justify-between">
                  <div
                    className="font-medium cursor-pointer hover:text-[#C91C1C]"
                    onClick={() => {
                      handleUserClick(following.following__id);
                      setShowFollowModal(false);
                    }}
                  >
                    {following.following__username}
                  </div>
                  <FollowButton
                    followerId={auth.id}
                    followingId={following.following__id}
                    isFollowing={true}
                    onFollowChange={async () => {
                      const metadata = await fetchFollowMetadata(auth.id);
                      setFollowMetadata(metadata);
                    }}
                    size="sm"
                  />
                </div>
              ))}
        </div>
      </div>
    </div>
  )}

      {/* Footer */}
      <Footer currentPage="profile" />
    </div>
  );
};

export default Profile;
