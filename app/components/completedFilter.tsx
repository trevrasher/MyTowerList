interface CompletedFilterProps {
    completedToggle: boolean
    setCompletedToggle: (values: boolean) => void;
}



export default function CompletedFilter ({completedToggle, setCompletedToggle} : CompletedFilterProps){

    return (
        <div>
            <label className="flex items-center space-x-2 cursor-pointer w-30 py-4 bg-zinc-700 text-white rounded">
                <input
                type = "checkbox"
                checked = {completedToggle}
                onChange={() => setCompletedToggle(!completedToggle)}
                className="daily-checkbox scale-200"
                />
                <span className="text-sm">Show Completed</span>
            </label>
        </div>
    )


}

