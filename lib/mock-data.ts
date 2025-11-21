export interface RankingItem {
  id: string
  name: string
  imageUrl: string
  eloScore: number
  winCount: number
  lossCount: number
  matchCount: number
  rank?: number
  change?: number
}

export interface RankingTopic {
  id: string
  title: string
  category: string
  viewType: "BATTLE" | "FACT" | "HELL"
  createdAt: string
  items: RankingItem[]
}

export const mockTopics: RankingTopic[] = [
  {
    id: "1",
    title: "라면 계급도",
    category: "Food",
    viewType: "BATTLE",
    createdAt: "2025-01-15T09:00:00Z",
    items: [
      {
        id: "1-1",
        name: "신라면",
        imageUrl: "/korean-shin-ramyun-noodles.jpg",
        eloScore: 1450,
        winCount: 125,
        lossCount: 75,
        matchCount: 200,
        rank: 1,
        change: 2,
      },
      {
        id: "1-2",
        name: "불닭볶음면",
        imageUrl: "/korean-buldak-spicy-noodles.jpg",
        eloScore: 1420,
        winCount: 110,
        lossCount: 85,
        matchCount: 195,
        rank: 2,
        change: -1,
      },
      {
        id: "1-3",
        name: "진라면",
        imageUrl: "/korean-jin-ramyun-noodles.jpg",
        eloScore: 1380,
        winCount: 95,
        lossCount: 90,
        matchCount: 185,
        rank: 3,
        change: 1,
      },
      {
        id: "1-4",
        name: "짜파게티",
        imageUrl: "/korean-chapagetti-black-noodles.jpg",
        eloScore: 1350,
        winCount: 88,
        lossCount: 92,
        matchCount: 180,
        rank: 4,
        change: -2,
      },
      {
        id: "1-5",
        name: "너구리",
        imageUrl: "/korean-neoguri-seafood-noodles.jpg",
        eloScore: 1320,
        winCount: 82,
        lossCount: 98,
        matchCount: 180,
        rank: 5,
        change: 0,
      },
    ],
  },
  {
    id: "2",
    title: "최악의 상사 유형",
    category: "Work",
    viewType: "BATTLE",
    createdAt: "2025-01-14T14:30:00Z",
    items: [
      {
        id: "2-1",
        name: "꼰대형",
        imageUrl: "/strict-old-fashioned-boss.jpg",
        eloScore: 1480,
        winCount: 140,
        lossCount: 60,
        matchCount: 200,
        rank: 1,
        change: 3,
      },
      {
        id: "2-2",
        name: "히스테리형",
        imageUrl: "/angry-emotional-boss.jpg",
        eloScore: 1440,
        winCount: 125,
        lossCount: 75,
        matchCount: 200,
        rank: 2,
        change: 1,
      },
      {
        id: "2-3",
        name: "무능력형",
        imageUrl: "/incompetent-confused-boss.jpg",
        eloScore: 1390,
        winCount: 105,
        lossCount: 95,
        matchCount: 200,
        rank: 3,
        change: -1,
      },
      {
        id: "2-4",
        name: "마이크로매니징형",
        imageUrl: "/micromanaging-controlling-boss.jpg",
        eloScore: 1360,
        winCount: 95,
        lossCount: 105,
        matchCount: 200,
        rank: 4,
        change: -2,
      },
    ],
  },
  {
    id: "3",
    title: "프랜차이즈 치킨",
    category: "Food",
    viewType: "BATTLE",
    createdAt: "2025-01-13T18:00:00Z",
    items: [
      {
        id: "3-1",
        name: "BBQ 황금올리브",
        imageUrl: "/korean-bbq-fried-chicken.jpg",
        eloScore: 1460,
        winCount: 135,
        lossCount: 65,
        matchCount: 200,
        rank: 1,
        change: 1,
      },
      {
        id: "3-2",
        name: "교촌 허니콤보",
        imageUrl: "/korean-kyochon-honey-chicken.jpg",
        eloScore: 1455,
        winCount: 132,
        lossCount: 68,
        matchCount: 200,
        rank: 2,
        change: -1,
      },
      {
        id: "3-3",
        name: "BHC 뿌링클",
        imageUrl: "/korean-bhc-seasoned-chicken.jpg",
        eloScore: 1430,
        winCount: 120,
        lossCount: 80,
        matchCount: 200,
        rank: 3,
        change: 2,
      },
      {
        id: "3-4",
        name: "굽네 고추바사삭",
        imageUrl: "/korean-goobne-grilled-chicken.jpg",
        eloScore: 1400,
        winCount: 110,
        lossCount: 90,
        matchCount: 200,
        rank: 4,
        change: 0,
      },
      {
        id: "3-5",
        name: "네네 스노윙",
        imageUrl: "/korean-nene-snowing-chicken.jpg",
        eloScore: 1370,
        winCount: 98,
        lossCount: 102,
        matchCount: 200,
        rank: 5,
        change: -2,
      },
    ],
  },
]

export function getTopicById(id: string): RankingTopic | undefined {
  return mockTopics.find((topic) => topic.id === id)
}

export function getRandomMatchup(topicId: string): [RankingItem, RankingItem] | null {
  const topic = getTopicById(topicId)
  if (!topic || topic.items.length < 2) return null

  const shuffled = [...topic.items].sort(() => Math.random() - 0.5)
  return [shuffled[0], shuffled[1]]
}
