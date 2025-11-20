import { Range, getTrackBackground } from 'react-range';

interface DifficultyFilterProps {
  difficultyRange: number[];
  setDifficultyRange: (values: number[]) => void;
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
  return (
    <div className="p-5 bg-zinc-900 rounded-lg mb-5">
      <div className="mb-4">
        <div className="block mb-2 font-semibold text-white">
          Difficulty Range: {difficultyRange[0].toFixed(1)} - {difficultyRange[1].toFixed(1)}
        </div>
        <Range
          step={0.1}
          min={1}
          max={12}
          values={difficultyRange}
          onChange={(values) => setDifficultyRange(values)}
          renderTrack={({ props, children }) => {
            const { key, ...restProps } = props as any;
            return (
              <div
                key={key}
                {...restProps}
                className="h-3 w-1/1 rounded border border-black border-2"
                style={{
                  background: `linear-gradient(to right, ${
                    [...Array(11)].map((_, i) => {
                      const segStart = i + 1;
                      const segEnd = i + 2;
                      const startPct = ((segStart - 1) / 11) * 100;
                      const endPct = ((segEnd - 1) / 11) * 100;

                      if (difficultyRange[1] <= segStart || difficultyRange[0] >= segEnd) {
                        return `#7078837a ${startPct}%, #7078837a ${endPct}%`;
                      }
                    
                      if (difficultyRange[0] <= segStart && difficultyRange[1] >= segEnd) {
                        return `${SEGMENTS[i]} ${startPct}%, ${SEGMENTS[i]} ${endPct}%`;
                      }

                      if (difficultyRange[0] > segStart && difficultyRange[0] < segEnd) {
                        const fillPct = ((difficultyRange[0] - segStart) / 1) * (endPct - startPct) + startPct;
                        return [
                          `#7078837a ${startPct}%, #7078837a ${fillPct}%`,
                          `${SEGMENTS[i]} ${fillPct}%, ${SEGMENTS[i]} ${endPct}%`
                        ].join(', ');
                      }

                      if (difficultyRange[1] > segStart && difficultyRange[1] < segEnd) {
                        const fillPct = ((difficultyRange[1] - segStart) / 1) * (endPct - startPct) + startPct;
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
                className="h-10 w-10 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-xs text-white">{difficultyRange[index].toFixed(1)}</span>
              </div>
            );
          }}
        />
      </div>
    </div>
  );
}