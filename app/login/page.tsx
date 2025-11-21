import { AuthButtons } from "@/components/auth-buttons"
import { NeoCard } from "@/components/neo-card"

export default function LoginPage() {
  return (
    <div className="container mx-auto flex min-h-[calc(100vh-80px)] items-center justify-center px-4 py-8">
      <NeoCard className="w-full max-w-md p-8 bg-white">
        <div className="flex flex-col items-center gap-6 text-center">
          <div className="space-y-2">
            <h1 className="font-heading text-3xl md:text-4xl">로그인</h1>
            <p className="text-muted-foreground font-medium">랭킹공장에 오신 것을 환영합니다!</p>
          </div>

          <div className="w-full h-px bg-black/10" />

          <AuthButtons />

          <p className="text-xs text-muted-foreground mt-4">
            로그인함으로써 이용약관 및 개인정보처리방침에 동의합니다.
          </p>
        </div>
      </NeoCard>
    </div>
  )
}
