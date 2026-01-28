import { fetchWithAuth } from "@/app/utils/auth";

type Props = {
  setSelectedAreas: (values: string[]) => void;
};

export default function AutoAreaFilterButton({ setSelectedAreas }: Props) {

    const handleClick = async () => {
        try {
            const data = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/profile/available-areas/`);
            setSelectedAreas(data);
        } catch (error) {
            console.error('Failed to fetch available areas:', error);
        }
        
    }

    return (
        <button onClick = {handleClick}  className="bg-zinc-600 text-white px-4 py-2 rounded hover:bg-zinc-400">
           Show Available Areas
        </button>

    )
}