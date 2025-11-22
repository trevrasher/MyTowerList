import { useState, useRef, useEffect } from "react";
import DifficultyFilter from "./difficultyFilter";
import AreaFilter from "./areaFilter";
import CompletedFilter from "./completedFilter";



interface FilterBarProps {
  areas: string[];
  selectedAreas: string[];
  setSelectedAreas: (values: string[]) => void;
  difficultyRange: number[];
  setDifficultyRange: React.Dispatch<React.SetStateAction<number[]>>;
  completedToggle: boolean
  setCompletedToggle: (values: boolean) => void;
}


export default function FilterBar({
    areas = [],
    selectedAreas,
    setSelectedAreas,
    difficultyRange,
    setDifficultyRange,
    completedToggle,
    setCompletedToggle,
    }: FilterBarProps) {

    const [filterSelect, setFilterSelect] = useState<String>("");
    const [searchBar, setSearchBar] = useState("");
    const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!filterSelect) return;
    function handleClickOutside(event: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setFilterSelect("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [filterSelect]);

    
    return (
    <div className="flex justify-center items-center relative w-full">
        <div className="flex gap-x-4">
        <div className="relative">
            <button
            className="w-30 py-4 bg-zinc-700 text-white rounded"
            onClick={() => setFilterSelect("difficulty")}
            >
            Difficulty
            </button>
            {filterSelect == "difficulty" && (
            <div
                ref={filterRef}
                className="absolute left-1/3 shadow-lg bg-zinc-900 rounded-lg p-2 w-96 z-50"
                style={{ transform: "translateX(-50%)" }}
            >
                <DifficultyFilter
                difficultyRange={difficultyRange}
                setDifficultyRange={setDifficultyRange}
                />
            </div>
            )}
        </div>
        <div className="relative">
            <button
            className="w-30 py-4 bg-zinc-700 text-white rounded"
            onClick={() => setFilterSelect("areas")}
            >
            Areas
            </button>
            {filterSelect == "areas" && (
            <div
                ref={filterRef}
                className="absolute left-1/3 shadow-lg bg-zinc-900 rounded-lg p-2 w-85 z-50"
                style={{ transform: "translateX(-50%)" }}
            >
                <AreaFilter
                selectedAreas={selectedAreas}
                areas={areas}
                setSelectedAreas={setSelectedAreas}
                />
            </div>
            )}
        </div>      
          <CompletedFilter
          completedToggle={completedToggle}
          setCompletedToggle={setCompletedToggle}/>
        </div>

    </div>
    );
}