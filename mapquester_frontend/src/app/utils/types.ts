export interface Point {
    id: string;
    userId: string;
    username: string;
    title: string;
    description: string;
    latitude: number;
    longitude: number;
    tag: "food" | "event" | "school" | "photo" | "music";
    isPublic?: boolean;
    content?: Array<{
        filename: string;
        data: File;
    }>;
    user?: string;
    created_at?: string;
    updated_at?: string;
}

export interface ReactionUser {
    id: string;
    username: string;
    createdAt: string;
}

export interface UserProfile {
    id: string;
    username: string;
    profile_info?: string;
  }
  
export interface Follower {
      follower__id: string;
      follower__username: string;
      follower__email: string;
    }
  
export interface Following {
      following__id: string;
      following__username: string;
      following__email: string;
    }
    
export interface FollowMetadata {
      followers: Follower[];
      followings: Following[];
      followerCount: number;
      followingCount: number;
  }