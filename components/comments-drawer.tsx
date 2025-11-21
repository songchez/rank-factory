"use client"

import { useState } from "react"
import { X, Heart, Send } from "lucide-react"
import { NeoButton } from "./neo-button"
import { NeoCard } from "./neo-card"

interface Comment {
  id: string
  nickname: string
  content: string
  supportedItem: string
  likes: number
  createdAt: string
}

interface CommentsDrawerProps {
  isOpen: boolean
  onClose: () => void
  topicTitle: string
  items: Array<{ id: string; name: string }>
}

const randomNicknames = [
  "프로불편러",
  "도파민중독자",
  "결정장애왕",
  "논쟁의달인",
  "취향저격수",
  "랭킹마스터",
  "투표광",
  "선택의신",
  "밸런스왕",
  "고인물",
]

function generateRandomNickname() {
  return randomNicknames[Math.floor(Math.random() * randomNicknames.length)] + Math.floor(Math.random() * 9999)
}

const mockComments: Comment[] = [
  {
    id: "1",
    nickname: "프로불편러1234",
    content: "이게 1등이라고? 나라 망했네 ㅋㅋㅋ",
    supportedItem: "신라면",
    likes: 42,
    createdAt: "5분 전",
  },
  {
    id: "2",
    nickname: "도파민중독자5678",
    content: "불닭이 최고지 ㅇㅈ?",
    supportedItem: "불닭볶음면",
    likes: 28,
    createdAt: "12분 전",
  },
  {
    id: "3",
    nickname: "결정장애왕9012",
    content: "둘 다 맛있는데 고르기 너무 힘들어요 ㅠㅠ",
    supportedItem: "진라면",
    likes: 15,
    createdAt: "23분 전",
  },
]

export function CommentsDrawer({ isOpen, onClose, topicTitle, items }: CommentsDrawerProps) {
  const [comments, setComments] = useState<Comment[]>(mockComments)
  const [newComment, setNewComment] = useState("")
  const [selectedSupport, setSelectedSupport] = useState<string>(items[0]?.id || "")

  const handleSubmit = () => {
    if (!newComment.trim() || newComment.length > 100) return

    const comment: Comment = {
      id: Date.now().toString(),
      nickname: generateRandomNickname(),
      content: newComment,
      supportedItem: items.find((item) => item.id === selectedSupport)?.name || "",
      likes: 0,
      createdAt: "방금 전",
    }

    setComments([comment, ...comments])
    setNewComment("")
  }

  const handleLike = (commentId: string) => {
    setComments(
      comments.map((comment) => (comment.id === commentId ? { ...comment, likes: comment.likes + 1 } : comment)),
    )
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full md:w-[480px] bg-background border-l-3 border-black z-50 transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="border-b-3 border-black p-4 bg-primary">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-heading text-2xl">댓글</h2>
                <p className="text-sm">{topicTitle}</p>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 flex items-center justify-center border-2 border-black bg-background hover:bg-accent transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Comments List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {comments.map((comment) => (
              <NeoCard key={comment.id} className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="font-bold text-sm">{comment.nickname}</div>
                    <div className="text-xs text-muted-foreground">{comment.createdAt}</div>
                  </div>
                  <div className="bg-secondary text-secondary-foreground px-2 py-1 text-xs border-2 border-black">
                    {comment.supportedItem}
                  </div>
                </div>
                <p className="mb-3 text-sm leading-relaxed">{comment.content}</p>
                <button
                  onClick={() => handleLike(comment.id)}
                  className="flex items-center gap-1 text-sm hover:text-accent transition-colors"
                >
                  <Heart className="w-4 h-4" />
                  <span>{comment.likes}</span>
                </button>
              </NeoCard>
            ))}
          </div>

          {/* Input Area */}
          <div className="border-t-3 border-black p-4 bg-card">
            <div className="mb-3">
              <label className="text-xs font-bold mb-2 block">지지하는 후보</label>
              <div className="flex gap-2 flex-wrap">
                {items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedSupport(item.id)}
                    className={`px-3 py-1 text-sm border-2 border-black transition-colors ${
                      selectedSupport === item.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-background hover:bg-muted"
                    }`}
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value.slice(0, 100))}
                placeholder="댓글을 입력하세요 (최대 100자)"
                className="flex-1 px-4 py-2 border-3 border-black focus:outline-none focus:ring-2 focus:ring-primary"
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              />
              <NeoButton onClick={handleSubmit} disabled={!newComment.trim()} size="sm" className="px-4">
                <Send className="w-4 h-4" />
              </NeoButton>
            </div>
            <div className="text-xs text-muted-foreground mt-2 text-right">{newComment.length}/100</div>
          </div>
        </div>
      </div>
    </>
  )
}
