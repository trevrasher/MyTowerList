interface CompletedFilterProps {
    completedToggle: boolean
    setCompletedToggle: (values: boolean) => void;
}

export default function CompletedFilter ({completedToggle, setCompletedToggle} : CompletedFilterProps){

    return (
        <div>
            <label className="flex items-center space-x-2 cursor-pointer">
                <input
                type = "checkbox"
                checked = {completedToggle}
                onChange={() => setCompletedToggle(!completedToggle)}
                className="w-4 h-4"
                />
                <span className="text-sm">Toggle Completed Towers</span>
            </label>
        </div>
    )


}

