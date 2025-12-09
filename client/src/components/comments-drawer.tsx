

import { useState } from "react"
import { X, Heart, Send } from "lucide-react"
import { NeoButton } from "./neo-button"
import { NeoCard } from "./neo-card"
import { postCommentAction } from "../lib/actions"
import { type Comment } from "../lib/types"
import { useNavigate } from "react-router-dom"

interface CommentsDrawerProps {
  isOpen: boolean
  onClose: () => void
  topicId: string
  topicTitle: string
  items: Array<{ id: string; name: string }>
  initialComments: Comment[]
}

export function CommentsDrawer({ isOpen, onClose, topicId, topicTitle, items, initialComments }: CommentsDrawerProps) {
  const navigate = useNavigate()
  const [comments, setComments] = useState<Comment[]>(initialComments)
  const [newComment, setNewComment] = useState("")
  const [selectedSupport, setSelectedSupport] = useState<string>(items[0]?.id || "")

  // Update comments when initialComments changes (e.g. after revalidation)
  // useEffect(() => {
  //   setComments(initialComments)
  // }, [initialComments])
  // Actually, we might want to just use initialComments directly if we trust the parent to update it.
  // But for optimistic updates, local state is better.
  // Let's sync them.
  if (initialComments !== comments && initialComments.length > comments.length) {
      // Simple check to see if we got new data from server
      setComments(initialComments)
  }

  const handleSubmit = async () => {
    if (!newComment.trim() || newComment.length > 100) return

    // Optimistic update
    const tempId = Date.now().toString()
    const optimisticComment: Comment = {
      id: tempId,
      topic_id: topicId,
      nickname: "나 (작성중)",
      content: newComment,
      created_at: new Date().toISOString(),
    }

    setComments([optimisticComment, ...comments])
    setNewComment("")

    const result = await postCommentAction(topicId, newComment)
    
    if (result.success) {
       // Refresh to get the real comment with generated nickname
    } else {
      // Revert if failed
      setComments(comments.filter(c => c.id !== tempId))
      alert("댓글 작성에 실패했습니다.")
    }
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
                    <div className="text-xs text-muted-foreground">
                      {new Date(comment.created_at).toLocaleString()}
                    </div>
                  </div>
                  {/* Supported item display - if we stored it. For now, we don't store supported item in DB schema, so omitting or mocking */}
                  {/* <div className="bg-secondary text-secondary-foreground px-2 py-1 text-xs border-2 border-black">
                    {comment.supportedItem}
                  </div> */}
                </div>
                <p className="mb-3 text-sm leading-relaxed">{comment.content}</p>
                {/* Likes are not in DB yet, so omitting */}
                {/* <button
                  onClick={() => handleLike(comment.id)}
                  className="flex items-center gap-1 text-sm hover:text-accent transition-colors"
                >
                  <Heart className="w-4 h-4" />
                  <span>{comment.likes}</span>
                </button> */}
              </NeoCard>
            ))}
            {comments.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                    첫 번째 댓글을 남겨보세요!
                </div>
            )}
          </div>

          {/* Input Area */}
          <div className="border-t-3 border-black p-4 bg-card">
            {/* Supported item selection - currently visual only as DB doesn't store it yet */}
            <div className="mb-3">
              <label className="text-xs font-bold mb-2 block">지지하는 후보 (투표 반영 X)</label>
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
