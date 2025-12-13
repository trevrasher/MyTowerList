"use client"
import { API_BASE_URL } from "@/next.config";
import Link from 'next/link';
import { useEffect, useState, useRef } from "react";
import InfiniteScroll from 'react-infinite-scroll-component';
import AreaIcon from "./components/areaIcon";
import FilterBar from "./components/filterBar";
import MainHeader from "./components/mainHeader";
import { useAuth } from "./hooks/useAuth";
import { fetchWithAuth } from "./utils/auth";
import { Tower, areas, diffColors, getTowerDifficultyWord, getTowerImageUrl } from "./utils/towers";


function buildQueryParams(
  selectedAreas: string[],
  difficultyRange: number[],
  completedToggle: boolean,
  completedTowers: number[]
) {
  const params = new URLSearchParams();
  if (selectedAreas.length && selectedAreas.length !== areas.length) {
    selectedAreas.forEach(area => params.append("area", area));
  }
  params.append("difficulty_min", difficultyRange[0].toString());
  params.append("difficulty_max", difficultyRange[1].toString());
  if (completedToggle && completedTowers.length) {
    params.append("exclude_completed", "true");
    completedTowers.forEach(id => params.append("completed_ids", id.toString()));
  }
  return `${API_BASE_URL}/api/towers/?${params.toString()}`;
}

export default function Home() {
  const [towers, setTowers] = useState<Tower[]>([]);
  const [nextUrl, setNextUrl] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [completedTowers, setCompletedTowers] = useState<number[]>([]);
  const isAuthenticated = useAuth();
  const [selectedAreas, setSelectedAreas] = useState<string[]>(areas);
  const [completedToggle, setCompletedToggle] = useState<boolean>(false);
  const [difficultyRange, setDifficultyRange] = useState<number[]>([1, 12]);
  const [loading, setLoading] = useState(false);
  const [completedTowersLoaded, setCompletedTowersLoaded] = useState<boolean>(false);

  const handleSearch = (query: string) => {
    const baseQuery = buildQueryParams(selectedAreas, difficultyRange, completedToggle, completedTowers);
    const url = `${API_BASE_URL}/api/towers/?${baseQuery}&search=${encodeURIComponent(query)}`
    setTowers([]);
    setNextUrl(url);
    setHasMore(true);
    fetchTowersPage(url, true);
  };

  //completed towers check
  useEffect(() => {
    if (!isAuthenticated) {
      setCompletedTowersLoaded(true);
      return;
    }
    fetchWithAuth(`${API_BASE_URL}/api/profile/completed-towers/`)
      .then((data) => {
        const ids = data.map((item: any) => item.id);
        setCompletedTowers(ids);
        setCompletedTowersLoaded(true);
      })
      .catch((error) => {
        console.error('Error fetching completed towers:', error);
        setCompletedTowersLoaded(true);
      });
  }, [isAuthenticated]);

  //filtering
  useEffect(() => {
    if (!completedTowersLoaded) return;
    setTowers([]);
    const url = buildQueryParams(selectedAreas, difficultyRange, completedToggle, completedTowers);
    setNextUrl(url);
    setHasMore(true);
    fetchTowersPage(url, true);
  }, [selectedAreas, difficultyRange, completedToggle, completedTowers, completedTowersLoaded]);



  const fetchTowersPage = async (url: string | null, reset = false) => {
    if (!url) return;
    setLoading(true);

    let res = await fetch(url)

    const data = await res.json();
    setTowers(prev => reset ? (data.results || []) : [...prev, ...(data.results || [])]);
    setNextUrl(data.next);
    setHasMore(Boolean(data.next));
    setLoading(false);
  };





  const fetchMoreTowers = () => {
    if (nextUrl && !loading) {
      fetchTowersPage(nextUrl);
    }
  };

  return (
    <>
      <MainHeader isAuthenticated={isAuthenticated} />
      <FilterBar
        areas={areas}
        setSelectedAreas={setSelectedAreas}
        selectedAreas={selectedAreas}
        difficultyRange={difficultyRange}
        setDifficultyRange={setDifficultyRange}
        completedToggle={completedToggle}
        setCompletedToggle={setCompletedToggle}
        isAuthenticated={isAuthenticated}
        onSearch={handleSearch}
      />
      <InfiniteScroll
        dataLength={towers.length}
        next={fetchMoreTowers}
        hasMore={hasMore}
        loader={<h4>Loading...</h4>}
      >
        <div className="grid grid-cols-6 gap-15 w-[95vw] my-10 mx-auto">
          {towers.map((tower) => {
            const isCompleted = completedTowers.includes(tower.id);
            return (
              <Link href={`/towers/${tower.name}`} key={tower.id}>
                <div className="relative flex flex-col cursor-pointer hover:opacity-90 transition">
                  <img src={getTowerImageUrl(tower.name)} alt={tower.name} className={`h-90 w-full object-cover block mx-auto rounded-lg shadow-lg mb-2` + (isCompleted ? " ring-4 ring-green-400" : "")} />
                  <AreaIcon tower={tower} />
                  <div style={{ backgroundColor: diffColors[tower.diff_category] || "#fff" }} className="absolute bottom-14 right-0 w-14 h-14 rounded-md border-2 border-white shadow z-10 flex items-center justify-center" >
                    <span className="right-0.5 text-xl font-bold text-white text-outline">
                      {getTowerDifficultyWord(tower)}
                    </span>
                  </div>
                  <strong className="whitespace-nowrap max-w-full overflow-hidden text-ellipsis" >{tower.name}</strong>
                  <span className="whitespace-nowrap max-w-full overflow-hidden text-ellipsis text-zinc-500">Score: {tower.score}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </InfiniteScroll>
    </>
  );
}


