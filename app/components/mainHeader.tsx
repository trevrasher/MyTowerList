import React, { useEffect, useState } from "react";
import LoginButton from "./loginButton"
import SyncButton from "./syncCompletions"
import { API_BASE_URL } from "@/next.config";

interface MainHeaderProps {
    isAuthenticated: boolean;
}

type User = { username: string; roblox_user_id: string };

export default function MainHeader({ isAuthenticated }: MainHeaderProps) {
    const [robloxUserId, setRobloxUserId] = useState<string | null>(null);
    const [robloxUsername, setRobloxUsername] = useState<string | null>(null);

    useEffect(() => {
        if (isAuthenticated) {
            fetch(`${API_BASE_URL}/api/profile`, {
                credentials: "include",
                headers: { "Authorization": `Bearer ${localStorage.getItem("access_token")}` }
            })
                .then(res => res.json())
                .then((user: User) => {
                    setRobloxUserId(user.roblox_user_id);
                    setRobloxUsername(user.username);
                });
        }
    }, [isAuthenticated]);

    return (
        <div className="w-full h-15 bg-zinc-900 p-2 mb-10">
            <div className="w-[95vw] mx-auto flex items-center justify-between">
                <div className="flex-1 flex justify-end">
                </div>
                <span className="text-4xl mx-5 flex-shrink-0">MyTowerList</span>
                <div className="flex-1 flex justify-end space-x-4">
                    {isAuthenticated && <SyncButton />}
                    <LoginButton />
                </div>
                {isAuthenticated &&
                    <div>
                        <img src={`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${robloxUserId}&size=150x150&format=Png&isCircular=false`} alt="Roblox Avatar" />
                        <span>Logged in as {robloxUsername}</span>
                    </div>
                }
            </div>
        </div>
    )
}