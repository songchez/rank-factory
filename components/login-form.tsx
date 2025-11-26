"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { NeoButton } from "./neo-button"
import { Loader2 } from "lucide-react"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setIsLoading(false)
    } else {
      router.push("/")
      router.refresh()
    }
  }

  const handleSignUp = async () => {
    setIsLoading(true)
    setError(null)

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${location.origin}/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
      setIsLoading(false)
    } else {
      setError("가입 확인 메일을 보냈습니다. 이메일을 확인해주세요.")
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSignIn} className="w-full space-y-4">
      <div className="space-y-2">
        <input
          type="email"
          placeholder="이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-primary"
          required
        />
        <input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-primary"
          required
        />
      </div>

      {error && <p className="text-red-500 text-sm font-bold">{error}</p>}

      <div className="flex gap-3">
        <NeoButton
          type="submit"
          disabled={isLoading}
          className="flex-1 bg-primary text-black"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "로그인"}
        </NeoButton>
        <NeoButton
          type="button"
          onClick={handleSignUp}
          disabled={isLoading}
          variant="outline"
          className="flex-1"
        >
          회원가입
        </NeoButton>
      </div>
    </form>
  )
}
