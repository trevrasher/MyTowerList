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

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/towers/`)
    .then((res) => res.json())
    .then((data) => setTowers(data));
  }, []);

  return (
    <>
      <div className="grid grid-cols-6 gap-2.5 p-5">
        {towers.map((tower) => (
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


