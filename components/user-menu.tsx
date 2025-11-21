"use client"

import { createClient } from "@/lib/supabase/client"
import { NeoButton } from "./neo-button"
import { useRouter } from "next/navigation"
import type { User } from "@supabase/supabase-js"

interface UserMenuProps {
  user: User
}

export function UserMenu({ user }: UserMenuProps) {
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.refresh()
  }

  return (
    <div className="flex items-center gap-4">
      <span className="hidden md:inline-block font-bold text-sm truncate max-w-[150px]">{user.email}</span>
      <NeoButton variant="secondary" size="sm" onClick={handleLogout} className="text-xs px-3 h-8">
        로그아웃
      </NeoButton>
    </div>
  )
}
