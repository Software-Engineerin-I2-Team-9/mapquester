export interface Point {
    name: string;
    longitude: number;
    latitude: number;
    description: string;
    tag: "food" | "event" | "school" | "photo" | "music" | "";
}