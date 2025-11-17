interface AreaFilterProps {
    areas: string[]
    selectedAreas: string[]
    setSelectedAreas: (values: string[]) => void;
}

export default function AreaFilter({areas, setSelectedAreas, selectedAreas}: AreaFilterProps) {
    const handleToggle = (area: string) => {
        if (selectedAreas.includes(area)) {
            setSelectedAreas(selectedAreas.filter(a => a !== area));
        } else {
            setSelectedAreas([...selectedAreas, area]);
        }
    };
    
    return(
        <div>
            {areas.map((area) =>
                <label key ={area}  className="flex items-center space-x-2 cursor-pointer">
                    <input
                            type="checkbox"
                            checked={selectedAreas.includes(area)}
                            onChange={() => handleToggle(area)}
                            className="w-4 h-4"
                        />
                    <span className="text-sm">{area}</span>
                </label>
            )}

        </div>
    )
}