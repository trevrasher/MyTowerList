import { Tower } from "./towers";
import { SortState } from "@/app/utils/towers";

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

export function getDiffCategoryCounts(towers: ProfileData['completed']['towers']) {
    const counts: Record<string, number> = {};
    const percentages: Record<string, number> = {};
    const total = towers.length;

    towers.forEach(tower => {
        counts[tower.diff_category] = (counts[tower.diff_category] || 0) + 1;
    });

    Object.entries(counts).forEach(([category, count]) => {
        percentages[category] = total > 0 ? (count / total) * 100 : 0;
    });

    return percentages;
}

export function getTowerAcronym(towerName: string): string {
    return towerName
        .split(' ')
        .map(word => word[0])
        .join('')
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

export function sortCompletedTowers(
  towers: Tower[],
  sortMode: SortState,
  reviewScores: Record<number, number>,
  completedDates: Record<number, string | null> 
) {
  return [...towers].sort((a, b) => {
    const scoreA = reviewScores[a.id];
    const scoreB = reviewScores[b.id];

    if (sortMode === "scoreDown" || sortMode === "scoreUp") {
      const hasScoreA = scoreA !== null && scoreA !== undefined;
      const hasScoreB = scoreB !== null && scoreB !== undefined;

      if (hasScoreA && !hasScoreB) return -1;
      if (!hasScoreA && hasScoreB) return 1;
      if (hasScoreA && hasScoreB) {
        return sortMode === "scoreDown" ? scoreB - scoreA : scoreA - scoreB;
      }
      return 0;
    }

    if (sortMode === "dateDown" || sortMode === "dateUp") {
      const rawA = completedDates?.[a.id];
      const rawB = completedDates?.[b.id];

      const timeA = rawA ? Date.parse(rawA) : NaN;
      const timeB = rawB ? Date.parse(rawB) : NaN;

      const hasA = !Number.isNaN(timeA);
      const hasB = !Number.isNaN(timeB);

      if (hasA && !hasB) return -1;
      if (!hasA && hasB) return 1;
      if (hasA && hasB) {
        return sortMode === "dateDown" ? timeB - timeA : timeA - timeB;
      }
      return 0;
    }

    if (sortMode === "difficultyDown") return b.difficulty - a.difficulty;
    if (sortMode === "difficultyUp") return a.difficulty - b.difficulty;

    return 0;
  });
}