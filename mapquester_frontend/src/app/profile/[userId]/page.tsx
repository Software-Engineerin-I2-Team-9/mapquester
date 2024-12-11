'use client'

import { useState, useEffect } from 'react';
import { useRecoilState } from 'recoil';
import { useRouter } from 'next/navigation';
import { authState } from '@/app/atoms/authState';
import apiClient from '@/app/api/axios';
import FollowButton from '../_components/FollowButton';
import Footer from '@/app/_components/Footer';
import { fetchFollowMetadata } from '@/app/utils/userUtils';
import { UserProfile, FollowMetadata } from '@/app/utils/types';

export default function Profile({ params }: { params: { userId: string } }) {
  const router = useRouter();
  const [auth, setAuth] = useRecoilState(authState);
  const [isAuthLoaded, setIsAuthLoaded] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [followMetadata, setFollowMetadata] = useState<FollowMetadata>({
    followers: [],
    followings: [],
    followerCount: 0,
    followingCount: 0
  });
  const [isFollowing, setIsFollowing] = useState(false);

  console.log("auth: ", auth);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    const id = localStorage.getItem('id');
  
    if (!token || !refreshToken || !id) {
      router.push('/login');
      return;
    }

    setAuth({
      isLoggedIn: true,
      id,
      accessToken: token,
      refreshToken: refreshToken
    });
    
    setIsAuthLoaded(true);
  }, [router, setAuth]);

  useEffect(() => {
    if (!isAuthLoaded) return;

    const fetchProfile = async () => {
      try {
        const [profileRes, metadata] = await Promise.all([
          apiClient.get(`/api/v1/users/exact-user/${params.userId}/`),
          fetchFollowMetadata(params.userId),
        ]);

        setProfile(profileRes.data);
        setFollowMetadata(metadata);
        setIsFollowing(metadata.followers.some(
          (follower: any) => follower.follower__id.toString() === auth.id
        ));
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };
    
    fetchProfile();
  }, [params.userId, auth.id, isAuthLoaded]);

  const handleFollowChange = async () => {
    // Production mode
    const metadata = await fetchFollowMetadata(params.userId);
    setFollowMetadata(metadata);
    setIsFollowing(!isFollowing);
  };

  if (!isAuthLoaded || !profile) return <div>Loading...</div>;

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center">
          <button 
            onClick={() => router.back()}
            className="mr-4 text-gray-600 hover:text-gray-800"
          >
            ←
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        <div className="max-w-2xl mx-auto p-4">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold mb-4">{profile.username}</h2>
            {profile.profile_info && (
              <p className="text-gray-600 mb-4">{profile.profile_info}</p>
            )}
            <div className="flex space-x-4 mb-4">
              <div>
                <span className="font-bold">{followMetadata.followerCount}</span> followers
              </div>
              <div>
                <span className="font-bold">{followMetadata.followingCount}</span> following
              </div>
            </div>
            {auth.id && auth.id !== params.userId && (
              <FollowButton
                followerId={auth.id}
                followingId={params.userId}
                isFollowing={isFollowing}
                onFollowChange={handleFollowChange}
              />
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
} 