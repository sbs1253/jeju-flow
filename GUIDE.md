# 🚀 Jeju Flow: 프로젝트 시작 및 에이전트 설정 가이드

이 문서는 프로젝트의 초기 설정 방법과 다른 환경에서 동일한 AI 에이전트(Antigravity) 환경을 구축하는 방법을 설명합니다.

---

## ✅ 최초 커밋 체크리스트 (Initial Commit Checklist)
프로젝트를 깃허브에 올리기 전 다음 항목들을 확인 완료했습니다.

- [x] **민감 정보 제외**: `.env.local` 등 API 키가 포함된 파일이 `.gitignore`에 등록됨
- [x] **불필요 파일 제외**: `.agents/`, `.claude/`, `.next/`, `node_modules` 제외 완료
- [x] **에이전트 설정 포함**: `AGENTS.md`, `CLAUDE.md`, `skills-lock.json` 포함 완료
- [x] **문서화**: 설치 및 실행 방법이 담긴 `README.md` 및 `GUIDE.md` 작성 완료

---

## 🤖 에이전트 설정 가이드 (Agent Setup)
다른 컴퓨터에서도 이 프로젝트를 담당하는 AI 에이전트가 동일한 지능과 능력을 갖게 하려면 다음 설정을 진행하세요.

### 1. 에이전트 스킬(Skills) 설치
터미널에서 프로젝트 루트 폴더로 이동한 뒤 다음 명령어를 실행합니다.

```bash
# Vercel & Anthropic 공식 핵심 스킬 팩 설치
npx skills add vercel-labs/agent-skills -y
npx skills add anthropics/skills -y
npx skills add secondsky/claude-skills@motion -y
```

### 2. MCP(Model Context Protocol) 설정
`~/.gemini/antigravity/mcp_config.json` 파일에 다음 설정을 추가합니다. (최신 문서 검색 및 복잡한 추론용)

```json
{
  "mcpServers": {
    "context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp", "--api-key", "YOUR_CONTEXT7_API_KEY"]
    },
    "sequential-thinking": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-sequential-thinking"]
    }
  }
}
```

---

## 💻 로컬 개발 환경 세팅 (Local Setup)

### 1. 의존성 설치
```bash
npm install
# 또는 pnpm 사용 시
pnpm install
```

### 2. 환경 변수 설정
`.env.example` 파일을 복사하여 `.env.local` 파일을 만들고, 필요한 API 키를 입력합니다.
```bash
cp .env.example .env.local
```

### 3. 개발 서버 실행
```bash
npm run dev
```

---

## 💡 에이전트 활용 팁
프로젝트 규칙이 정의된 `AGENTS.md` 파일 덕분에, 이 프로젝트를 연 에이전트는 자동으로 Next.js 최신 관례와 프로젝트 특화 규칙을 따르게 됩니다. 궁금한 점은 에이전트에게 바로 물어보세요!
