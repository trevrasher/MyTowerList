import LoginButton from "./loginButton"
import SyncButton from "./syncCompletions"

interface MainHeaderProps {
    isAuthenticated: boolean;
}

export default function MainHeader({ isAuthenticated }: MainHeaderProps) {
    return (
        <div className="w-full h-15 bg-zinc-900 p-2 mb-10">
            <div className="w-[95vw] mx-auto flex items-center justify-between">
                <div className="flex-1 flex justify-end">
                </div>
                <span className="text-4xl mx-5 flex-shrink-0">MyTowerList</span>
                <div className="flex-1 flex justify-end space-x-4">
                    {true && <SyncButton />}
                    <LoginButton />
                </div>
            </div>
        </div>
    )
}