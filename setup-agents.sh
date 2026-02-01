#!/bin/bash

# setup-agents.sh
# base-agents SSOT를 현재 프로젝트로 복사하는 스크립트

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Base-agents 레포지토리 경로
BASE_AGENTS_REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo -e "${GREEN}📦 Base-Agents Setup${NC}"
echo "SSOT: $BASE_AGENTS_REPO"
echo ""

# 현재 프로젝트 경로
PROJECT_ROOT="$(pwd)"

echo -e "${YELLOW}📁 Current project:${NC} $PROJECT_ROOT"
echo ""

# 옵션 파싱
COPY_SKILLS=false
COPY_RULES=false
COPY_AGENTS=false
COPY_MCP=false
COPY_ALL=false

while [[ $# -gt 0 ]]; do
  case $1 in
    --skills)
      COPY_SKILLS=true
      shift
      ;;
    --rules)
      COPY_RULES=true
      shift
      ;;
    --agents)
      COPY_AGENTS=true
      shift
      ;;
    --mcp)
      COPY_MCP=true
      shift
      ;;
    --all|-a)
      COPY_ALL=true
      shift
      ;;
    *)
      echo -e "${RED}Unknown option: $1${NC}"
      exit 1
      ;;
  esac
done

# 옵션이 없으면 전체 복사
if [ "$COPY_ALL" = true ] || [ "$COPY_SKILLS" = false ] && [ "$COPY_RULES" = false ] && [ "$COPY_AGENTS" = false ] && [ "$COPY_MCP" = false ]; then
  COPY_SKILLS=true
  COPY_RULES=true
  COPY_AGENTS=true
  COPY_MCP=true
fi

# 복사 함수
copy_dir() {
  local source="$1"
  local target="$2"
  local name="$3"

  if [ -d "$source" ]; then
    echo -e "${GREEN}✓${NC} Copying $name..."
    mkdir -p "$target"
    cp -r "$source"/* "$target/" 2>/dev/null || true
    # README 제거
    find "$target" -name "README.md" -delete 2>/dev/null || true
  else
    echo -e "${YELLOW}⚠${NC} $name not found in SSOT"
  fi
}

# Skills 복사
if [ "$COPY_SKILLS" = true ]; then
  copy_dir "$BASE_AGENTS_REPO/skills" "$PROJECT_ROOT/.claude/skills" "Skills → .claude/skills"
  copy_dir "$BASE_AGENTS_REPO/skills" "$PROJECT_ROOT/.cursor/skills" "Skills → .cursor/skills"
fi

# Rules 복사
if [ "$COPY_RULES" = true ]; then
  copy_dir "$BASE_AGENTS_REPO/rules" "$PROJECT_ROOT/.cursor/rules" "Rules → .cursor/rules"
  copy_dir "$BASE_AGENTS_REPO/rules" "$PROJECT_ROOT/.claude/rules" "Rules → .claude/rules"
fi

# Agents 복사
if [ "$COPY_AGENTS" = true ]; then
  copy_dir "$BASE_AGENTS_REPO/agents" "$PROJECT_ROOT/.claude/agents" "Agents → .claude/agents"
fi

# MCP 복사
if [ "$COPY_MCP" = true ]; then
  copy_dir "$BASE_AGENTS_REPO/mcp" "$PROJECT_ROOT/.claude/mcp" "MCP → .claude/mcp"
fi

echo ""
echo -e "${GREEN}✅ Setup complete!${NC}"
echo ""
echo "Created directories in $PROJECT_ROOT:"
[ "$COPY_SKILLS" = true ] && echo "  ✓ .claude/skills/"
[ "$COPY_SKILLS" = true ] && echo "  ✓ .cursor/skills/"
[ "$COPY_RULES" = true ] && echo "  ✓ .cursor/rules/"
[ "$COPY_RULES" = true ] && echo "  ✓ .claude/rules/"
[ "$COPY_AGENTS" = true ] && echo "  ✓ .claude/agents/"
[ "$COPY_MCP" = true ] && echo "  ✓ .claude/mcp/"
echo ""
echo "You can now commit these files to your project."
