import { useState } from 'react';
import apiClient from '@/app/api/axios';

interface FollowButtonProps {
  followerId: string;
  followingId: string;
  isFollowing: boolean;
  onFollowChange: (followerCount: number, followingCount: number) => void;
  size?: 'sm' | 'md' | 'lg';

}

const FollowButton: React.FC<FollowButtonProps> = ({ 
  followerId, 
  followingId, 
  isFollowing,
  onFollowChange,
  size = 'md'
}) => {
  const [loading, setLoading] = useState(false);

  console.log("followerId: ", followerId);
  console.log("followingId: ", followingId);

  const handleFollow = async () => {
    setLoading(true);
    try {
      const response = await apiClient.post('/api/v1/users/follow/', {
        followerId,
        followingId
      });
      
      onFollowChange(response.data.followerCount, response.data.followingCount);
    } catch (error) {
      console.error('Error following user:', error);
    } finally {
      setLoading(false);
    }
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg'
  }[size];

  return (
    <button
      onClick={handleFollow}
      disabled={loading}
      className={`${sizeClasses} rounded-full font-semibold ${
        isFollowing 
          ? 'bg-gray-200 text-gray-700 hover:bg-red-100 hover:text-red-600' 
          : 'bg-blue-500 text-white hover:bg-blue-600'
      }`}
    >
      {loading ? 'Loading...' : isFollowing ? 'Unfollow' : 'Follow'}
    </button>
  );
};

export default FollowButton; 