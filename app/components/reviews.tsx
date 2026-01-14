import InfiniteScroll from "react-infinite-scroll-component";

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
    reviews: Review[];
    hasMoreReviews: boolean;
    fetchMoreReviews: () => Promise<void>;
    setReviewWindow: (open: boolean) => void;
    setSelectedReview: (review: Review | null) => void;
}

export default function Reviews({
    isAuthenticated,
    towerStatus,
    userReview,
    reviews,
    hasMoreReviews,
    fetchMoreReviews,
    setReviewWindow,
    setSelectedReview
}: ReviewsProps) {
    return(
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
    </div>
    )
}
