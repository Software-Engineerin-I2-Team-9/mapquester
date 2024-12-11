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
}