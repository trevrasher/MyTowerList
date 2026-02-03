import { Tower } from "./towers";

export interface ProfileData {
    roblox_user_id: number | null;
    username: string;
    avatar_url: string | null;
    completed: {
        count: number;
        towers: Tower[];
    };
    bookmarked: {
        count: number;
        towers: Tower[];
    };
    ignored: {
        count: number;
        towers: Tower[];
    };
    review_scores: Record<number, number>;
    tower_reviews: Record<number, { review_text: string; summary: string }>;
    completed_dates: Record<number, string | null>;
}

export function convertTimestamp(timestamp?: string | null): string {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) return "";

    const month = date.toLocaleString("en-US", { month: "short", timeZone: "UTC" });
    const day = date.getUTCDate();
    const year = String(date.getUTCFullYear());

    return `${month} ${day} ${year}`;
}