import apiClient from '../api/axios';

export const fetchFollowMetadata = async (userId: string) => {
  try {
    const [followersRes, followingsRes] = await Promise.all([
      apiClient.get(`/api/v1/users/${userId}/followers_or_followings/?mode=followers`),
      apiClient.get(`/api/v1/users/${userId}/followers_or_followings/?mode=followings`)
    ]);

    return {
      followers: followersRes.data.followers || [],
      following: followingsRes.data.followings || [],
      followerCount: followersRes.data.followers?.length || 0,
      followingCount: followingsRes.data.followings?.length || 0
    };
  } catch (error) {
    console.error('Error fetching follow counts:', error);
    return { followers: [], following: [], followerCount: 0, followingCount: 0 };
  }
}; 