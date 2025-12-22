# AI를 위한 시드 데이터 생성 가이드

이 문서는 AI 어시스턴트가 Rank Factory의 시드 데이터를 생성할 때 참고하는 가이드입니다.

## 🎯 목적

사용자가 "치킨 브랜드 월드컵 만들어줘" 같은 요청을 하면, AI는 이 가이드를 참고하여 올바른 JSON 파일을 생성해야 합니다.

## 📋 4가지 모드 이해하기

### Mode A - Battle (대전/월드컵)
- **용도**: 두 아이템을 비교해서 선택하는 토너먼트 형식
- **예시**: "치킨 브랜드 월드컵", "최애 캐릭터 대결"
- **특징**: ELO 점수로 랭킹 계산
- **필수 필드**: `elo_score` (기본값: 1200)

```json
{
  "title": "한국 치킨 브랜드 월드컵",
  "category": "Food",
  "mode": "A",
  "view_type": "battle",
  "meta": {
    "description": "당신의 최애 치킨 브랜드는?"
  },
  "items": [
    {
      "name": "교촌치킨",
      "image_url": "./images/kyochon.jpg",
      "description": "허니콤보의 원조",
      "elo_score": 1200
    }
  ]
}
```

### Mode B - Test (심리테스트/적성검사)
- **용도**: 질문에 답하면 결과가 나오는 테스트
- **예시**: "MBTI 개발자 버전", "나의 업무 스타일"
- **특징**: 질문과 선택지의 가중치로 결과 계산
- **필수 필드**: `meta.questions`, `meta.results`

```json
{
  "title": "나의 개발 스타일은?",
  "category": "Tech",
  "mode": "B",
  "view_type": "test",
  "meta": {
    "description": "10가지 질문으로 알아보는 개발 스타일",
    "questions": [
      {
        "id": "q1",
        "prompt": "버그를 발견했을 때 나는?",
        "choices": [
          { "text": "즉시 수정한다", "weight": 5 },
          { "text": "이슈 티켓을 만든다", "weight": 3 },
          { "text": "나중에 처리한다", "weight": 1 }
        ]
      },
      {
        "id": "q2",
        "prompt": "코드 리뷰에서 나는?",
        "choices": [
          { "text": "꼼꼼히 다 본다", "weight": 5 },
          { "text": "중요한 부분만", "weight": 3 },
          { "text": "대충 훑어본다", "weight": 1 }
        ]
      }
    ],
    "results": [
      {
        "threshold": 8,
        "label": "완벽주의 개발자",
        "summary": "모든 것을 완벽하게 처리하는 타입"
      },
      {
        "threshold": 5,
        "label": "균형잡힌 개발자",
        "summary": "효율과 품질의 균형을 찾는 타입"
      },
      {
        "threshold": 0,
        "label": "실용주의 개발자",
        "summary": "빠른 배포를 중시하는 타입"
      }
    ]
  },
  "items": [
    {
      "name": "완벽주의 개발자",
      "image_url": "./images/perfectionist.jpg",
      "description": "코드 품질을 최우선으로",
      "elo_score": 1200
    }
  ]
}
```

**Mode B 작성 규칙**:
1. 질문은 최소 3개 이상 (5-10개 권장)
2. 각 질문은 2-4개의 선택지
3. 선택지의 weight는 1-5 사이 (높을수록 특정 결과에 가까움)
4. results는 threshold 내림차순 정렬 (가장 높은 점수부터)
5. items는 results의 label과 1:1 매칭

### Mode C - Tier (티어표/순위)
- **용도**: S, A, B, C, F 등 티어로 분류
- **예시**: "개발 도구 티어표", "출근 필수템 순위"
- **특징**: 사용자가 드래그로 티어 배치
- **필수 필드**: `meta.tiers`, `rank_order`

