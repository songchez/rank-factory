"use client"

import { createClient } from "@/lib/supabase/client"
import { NeoButton } from "./neo-button"
import type { ComponentProps } from "react"

export function AuthButtons({ className, ...props }: ComponentProps<"div">) {
  const supabase = createClient()

  const handleLogin = async (provider: "google" | "kakao" | "naver") => {
    const next = new URLSearchParams(window.location.search).get("next")
    const redirectTo = new URL(`${location.origin}/auth/callback`)
    if (next) {
      redirectTo.searchParams.set("next", next)
    }

    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: redirectTo.toString(),
      },
    })
  }

  return (
    <div className={`flex flex-col gap-3 w-full ${className}`} {...props}>
      <NeoButton
        onClick={() => handleLogin("google")}
        className="w-full bg-white text-black hover:bg-gray-100 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
      >
        Google 로그인
      </NeoButton>
      <NeoButton
        onClick={() => handleLogin("kakao")}
        className="w-full bg-[#FEE500] text-black hover:bg-[#FDD835] border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
      >
        Kakao 로그인
      </NeoButton>
      {/* Naver provider string is 'naver' if configured in Supabase */}
      <NeoButton
        onClick={() => handleLogin("naver" as any)}
        className="w-full bg-[#03C75A] text-white hover:bg-[#02B351] border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
      >
        Naver 로그인
      </NeoButton>
    </div>
  )
}
