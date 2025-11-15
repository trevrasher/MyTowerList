"use client"
import React, { useEffect, useState } from "react";

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

type Creator = {
  name: string;
}

type Area = {
  name: string;
  order: number;
}

export default function Home() {
  const [towers, setTowers] = useState<Tower[]>([]);
  const [filteredTowers, setFilteredTowers] = useState<Tower[]>([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string[]>([]);
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [minScore, setMinScore] = useState<number>(0);
  const [maxScore, setMaxScore] = useState<number>(100);
  const [showFilters, setShowFilters] = useState<boolean>(false);

  const difficulties = [
    'easy', 'medium', 'hard', 'difficult', 'challenging', 
    'intense', 'remorseless', 'insane', 'extreme', 'terrifying', 'catastrophic'
  ];

  const areas = ['Ring 1', 'Ring 2', 'Ring 3', 'Ring 4', 'Ring 5', 'Ring 6', 'Ring 7', 'Ring 8', 'Ring 9'];


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
      tower.score >= minScore && tower.score <= maxScore
    );

    setFilteredTowers(filtered);

  }, [selectedDifficulty, selectedAreas, minScore, maxScore, towers])

  return (
    <>
      <button onClick={() => setShowFilters(!showFilters)} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700">
        {showFilters ? 'Hide Filters' : 'Show Filters'}
      </button>
      

      <div className="grid grid-cols-6 gap-2.5 p-5">
        {filteredTowers.map((tower) => (
          <div key={tower.id} className="border border-gray-300 p-2.5 rounded-lg">
            <strong>{tower.name}</strong>
            <div>Score: {tower.score}</div>
            <div>Difficulty: {tower.diff_category}</div>
            <div>Type: {tower.type}</div>
            <div>Area: {tower.area}</div>
            <div>Creators: {tower.creators}</div>
          </div>
        ))}
      </div>
    </>
      

  );
}


