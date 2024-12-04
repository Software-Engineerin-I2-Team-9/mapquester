export interface Point {
    id: string;
    title: string;
    longitude: number;
    latitude: number;
    description: string;
    tag: "food" | "event" | "school" | "photo" | "music";
}