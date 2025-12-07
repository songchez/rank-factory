import { type RankingTopic, type TopicMode } from "@/lib/types";

export function resolveMode(topic: Pick<RankingTopic, "mode" | "viewType">): TopicMode {
  if (topic.mode) return topic.mode;
  if (topic.viewType === "FACT") return "D";
  if (topic.viewType === "TEST") return "B";
  if (topic.viewType === "TIER") return "C";
  return "A";
}

export function getModePlayPath(topic: Pick<RankingTopic, "id" | "mode" | "viewType">) {
  const mode = resolveMode(topic);
  switch (mode) {
    case "B":
      return `/test/${topic.id}`;
    case "C":
      return `/tier/${topic.id}`;
    case "D":
      return `/fact/${topic.id}`;
    case "A":
    default:
      return `/battle/${topic.id}`;
  }
}

export function getModeResultPath(topic: Pick<RankingTopic, "id" | "mode" | "viewType">) {
  const mode = resolveMode(topic);
  if (mode === "A") return `/ranking/${topic.id}`;
  return getModePlayPath(topic);
}

export function getModeLabel(mode: TopicMode) {
  switch (mode) {
    case "A":
      return "배틀형 (A)";
    case "B":
      return "진단형 (B)";
    case "C":
      return "티어형 (C)";
    case "D":
      return "팩트형 (D)";
    default:
      return "배틀형 (A)";
  }
}