```json
{
  "title": "개발자 필수 도구 티어",
  "category": "Tech",
  "mode": "C",
  "view_type": "tier",
  "meta": {
    "tiers": ["S", "A", "B", "C", "F"],
    "description": "당신의 개발 도구함을 티어로 분류해보세요"
  },
  "items": [
    {
      "name": "VS Code",
      "image_url": "./images/vscode.jpg",
      "rank_order": 1,
      "description": "강력하고 가벼운 에디터"
    },
    {
      "name": "Git",
      "image_url": "./images/git.jpg",
      "rank_order": 1,
      "description": "필수 버전 관리 도구"
    },
    {
      "name": "Notion",
      "image_url": "./images/notion.jpg",
      "rank_order": 2,
      "description": "문서화와 협업"
    }
  ]
}
```

**Mode C 작성 규칙**:
1. `meta.tiers`에 사용할 티어 목록 정의
2. `rank_order`는 초기 배치 힌트 (1=가장 높은 티어, 숫자가 클수록 낮은 티어)
3. 티어는 보통 3-6개 정도

### Mode D - Fact (정보/사실 정리)
- **용도**: 객관적 정보나 통계를 순위로 정리
- **예시**: "2024년 인기 라면 순위", "프로그래밍 언어 점유율"
- **특징**: 수정 불가능한 읽기 전용 순위
- **필수 필드**: `meta.source`, `meta.body`, `rank_order`

```json
{
  "title": "2024 프로그래밍 언어 순위",
  "category": "Tech",
  "mode": "D",
  "view_type": "fact",
  "meta": {
    "source": "TIOBE Index 2024.12",
    "lastSyncedAt": "2024-12-18T00:00:00.000Z",
    "body": "2024년 12월 기준 프로그래밍 언어 인기도 순위입니다.\n\n주요 특징:\n- Python이 1위 유지 (AI/ML 영향)\n- JavaScript는 웹 개발의 필수\n- TypeScript의 급격한 성장\n- Rust의 꾸준한 상승세"
  },
  "items": [
    {
      "name": "Python",
      "image_url": "./images/python.jpg",
      "description": "AI/ML과 데이터 과학의 표준",
      "rank_order": 1
    },
    {
      "name": "JavaScript",
      "image_url": "./images/javascript.jpg",
      "description": "웹 개발의 필수 언어",
      "rank_order": 2
    },
    {
      "name": "TypeScript",
      "image_url": "./images/typescript.jpg",
      "description": "타입 안전성으로 급성장",
      "rank_order": 3
    }
  ]
}
```

**Mode D 작성 규칙**:
1. `meta.source`: 데이터 출처 명시 (필수)
2. `meta.body`: 상세 설명 (여러 줄 가능, `\n`으로 줄바꿈)
3. `rank_order`: 1부터 순차적으로
4. 객관적 데이터 기반이어야 함

## 🎨 이미지 URL 처리

### 로컬 이미지 (권장)
사용자가 이미지를 제공하면 로컬 경로 사용:

```json
{
  "image_url": "./images/product-name.jpg"
}
```

실행 시 `--upload-images` 옵션으로 자동 업로드됨.

### 원격 URL
온라인 이미지 사용:

```json
{
  "image_url": "https://example.com/image.jpg"
}
```

### Placeholder
테스트용 또는 이미지가 없을 때:

```json
{
  "image_url": "https://placehold.co/400x400/ffde59/000000?text=Product+Name"
}
```

**Placehold.co 색상 추천**:
- `ffde59` (노란색)
- `ff5757` (빨간색)
- `8c52ff` (보라색)
- `00bcd4` (청록색)
- `00cc00` (초록색)
- `f0f0f0` (회색)
- `000000` (검정, 텍스트는 흰색 ffffff)

## 📝 JSON 작성 체크리스트

### 모든 Mode 공통
- [ ] `title`: 명확하고 간결한 제목 (20자 이내 권장)
- [ ] `category`: Food, Tech, Entertainment, General, Lifestyle 중 선택
- [ ] `mode`: A, B, C, D 중 하나
- [ ] `view_type`: battle, test, tier, fact 중 하나 (mode와 매칭)
- [ ] `meta.description`: 한 줄 설명 (선택사항이지만 권장)
- [ ] `items`: 최소 3개 이상 (Mode A는 8개 이상 권장)

