

export default function AutoAreaFilterButton(setSelectedAreas: (values: string[]) => void) {

    const handleClick = async () => {
        const res = await fetch('api/profile/available-areas');
        const data = await res.json();
        setSelectedAreas(data);
        
    }

    return (
        <button onClick = {handleClick}  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-700">
           Sync Areas
        </button>

    )
}