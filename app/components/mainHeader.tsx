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
    const [username, setUsername] = useState<string | null>(null);

    useEffect(() => {
        if (isAuthenticated) {
            const cachedAvatar = localStorage.getItem("avatar_url");
            const cachedUsername = localStorage.getItem("username");
            
            if (cachedAvatar && cachedUsername) {
                setAvatarUrl(cachedAvatar);
                setUsername(cachedUsername);
                return;
            }
            
            fetch(`${API_BASE_URL}/api/profile`, {
                credentials: "include",
                headers: { "Authorization": `Bearer ${localStorage.getItem("access_token")}` }
            })
                .then(res => res.json())
                .then((res) => {
                    const url = res.avatar_url || null;
                    const user = res.username || null;
                    
                    setAvatarUrl(url);
                    setUsername(user);
                    
                    if (url) {
                        localStorage.setItem("avatar_url", url);
                    }
                    if (user) {
                        localStorage.setItem("username", user);
                    }
                });
        }
    }, [isAuthenticated]);

    return (
        <div className="w-full h-18 bg-zinc-900  mb-10">
            <div className="w-[95vw] h-18 mx-auto flex items-center justify-between">
                <Link href="/" className="sm:hidden text-4xl absolute mx-auto flex-shrink-0 cursor-pointer hover:opacity-80 transition text-outline">
                    MTL
                </Link>
                <Link href="/" className="text-4xl absolute mx-auto flex-shrink-0 cursor-pointer hover:opacity-80 transition text-outline invisible sm:visible ">
                    MyTowerList
                </Link>
                <div className="flex-1 flex justify-end ">
                    {isAuthenticated && <SyncButton />}
                    <LoginButton />
                </div>
                {isAuthenticated && username &&
                    <Link href={`/profiles/${username}`} className="ml-2 md:ml-4">
                        {avatarUrl && <img src={avatarUrl} alt="Roblox Avatar" className="w-15 h-15 border-2 rounded-md cursor-pointer hover:opacity-80 transition" />}
                    </Link>
                }
            </div>
        </div>
    )
}