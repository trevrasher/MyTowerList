"use client"
import React, { useEffect, useState } from "react";
import FilterBar from "./components/filterBar";
import MainHeader from "./components/mainHeader";
import InfiniteScroll from 'react-infinite-scroll-component';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

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
  'Ring 0', 'Ring 1', 'Ring 2',  'Ring 3', 'Ring 4', 'Ring 5', 'Ring 6', 'Ring 7', 'Ring 8', 'Ring 9',
  'Zone 1', 'Zone 2', 'Zone 3', 'Zone 4', 'Zone 5', 'Zone 6', 'Zone 7', 'Zone 8', 'Zone 9', 'Zone 10',
  'Arcane Area', 'Ashen Towerworks', 'Forgotten Ridge', 'Garden of Eeshöl', 'Lost River', 
  'Paradise Atoll', 'Silent Abyss', 'The Starlit Archives'
];

function getTowerImageUrl(towerName: string) {
  const fileName = towerName.replace(/ /g, "_") + ".webp";
    return `https://raw.githubusercontent.com/trevrasher/MyTowerList/refs/heads/master/scripts/tower_thumbnails/${fileName}`;
}


export default function Home() {
  const [displayCount, setDisplayCount] = useState(20);
  const [towers, setTowers] = useState<Tower[]>([]);
  const [filteredTowers, setFilteredTowers] = useState<Tower[]>([]);
  const [completedTowers, setCompletedTowers] = useState<number[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [selectedAreas, setSelectedAreas] = useState<string[]>(areas);
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = sessionStorage.getItem('selectedAreas');
      if (stored) setSelectedAreas(JSON.parse(stored));
    }
  }, []);

  const [completedToggle, setCompletedToggle] = useState<boolean>(false);
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = sessionStorage.getItem('completedToggle');
      if (stored) setCompletedToggle(JSON.parse(stored));
    }
  }, []);

  const [difficultyRange, setDifficultyRange] = useState<number[]>([1, 12]);
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = sessionStorage.getItem('difficultyRange');
      if (stored) setDifficultyRange(JSON.parse(stored));
    }
  }, []);





  useEffect(() => {
  sessionStorage.setItem('selectedAreas', JSON.stringify(selectedAreas));
  }, [selectedAreas]);

  useEffect(() => {
    sessionStorage.setItem('completedToggle', JSON.stringify(completedToggle));
  }, [completedToggle]);

  useEffect(() => {
    sessionStorage.setItem('difficultyRange', JSON.stringify(difficultyRange));
  }, [difficultyRange]);



  useEffect(() => {
  setDisplayCount(20);
  }, [filteredTowers]);


  async function fetchAllTowers() {
    let url = `${API_BASE_URL}/api/towers/`;
    let allTowers: Tower[] = [];
    while (url) {
      const res = await fetch(url);
      const data = await res.json();
      allTowers = allTowers.concat(data.results || []);
      url = data.next;
    }
    return allTowers;
  }

  useEffect(() => {
    const cached = localStorage.getItem('towers');
    if (cached) {
      try {
        const towersData = JSON.parse(cached);
        if (Array.isArray(towersData)) {
          setTowers(towersData);
          setFilteredTowers(towersData);
        } else {
          setTowers([]);
          setFilteredTowers([]);
        }
      } catch {
        setTowers([]);
        setFilteredTowers([]);
      }
    } else {
      fetchAllTowers()
        .then((allTowers) => {
          setTowers(allTowers);
          setFilteredTowers(allTowers);
          localStorage.setItem('towers', JSON.stringify(allTowers));
        })
        .catch(() => {
          setTowers([]);
          setFilteredTowers([]);
        });
    }
  }, []);

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

  useEffect(() => {
    const cached = localStorage.getItem('completedTowers');
    if (cached) {
      const data = JSON.parse(cached);
      const ids = data.map((item: any) => item.id);
      setCompletedTowers(ids);
    } else {
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
            console.log('Completed tower IDs:', ids);
            setCompletedTowers(ids);
            localStorage.setItem('completedTowers', JSON.stringify(data));
          })
          .catch((error) => console.error('Error:', error));
      }
    }
  }, [isAuthenticated])

  useEffect(() =>  {
    let filtered = Array.isArray(towers) ? towers : [];

    if(selectedAreas.length>0) {
      filtered = filtered.filter(tower =>
        selectedAreas.includes(tower.area)
      );
    }

    filtered = filtered.filter(tower => 
      tower.difficulty >= difficultyRange[0] && tower.difficulty <= difficultyRange[1]
    );

    if (completedToggle) {
      filtered = filtered.filter(tower => 
        !completedTowers.includes(tower.id)
      );
    }

    setFilteredTowers(filtered);

  }, [selectedAreas, towers, difficultyRange, completedToggle, completedTowers])




  return (
    <>
      <MainHeader isAuthenticated={isAuthenticated}/>
      <FilterBar
      areas={areas}
      setSelectedAreas={setSelectedAreas}
      selectedAreas={selectedAreas}
      difficultyRange={difficultyRange}
      setDifficultyRange={setDifficultyRange}
      completedToggle={completedToggle}
      setCompletedToggle={setCompletedToggle}
      isAuthenticated={isAuthenticated}
    />
      
      <InfiniteScroll
        dataLength={displayCount}
        next={() => setDisplayCount(count => count + 20)}
        hasMore={displayCount < filteredTowers.length}
        loader={<h4>Loading...</h4>}
      >
        <div className="grid grid-cols-6 gap-2.5 p-5">
          {filteredTowers.slice(0, displayCount).map((tower) => {
            const isCompleted = completedTowers.includes(tower.id);
            return (
              <div key={tower.id} >
                <img src={getTowerImageUrl(tower.name)} alt={tower.name} 
                className={`h-[300px] w-full object-cover block mx-auto rounded-lg shadow-lg` +
                (isCompleted ? " ring-4 ring-green-400 shadow-green-400" : "")}/>
                <strong>{tower.name}</strong>
                <div>Score: {tower.score}</div>
                <div>Difficulty: {tower.diff_category}</div>
                <div>Area: {tower.area}</div>
              </div>
            );
          })}
        </div>
      </InfiniteScroll>
    </>
      

  );
}


