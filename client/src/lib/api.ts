const API_BASE = import.meta.env.PROD ? '' : 'http://localhost:8787';

async function fetcher<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Request failed' }));
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
