import { getTopicById, getTopicItems } from "@/lib/data";
import { ItemManager } from "@/components/admin/item-manager";
import { Header } from "@/components/header";
import { NeoButton } from "@/components/neo-button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

interface TopicDetailPageProps {
  params: {
    id: string;
  };
}

export default async function TopicDetailPage({ params }: TopicDetailPageProps) {
  const { id } = await params;
  const topic = await getTopicById(id);

  if (!topic) {
    notFound();
  }

  // Fetch items for this topic (initial load)
  const { items } = await getTopicItems(id, 1, 100); // Fetch up to 100 items initially

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Link href="/admin">
          <NeoButton variant="outline" className="mb-4 pl-0 gap-2">
            <ArrowLeft className="w-4 h-4" /> 목록으로 돌아가기
          </NeoButton>
        </Link>
        
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-sm font-bold bg-primary px-3 py-1 border border-black rounded-full">
              {topic.category}
            </span>
            <h1 className="font-heading text-4xl">{topic.title}</h1>
          </div>
          <p className="text-muted-foreground">ID: {topic.id}</p>
        </div>

        <ItemManager topicId={topic.id} initialItems={items} />
      </main>
    </div>
  );
}
