import { Header } from "@/components/header";
import { NeoButton } from "@/components/neo-button";
import { getTopics } from "@/lib/data";
import Link from "next/link";
import HomeFeed from "@/components/home-feed";

export const runtime = "edge";

export default async function HomePage() {
  const { topics } = await getTopics();

  if (topics.length === 0) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="container mx-auto px-4 py-8 text-center">
          <h1 className="font-heading text-4xl mb-4">데이터가 없습니다</h1>
          <p>관리자에게 문의하거나 시딩을 진행해주세요.</p>
          <Link href="/api/seed">
            <NeoButton className="mt-4">데이터 시딩하기</NeoButton>
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <HomeFeed topics={topics} />
      </main>
    </div>
  );
}
