import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getTopics } from "@/lib/data";
import { TopicList } from "@/components/admin/topic-list";
import { NeoCard } from "@/components/neo-card";
import { Header } from "@/components/header";

export default async function AdminPage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();

  const adminEmails = (process.env.ADMIN_EMAIL || "")
    .split(",")
    .map((e) => e.trim())
    .filter((e) => e.length > 0);

  const isOpenAdmin = adminEmails.length === 0;

  if (!isOpenAdmin && (!user || !user.email || !adminEmails.includes(user.email))) {
    redirect("/login");
  }

  // Fetch topics (page 1, limit 10)
  const { topics, total } = await getTopics(1, 10);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="font-heading text-4xl">관리자 대시보드</h1>
          <NeoCard className="bg-secondary text-white px-4 py-2">
            <span className="text-sm font-bold">
              {user?.email || (isOpenAdmin ? "게스트 (ADMIN_EMAIL 미설정)" : "로그인 필요")}
            </span>
          </NeoCard>
        </div>
        
        <TopicList initialTopics={topics} total={total} />
      </main>
    </div>
  );
}
