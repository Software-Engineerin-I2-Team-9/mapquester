import { useState } from 'react';
import apiClient from '@/app/api/axios';

interface FollowButtonProps {
  followerId: string;
  followingId: string;
  isFollowing: boolean;
  onFollowChange: (followerCount: number, followingCount: number) => void;
}

const FollowButton: React.FC<FollowButtonProps> = ({ 
  followerId, 
  followingId, 
  isFollowing,
  onFollowChange 
}) => {
  const [loading, setLoading] = useState(false);

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

  return (
    <button
      onClick={handleFollow}
      disabled={loading}
      className={`px-4 py-2 rounded-full font-semibold ${
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