import { submitScore } from './api';

export async function submitGameScoreAction(
  gameId: string,
  score: number,
  sessionId?: string,
  userId?: string,
  meta?: Record<string, unknown>
) {
  try {
    const { success, error } = await submitScore(gameId, score, {
      ...(meta || {}),
      sessionId: sessionId ?? 'anon',
      userId: userId ?? undefined,
    });

    if (!success) {
      return { success: false, error: error ?? '점수 저장 실패' };
    }
  } catch (e) {
    console.error("submitGameScoreAction unexpected error:", e);
    return { success: false, error: "점수 저장 실패" };
  }

  return { success: true };
}
