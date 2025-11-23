interface CompletedFilterProps {
    completedToggle: boolean
    setCompletedToggle: (values: boolean) => void;
}



export default function CompletedFilter ({completedToggle, setCompletedToggle} : CompletedFilterProps){

    return (
        <div>
            <label className="flex items-center cursor-pointer w-40 py-4 bg-zinc-700 text-white rounded hover:bg-zinc-400 transition">
                <input
                type = "checkbox"
                checked = {completedToggle}
                onChange={() => setCompletedToggle(!completedToggle)}
                className="daily-checkbox"
                />
                <span>Hide Completed</span>
            </label>
        </div>
    )


}

