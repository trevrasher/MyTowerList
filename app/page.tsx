"use client"
import React, { useEffect, useState } from "react";
import FilterBar from "./components/filterBar";
import MainHeader from "./components/mainHeader";
import InfiniteScroll from 'react-infinite-scroll-component';
import { API_BASE_URL } from "@/next.config";
import { refreshAccessToken } from "./utils/auth";


type Tower = {
  id: number;
  name: string;
  difficulty: number;
  creators: string[]
  floors: number;
  area: string;
  score: number;
  type: 'tower' | 'mini_tower' | 'steeple' | 'citadel';
  diff_category: string;
};

const areas = [
  'Ring 0', 'Ring 1', 'Ring 2', 'Ring 3', 'Ring 4', 'Ring 5', 'Ring 6', 'Ring 7', 'Ring 8', 'Ring 9',
  'Zone 1', 'Zone 2', 'Zone 3', 'Zone 4', 'Zone 5', 'Zone 6', 'Zone 7', 'Zone 8', 'Zone 9', 'Zone 10',
  'Arcane Area', 'Ashen Towerworks', 'Forgotten Ridge', 'Garden of Eeshöl', 'Lost River',
  'Paradise Atoll', 'Silent Abyss', 'The Starlit Archives'
];

const areaAcronyms: { [key: string]: string } = {
  "Ring 0": "R0",
  "Ring 1": "R1",
  "Ring 2": "R2",
  "Ring 3": "R3",
  "Ring 4": "R4",
  "Ring 5": "R5",
  "Ring 6": "R6",
  "Ring 7": "R7",
  "Ring 8": "R8",
  "Ring 9": "R9",
  "Zone 1": "Z1",
  "Zone 2": "Z2",
  "Zone 3": "Z3",
  "Zone 4": "Z4",
  "Zone 5": "Z5",
  "Zone 6": "Z6",
  "Zone 7": "Z7",
  "Zone 8": "Z8",
  "Zone 9": "Z9",
  "Zone 10": "Z10",
  "Arcane Area": "AA",
  "Ashen Towerworks": "AT",
  "Forgotten Ridge": "FR",
  "Garden of Eeshöl": "GoE",
  "Lost River": "LR",
  "Paradise Atoll": "PA",
  "Silent Abyss": "SA",
  "The Starlit Archives": "TSA"
};

const diffColors: { [key: string]: string } = {
  easy: "#59b338ff",
  medium: "#c5c502ff",
  hard: "#b17000ff",
  difficult: "#cc3e3eff",
  challenging: "#720000ff",
  intense: "#000000",
  remorseless: "#a70096ff",
  insane: "#0000FF",
  extreme: "#0389FF",
  terrifying: "#00b4b4ff",
  catastrophic: "#FFFFFF"
};

function getTowerImageUrl(towerName: string) {
  const fileName = towerName.replace(/ /g, "_") + ".webp";

  return `https://raw.githubusercontent.com/trevrasher/MyTowerList/refs/heads/master/assets/tower_thumbnails/${fileName}`;
}

function getTowerAreaImage(towerArea: string) {
  const fileName = towerArea.replace(/ /g, "").replace(/ö/g, "o") + ".webp";
  return `https://raw.githubusercontent.com/trevrasher/MyTowerList/refs/heads/master/assets/area_thumbnails/${fileName}`;
}

function getTowerDifficultyWord(tower: Tower) {
  const decimalStr = tower.difficulty.toString().split(".")[1] || "0";
  const decimalPart = parseFloat("0." + decimalStr);
  if (decimalPart >= 0.00 && decimalPart <= 0.15) return "Bot";
  if (decimalPart >= 0.16 && decimalPart <= 0.35) return "Low";
  if (decimalPart >= 0.36 && decimalPart <= 0.6) return "Mid";
  if (decimalPart >= 0.61 && decimalPart <= 0.8) return "High";
  if (decimalPart >= 0.81 && decimalPart <= 0.99) return "Peak";
  return "";
}

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
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [selectedAreas, setSelectedAreas] = useState<string[]>(areas);
  const [completedToggle, setCompletedToggle] = useState<boolean>(false);
  const [difficultyRange, setDifficultyRange] = useState<number[]>([1, 12]);
  const [loading, setLoading] = useState(false);

  const handleSearch = (query: string) => {
    const baseQuery = buildQueryParams(selectedAreas, difficultyRange, completedToggle, completedTowers);
    const url = `${API_BASE_URL}/api/towers/?${baseQuery}&search=${encodeURIComponent(query)}`
    setTowers([]);
    setNextUrl(url);
    setHasMore(true);
    fetchTowersPage(url, true);
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    const token = localStorage.getItem('access_token');
    if (token) {
      fetch(`${API_BASE_URL}/api/profile/completed-towers/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
        .then((res) => {
          if (!res.ok) throw new Error('Failed to fetch');
          return res.json();
        })
        .then((data) => {
          const ids = data.map((item: any) => item.id);
          setCompletedTowers(ids);
        })
        .catch((error) => console.error('Error:', error));
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const access = params.get('access');
    const refresh = params.get('refresh');

    if (access && refresh) {
      localStorage.setItem('access_token', access);
      window.dispatchEvent(new Event('storage'));
      localStorage.setItem('refresh_token', refresh);
      setIsAuthenticated(true);
      window.history.replaceState({}, document.title, '/');
    } else {
      const token = localStorage.getItem('access_token');
      if (token) {
        setIsAuthenticated(true);
      }
    }
  }, []);



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



  useEffect(() => {
    setTowers([]);
    const url = buildQueryParams(selectedAreas, difficultyRange, completedToggle, completedTowers);
    setNextUrl(url);
    setHasMore(true);
    fetchTowersPage(url, true);
  }, [selectedAreas, difficultyRange, completedToggle, completedTowers]);

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
              <div key={tower.id} className="relative flex flex-col">
                <img src={getTowerImageUrl(tower.name)} alt={tower.name} className={`h-90 w-full object-cover block mx-auto rounded-lg shadow-lg mb-2` + (isCompleted ? " ring-2 ring-green-400" : "")} />
                <div className="absolute bottom-14 left-0 w-14 h-14 flex items-center justify-center">
                  <div className="w-14 h-14 border-2 border-white rounded-md flex items-center justify-center bg-black">
                    <img
                      src={getTowerAreaImage(tower.area)}
                      className="w-12 h-12 rounded"
                      alt={tower.area}
                    />
                  </div>
                  <span className="absolute text-xl font-bold text-white text-outline">
                    {areaAcronyms[tower.area]}
                  </span>
                </div>
                <div style={{ backgroundColor: diffColors[tower.diff_category] || "#fff" }} className="absolute bottom-14 right-0 w-14 h-14 rounded-md border-2 border-white shadow z-10 flex items-center justify-center" >
                  <span className="right-0.5 text-xl font-bold text-white text-outline">
                    {getTowerDifficultyWord(tower)}
                  </span>
                </div>
                <strong className="whitespace-nowrap max-w-full overflow-hidden text-ellipsis" >{tower.name}</strong>
                <span className="whitespace-nowrap max-w-full overflow-hidden text-ellipsis text-zinc-500">Score: {tower.score}</span>
              </div>
            );
          })}
        </div>
      </InfiniteScroll>
    </>
  );
}


