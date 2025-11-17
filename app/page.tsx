"use client"
import React, { useEffect, useState } from "react";
import DifficultyFilter from "./components/difficultyFilter";
import AreaFilter from "./components/areaFilter";
import CompletedFilter from "./components/completedFilter";
import LoginButton from "./components/loginButton";

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
  'Ring 0', 'Ring 1', 'Ring 2', 'Ring 3', 'Ring 4', 'Ring 5', 'Ring 6', 'Ring 7', 'Ring 8', 'Ring 9',
  'Zone 1', 'Zone 2', 'Zone 3', 'Zone 4', 'Zone 5', 'Zone 6', 'Zone 7', 'Zone 8', 'Zone 9', 'Zone 10',
  'Arcane Area', 'Ashen Towerworks', 'Forgotten Ridge', 'Garden of Eeshöl', 'Lost River', 
  'Paradise Atoll', 'Silent Abyss', 'The Starlit Archives'
];


export default function Home() {
  const [towers, setTowers] = useState<Tower[]>([]);
  const [filteredTowers, setFilteredTowers] = useState<Tower[]>([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string[]>([]);
  const [selectedAreas, setSelectedAreas] = useState<string[]>(areas);
  const [completedToggle, setCompletedToggle] = useState<boolean>(false);
  const [difficultyRange, setDifficultyRange] = useState<number[]>([1, 12]);
  const [completedTowers, setCompletedTowers] = useState<Tower[]>([]);
  const [showFilters, setShowFilters] = useState<boolean>(false);


  useEffect(() => {
    fetch(`${API_BASE_URL}/api/towers/`)
    .then((res) => res.json())
    .then((data) => {
      setTowers(data);
      setFilteredTowers(data);
    });
  }, []);

  useEffect(() =>  {
    let filtered = towers
    if(selectedDifficulty.length > 0) {
      filtered = filtered.filter(tower =>
        selectedDifficulty.includes(tower.diff_category)
      );
    }

    if(selectedAreas.length>0) {
      filtered = filtered.filter(tower =>
        selectedAreas.includes(tower.area)
      );
    }

    filtered = filtered.filter(tower => 
      tower.difficulty >= difficultyRange[0] && tower.difficulty <= difficultyRange[1]
    );

    const completedTowerIds = completedTowers.map(t => t.id);
    if(completedToggle) {
      filtered = filtered.filter(tower => 
        !completedTowerIds.includes(tower.id)
        
      );
    }

    setFilteredTowers(filtered);

  }, [selectedDifficulty, selectedAreas, towers, difficultyRange, completedToggle])

  useEffect(() => {
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
        .then((data) => setCompletedTowers(data))
        .catch((error) => console.error('Error fetching completed towers:', error));
    }
  }, []);

  useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const access = params.get('access');
  const refresh = params.get('refresh');
  
  if (access && refresh) {
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
    
    window.history.replaceState({}, document.title, '/');
  }}, []);



  return (
    <>
      <button onClick={() => setShowFilters(!showFilters)} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700">
        {showFilters ? 'Hide Filters' : 'Show Filters'}
      </button>
      <LoginButton/>
      <div>
        {showFilters && (
          <div>
            <DifficultyFilter 
              difficultyRange={difficultyRange}
              setDifficultyRange={setDifficultyRange}
            />
            <AreaFilter
              areas = {areas}
              selectedAreas={selectedAreas}
              setSelectedAreas={setSelectedAreas}
            />
            <CompletedFilter
            completedToggle = {completedToggle}
            setCompletedToggle={setCompletedToggle}/>
          </div>

        )}
      </div>

      <div className="grid grid-cols-6 gap-2.5 p-5">
        {filteredTowers.map((tower) => {
          const isCompleted = completedTowers.some(ct => ct.id === tower.id);
          
          return (
            <div 
              key={tower.id} 
              className={`border border-gray-300 p-2.5 rounded-lg ${isCompleted ? 'bg-green-900' : 'bg-black-200'}`}
            >
              <strong>{tower.name}</strong>
              <div>Score: {tower.score}</div>
              <div>Difficulty: {tower.diff_category}</div>
              <div>Type: {tower.type}</div>
              <div>Area: {tower.area}</div>
              <div>Creators: {tower.creators}</div>
            </div>
          );
        })}
      </div>
    </>
      

  );
}


