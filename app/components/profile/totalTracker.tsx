import { ProfileData } from "@/app/utils/profile";
import { diffColors } from "@/app/utils/towers";
import { useState } from "react";

interface TotalTrackerProps {
    profileData: ProfileData | null
}

function getTowerAcronym(towerName: string): string {
    return towerName
        .split(' ')
        .map(word => word[0])
        .join('')
}


export default function TotalTracker({ profileData }: TotalTrackerProps) {

    if (profileData) {
        const [hover, setHover] = useState(false);


        const hardestTower = profileData.completed.towers.reduce((hardest, tower) => tower.difficulty > hardest.difficulty ? tower : hardest, profileData.completed.towers[0]);
        const acronym = getTowerAcronym(hardestTower.name);
        const hardestValue = hardestTower.difficulty
        const hardestColor = diffColors[hardestTower.diff_category];
        const scores = Object.values(profileData.review_scores);
        const meanScore = scores.length > 0 ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : 0;




        return (
            <div className="w-120 h-30 flex rounded-2xl bg-zinc-800 ">
                <div className="flex flex-col my-auto mx-auto">
                    <span className="text-3xl text-outline mx-auto">{profileData.completed.count}</span>
                    <span className="text-m text-zinc-400">Completed Towers</span>
                </div>
                <div className="flex flex-col my-auto mx-auto">
                    <span className="text-3xl text-outline mx-auto" style={{ color: hardestColor }} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
                    >
                        {hover ? hardestValue : acronym}
                    </span>
                    <span className="text-m text-zinc-400" >Hardest Tower</span>
                </div>

                <div className="flex flex-col my-auto mx-auto">
                    <span className="text-3xl text-outline mx-auto">
                        {meanScore}
                    </span>
                    <span className="text-m text-zinc-400" >Mean Score</span>
                </div>
            </div>

        );
    }
}