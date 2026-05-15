import { ProfileData, getDiffCategoryCounts } from "@/app/utils/profile"
import { diffColors } from "@/app/utils/towers";

interface DiffOverviewProps {
    profileData: ProfileData | null
}

export default function DiffOverview({ profileData }: DiffOverviewProps) {
    const nonScCount = profileData?.completed.towers.filter(tower => tower.difficulty < 8).length ?? 0;
    const scCount = profileData?.completed.towers.filter(tower => tower.difficulty >= 8).length ?? 0;
    const diffPercentage = profileData ? getDiffCategoryCounts(profileData.completed.towers) : {};
    return (
        <div>
            <div className="w-120 h-30 flex flex-col rounded-2xl bg-zinc-900 ">
                <div className="flex mt-6">
                    <div className="flex flex-col my-auto mx-auto">
                        <span className="text-3xl text-outline mx-auto">{nonScCount}</span>
                        <span className="text-m text-zinc-400">Non-SC</span>
                    </div>


                    <div className="flex flex-col my-auto mx-auto">
                        <span className="text-3xl text-outline mx-auto">
                            {scCount}
                        </span>
                        <span className="text-m text-zinc-400" >SC</span>
                    </div>
                </div>
                <div className="w-full h-4 flex rounded-2xl overflow-hidden bg-zinc-900 mt-auto border-2 border-black">
                    {Object.keys(diffColors)
                        .filter(category => diffPercentage[category] > 0)
                        .map(category => (
                            <div
                                key={category}
                                style={{
                                    width: `${diffPercentage[category]}%`,
                                    backgroundColor: diffColors[category]
                                }}
                                title={`${category}: ${diffPercentage[category].toFixed(1)}%`}
                            />
                        ))}
                </div>

            </div>
        </div>
    )
}