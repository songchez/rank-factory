import Link from "next/link"
import { NeoButton } from "./neo-button"
import { createClient } from "@/lib/supabase/server"
import { UserMenu } from "./user-menu"

export async function Header() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <header className="sticky top-0 z-50 border-b-3 border-black bg-background">
      <div className="container mx-auto flex items-center justify-between px-4 py-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="font-heading text-2xl md:text-3xl">랭킹공장</div>
        </Link>

        <nav className="hidden md:flex items-center gap-4">
          <Link href="/" className="font-bold hover:text-primary transition-colors">
            홈
          </Link>
          <Link href="/games" className="font-bold hover:text-primary transition-colors">
            순위 게임
          </Link>
          <Link href="/rankings" className="font-bold hover:text-primary transition-colors">
            랭킹
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <UserMenu user={user} />
          ) : (
            <Link href="/login">
              <NeoButton variant="primary" size="sm">
                로그인
              </NeoButton>
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
