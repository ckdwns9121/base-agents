# Base Agents

**SSOT(Single Source of Truth)** for AI IDE configurations. 한 곳에서 스킬, 규칙, 에이전트를 관리하고 여러 프로젝트에서 사용하세요.

## 핵심 개념

```
base-agents/           ← SSOT (한 곳에서만 관리)
├── skills/            # 공통 스킬
├── rules/             # 공통 규칙
├── agents/            # 공통 에이전트
├── mcp/               # MCP 서버
└── setup-agents.sh    # 설정 스크립트

내 프로젝트/            ← 사용할 때 복사
├── .claude/           # Claude 설정
├── .cursor/           # Cursor 설정
└── .gemini/           # Gemini 설정
```

## 빠른 시작

### 1. 스킬/규칙 추가

```bash
cd base-agents/

# 새 스킬 만들기
node dist/cli.js template skill my-testing-patterns

# 또는 직접 폴더 만들기
mkdir -p skills/react-patterns
# SKILL.md 작성
```

### 2. 프로젝트에서 사용

#### 방법 A: CLI 명령

```bash
cd my-project/
node /path/to/base-agents/dist/cli.js copy-to-project --all
```

#### 방법 B: Bash 스크립트

```bash
cd my-project/
/path/to/base-agents/setup-agents.sh
```

#### 방법 C: 선택적 복사

```bash
# 스킬만 복사
node /path/to/base-agents/dist/cli.js copy-to-project --skills

# 규칙만 복사
/path/to/base-agents/setup-agents.sh --rules
```

### 3. 결과

프로젝트에 자동으로 생성됨:

```
my-project/
├── .claude/
│   ├── skills/      ← base-agents/skills/ 복사
│   ├── agents/      ← base-agents/agents/ 복사
│   └── mcp/         ← base-agents/mcp/ 복사
└── .cursor/
    ├── skills/      ← base-agents/skills/ 복사
    └── rules/       ← base-agents/rules/ 복사
```

## 구조

### SSOT 폴더 구조

```
base-agents/
├── skills/              # 공통 스킬
│   ├── testing-patterns/
│   │   └── SKILL.md
│   └── react-best-practices/
│       └── SKILL.md
├── rules/               # 공통 규칙
│   ├── coding-standards.md
│   └── .cursorrules
├── agents/              # 공통 에이전트
│   ├── code-reviewer/
│   │   └── AGENT.md
│   └── test-generator/
│       └── AGENT.md
├── mcp/                 # MCP 서버
│   └── my-server/
│       └── server.json
├── templates/           # 템플릿
├── src/                 # CLI 소스
└── setup-agents.sh      # 설정 스크립트
```

## 사용 방법

### CLI로 사용

```bash
# 모든 카테고리 복사
base-agents copy-to-project --all

# 또는
base-agents copy-to-project -a

# 특정 카테고리만 복사
base-agents copy-to-project --skills
base-agents copy-to-project --rules
base-agents copy-to-project --agents
base-agents copy-to-project --mcp

# 조합
base-agents copy-to-project --skills --rules
```

### Bash 스크립트로 사용

```bash
# 전체 복사
./setup-agents.sh

# 선택적 복사
./setup-agents.sh --skills
./setup-agents.sh --rules --agents
./setup-agents.sh -a  # 전체
```

## 템플릿 생성

### 스킬 템플릿

```bash
cd base-agents/
node dist/cli.js template skill my-skill --description "내 스킬 설명"

# 결과
skills/my-skill/
└── SKILL.md
```

### 에이전트 템플릿

```bash
node dist/cli.js template agent my-agent --description "코드 리뷰어"

# 결과
agents/my-agent/
└── AGENT.md
```

### MCP 서버 템플릿

```bash
node dist/cli.js template mcp my-mcp

# 결과
mcp/my-mcp/
└── server.json
```

## 환경 변수

```bash
# SSOT 위치 지정 (기본: ~/Desktop/base-agents)
export BASE_AGENTS_SSOT=/path/to/base-agents

# 사용
base-agents copy-to-project --all
```

## Git 저장소에서 설치 (이전 방식)

```bash
# Cursor 규칙 설치
base-agents install cursor

# Claude 설정 설치
base-agents install claude

# 커스텀 저장소
base-agents install cursor https://github.com/user/cursor-rules
```

## 개발

```bash
# 의존성 설치
npm install

# 빌드
npm run build

# 개발 모드
npm run dev -- <command>

# 전역 설치 (선택)
npm link
```

## 예시 워크플로우

### 1. 새 스킬 추가

```bash
cd base-agents/

# 스킬 템플릿 생성
node dist/cli.js template skill typescript-tips --description "TypeScript 팁"

# 내용 편집
vim skills/typescript-tips/SKILL.md
```

### 2. 여러 프로젝트에서 사용

```bash
# 프로젝트 A
cd ~/projects/project-a/
~/Desktop/base-agents/setup-agents.sh

# 프로젝트 B
cd ~/projects/project-b/
~/Desktop/base-agents/setup-agents.sh
```

### 3. SSOT 업데이트

```bash
cd base-agents/

# 스킬 내용 수정
vim skills/typescript-tips/SKILL.md

# Git에 커밋
git add skills/typescript-tips/SKILL.md
git commit -m "Update TypeScript tips"

# 프로젝트들에서 다시 복사
cd ~/projects/project-a/
~/Desktop/base-agents/setup-agents.sh
```

## 기존 방식과의 차이

### 이전 방식
```
~/.base-agents/ (개인용)
각 프로젝트/ (별도 관리)
```

### 새 방식 (SSOT)
```
base-agents/ 레포지토리 (SSOT)
  ↓ 복사
각 프로젝트/ (.claude/, .cursor/ 등 생성)
```

## 라이선스

MIT
