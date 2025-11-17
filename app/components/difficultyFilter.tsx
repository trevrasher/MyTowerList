import { Range, getTrackBackground } from 'react-range';

interface DifficultyFilterProps {
  difficultyRange: number[];
  setDifficultyRange: (values: number[]) => void;
}

export default function DifficultyFilter({ difficultyRange, setDifficultyRange }: DifficultyFilterProps) {
return (
    <div className="p-5 bg-gray-600 rounded-lg mb-5">
      <div className="mb-4">
        <label className="block mb-2 font-semibold text-black">
          Difficulty Range: {difficultyRange[0].toFixed(1)} - {difficultyRange[1].toFixed(1)}
        </label>
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
                className="h-1.5 w-full rounded"
                style={{
                  background: getTrackBackground({
                    values: difficultyRange,
                    colors: ['#d1d5db', '#3b82f6', '#d1d5db'],
                    min: 1,
                    max: 12
                  })
                }}
              >
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
                // ...existing code...
              />
            );
          }}
        />
      </div>
    </div>
  );
}