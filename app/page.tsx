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
import { SortState } from "./utils/towers";



interface TowerStatus {
  tower_id: number;
  status: string;
}

const sortToOrdering = (sortMode: SortState): string => {
  const mapping: Record<SortState, string> = {
    'scoreUp': 'score',
    'scoreDown': '-score',
    'difficultyUp': 'difficulty',
    'difficultyDown': '-difficulty',
  };
  return mapping[sortMode];
};

function buildQueryParams(
  selectedAreas: string[],
  difficultyRange: number[],
  completedToggle: boolean,
  towerStatuses: Map<number, string>,
  sortMode: SortState
) {
  const params = new URLSearchParams();
  if (selectedAreas.length && selectedAreas.length !== areas.length) {
    selectedAreas.forEach(area => params.append("area", area));
  }
  params.append("difficulty_min", difficultyRange[0].toString());
  params.append("difficulty_max", difficultyRange[1].toString());
  if (completedToggle && towerStatuses.size) {
    params.append("exclude_completed", "true");
    towerStatuses.forEach((status, id) => {
      if (status === 'completed') {
        params.append("completed_ids", id.toString());
      }
    });
  } 
  towerStatuses.forEach((status, id) => {
    if (status === 'ignored') {
      params.append("ignored_ids", id.toString());
    }
  });
  
  if (sortMode) {
    params.append("ordering", sortToOrdering(sortMode));
  }
  return `${API_BASE_URL}/api/towers/?${params.toString()}`;
}


export default function Home() {
  const [towers, setTowers] = useState<Tower[]>([]);
  const [nextUrl, setNextUrl] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [towerStatuses, setTowerStatuses] = useState<Map<number, string>>(new Map());
  const isAuthenticated = useAuth();
  const [selectedAreas, setSelectedAreas] = useState<string[]>(areas);
  const [completedToggle, setCompletedToggle] = useState<boolean>(false);
  const [difficultyRange, setDifficultyRange] = useState<number[]>([1, 12]);
  const [loading, setLoading] = useState(false);
  const [completedTowersLoaded, setCompletedTowersLoaded] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortMode, setSortMode] = useState<SortState>('scoreDown');

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  //completed towers check
  useEffect(() => {
    if (!isAuthenticated) {
      setCompletedTowersLoaded(true);
      return;
    }
    fetchWithAuth(`${API_BASE_URL}/api/profile/completed-towers/`)
      .then((data) => {
        const statusMap = new Map<number, string>();
        data.forEach((item: TowerStatus) => {
          statusMap.set(item.tower_id, item.status);
        });
        setTowerStatuses(statusMap);
        setCompletedTowersLoaded(true);
      })
      .catch((error) => {
        console.error('Error fetching tower statuses:', error);
        setCompletedTowersLoaded(true);
      });
  }, [isAuthenticated]);

  //filtering
  useEffect(() => {
    if (!completedTowersLoaded) return;
    setTowers([]);
    let url = buildQueryParams(selectedAreas, difficultyRange, completedToggle, towerStatuses, sortMode);
    if (searchQuery) {
      url += `&search=${encodeURIComponent(searchQuery)}`;
    }
    setNextUrl(url);
    setHasMore(true);
    fetchTowersPage(url, true);
  }, [selectedAreas, difficultyRange, completedToggle, towerStatuses, completedTowersLoaded, searchQuery, sortMode]);



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
        searchQuery={searchQuery}
        sortMode={sortMode}
        setSortMode={setSortMode}
      />
      <InfiniteScroll
        dataLength={towers.length}
        next={fetchMoreTowers}
        hasMore={hasMore}
        loader={
          <div className="flex justify-center py-8">
            <h4 className="text-lg text-gray-600 dark:text-gray-400">Loading...</h4>
          </div>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 md:gap-6 lg:gap-8 w-[95vw] my-10 mx-auto">
          {towers.map((tower) => {
            const isCompleted = towerStatuses.get(tower.id) === 'completed';
            const isBookmarked = towerStatuses.get(tower.id) === 'bookmarked';


            return (
              <Link href={`/towers/${tower.name}`} key={tower.id}>
                <div className="relative flex flex-col cursor-pointer hover:opacity-90 transition">
                  <img
                    src={getTowerImageUrl(tower.name)}
                    alt={tower.name}
                    className={`h-90 w-full object-cover block mx-auto rounded-lg shadow-lg mb-2 ${isCompleted ? "ring-4 ring-green-400" :
                        isBookmarked ? "ring-4 ring-blue-400" : ""
                      }`}
                  />
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


