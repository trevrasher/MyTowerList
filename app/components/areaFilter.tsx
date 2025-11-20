interface AreaFilterProps {
    areas: string[]
    selectedAreas: string[]
    setSelectedAreas: (values: string[]) => void;
}



export default function AreaFilter({areas, setSelectedAreas, selectedAreas}: AreaFilterProps) {

    const groupedAreas = areas.reduce<{ [key: string]: string[] }>((acc, area) => {
        const group = area.startsWith("Ring") ? "Rings" : area.startsWith("Zone") ? "Zones" : "Subareas";
        if (!acc[group]) acc[group] = [];
        acc[group].push(area);
        return acc;
    }, {});

    const handleToggle = (area: string) => {
        if (selectedAreas.includes(area)) {
            setSelectedAreas(selectedAreas.filter(a => a !== area));
        } else {
            setSelectedAreas([...selectedAreas, area]);
        }
    };

    const worldToggle = (group: string) => {
        if (!(group in groupedAreas)) return;
        const groupAreas = groupedAreas[group];
        const anySelected = groupAreas.some(area => selectedAreas.includes(area));
        if (anySelected) {
            setSelectedAreas(selectedAreas.filter(a => !groupAreas.includes(a)));
        } else {
            setSelectedAreas([...selectedAreas, ...groupAreas]);
        }
    };
    
    return (
    <div className="flex gap-8">
    {Object.entries(groupedAreas).map(([group, groupAreas]) => (
        <div key={group} className="mb-4 text-xl">
        <label className="font-bold mb-2 cursor-pointer" onClick={() => worldToggle(group)}>{group}</label>
        {groupAreas.map((area) => (
            <label key={area} className="flex items-center space-x-2 cursor-pointer">
            <input
                type="checkbox"
                checked={selectedAreas.includes(area)}
                onChange={() => handleToggle(area)}
                className="w-4 h-4"
            />
            <span className="text-sm">{area}</span>
            </label>
        ))}
        </div>
    ))}
    </div>
    );
}