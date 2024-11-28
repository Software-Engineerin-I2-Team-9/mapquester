export interface Point {
    id: string;
    name: string;
    longitude: number;
    latitude: number;
    description: string;
    tag: "food" | "event" | "school" | "photo" | "music";
}