### Item 공통 필드
- [ ] `name`: 아이템 이름 (필수)
- [ ] `image_url`: 이미지 URL (필수)
- [ ] `description`: 설명 (선택, 1-2줄)
- [ ] `elo_score`: Mode A, B에서 1200 (선택, 기본값 1200)
- [ ] `rank_order`: Mode C, D에서 순위 (필수)

### Mode별 특수 필드
- [ ] **Mode B**: `meta.questions`, `meta.results` 필수
- [ ] **Mode C**: `meta.tiers` 필수
- [ ] **Mode D**: `meta.source`, `meta.body` 필수

## 💡 AI 작성 가이드

### 1. 사용자 요청 이해하기

**사용자**: "한국 라면 월드컵 만들어줘"
→ **분석**:
- 키워드: "월드컵" → Mode A (battle)
- 주제: "한국 라면"
- Category: Food

**사용자**: "나의 코딩 스타일 테스트 만들어줘"
→ **분석**:
- 키워드: "테스트" → Mode B (test)
- 주제: "코딩 스타일"
- Category: Tech

**사용자**: "개발 도구를 티어로 나눠줘"
→ **분석**:
- 키워드: "티어" → Mode C (tier)
- 주제: "개발 도구"
- Category: Tech

**사용자**: "2024년 인기 프레임워크 순위 정리해줘"
→ **분석**:
- 키워드: "순위 정리" → Mode D (fact)
- 주제: "프레임워크"
- Category: Tech

### 2. 아이템 선정 원칙

**좋은 예시**:
- 서로 비교 가능한 항목들
- 균형잡힌 난이도 (너무 명확한 승자가 없도록)
- 다양성 있는 선택지
- 8-16개 정도 (Mode A는 토너먼트를 위해 2의 배수 권장)

**나쁜 예시**:
- 비교가 안 되는 이질적인 항목들
- 너무 적은 항목 (3개 미만)
- 너무 많은 항목 (20개 초과)

### 3. JSON 파일 생성 프로세스

```
1. 사용자 요청 분석 → Mode 결정
2. Title과 Category 설정
3. 아이템 리스트 작성 (8-12개 권장)
4. Mode별 특수 필드 작성
5. 파일명 생성: {topic-slug}.json
6. 사용자에게 JSON 파일 제공
```

### 4. 파일명 규칙

좋은 파일명:
- `korean-ramen-battle.json`
- `developer-personality-test.json`
- `dev-tools-tier.json`
- `2024-framework-ranking.json`

나쁜 파일명:
- `topic1.json` (의미 없음)
- `한글이름.json` (영문 권장)
- `my battle.json` (공백 사용 금지)

### 5. Description 작성 팁

**좋은 description**:
- "당신의 최애 라면을 찾아보세요"
- "10가지 질문으로 알아보는 개발 스타일"
- "업무 생산성을 높이는 도구들"

**나쁜 description**:
- "라면" (너무 짧음)
- "라면은 한국인이 가장 좋아하는 음식 중 하나입니다. 다양한 브랜드와..." (너무 김)

### 6. Mode B (Test) 질문 작성 가이드

**좋은 질문**:
```json
{
  "id": "q1",
  "prompt": "주말에 새로운 기술을 배울 때 나는?",
  "choices": [
    { "text": "공식 문서부터 정독한다", "weight": 3 },
    { "text": "튜토리얼을 따라한다", "weight": 5 },
    { "text": "바로 프로젝트에 적용한다", "weight": 4 },
    { "text": "유튜브 강의를 본다", "weight": 2 }
  ]
}
```

**나쁜 질문**:
```json
{
  "prompt": "당신은?",  // 너무 모호함
  "choices": [
    { "text": "예", "weight": 1 },  // 의미 없는 선택지
    { "text": "아니오", "weight": 2 }
  ]
}
```

### 7. 검증 방법

JSON 작성 후 반드시 검증:

```bash
# Dry run으로 검증
bun run seed path/to/your-file.json --dry-run -v
```

에러가 나면 메시지를 읽고 수정.

## 🚨 주의사항

### 하지 말아야 할 것

1. **중복된 title 주의**: 같은 title이 있으면 덮어씌워짐
2. **너무 긴 텍스트**: description은 1-2줄, body는 10줄 이내
3. **잘못된 JSON 형식**: 쉼표, 괄호 확인
4. **Mode와 view_type 불일치**:
   - Mode A → view_type: battle
   - Mode B → view_type: test
   - Mode C → view_type: tier
   - Mode D → view_type: fact

