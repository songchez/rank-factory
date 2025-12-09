import { supabase } from './supabase';

export async function submitGameScoreAction(
  gameId: string,
  score: number,
  sessionId?: string,
  userId?: string,
  meta?: Record<string, unknown>
) {
  try {
    const { error } = await supabase.from("game_scores").insert({
      game_id: gameId,
      session_id: sessionId || "anon",
      user_id: userId || null,
      score,
      meta: meta || {},
    });

    if (error) {
      console.error("submitGameScoreAction insert error:", error);
      return { success: false, error: "점수 저장 실패" };
    }
  } catch (e) {
    console.error("submitGameScoreAction unexpected error:", e);
    return { success: false, error: "점수 저장 실패" };
  }

  return { success: true };
}
