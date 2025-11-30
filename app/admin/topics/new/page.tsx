import { CreateTopicForm } from "@/components/admin/create-topic-form";
import { Header } from "@/components/header";
import { NeoButton } from "@/components/neo-button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewTopicPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Link href="/admin">
          <NeoButton variant="outline" className="mb-4 gap-2 flex items-center w-48">
            <ArrowLeft className="w-4 h-4" /> 목록으로 돌아가기
          </NeoButton>
        </Link>
        
        <h1 className="font-heading text-3xl mb-8">새 주제 만들기</h1>
        <CreateTopicForm />
      </main>
    </div>
  );
}
