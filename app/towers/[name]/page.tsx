"use client"
import { API_BASE_URL } from "@/next.config";
import MainHeader from "@/app/components/mainHeader";
import { useAuth } from "@/app/hooks/useAuth";
import { useEffect, useState } from "react";
import { getTowerImageUrl, getTowerAreaImage, areaAcronyms } from "@/app/utils/towers";

export default function TowerPage({
  params
}: {
  params: Promise<{ name: string }>
}) {
  const [tower, setTower] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const isAuthenticated = useAuth();

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

  if (error) return <div>{error}</div>;
  if (!tower) return <div>Loading...</div>;

  return (
    <>
      <MainHeader isAuthenticated={isAuthenticated} />

      <div className="relative w-full h-100">

        <img src="https://raw.githubusercontent.com/trevrasher/MyTowerList/refs/heads/master/assets/area_banners/Ring1.png" className="w-full h-full object-cover" ></img>
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="absolute left-0 right-0 top-0 mx-auto w-[60vw] z-10 mt-20 flex items-start">
          <img src={getTowerImageUrl(tower.name)} className="h-120 w-80 object-cover rounded-lg shadow-lg border-3"></img>
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
              <span className="ml-4 text-white text-3xl  text-outline">{tower.area}</span>
            </div>


          </div>
        </div>
      </div>
    </>
  );
}