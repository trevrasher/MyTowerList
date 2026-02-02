import { Range, getTrackBackground } from 'react-range';
import { useState, useEffect } from 'react';

interface DifficultyFilterProps {
  difficultyRange: number[];
  setDifficultyRange: (values: [number, number]) => void;
}



const SEGMENTS: string[] = [
  '#7CFF4D', 
  '#FFFF00', 
  '#FFA200', 
  '#FF5050 ', 
  '#C80000 ',
  '#000000 ', 
  '#FF00E6 ', 
  '#0000FF ', 
  '#0389FF ',
  '#00FFFF  ', 
  '#FFFFFF ',
 
];

export default function DifficultyFilter({ difficultyRange, setDifficultyRange }: DifficultyFilterProps) {
  const [tempDifficultyRange, setTempDifficultyRange] = useState<number[]>(difficultyRange);

  useEffect(() => {
    setTempDifficultyRange(difficultyRange);
  }, [difficultyRange]);

  return (
    <div className="p-5 bg-zinc-900 rounded-lg w-1/1">
      <div>
        <div className="block mb-2 font-semibold text-white">
          Difficulty Range: {tempDifficultyRange[0].toFixed(1)} - {tempDifficultyRange[1].toFixed(1)}
        </div>
        <Range
          step={0.1}
          min={1}
          max={12}
          values={tempDifficultyRange}
          onChange={(values) => setTempDifficultyRange([values[0], values[1]])}
          onFinalChange={(values) => setDifficultyRange([values[0], values[1]])}
          renderTrack={({ props, children }) => {
            const { key, ...restProps } = props as any;
            return (
              <div
                key={key}
                {...restProps}
                className="h-5 rounded border border-black border-2"
                style={{
                  background: `linear-gradient(to right, ${
                    [...Array(11)].map((_, i) => {
                      const segStart = i + 1;
                      const segEnd = i + 2;
                      const startPct = ((segStart - 1) / 11) * 100;
                      const endPct = ((segEnd - 1) / 11) * 100;

                      if (tempDifficultyRange[1] <= segStart || tempDifficultyRange[0] >= segEnd) {
                        return `#7078837a ${startPct}%, #7078837a ${endPct}%`;
                      }
                    
                      if (tempDifficultyRange[0] <= segStart && tempDifficultyRange[1] >= segEnd) {
                        return `${SEGMENTS[i]} ${startPct}%, ${SEGMENTS[i]} ${endPct}%`;
                      }

                      if (tempDifficultyRange[0] > segStart && tempDifficultyRange[0] < segEnd) {
                        const fillPct = ((tempDifficultyRange[0] - segStart) / 1) * (endPct - startPct) + startPct;
                        return [
                          `#7078837a ${startPct}%, #7078837a ${fillPct}%`,
                          `${SEGMENTS[i]} ${fillPct}%, ${SEGMENTS[i]} ${endPct}%`
                        ].join(', ');
                      }

                      if (tempDifficultyRange[1] > segStart && tempDifficultyRange[1] < segEnd) {
                        const fillPct = ((tempDifficultyRange[1] - segStart) / 1) * (endPct - startPct) + startPct;
                        return [
                          `${SEGMENTS[i]} ${startPct}%, ${SEGMENTS[i]} ${fillPct}%`,
                          `#7078837a ${fillPct}%, #7078837a ${endPct}%`
                        ].join(', ');
                      }
                    }).join(', ')
                  })`
                }}>
                {children}
              </div>
            );
          }}
          renderThumb={({ props, index }) => {
            const { key, ...restProps } = props as any;
            return (
              <div
                key={key}
                {...restProps}
                className="h-11 w-11 bg-zinc-600 rounded-full flex items-center justify-center mx-auto">
                <span className="text-xs text-white">{tempDifficultyRange[index].toFixed(1)}</span>
              </div>
            );
          }}
        />
      </div>
    </div>
  );
}