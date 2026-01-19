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
}