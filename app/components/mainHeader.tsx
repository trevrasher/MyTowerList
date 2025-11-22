import LoginButton from "./loginButton"
import SyncButton from "./syncCompletions"
export default function MainHeader() {
    return (
        <div className="w-full h-15 gray-500 relative bg-zinc-900 p-2 mb-10">
            <div className="flex justify-center">
                <span className="text-4xl mx-5">MyTowerList</span>
                <LoginButton/>
                <SyncButton/>
                
            </div>
        </div>
        
    )
}