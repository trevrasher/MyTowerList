export default async function TowerPage({ 
  params 
}: { 
  params: { name: string } 
}) {
  const res = await fetch(
    `http://localhost:8000/api/towers/${params.name}/`
  );
  const tower = await res.json();
  return (
    <div>
      <h1>{tower.name}</h1>
      <p>Difficulty: {tower.difficulty}</p>
      <p>Floors: {tower.floors}</p>
      <p>Score: {tower.score}</p>
    </div>
  );
}