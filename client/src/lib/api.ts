// Vite dev 서버의 프록시(/api → 127.0.0.1:8787)를 쓰기 위해 기본은 공백(동일 오리진)으로 둡니다.
// 필요 시만 VITE_API_BASE로 덮어씁니다.
const API_BASE = import.meta.env.VITE_API_BASE || '';

async function fetcher<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Request failed' }));
    console.error('API Error:', { url, status: res.status, error });
    throw new Error(error.error || 'Request failed');
  }

  return res.json();
}

// Topics API
export async function fetchTopics() {
  return fetcher<{ success: boolean; data: any[] }>('/api/topics');
}

export async function fetchTopic(id: string) {
  return fetcher<{ success: boolean; data: any }>(`/api/topics/${id}`);
}

export async function generateTopic(prompt: string) {
  return fetcher<{ success: boolean; data: any }>('/api/topics/generate', {
    method: 'POST',
    body: JSON.stringify({ prompt }),
  });
}

export async function createTopic(topic: any) {
  return fetcher<{ success: boolean; data: any }>('/api/topics', {
    method: 'POST',
    body: JSON.stringify(topic),
  });
}

export async function updateTopic(id: string, updates: any) {
  return fetcher<{ success: boolean; data: any }>(`/api/topics/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
}

export async function deleteTopic(id: string) {
  return fetcher<{ success: boolean }>(`/api/topics/${id}`, {
    method: 'DELETE',
  });
}

// Ranking API
export async function fetchRankingItems(topicId: string) {
  return fetcher<{ success: boolean; data: any[] }>(`/api/ranking/${topicId}/items`);
}

export async function fetchBattlePair(topicId: string) {
  return fetcher<{ success: boolean; data: any[] }>(`/api/ranking/${topicId}/pair`);
}

export async function submitVote(topicId: string, winnerId: string, loserId: string) {
  return fetcher<{ success: boolean; data: any }>(`/api/ranking/${topicId}/vote`, {
    method: 'POST',
    body: JSON.stringify({ winnerId, loserId }),
  });
}

// Admin API
export async function adminCreateTopic(prompt: string) {
  return fetcher<{ success: boolean; data: any }>('/api/admin/topics/new', {
    method: 'POST',
    body: JSON.stringify({ prompt }),
  });
}

export async function adminCreateManualTopic(payload: {
  title: string;
  category?: string;
  view_type?: 'battle' | 'test' | 'tier' | 'fact';
  mode?: string;
  items: Array<{
    name: string;
    image_url?: string;
    description?: string;
    external_url?: string;
    meta?: Record<string, unknown>;
  }>;
  meta?: Record<string, unknown>;
}) {
  return fetcher<{ success: boolean; data: any }>('/api/admin/topics', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function adminUploadImage(payload: { dataUrl: string; filename?: string }) {
  return fetcher<{ success: boolean; url: string; path: string }>('/api/admin/upload-image', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function adminUpdateTopic(id: string, updates: any) {
  return fetcher<{ success: boolean; data: any }>(`/api/admin/topics/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
}

export async function adminDeleteTopic(id: string) {
  return fetcher<{ success: boolean }>(`/api/admin/topics/${id}`, {
    method: 'DELETE',
  });
}

export async function runSeed() {
  return fetcher<{ success: boolean; results: any }>('/api/seed/all', {
    method: 'POST',
  });
}

// Auth API
export async function login(email: string, password: string) {
  return fetcher<{ success: boolean; user?: any; error?: string }>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function logout() {
  return fetcher<{ success: boolean }>('/api/auth/logout', { method: 'POST' });
}

export async function fetchSession() {
  try {
    const res = await fetch(`${API_BASE}/api/auth/session`, {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) {
      // 세션 없음(401)도 게스트로 간주
      return { success: true, user: null };
    }
    return res.json();
  } catch {
    return { success: true, user: null };
  }
}

// Games API
export async function fetchLeaderboard(gameId: string, limit = 20) {
  return fetcher<{ success: boolean; data: any[] }>(`/api/games/${gameId}/leaderboard?limit=${limit}`);
}

export async function submitScore(gameId: string, score: number, meta?: Record<string, unknown>) {
  return fetcher<{ success: boolean; data?: any; error?: string }>(`/api/games/${gameId}/score`, {
    method: 'POST',
    body: JSON.stringify({ score, meta }),
  });
}

// Comments API
export async function fetchComments(topicId: string) {
  return fetcher<{ success: boolean; data: any[] }>(`/api/comments?topicId=${encodeURIComponent(topicId)}`);
}

export async function postComment(topicId: string, content: string) {
  return fetcher<{ success: boolean; data: any }>(`/api/comments`, {
    method: 'POST',
    body: JSON.stringify({ topicId, content }),
  });
}

// Likes API
export async function toggleLike(topicId: string) {
  return fetcher<{ success: boolean; liked: boolean; likeCount: number }>(`/api/topics/${topicId}/like`, {
    method: 'POST',
  });
}

export async function checkLikeStatus(topicId: string) {
  return fetcher<{ success: boolean; liked: boolean }>(`/api/topics/${topicId}/like/status`);
}
