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
  isAuthenticated: boolean
}


export default function FilterBar({
    areas = [],
    selectedAreas,
    setSelectedAreas,
    difficultyRange,
    setDifficultyRange,
    completedToggle,
    setCompletedToggle,
    isAuthenticated
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
          <div className="relative flex justify-center">
              <button
              className="w-30 bg-zinc-700 text-white rounded hover:bg-zinc-400 transition"
              onClick={() => setFilterSelect("difficulty")}
              >
              Difficulty
              </button>
              {filterSelect == "difficulty" && (
              <div
                  ref={filterRef}
                  className="absolute -translate-x-1/2 left-1/2 top-6/7 shadow-lg bg-zinc-900 rounded-lg p-2 w-96 z-50 mt-5"
              >
                  <DifficultyFilter
                  difficultyRange={difficultyRange}
                  setDifficultyRange={setDifficultyRange}
                  />
              </div>
              )}
          </div>
        <div className="relative flex justify-center">
            <button
            className="w-30 py-4 bg-zinc-700 text-white rounded hover:bg-zinc-400 transition"
            onClick={() => setFilterSelect("areas")}
            >
            Areas
            </button>
            {filterSelect == "areas" && (
            <div
                ref={filterRef}
                className="absolute -translate-x-1/2 left-1/2 top-6/7 translate-y-1/27 shadow-lg bg-zinc-900 rounded-lg p-2 w-85 z-50"
            >
                <AreaFilter
                selectedAreas={selectedAreas}
                areas={areas}
                setSelectedAreas={setSelectedAreas}
                isAuthenticated={isAuthenticated}
                />
            </div>
            )}
        </div> 
        {isAuthenticated &&     
          <CompletedFilter
          completedToggle={completedToggle}
          setCompletedToggle={setCompletedToggle}
          />
        }
        </div>

    </div>
    );
}