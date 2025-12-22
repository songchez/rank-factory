# Rank Factory Seed Script

간단한 JSON 파일과 로컬 이미지로 대량의 토픽을 데이터베이스에 삽입할 수 있는 시드 스크립트입니다.

> **🤖 AI 어시스턴트용**: 시드 데이터를 생성할 때는 [AI-GUIDE.md](./AI-GUIDE.md)를 참고하세요.

## 🚀 빠른 시작

```bash
# 단일 JSON 파일 시드
bun run seed scripts/seed/data/examples/mode-a-battle.json

# 디렉토리 전체 시드
bun run seed scripts/seed/data/examples/

# 로컬 이미지 자동 업로드
bun run seed data/my-topic.json --upload-images

# 상세 로그와 함께 실행
bun run seed data/my-topic.json -v --upload-images
```

## 📋 사용법

### 기본 명령어

```bash
bun run seed <input> [options]
```

### 옵션

| 옵션 | 설명 |
|------|------|
| `<input>` | JSON 파일 또는 디렉토리 경로 (필수) |
| `--mode <A\|B\|C\|D>` | 특정 모드만 필터링 |
| `--upload-images` | 로컬 이미지를 Supabase Storage에 업로드 |
| `--dry-run` | 검증만 수행, DB 변경 없음 |
| `--verbose`, `-v` | 상세 로그 출력 |
| `--help`, `-h` | 도움말 표시 |

### 환경 변수

`.env` 파일에 다음 환경 변수를 설정하세요:

```bash
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
# 또는
SUPABASE_SECRET_KEY=your_secret_key
```

## 📄 JSON 데이터 포맷

### Mode A - Battle (대전 모드)

```json
{
  "title": "한국 치킨 브랜드 월드컵",
  "category": "Food",
  "mode": "A",
  "view_type": "battle",
  "meta": {
    "description": "당신의 최애 치킨은?"
  },
  "items": [
    {
      "name": "교촌 허니콤보",
      "image_url": "./images/kyochon-honey.jpg",
      "description": "달콤한 허니의 정석",
      "elo_score": 1200
    },
    {
      "name": "BBQ 황금올리브",
      "image_url": "https://example.com/bbq.jpg",
      "elo_score": 1200
    }
  ]
}
```

### Mode B - Test (테스트 모드)

```json
{
  "title": "당신의 개발 스타일은?",
  "category": "Tech",
  "mode": "B",
  "view_type": "test",
  "meta": {
    "description": "개발 스타일 테스트",
    "questions": [
      {
        "id": "q1",
        "prompt": "버그를 발견했을 때 나는?",
        "choices": [
          { "text": "즉시 디버깅한다", "weight": 5 },
          { "text": "이슈 티켓을 먼저 만든다", "weight": 3 },
          { "text": "팀원에게 물어본다", "weight": 2 },
          { "text": "나중에 수정한다", "weight": 1 }
        ]
      }
    ],
    "results": [
      {
        "threshold": 12,
        "label": "즉흥 개발자",
        "summary": "문제를 빠르게 해결하는 타입"
      },
      {
        "threshold": 6,
        "label": "계획형 개발자",
        "summary": "체계적으로 접근하는 타입"
      },
      {
        "threshold": 0,
        "label": "협업형 개발자",
        "summary": "팀워크를 중시하는 타입"
      }
    ]
  },
  "items": [
    {
      "name": "즉흥 개발자",
      "image_url": "./images/dev-quick.jpg",
      "description": "빠른 실행력",
      "elo_score": 1200
    }
  ]
}
```

### Mode C - Tier (티어 모드)

```json
{
  "title": "개발자 필수 도구",
  "category": "Tech",
  "mode": "C",
  "view_type": "tier",
  "meta": {
    "tiers": ["S", "A", "B", "C", "F"],
    "description": "개발 생산성을 높이는 도구들"
  },
  "items": [
    {
      "name": "VS Code",
      "image_url": "./images/vscode.jpg",
      "rank_order": 1,
      "description": "최고의 에디터"
    },
    {
      "name": "Git",
      "image_url": "./images/git.jpg",
      "rank_order": 1,
      "description": "필수 버전 관리"
    }
  ]
}
```

### Mode D - Fact (사실 체크 모드)

