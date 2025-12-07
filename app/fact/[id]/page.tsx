import { Header } from "@/components/header";
import { FactClient } from "@/components/fact-client";
import { getTopicById } from "@/lib/data";
import { getModePlayPath } from "@/lib/topics";
import { notFound, redirect } from "next/navigation";

export const runtime = "edge";

export default async function FactPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const topic = await getTopicById(id);

  if (!topic) {
    notFound();
  }

  if (topic.mode !== "D") {
    redirect(getModePlayPath(topic));
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <FactClient topic={topic} />
      </main>
    </div>
  );
}
