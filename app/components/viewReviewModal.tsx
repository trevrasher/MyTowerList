interface ViewReviewModalProps {
    onClose: () => void;
    review: {
        id: number;
        profile: {
            username: string;
            avatar_url?: string;
        };
        score: number;
        summary?: string;
        review_text?: string;
    };
}


export default function ViewReviewModal({ onClose, review }: ViewReviewModalProps) {
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
            <div className="w-[90vw] md:w-[60vw] max-h-[80vh] bg-zinc-800 flex flex-col rounded-md border-2 border-white p-6" onClick={(e) => e.stopPropagation()}>
                
                <div className="flex justify-between items-center mb-4 pb-4 border-b border-zinc-600">
                    <div className="flex items-center gap-3">
                        {review.profile.avatar_url && (
                            <img 
                                src={review.profile.avatar_url} 
                                alt={`${review.profile.username}'s avatar`}
                                className="h-12 w-12 border-2 border-white rounded-md"
                            />
                        )}
                        <span className="text-2xl font-bold text-outline">{review.profile.username}</span>
                    </div>
                    <span className="text-yellow-500 text-xl font-bold">{review.score}/100</span>
                </div>

                {review.summary && (
                    <div className="mb-4">
                        <h3 className="text-lg font-semibold text-outline mb-2">Summary</h3>
                        <p className="text-white bg-zinc-700 p-3 rounded">{review.summary}</p>
                    </div>
                )}

                <div className="flex-1 overflow-y-auto">
                    <h3 className="text-lg font-semibold text-outline mb-2">Full Review</h3>
                    <div className="text-white bg-zinc-700 p-4 rounded whitespace-pre-wrap">
                        {review.review_text || 'No review text provided.'}
                    </div>
                </div>

                <div className="flex justify-end mt-4 pt-4 border-t border-zinc-600">
                    <button 
                        onClick={onClose}
                        className="bg-zinc-700 px-6 py-2 rounded hover:bg-zinc-600 transition"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}