### 반드시 해야 할 것

1. **JSON 유효성 검사**: 파일을 생성한 후 JSON이 유효한지 확인
2. **필수 필드 포함**: 각 Mode별 필수 필드 누락 금지
3. **의미있는 데이터**: 테스트용이 아니라면 실제 의미있는 내용 작성
4. **일관성 유지**: 같은 토픽 내 아이템들은 비슷한 형식 유지

## 📚 예시 템플릿

### Mode A 템플릿
```json
{
  "title": "[주제] 월드컵",
  "category": "[Food/Tech/Entertainment/General/Lifestyle]",
  "mode": "A",
  "view_type": "battle",
  "meta": {
    "description": "당신의 최애 [주제]는?"
  },
  "items": [
    {
      "name": "[아이템명 1]",
      "image_url": "./images/item1.jpg",
      "description": "[간단한 설명]",
      "elo_score": 1200
    }
  ]
}
```

### Mode B 템플릿
```json
{
  "title": "[주제] 테스트",
  "category": "[카테고리]",
  "mode": "B",
  "view_type": "test",
  "meta": {
    "description": "[N]가지 질문으로 알아보는 [주제]",
    "questions": [
      {
        "id": "q1",
        "prompt": "[질문 내용]?",
        "choices": [
          { "text": "[선택지 1]", "weight": 5 },
          { "text": "[선택지 2]", "weight": 3 },
          { "text": "[선택지 3]", "weight": 1 }
        ]
      }
    ],
    "results": [
      {
        "threshold": 10,
        "label": "[결과 타입 1]",
        "summary": "[한 줄 설명]"
      }
    ]
  },
  "items": [
    {
      "name": "[결과 타입 1]",
      "image_url": "./images/result1.jpg",
      "description": "[상세 설명]",
      "elo_score": 1200
    }
  ]
}
```

### Mode C 템플릿
```json
{
  "title": "[주제] 티어",
  "category": "[카테고리]",
  "mode": "C",
  "view_type": "tier",
  "meta": {
    "tiers": ["S", "A", "B", "C", "F"],
    "description": "[주제]를 티어로 분류해보세요"
  },
  "items": [
    {
      "name": "[아이템명]",
      "image_url": "./images/item.jpg",
      "rank_order": 1,
      "description": "[설명]"
    }
  ]
}
```

### Mode D 템플릿
```json
{
  "title": "[연도] [주제] 순위",
  "category": "[카테고리]",
  "mode": "D",
  "view_type": "fact",
  "meta": {
    "source": "[데이터 출처]",
    "lastSyncedAt": "2024-12-18T00:00:00.000Z",
    "body": "[주제]에 대한 상세 설명\n\n주요 특징:\n- [특징 1]\n- [특징 2]\n- [특징 3]"
  },
  "items": [
    {
      "name": "[1위 아이템]",
      "image_url": "./images/rank1.jpg",
      "description": "[설명]",
      "rank_order": 1
    }
  ]
}
```

## 🎓 학습 예시

scripts/seed/data/examples/ 폴더의 파일들을 참고하세요:
- `mode-a-battle.json` - 월드컵/대전 예시
- `mode-b-test.json` - 테스트 예시
- `mode-c-tier.json` - 티어 예시
- `mode-d-fact.json` - 팩트 체크 예시

## 🤖 AI 실행 플로우

```
1. 사용자 요청 받기
   ↓
2. 키워드 분석 (월드컵/테스트/티어/순위)
   ↓
3. Mode 결정 (A/B/C/D)
   ↓
4. JSON 구조 생성
   ↓
5. 아이템 데이터 작성
   ↓
6. 파일 저장 (data/[filename].json)
   ↓
7. 검증 명령어 제공
   bun run seed data/[filename].json --dry-run -v
   ↓
8. 실행 명령어 제공
   bun run seed data/[filename].json --upload-images -v
```

---

이 가이드를 따라 정확한 시드 데이터를 생성하세요!
