import InfiniteScroll from "react-infinite-scroll-component";
import { useState } from "react";
import { useEffect } from "react";
import { API_BASE_URL } from "@/next.config";
import { Tower } from "../utils/towers";
import ViewReviewModal from "./viewReviewModal";
import ReviewModal from "./reviewModal";

interface Review {
    id: number;
    profile: {
        username: string;
        roblox_user_id: number;
        avatar_url: string;
    };
    score: number;
    review_text: string;
    summary: string;
}

interface ReviewsProps {
    isAuthenticated: boolean;
    towerStatus: string;
    userReview: Review | null;
    tower: Tower

}



export default function Reviews({
    isAuthenticated,
    towerStatus,
    userReview,
    tower
}: ReviewsProps) {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [selectedReview, setSelectedReview] = useState<Review | null>(null);
    const [reviewsNextUrl, setReviewsNextUrl] = useState<string | null>(null);
    const [hasMoreReviews, setHasMoreReviews] = useState(true);
    const [reviewWindow, setReviewWindow] = useState(false);

    useEffect(() => {
        async function fetchReviews() {
            if (!tower) return;

            try {
                const url = `${API_BASE_URL}/api/towers/${tower.id}/reviews/?limit=5`;
                const res = await fetch(url);
                const data = await res.json();

                setReviews(data.results || []);
                setReviewsNextUrl(data.next);
                setHasMoreReviews(Boolean(data.next));
            } catch (error) {
                console.error('Failed to fetch reviews:', error);
            }
        }
        fetchReviews();
    }, [tower]);

    const fetchMoreReviews = async () => {
        if (!reviewsNextUrl) return;

        try {
            const res = await fetch(reviewsNextUrl);
            const data = await res.json();

            setReviews(prev => [...prev, ...(data.results || [])]);
            setReviewsNextUrl(data.next);
            setHasMoreReviews(Boolean(data.next));
        } catch (error) {
            console.error('Failed to fetch more reviews:', error);
        }
    };
    return (
        <div className="w-80 h-80 md:w-100 bg-zinc-900 border-white border-2 rounded-md">
            <div className="w-full h-10 flex justify-between items-center px-4 border-b border-white">
                <span className="text-xl text-outline">Reviews</span>
                {isAuthenticated && towerStatus == "completed" && !userReview && <button className="bg-zinc-700 px-2 py-1 rounded-md hover:bg-zinc-500" onClick={() => setReviewWindow(true)}>Write a Review</button>}
                {isAuthenticated && towerStatus == "completed" && userReview && <button className="bg-blue-600 px-2 py-1 rounded-md hover:bg-blue-500" onClick={() => setSelectedReview(userReview)}>View My Review</button>}
            </div>

            <div id="reviews-scrollable" className="h-65 overflow-y-auto">
                <InfiniteScroll
                    dataLength={reviews.length}
                    next={fetchMoreReviews}
                    hasMore={hasMoreReviews}
                    loader={<div className="text-center py-2">Loading...</div>}
                    scrollableTarget="reviews-scrollable"
                >
                    {reviews.map((review) => (
                        <div
                            key={review.id}
                            className="pt-4 pl-4 pr-4 border-b border-zinc-700 cursor-pointer hover:bg-zinc-800 transition"
                            onClick={() => setSelectedReview(review)}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    {review.profile.avatar_url && (
                                        <img
                                            src={review.profile.avatar_url}
                                            alt={`${review.profile.username}'s avatar`}
                                            className="h-12 w-12 border-2 border-white rounded-md"
                                        />
                                    )}
                                    <span className="text-xl font-bold text-outline">{review.profile.username}</span>
                                </div>
                                <span className="text-yellow-500">{review.score}/100</span>
                            </div>
                            {review.summary && (
                                <div className="overflow-x-auto pb-3">
                                    <p className="text-sm font-semibold text-outline whitespace-nowrap">{review.summary}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </InfiniteScroll>
            </div>
            {reviewWindow && (
                <ReviewModal
                    onClose={() => setReviewWindow(false)}
                    towerId={tower.id}
                />
            )}
            {selectedReview && (
                <ViewReviewModal
                    review={selectedReview}
                    towerId={tower.id}
                    isOwnReview={userReview?.id === selectedReview.id}
                    onClose={() => setSelectedReview(null)}
                />
            )}
        </div>

    )

}
