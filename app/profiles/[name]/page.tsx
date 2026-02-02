"use client"
import MainHeader from "@/app/components/mainHeader";
import { useAuth } from "@/app/hooks/useAuth";
import { use, useEffect, useState } from "react";
import { API_BASE_URL } from "@/next.config";
import { getTowerImageUrl, diffColors, redirectToTower, SortState } from "@/app/utils/towers";
import { ProfileData } from "@/app/utils/profile";
import TotalTracker from "@/app/components/profile/totalTracker";
import DiffOverview from "@/app/components/profile/diffOverview";
import ViewReviewModal from "@/app/components/viewReviewModal";
import { useRouter } from "next/navigation";
import SortingTowerButton from "@/app/components/sortingTowerButton";
import { fetchWithAuth } from "@/app/utils/auth";



interface SelectedReview {
    towerId: number;
    profile: {
        username: string;
        avatar_url: string | null
    };
    score: number;
    summary: string;
    review_text: string;
}


export default function ProfilePage({ params }: { params: Promise<{ name: string }> }) {
    const router = useRouter();
    const isAuthenticated = useAuth();
    const { name } = use(params);
    const [profileData, setProfileData] = useState<ProfileData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedReview, setSelectedReview] = useState<SelectedReview | null>(null);
    const [sortMode, setSortMode] = useState<SortState>("scoreDown");
    const [isOwnProfile, setIsOwnProfile] = useState(false);

    const sortedCompleted = profileData?.completed.towers
        ? [...profileData.completed.towers].sort((a, b) => {
            const scoreA = profileData.review_scores[a.id];
            const scoreB = profileData.review_scores[b.id];

            if (sortMode === "scoreDown" || sortMode === "scoreUp") {
                const hasScoreA = scoreA !== undefined;
                const hasScoreB = scoreB !== undefined;

                if (hasScoreA && !hasScoreB) return -1;
                if (!hasScoreA && hasScoreB) return 1;
                if (hasScoreA && hasScoreB) {
                    return sortMode === "scoreDown" ? scoreB - scoreA : scoreA - scoreB;
                }
                return 0;
            }

            if (sortMode === "difficultyDown") return b.difficulty - a.difficulty;
            if (sortMode === "difficultyUp") return a.difficulty - b.difficulty;

            return 0;
        })
        : [];


    useEffect(() => {
        async function fetchCurrentUser() {
            if (!isAuthenticated || !name) return;
            try {
                const me = await fetchWithAuth(`${API_BASE_URL}/api/profile/`);
                setIsOwnProfile(me.username?.toLowerCase() === name.toLowerCase());
            } catch {
                setIsOwnProfile(false);
            }
        }
        fetchCurrentUser();
    }, [isAuthenticated, name]);

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
                <div className="flex justify-start items-center pb-7">
                    {profileData?.avatar_url && <img src={profileData?.avatar_url} className="w-24 h-24 border-2 rounded-md mr-5 "></img>}
                    <span className=" text-4xl text-outline">{name}</span>
                </div>
                <div className="flex">
                    <div className="flex flex-col mx-auto -mt-3">

                        <div className="w-[40vw] flex flex-col">
                            <div className="flex">
                                <span className="text-2xl text-outline my-auto">Completed</span>
                                <div className="ml-auto mb-2">
                                    <SortingTowerButton sortMode={sortMode} setSortMode={setSortMode} />
                                </div>
                            </div>

                            <div className="bg-zinc-900 rounded-2xl border-2">
                                <div className="flex items-center gap-4 font-bold mb-3 px-2 mt-1 border-b">
                                    <span className="h-14 w-14"></span>
                                    <span className="text-zinc-300 text-xl text-outline ml-5">Name</span>
                                    <span className="text-zinc-300 text-xl text-outline ml-auto">Score</span>
                                    <span className="text-zinc-300 text-xl text-outline ml-4 mr-5">Review</span>
                                </div>
                                <div className="flex flex-col gap-2 w-full">
                                    {sortedCompleted.map((tower) => (
                                        <div
                                            key={tower.id}
                                            className="flex items-center gap-4 rounded-xl px-2 py-2 hover:bg-zinc-800 w-full hover:cursor-pointer"
                                            onClick={() => redirectToTower(tower.name, router)}
                                        >
                                            <img src={getTowerImageUrl(tower.name)} className="h-14 w-14 rounded-md object-cover ml-5 border-1 border-black"></img>
                                            <span className={` text-l ${tower.diff_category === 'intense' ? 'text-outline-white' : 'text-outline'} `} style={{ color: diffColors[tower.diff_category] }}>{tower.name}</span>
                                            <span className="text-zinc-300 text-outline-gold ml-auto mr-10 ">{profileData?.review_scores[tower.id]}</span>
                                            {profileData?.tower_reviews?.[tower.id] && (
                                                <div className="relative group ml-4 w-6 h-6 mr-11">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSelectedReview({
                                                                towerId: tower.id,
                                                                profile: {
                                                                    username: profileData.username || name,
                                                                    avatar_url: profileData.avatar_url
                                                                },
                                                                score: profileData.review_scores[tower.id],
                                                                summary: profileData.tower_reviews[tower.id].summary,
                                                                review_text: profileData.tower_reviews[tower.id].review_text
                                                            });
                                                        }}
                                                        className="w-6 h-6 transition cursor-pointer z-50"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                                                        </svg>
                                                    </button>
                                                    <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block bg-zinc-800 text-white text-md rounded px-3 py-2 whitespace-nowrap border border-zinc-600 z-50 pointer-events-none">
                                                        {profileData.tower_reviews[tower.id].summary}
                                                    </div>
                                                </div>
                                            )}
                                            {!profileData?.tower_reviews?.[tower.id] && <div className="ml-4 w-6 h-6 mr-11"></div>}

                                        </div>
                                    ))}
                                </div>
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
                        {!!profileData?.bookmarked.count && (
                            <div className="flex flex-col">
                                <span className="mb-2 text-outline text-xl">Planned</span>

                                <div className="flex flex-col gap-2 rounded-2xl bg-zinc-900">
                                    {profileData?.bookmarked.towers.map((tower) => (
                                        <div
                                            key={tower.id}
                                            className="flex items-center gap-4 rounded-2xl px-2 py-2  hover:bg-zinc-800 hover:cursor-pointer"
                                            onClick={() => redirectToTower(tower.name, router)}
                                        >
                                            <img
                                                className="h-14 w-14 rounded-md object-cover border-1 border-black "
                                                src={getTowerImageUrl(tower.name)}
                                            />
                                            <span
                                                className={`${tower.diff_category === "intense" ? "text-outline-white" : "text-outline"}`}
                                                style={{ color: diffColors[tower.diff_category] }}
                                            >
                                                {tower.name}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>


                        )}
                        {!!profileData?.ignored.count && (
                            <div className="flex flex-col mt-4">
                                <span className="mb-2 text-outline text-xl">Ignored</span>

                                <div className="flex flex-col gap-2 rounded-2xl bg-zinc-900">
                                    {profileData?.ignored.towers.map((tower) => (
                                        <div
                                            key={tower.id}
                                            className="flex items-center gap-4 rounded-2xl px-2 py-2  hover:bg-zinc-800 hover:cursor-pointer"
                                            onClick={() => redirectToTower(tower.name, router)}
                                        >
                                            <img
                                                className="h-14 w-14 rounded-md object-cover border-1 border-black"
                                                src={getTowerImageUrl(tower.name)}
                                            />
                                            <span
                                                className={`${tower.diff_category === "intense" ? "text-outline-white" : "text-outline"}`}
                                                style={{ color: diffColors[tower.diff_category] }}
                                            >
                                                {tower.name}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>


                        )}
                    </div>
                </div>
            </div>
            {selectedReview && (
                <ViewReviewModal
                    review={selectedReview}
                    towerId={selectedReview.towerId}
                    isOwnReview={isOwnProfile}
                    onClose={() => setSelectedReview(null)}
                />
            )}
        </div>
    )
}