```json
{
  "title": "2024 프로그래밍 언어 트렌드",
  "category": "Tech",
  "mode": "D",
  "view_type": "fact",
  "meta": {
    "source": "Stack Overflow Survey 2024",
    "lastSyncedAt": "2024-12-18T00:00:00.000Z",
    "body": "2024년 프로그래밍 언어 트렌드 분석\n- TypeScript가 3년 연속 1위\n- Python은 AI/ML 분야에서 압도적\n- Rust의 급성장세 지속"
  },
  "items": [
    {
      "name": "TypeScript",
      "image_url": "./images/typescript.jpg",
      "description": "타입 안정성으로 인기",
      "rank_order": 1
    }
  ]
}
```

## 🖼️ 이미지 처리

### 로컬 이미지 사용

1. 이미지 파일을 프로젝트 내에 저장
2. JSON에서 상대 경로로 참조
3. `--upload-images` 옵션 사용

```json
{
  "items": [
    {
      "name": "상품명",
      "image_url": "./images/product.jpg"
    }
  ]
}
```

### 원격 이미지 사용

HTTP(S) URL을 직접 사용 (업로드 불필요):

```json
{
  "items": [
    {
      "name": "상품명",
      "image_url": "https://example.com/image.jpg"
    }
  ]
}
```

### Supabase Storage 구조

업로드된 이미지는 다음 경로에 저장됩니다:

```
ranking-items/
  └── uploads/
      ├── product-name-abc123def456.jpg
      ├── another-item-789ghi012jkl.png
      └── ...
```

## 📁 프로젝트 구조

```
scripts/seed/
├── seed.ts                    # CLI 진입점
├── lib/
│   ├── types.ts               # TypeScript 타입
│   ├── validator.ts           # JSON 검증
│   ├── image-uploader.ts      # 이미지 업로드
│   └── seeder.ts              # 핵심 시드 로직
├── data/
│   └── examples/              # 예시 데이터
│       ├── mode-a-battle.json
│       ├── mode-b-test.json
│       ├── mode-c-tier.json
│       └── mode-d-fact.json
└── README.md
```

## 🔍 검증

JSON 파일은 자동으로 검증됩니다:

- ✅ 필수 필드 확인
- ✅ 타입 검증
- ✅ Mode별 특수 요구사항 확인
- ✅ 이미지 파일 존재 여부 (로컬 경로인 경우)

### Dry Run으로 검증만 수행

```bash
bun run seed data/my-topic.json --dry-run -v
```

## 💡 예시 워크플로우

### 1. 새 토픽 만들기

```bash
# 1. 예시 파일 복사
cp scripts/seed/data/examples/mode-a-battle.json data/my-topic.json

# 2. 내용 수정
# data/my-topic.json 편집

# 3. 이미지 준비
mkdir -p data/images
# data/images/에 이미지 파일 복사

# 4. 검증
bun run seed data/my-topic.json --dry-run -v

# 5. 실제 삽입
bun run seed data/my-topic.json --upload-images -v
```

### 2. 대량 토픽 삽입

```bash
# 1. 여러 JSON 파일을 한 디렉토리에 모음
mkdir -p data/batch-import
# JSON 파일들을 data/batch-import/에 복사

# 2. 전체 삽입
bun run seed data/batch-import/ --upload-images -v
```

### 3. 특정 모드만 업데이트

```bash
# Mode A (battle)만 필터링
bun run seed data/ --mode A --upload-images -v
```

## ⚠️ 주의사항

1. **기존 토픽 업데이트**: 같은 `title`을 가진 토픽이 있으면 업데이트됩니다
2. **아이템 교체**: 토픽 업데이트 시 모든 아이템이 교체됩니다 (기존 아이템 삭제)
3. **이미지 중복 방지**: 같은 파일은 한 번만 업로드됩니다 (MD5 해시 기반)
4. **Service Role Key**: 데이터베이스 변경을 위해 Service Role Key가 필요합니다

## 🐛 트러블슈팅

### 권한 오류

```bash
Error: Missing Supabase credentials
```

→ `.env` 파일에 `SUPABASE_URL`과 `SUPABASE_SERVICE_ROLE_KEY` 확인

### 이미지 업로드 실패

```bash
Error: Image file not found: ./images/product.jpg
```

→ 파일 경로와 이미지 존재 여부 확인

### JSON 검증 오류

```bash
ValidationError: Missing required field: title
```

→ JSON 구조를 예시 파일과 비교

## 📚 추가 자료

- [Supabase Storage 문서](https://supabase.com/docs/guides/storage)
- [JSON 예시 파일](./data/examples/)
- [프로젝트 메인 README](../../README.md)
