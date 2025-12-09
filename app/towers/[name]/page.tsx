import { API_BASE_URL } from "@/next.config";

export default async function TowerPage({ 
  params 
}: { 
  params: { name: string } 
}) {
  const { name } = await params;
  const towerName = decodeURIComponent(name);
  
  try {
    const res = await fetch(
      `${API_BASE_URL}/api/towers/${encodeURIComponent(towerName)}/`,
    );
    
    if (!res.ok) {
      throw new Error(`Failed to fetch tower: ${res.status}`);
    }
    
    const tower = await res.json();
    
    return (
      <div>
        <h1>{tower.name}</h1>
        <p>Difficulty: {tower.difficulty}</p>
        <p>Floors: {tower.floors}</p>
        <p>Score: {tower.score}</p>
      </div>
    );
  } catch (error) {
    console.log(error)
    return (
      <div>
        <h1>Error loading tower</h1>
        <p>{error instanceof Error ? error.message : 'Unknown error'}</p>
        <p>Tried to load: {towerName}</p>
        <p>API URL: {API_BASE_URL}</p>
      </div>
    );
  }
}