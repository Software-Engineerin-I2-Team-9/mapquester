import apiClient from '../api/axios';
import { FollowMetadata } from './types';

export const fetchFollowMetadata = async (userId: string): Promise<FollowMetadata> => {
  try {
    const [followersRes, followingsRes] = await Promise.all([
      apiClient.get(`/api/v1/users/${userId}/followers_or_followings/?mode=followers`),
      apiClient.get(`/api/v1/users/${userId}/followers_or_followings/?mode=followings`)
    ]);

    return {
      followers: followersRes.data.followers || [],
      followings: followingsRes.data.followings || [],
      followerCount: followersRes.data.followers?.length || 0,
      followingCount: followingsRes.data.followings?.length || 0
    };
  } catch (error) {
    console.error('Error fetching follow counts:', error);
    return { followers: [], followings: [], followerCount: 0, followingCount: 0 };
  }
}; 