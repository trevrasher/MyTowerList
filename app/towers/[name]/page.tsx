"use client"
import { API_BASE_URL } from "@/next.config";
import MainHeader from "@/app/components/mainHeader";
import { useAuth } from "@/app/hooks/useAuth";
import { useEffect, useState } from "react";
import { getTowerImageUrl, getTowerAreaImage, diffColors, getTowerDifficultyWord, Tower, getTowerAreaBanner} from "@/app/utils/towers";
import { fetchWithAuth } from "@/app/utils/auth";



export default function TowerPage({
  params
}: {
  params: Promise<{ name: string }>
}) {
  const [tower, setTower] = useState<Tower | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState<boolean | null>(null);
  const isAuthenticated = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);



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
    }
    fetchTower();
  }, [params]);

  useEffect(() => {
    async function fetchTowerCompletion() {
      if (!tower || !isAuthenticated) return;

      try {
        const data = await fetchWithAuth(`${API_BASE_URL}/api/towers/${tower.id}/completion/`);
        setIsCompleted(data.completed);
        console.log(isCompleted);
      } catch (error) {
        setError(`Failed to fetch tower completion: ${error}`)
      }
    }
    fetchTowerCompletion()
  }, [tower, isAuthenticated]);


  if (error) return <div>{error}</div>;
  if (!tower) return <div>Loading...</div>;

  return (
    <>
      <MainHeader isAuthenticated={isAuthenticated} />

      <div className="relative w-full h-100">

        <img src={getTowerAreaBanner(tower.area)} className="w-full h-full object-cover" ></img>
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="absolute left-0 right-0 top-0 mx-auto w-[60vw] z-10 mt-20 flex items-start">
          <div className="flex flex-col items-center">
            <img src={getTowerImageUrl(tower.name)} className="h-120 w-80 object-cover rounded-lg shadow-lg border-3" />
            {isCompleted && <div className="bg-green-600 h-15 w-80 mt-4 rounded-lg border-1 flex items-center justify-center">
              <span className="mx-auto my-auto text-2xl text-outline">Complete</span>
            </div>}
            {isCompleted == false && <button
              className="bg-zinc-600 h-15 w-80 mt-4 rounded-lg border-1 flex items-center justify-center hover:bg-zinc-500 cursor-pointer"
              onClick={() => setDropdownOpen((open) => !open)}
            >
              <span className="mx-auto my-auto text-2xl text-outline">Incomplete</span>
            </button>}
            {dropdownOpen && (
              <div className="flex flex-col bg-zinc-600 border rounded-lg shadow-lg mt-1 w-50 py-4 h-28">
                <button className="hover:bg-zinc-500 cursor-pointer h-10 text-xl">Set as Planned</button>
                <button className="hover:bg-zinc-500 cursor-pointer h-10 text-xl">Set as Ignored</button>
              </div>
            )}
          </div>
          <div className="ml-10">
            <span className="text-4xl font-bold text-outline">{tower.name}</span>
            <div className="flex items-center mt-10">
              <div className="w-14 h-14 flex items-center justify-center">
                <div className="w-14 h-14 border-2 border-white rounded-md flex items-center justify-center bg-black">
                  <img
                    src={getTowerAreaImage(tower.area)}
                    className="w-12 h-12 rounded"
                    alt={tower.area}
                  />
                </div>
              </div>
              <span className="ml-4 text-white text-3xl text-outline">{tower.area}</span>
            </div>
            <div className="flex items-center mt-5">
              <div style={{ backgroundColor: diffColors[tower.diff_category] || "#fff" }} className="w-14 h-14 rounded-md border-2 border-white shadow z-10 flex items-center justify-center" />
              <span className="ml-4 text-white text-3xl text-outline">
                {getTowerDifficultyWord(tower)} {tower.diff_category.charAt(0).toUpperCase() + tower.diff_category.slice(1)} ({tower.difficulty})
              </span>
            </div>



          </div>
        </div>

      </div>
    </>
  );
}