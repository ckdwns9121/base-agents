# Skills

이 폴더는 SSOT(Single Source of Truth)로서 공통으로 사용하는 스킬들을 관리합니다.

## 구조

```
skills/
├── testing-patterns/       # 테스트 패턴 스킬
│   └── SKILL.md
├── react-best-practices/   # React 모범 사례
│   └── SKILL.md
└── my-custom-skill/        # 나만의 스킬
    └── SKILL.md
```

## 스킬 추가하기

```bash
# 템플릿으로 새 스킬 만들기
base-agents template skill my-new-skill

# 또는 직접 폴더 만들기
mkdir -p skills/my-skill
# SKILL.md 작성
```

## 사용 방법

프로젝트에서 사용:

```bash
cd my-project/
base-agents copy-to-project --skills
```

이렇게 하면 `.claude/skills/`, `.cursor/rules/` 등에 복사됩니다.
