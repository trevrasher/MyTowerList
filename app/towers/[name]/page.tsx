"use client"
import { API_BASE_URL } from "@/next.config";
import MainHeader from "@/app/components/mainHeader";
import { useAuth } from "@/app/hooks/useAuth";
import { useEffect, useState } from "react";
import { getTowerImageUrl, getTowerAreaImage, diffColors, getTowerDifficultyWord, Tower, getTowerAreaBanner } from "@/app/utils/towers";
import { fetchWithAuth } from "@/app/utils/auth";
import ReviewModal from "@/app/components/reviewModal";
import ViewReviewModal from "@/app/components/viewReviewModal";
import Reviews from "@/app/components/reviews";



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

export default function TowerPage({
  params
}: {
  params: Promise<{ name: string }>
}) {
  const [tower, setTower] = useState<Tower | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [towerStatus, setTowerStatus] = useState<string | null>(null);
  const isAuthenticated = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [completeDropdown, setCompleteDropdown] = useState(false);
  const [reviewWindow, setReviewWindow] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [reviewsNextUrl, setReviewsNextUrl] = useState<string | null>(null);
  const [hasMoreReviews, setHasMoreReviews] = useState(true);
  const [userReview, setUserReview] = useState<Review | null>(null);
  const [score, setScore] = useState<number | "">(50);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

    if (tower) {
      try {
        await fetchWithAuth(`${API_BASE_URL}/api/towers/${tower.id}/reviews/post/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            score: score === "" ? 0 : score,
            review: "",
            summary: "",
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

  }


  async function setStatus(status: string) {
    if (!tower || !tower.id) {
      console.error('Tower not loaded');
      return;
    }
    const prevStatus = towerStatus;

    try {
      setTowerStatus(status);
      setDropdownOpen(false);
      const data = await fetchWithAuth(`${API_BASE_URL}/api/towers/${tower.id}/status/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });
    } catch (error) {
      setTowerStatus(prevStatus);
      console.error('Error updating tower status:', error);
      setError(`Failed to update tower status: ${error}`);
    }
  }

  useEffect(() => {
    async function fetchUserReview() {
      if (!tower || !isAuthenticated) return;

      try {
        const url = `${API_BASE_URL}/api/towers/${tower.id}/reviews/?my_review=true`;
        const data = await fetchWithAuth(url);

        if (data.results && data.results.length > 0) {
          setUserReview(data.results[0]);
        } else {
          setUserReview(null);
        }
      } catch (error) {
        console.error('Failed to fetch user review:', error);
      }
    }
    fetchUserReview();
  }, [tower, isAuthenticated]);

  useEffect(() => {
    async function fetchTower() {
      const { name } = await params;
      const towerName = decodeURIComponent(name);

      const res = await fetch(
        `${API_BASE_URL}/api/towers/${encodeURIComponent(towerName)}/`,
      );

      if (!res.ok) {
        setError(`Failed to fetch tower: ${res.status}`);
        return;
      }

      const data = await res.json();
      setTower(data);
      console.log('Creators:', data.creators);
    }
    fetchTower();

  }, [params]);

  useEffect(() => {
    async function fetchTowerCompletion() {
      if (!tower || !isAuthenticated) return;
      try {
        const data = await fetchWithAuth(`${API_BASE_URL}/api/towers/${tower.id}/completion/`);
        setTowerStatus(data.status);
      } catch (error) {
        setError(`Failed to fetch tower completion: ${error}`)
      }
    }
    fetchTowerCompletion()
  }, [tower, isAuthenticated]);

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

  const openWiki = (tower: Tower) => {
    const link: string = "https://jtoh.fandom.com/wiki/" + tower.name.replace(/ /g, '_');
    window.open(link, '_blank');
  }


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

  if (error) return <div>{error}</div>;
  if (!tower) return <div>Loading...</div>;

  return (
    <>
      <MainHeader isAuthenticated={isAuthenticated} />

      <div className="flex flex-col justify-center items-center md:relative w-full md:h-100">

        <img src={getTowerAreaBanner(tower.area)} className="hidden md:block w-full h-full object-cover" ></img>
        <div className="hidden md:block absolute inset-0 bg-black opacity-50"></div>
        <div className="flex-col  md:absolute inset-0 md:mx-auto md:w-[60vw] z-10  md:mt-20 flex md:flex-row items-start justify-center">
          <div className="flex flex-col items-center">
            <img src={getTowerImageUrl(tower.name)} className="h-60 w-60 md:h-120 md:w-80 object-cover rounded-lg shadow-lg border-3" />
            {(towerStatus == "completed") && <button
              className="bg-green-600 h-15 w-80 mt-4 rounded-lg border-1 flex items-center justify-center hover:bg-green-500 cursor-pointer"
              onClick={() => setCompleteDropdown((open) => !open)}
            >

              <span className="mx-auto my-auto text-2xl text-outline">Complete</span>
            </button>}
            {(towerStatus == "incomplete") && <button
              className="bg-zinc-600 h-15 w-80 mt-4 rounded-lg border-1 flex items-center justify-center hover:bg-zinc-500 cursor-pointer"
              onClick={() => setDropdownOpen((open) => !open)}
            >

              <span className="mx-auto my-auto text-2xl text-outline">Incomplete</span>
            </button>}
            {towerStatus == "bookmarked" && <button
              className="bg-sky-800 h-15 w-80 mt-4 rounded-lg border-1 flex items-center justify-center hover:bg-sky-600 cursor-pointer"
              onClick={() => setDropdownOpen((open) => !open)}
            >

              <span className="mx-auto my-auto text-2xl text-outline">Planned</span>
            </button>}
            {towerStatus == "ignored" && <button
              className="bg-red-800  h-15 w-80 mt-4 rounded-lg border-1 flex items-center justify-center hover:bg-red-600 cursor-pointer"
              onClick={() => setDropdownOpen((open) => !open)}
            >

              <span className="mx-auto my-auto text-2xl text-outline">Ignored</span>
            </button>}

            {dropdownOpen && (
              <div className="sm:absolute sm:top-140 mt-2 flex flex-col bg-zinc-800 border rounded-lg shadow-lg w-50 py-4">
                {(towerStatus !== "bookmarked") && <button onClick={() => setStatus("bookmarked")} className="hover:bg-zinc-500 cursor-pointer h-10 text-xl">Set as Planned</button>}
                {(towerStatus !== "ignored") && <button onClick={() => setStatus("ignored")} className="hover:bg-zinc-500 cursor-pointer h-10 text-xl">Set as Ignored</button>}
                {(towerStatus !== "incomplete") && <button onClick={() => setStatus("incomplete")} className="hover:bg-zinc-500 cursor-pointer h-10 text-xl">Remove from List</button>}
              </div>

            )}
            {completeDropdown && (
              <div className="flex flex-col bg-zinc-800 border-2 rounded-lg shadow-lg mt-1 w-50 py-4">
                <span className="text-xl mx-auto pb-2 text-outline">Score </span>
                <div className="flex px-2 justify-between">
                  <input type="number" value={score} onChange={(e) => handleScore(e)}
                    onInput={(e) => {
                      e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, '');
                    }}
                    min="0"
                    max="100"
                    className="w-16 h-10 px-2 rounded border border-zinc-400 text-center text-lg [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting || score === ""} className="bg-blue-600 px-6 py-2 rounded hover:bg-blue-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >Submit</button>
                </div>


              </div>
            )}

            <button className="w-40 h-16 rounded border bg-blue-600 mt-4 text-xl text-outline hover:bg-blue-500 cursor-pointer" onClick={() => openWiki(tower)}>
              Wiki Page
            </button>
          </div>
          <div className="md:ml-10 mt-5 md:mt-0">
            <span className="text-xl md:text-4xl font-bold text-outline">{tower.name}</span>
            <div className="flex items-center mt-4 md:mt-10">
              <div className="w-14 h-14 flex items-center justify-center">
                <div className="w-14 h-14 border-2 border-white rounded-md flex items-center justify-center bg-black">
                  <img
                    src={getTowerAreaImage(tower.area)}
                    className="w-12 h-12 rounded"
                    alt={tower.area}
                  />
                </div>
              </div>
              <span className="ml-4 text-white text-2xl md:text-3xl text-outline">{tower.area}</span>
            </div>
            <div className="flex items-center mt-5">
              <div style={{ backgroundColor: diffColors[tower.diff_category] || "#fff" }} className="w-14 h-14 rounded-md border-2 border-white shadow z-10 flex items-center justify-center" />
              <span className="ml-4 text-white text-2xl md:text-3xl text-outline">
                {getTowerDifficultyWord(tower)} {tower.diff_category.charAt(0).toUpperCase() + tower.diff_category.slice(1)} ({tower.difficulty})
              </span>
            </div>
            <div className="mt-6">
              <span className="ml-18 text-white text-2xl md:text-3xl text-outline">{tower.score} / 100</span>
            </div>
            <div className="flex flex-col md:flex-row mt-8 md:mt-20">
              <Reviews
                isAuthenticated={isAuthenticated}
                towerStatus={towerStatus || ""}
                userReview={userReview}
                reviews={reviews}
                hasMoreReviews={hasMoreReviews}
                fetchMoreReviews={fetchMoreReviews}
                setReviewWindow={setReviewWindow}
                setSelectedReview={setSelectedReview}
              />

              <div className="h-80 w-80 bg-zinc-900 md:ml-10 border-white border-2 rounded-md mt-8 md:mt-0 ">
                <div className="w-full flex flex-col border-b border-white h-10 justify-center">
                  <span className="text-xl px-4 text-outline">Creators</span>
                </div>
                <div className="h-65 overflow-y-auto pt-2">
                  {tower.creators.map((creator, index) => (
                    creator.roblox_user_id ? (
                      <a
                        key={index}
                        href={`https://www.roblox.com/users/${creator.roblox_user_id}/profile`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className=" pl-4 py-2 flex items-center hover:bg-zinc-800 rounded-md transition cursor-pointer w-full"
                      >
                        {creator.avatar_url && <img src={creator.avatar_url} className="h-16 w-16 border-2 border-white rounded-md" />}
                        <span className="pl-2 text-l text-outline">{creator.name}</span>
                      </a>
                    ) : (
                      <div key={index} className="pb-2 pl-4 flex items-center px-2">
                        {creator.avatar_url && <img src={creator.avatar_url} className="h-16 w-16 border-2 border-white rounded-md" />}
                        <span className="pl-4 text-l text-outline">{creator.name}</span>
                      </div>
                    )
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

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
    </>
  );
}