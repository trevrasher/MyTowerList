"use client"
import MainHeader from "@/app/components/mainHeader";
import { useAuth } from "@/app/hooks/useAuth";
import { use, useEffect, useState } from "react";
import { API_BASE_URL } from "@/next.config";

import { getTowerImageUrl } from "@/app/utils/towers";
import { ProfileData } from "@/app/utils/profile";
import TotalTracker from "@/app/components/profile/totalTracker";
import DiffOverview from "@/app/components/profile/diffOverview";
import { diffColors } from "@/app/utils/towers";

interface SelectedReview {
    towerName: string;
    review: string;
    summary: string;
    score: number;
}


export default function ProfilePage({ params }: { params: Promise<{ name: string }> }) {
    const isAuthenticated = useAuth();
    const { name } = use(params);
    const [profileData, setProfileData] = useState<ProfileData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedReview, setSelectedReview] = useState<SelectedReview | null>(null)

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
                <div className="flex">

                    <div className="flex flex-col mx-auto ">
                        <span className="pb-5 text-outline text-3xl">Completed</span>
                        <div className=" bg-zinc-800 p-10 rounded-2xl w-[40vw]">

                            <div className="grid grid-cols-[5vw_20vw_5vw_5vw] gap-4 font-bold mb-5">
                                <span className="text-zinc-300 text-xl"></span>
                                <span className="text-zinc-300 text-xl">Name</span>
                                <span className="text-zinc-300 text-xl">Score</span>
                                <span className="text-zinc-300 text-xl">Review</span>
                            </div>
                            <div className="grid grid-cols-[5vw_20vw_5vw_5vw] gap-4">
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
                                            <img src={getTowerImageUrl(tower.name)} className="h-14 w-14 rounded-md object-cover "></img>
                                            <span className={` mt-4 text-l ${tower.diff_category === 'intense' ? 'text-outline-white' : 'text-outline'}`} style={{ color: diffColors[tower.diff_category] }}>{tower.name}</span>
                                            <span className="text-zinc-300 ml-4 mt-4 ">{profileData?.review_scores[tower.id]}</span>
                                            {profileData?.tower_reviews?.[tower.id] && (
                                                <button
                                                    onClick={() => {
                                                        setSelectedReview({
                                                            towerName: tower.name,
                                                            review: profileData.tower_reviews[tower.id].review_text,
                                                            summary: profileData.tower_reviews[tower.id].summary,
                                                            score: profileData.review_scores[tower.id]
                                                        });
                                                    }}
                                                    className="ml-6 w-6 h-6 mt-4 hover:opacity-70 transition cursor-pointer"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                                                    </svg>
                                                </button>
                                            )}
                                            {!profileData?.tower_reviews?.[tower.id] && <div className="ml-6 w-6 h-6 mt-4"></div>}

                                        </div>
                                    ))
                                }
                            </div>
                        </div>
                    </div>
                    <div className="mt-14 ml-4">
                        <div className="mb-4">
                            <TotalTracker profileData={profileData} />
                        </div>
                        <div className="mb-4">
                            <DiffOverview profileData={profileData} />
                        </div>
                        <span className="pb-5 text-outline text-xl">Planned</span>
                    </div>
                </div>
            </div>
        </div>
    )
}