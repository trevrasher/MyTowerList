import React, { useEffect, useState } from "react";
import LoginButton from "./loginButton"
import SyncButton from "./syncCompletions"
import { API_BASE_URL } from "@/next.config";
import Link from "next/link";

interface MainHeaderProps {
    isAuthenticated: boolean;
}

export default function MainHeader({ isAuthenticated }: MainHeaderProps) {
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [robloxUsername, setRobloxUsername] = useState<string | null>(null);

    useEffect(() => {
        if (isAuthenticated) {
            fetch(`${API_BASE_URL}/api/profile`, {
                credentials: "include",
                headers: { "Authorization": `Bearer ${localStorage.getItem("access_token")}` }
            })
                .then(res => res.json())
                .then((res) => {
                    setRobloxUsername(res.username);
                    setAvatarUrl(res.avatar_url || null);
                });
        }
    }, [isAuthenticated]);

    return (
        <div className="w-full h-18 bg-zinc-900  mb-10">
            <div className="w-[95vw] h-18 mx-auto flex items-center justify-between">
                <div className="flex-1 flex justify-end">
                </div>
                <Link href="/" className="text-4xl mx-5 flex-shrink-0 cursor-pointer hover:opacity-80 transition text-outline">
                    MyTowerList
                </Link>
                <div className="flex-1 flex justify-end space-x-4">
                    {isAuthenticated && <SyncButton />}
                    <LoginButton />
                </div>
                {isAuthenticated &&
                    <div className="ml-8">
                        {avatarUrl && <img src={avatarUrl} alt="Roblox Avatar" className="w-15 h-15 border-2 rounded-md" />}
                    </div>
                }
            </div>
        </div>
    )
}