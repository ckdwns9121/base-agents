# Agents

이 폴더는 공통으로 사용하는 에이전트 설정들을 관리합니다.

## 구조

```
agents/
├── code-reviewer/       # 코드 리뷰어 에이전트
│   └── AGENT.md
├── test-generator/      # 테스트 생성기 에이전트
│   └── AGENT.md
└── my-custom-agent/     # 나만의 에이전트
    └── AGENT.md
```

## 에이전트 추가하기

```bash
base-agents template agent my-agent
```

## 사용 방법

```bash
cd my-project/
base-agents copy-to-project --agents
```
