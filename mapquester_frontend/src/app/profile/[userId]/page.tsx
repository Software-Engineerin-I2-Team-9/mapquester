'use client'

import { useState, useEffect } from 'react';
import { useRecoilValue } from 'recoil';
import { useRouter } from 'next/navigation';
import { authState } from '@/app/atoms/authState';
import apiClient from '@/app/api/axios';
import FollowButton from '../_components/FollowButton';
import Footer from '@/app/_components/Footer';
import { fetchFollowMetadata } from '@/app/utils/userUtils';
import { UserProfile, FollowMetadata } from '@/app/utils/types';

const DEV_MODE = true; // Toggle between dev and prod mode

// Dummy data for development
const DUMMY_USER = {
  id: "123",
  username: "john_doe",
  profile_info: "Travel enthusiast | Photography lover | Coffee addict"
};

const DUMMY_FOLLOWERS = {
  followers: [
    {
      follower__id: "456",
      follower__username: "alice_wonder",
      follower__email: "alice@example.com"
    },
    {
      follower__id: "789",
      follower__username: "bob_builder",
      follower__email: "bob@example.com"
    },
    {
      follower__id: "current_user", // This will be used to check if current user is following
      follower__username: "current_user",
      follower__email: "current@example.com"
    }
  ]
};

const DUMMY_FOLLOWINGS = {
  followings: [
    {
      following__id: "111",
      following__username: "charlie_brown",
      following__email: "charlie@example.com"
    },
    {
      following__id: "222",
      following__username: "diana_prince",
      following__email: "diana@example.com"
    }
  ]
};

export default function Profile({ params }: { params: { userId: string } }) {
  const router = useRouter();
  const auth = useRecoilValue(authState);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [followMetadata, setFollowMetadata] = useState<FollowMetadata>({
    followers: [],
    followings: [],
    followerCount: 0,
    followingCount: 0
  });
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (DEV_MODE) {
        setProfile(DUMMY_USER);
        setFollowMetadata({
          followers: DUMMY_FOLLOWERS.followers,
          followings: DUMMY_FOLLOWINGS.followings,
          followerCount: DUMMY_FOLLOWERS.followers.length,
          followingCount: DUMMY_FOLLOWINGS.followings.length
        });
        setIsFollowing(DUMMY_FOLLOWERS.followers.some(
          follower => follower.follower__id === auth.id
        ));
        return;
      }

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
  }, [params.userId, auth.id]);

  const handleFollowChange = async () => {
    if (DEV_MODE) {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (isFollowing) {
        // Remove current user from followers
        const updatedFollowers = DUMMY_FOLLOWERS.followers.filter(
          follower => follower.follower__id !== auth.id
        );
        setFollowMetadata(prev => ({
          ...prev,
          followerCount: updatedFollowers.length
        }));
      } else {
        // Add current user to followers
        DUMMY_FOLLOWERS.followers.push({
          follower__id: auth.id,
          follower__username: "current_user",
          follower__email: "current@example.com"
        });
        setFollowMetadata(prev => ({
          ...prev,
          followerCount: DUMMY_FOLLOWERS.followers.length
        }));
      }
      setIsFollowing(!isFollowing);
      return;
    }

    // Production mode
    const metadata = await fetchFollowMetadata(params.userId);
    setFollowMetadata(metadata);
    setIsFollowing(!isFollowing);
  };

  if (!profile) return <div>Loading...</div>;

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
            {auth.id !== params.userId && (
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