type Props = {
  setSelectedAreas: (values: string[]) => void;
};

export default function AutoAreaFilterButton({ setSelectedAreas }: Props) {

    const handleClick = async () => {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/profile/available-areas/`, {
            headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
            'Content-Type': 'application/json'
        }});
        const data = await res.json();
        setSelectedAreas(data);
        
    }

    return (
        <button onClick = {handleClick}  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-700">
           Sync Areas
        </button>

    )
}