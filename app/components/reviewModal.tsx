import { useState } from "react"
import { API_BASE_URL } from "@/next.config";
import { fetchWithAuth } from "@/app/utils/auth";
import ErrorPopup from "./errorPopup";

interface ReviewModalProps {
    onClose: () => void;
    towerId: number;
}

export default function ReviewModal({ onClose, towerId }: ReviewModalProps) {
    const [review, setReview] = useState("");
    const [summary, setSummary] = useState("");
    const [score, setScore] = useState<number | "">(50);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setReview(e.target.value);
    };

    const handleSummaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSummary(e.target.value);
    };

    const handleScore = (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value;

        if (inputValue === "") {
            setScore("");
            return;
        }

        const value = Math.max(0, Math.min(100, Number(inputValue)));
        setScore(value);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            await fetchWithAuth(`${API_BASE_URL}/api/towers/${towerId}/reviews/post/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    review,
                    summary,
                    score: score === "" ? 0 : score
                })
            });

            window.location.reload();
        } catch (err) {
            setError('Failed to submit review.');
            console.error('Review submission error:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
            <div className="w-[50vw] h-150 bg-zinc-800 flex flex-col items-start rounded-md border-2 p-6" onClick={(e) => e.stopPropagation()}>

                <div className="w-full">
                    <div className="flex justify-end">
                        <button type="button" onClick={onClose} className="bg-zinc-700 right-0 top-0 px-6 py-2 rounded hover:bg-zinc-600 transition">
                            Cancel
                        </button>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-stroke text-xl">Review</span>
                        <span className="text-sm text-gray-400">{review.length}/1500</span>
                    </div>
                    <textarea
                        value={review}
                        onChange={handleChange}
                        placeholder="Write your review..."
                        maxLength={1500}
                        className="w-full h-75 px-4 py-2 rounded border border-zinc-400 mt-2 mb-2 resize-none"
                    />
                    <div className="flex justify-between items-center mt-2">
                        <span className="text-stroke text-xl">Review Summary</span>
                        <span className="text-sm text-gray-400">{summary.length}/80</span>
                    </div>
                    <input type="text" value={summary} onChange={handleSummaryChange} placeholder="Write a summary..."
                        maxLength={80}
                        className="w-full h-10 px-4 rounded border border-zinc-400 mb-2 mt-2" />
                    <span className="text-stroke text-xl">Score</span>
                    <div className="flex justify-between items-center mt-2">
                        <input type="number" value={score} onChange={(e) => handleScore(e)}
                            min="0"
                            max="100"
                            className="w-16 h-10 px-2 rounded border border-zinc-400 text-center text-lg [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting || !review.trim() || !summary.trim() || score === ""}
                            className="bg-blue-600 px-6 py-2 rounded hover:bg-blue-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? 'Submitting...' : 'Submit Review'}
                        </button>
                    </div>


                </div>
            </div>
            {error && (
                <ErrorPopup errorText={error} onClear={() => setError(null)} />
            )}
        </div>

    );
}