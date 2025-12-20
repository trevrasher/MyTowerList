"use client"
import MainHeader from "@/app/components/mainHeader";
import { useAuth } from "@/app/hooks/useAuth";
import { use, useEffect, useState } from "react";
import { API_BASE_URL } from "@/next.config";
import { Tower } from "@/app/utils/towers";
import ErrorPopup from "@/app/components/errorPopup";
import { getTowerImageUrl } from "@/app/utils/towers";

interface ProfileData {
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


export default function ProfilePage({ params }: { params: Promise<{ name: string }> }) {
    const isAuthenticated = useAuth();
    const { name } = use(params);
    const [profileData, setProfileData] = useState<ProfileData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchProfileData() {
            if (!name) return;

            try {
                const url = `${API_BASE_URL}/api/profile/user/${name}/`;
                const res = await fetch(url);
                const data = await res.json();

                if (!res.ok) {
                    setError(data.error || 'Failed to load profile');
                    return;
                }

                setProfileData(data);
            } catch (err) {
                setError('Failed to load profile');
            } finally {
                setLoading(false);
            }
        }

        fetchProfileData();
    }, [name]);


    return (
        <div>
            <MainHeader isAuthenticated={isAuthenticated} />
            <div className="flex flex-col w-[60vw] mx-auto">
                <div className="flex justify-start items-center pb-10">
                    {profileData?.avatar_url && <img src={profileData?.avatar_url} className="w-24 h-24 border-2 rounded-md mr-5 "></img>}
                    <span className=" text-4xl text-outline">{name}</span>
                </div>
                <div className="flex flex-col mx-auto ">
                    <span className="pb-5 text-outline text-3xl">Completed</span>
                    <div className=" bg-zinc-800 p-10 rounded-2xl w-[40vw]">

                        <div className="grid grid-cols-[5vw_25vw_5vw] gap-4 font-bold mb-10">
                            <span className="text-zinc-300 text-xl">Image</span>
                            <span className="text-zinc-300 text-xl">Tower Name</span>
                            <span className="text-zinc-300 text-xl">Score</span>

                        </div>
                        <div className="grid grid-cols-[5vw_25vw_5vw] gap-4">
                            {profileData?.completed.towers
                                .sort((a, b) => {
                                    const scoreA = profileData.review_scores[a.id];
                                    const scoreB = profileData.review_scores[b.id];
                                    const hasScoreA = scoreA !== undefined;
                                    const hasScoreB = scoreB !== undefined;

                                    if (hasScoreA && !hasScoreB) return -1;
                                    if (!hasScoreA && hasScoreB) return 1;


                                    if (hasScoreA && hasScoreB) {
                                        return scoreB - scoreA;
                                    }

                                    return 0;
                                })
                                .map((tower) => (
                                    <div key={tower.id} className="contents">
                                        <img src={getTowerImageUrl(tower.name)} className="h-15 w-11 rounded-md"></img>
                                        <span className="text-zinc-300 mt-4">{tower.name}</span>
                                        <span className="text-zinc-300">{profileData?.review_scores[tower.id]}</span>

                                    </div>
                                ))
                            }
                        </div>
                    </div>
                </div>
            </div>

        </div>
    )
}