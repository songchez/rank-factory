import { getTopicById, getTopicItems } from "@/lib/data";
import { ItemManager } from "@/components/admin/item-manager";
import { Header } from "@/components/header";
import { NeoButton } from "@/components/neo-button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getModeLabel } from "@/lib/topics";
import { FactContentEditor } from "@/components/admin/fact-content-editor";

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
          <NeoButton variant="outline" className="mb-4 gap-2 w-48 flex items-center">
            <ArrowLeft className="w-4 h-4" /> 목록으로 돌아가기
          </NeoButton>
        </Link>
        
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <span className="text-sm font-bold bg-primary px-3 py-1 border border-black rounded-full">
              {topic.category}
            </span>
            <span className="text-sm font-bold bg-white px-3 py-1 border border-black rounded-full">
              {getModeLabel(topic.mode)}
            </span>
            <h1 className="font-heading text-4xl">{topic.title}</h1>
          </div>
          <p className="text-muted-foreground">ID: {topic.id}</p>
        </div>

        <div className="space-y-8">
          <ItemManager topicId={topic.id} initialItems={items} topicMode={topic.mode} />
          <FactContentEditor
            topicId={topic.id}
            initialMarkdown={topic.contentMarkdown || ""}
            enabled={topic.mode === "D"}
          />
        </div>
      </main>
    </div>
  );
}
