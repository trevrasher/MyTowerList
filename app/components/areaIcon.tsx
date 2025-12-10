import { Tower, getTowerAreaImage, areaAcronyms } from "../utils/towers";

export default function AreaIcon({ tower }: { tower: Tower }) {
    return (
        <div className="absolute bottom-14 left-0 w-14 h-14 flex items-center justify-center">
            <div className="w-14 h-14 border-2 border-white rounded-md flex items-center justify-center bg-black">
                <img
                    src={getTowerAreaImage(tower.area)}
                    className="w-12 h-12 rounded"
                    alt={tower.area}
                />
            </div>
            <span className="absolute text-xl font-bold text-white text-outline">
                {areaAcronyms[tower.area]}
            </span>
        </div>
    );
}