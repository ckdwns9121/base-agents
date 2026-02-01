# Rules

이 폴더는 모든 AI IDE 도구에서 공통으로 사용하는 규칙들을 관리합니다.

## 구조

```
rules/
├── coding-standards.md       # 코딩 표준
├── commit-conventions.md     # 커밋 컨벤션
├── architecture-principles.md # 아키텍처 원칙
└── .cursorrules             # Cursor용 규칙
```

## 규칙 추가하기

각 규칙 파일은 여러 AI 도구에서 호환되는 형식으로 작성하세요.

## 사용 방법

```bash
cd my-project/
base-agents copy-to-project --rules
```
