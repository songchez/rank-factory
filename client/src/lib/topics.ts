import type { RankingTopic } from '../../../shared/types';

export type TopicMode = 'A' | 'B' | 'C' | 'D';

export function resolveMode(topic: Pick<RankingTopic, 'mode' | 'view_type'>): TopicMode {
  if (topic.mode) return topic.mode as TopicMode;
  if (topic.view_type === 'fact') return 'D';
  if (topic.view_type === 'test') return 'B';
  if (topic.view_type === 'tier') return 'C';
  return 'A';
}

export function getModePlayPath(topic: Pick<RankingTopic, 'id' | 'mode' | 'view_type'>) {
  const mode = resolveMode(topic);
  switch (mode) {
    case 'B':
      return `/test/${topic.id}`;
    case 'C':
      return `/tier/${topic.id}`;
    case 'D':
      return `/fact/${topic.id}`;
    case 'A':
    default:
      return `/battle/${topic.id}`;
  }
}

export function getModeResultPath(topic: Pick<RankingTopic, 'id' | 'mode' | 'view_type'>) {
  const mode = resolveMode(topic);
  if (mode === 'A') return `/ranking/${topic.id}`;
  return getModePlayPath(topic);
}

export function getModeLabel(mode: TopicMode) {
  switch (mode) {
    case 'A':
      return '배틀';
    case 'B':
      return '테스트';
    case 'C':
      return '티어';
    case 'D':
      return '팩트';
    default:
      return '배틀';
  }
}
