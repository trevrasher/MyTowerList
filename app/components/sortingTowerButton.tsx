import { useState } from "react"
import { SortState } from "../utils/towers";


interface SortingTowerButtonProps {
    sortMode: SortState;
    setSortMode: (value: SortState | ((prev: SortState) => SortState)) => void;
}

export default function SortingTowerButton({sortMode, setSortMode}: SortingTowerButtonProps) {
    const [sortPopup, setSortPopup] = useState(false);
    return (
        <div>
            <button className="w-15 h-15 bg-zinc-700 text-white rounded hover:bg-zinc-400 transition mx-4 flex items-center justify-center" onClick={() => setSortPopup(!sortPopup)}>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 mt-2 ml-1" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M3 3a1 1 0 000 2h11a1 1 0 100-2H3zM3 7a1 1 0 000 2h7a1 1 0 100-2H3zM3 11a1 1 0 100 2h4a1 1 0 100-2H3zM15 8a1 1 0 10-2 0v5.586l-1.293-1.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L15 13.586V8z" />
                </svg>
            </button>
            {sortPopup &&
                <div className="absolute -ml-5 w-35 bg-zinc-800 flex flex-col mt-2 z-50 rounded px-2 py-2">
                    <button className = "mb-1 text-xl cursor-pointer" onClick={() => {setSortMode(prev => prev === 'scoreUp' ? 'scoreDown' : 'scoreUp')}}>
                        Score {sortMode === 'scoreUp' ? '↑' : sortMode === 'scoreDown' ? '↓' : ''}
                    </button>
                    <button className = "mb-1 text-xl cursor-pointer" onClick={() => {
                        setSortMode(prev =>
                            prev === 'difficultyUp' ? 'difficultyDown' : 'difficultyUp'
                        )
                    }}>
                        Difficulty {sortMode === 'difficultyUp' ? '↑' : sortMode === 'difficultyDown' ? '↓' : ''}
                    </button>
                </div>
            }
        </div>

    )
}