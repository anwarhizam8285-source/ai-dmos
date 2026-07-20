# QUICK START CHEAT SHEET

**All you need to know to start coding AI-DMOS today.**

---

## 📁 FILES YOU NEED (All in `/home/claude/`)

| File | Purpose |
|------|---------|
| **START-HERE.md** | Read this first (5 mins) |
| **CLAUDE-CODE-PROMPT-SPRINT0-CHECKPOINT1.md** | GitHub setup prompt |
| **CLAUDE-CODE-PROMPT-SPRINT0-ALL-CHECKPOINTS.md** | All 10 checkpoint prompts |
| **AI-DMOS-PROJECT-SUMMARY.md** | Complete overview (reference) |
| **SPRINT-0-CHECKLIST.md** | Verification checklist |
| **SPRINT-1-CHECKLIST.md** | Feature specifications |

---

## ⚡ QUICK START (TODAY)

```bash
# 1. Verify prerequisites
node --version          # Need 18+
npm --version           # Need 9+
git --version           # Need installed

# 2. Clone/setup repo
git clone https://github.com/[your-username]/ai-dmos.git
cd ai-dmos
git config --global user.name "Your Name"
git config --global user.email "your-email@example.com"

# 3. Copy all docs to repo
cp ~/claude/*.md ./
cp ~/claude/SCOPE-LOCK.md ./
cp ~/claude/SPRINT-*.md ./
cp ~/claude/DOGFOODING-*.md ./

# 4. First commit
git add .
git commit -m "chore: add foundation docs"
git push origin main

# 5. Open Claude Code
# → Paste CHECKPOINT #1 prompt
# → Follow instructions
# → Commit when done
```

**Time to first commit: ~15 mins**

---

## 🎯 WHAT HAPPENS NEXT

```
CHECKPOINT #1 (GitHub Setup)
    ↓
CHECKPOINTS #2-10 (Infrastructure)
    ↓ (13.5 hours total, 3-4 days)
Sprint 0 Complete
    ↓
Sprint 1 Begin (Features development)
```

---

## 📋 THE 10 CHECKPOINTS

```
1. GitHub Monorepo Setup      (45 mins)
2. React + Vite Frontend      (2 hrs)
3. Express API Server         (2 hrs)
4. Firebase Authentication    (2 hrs)
5. Firestore Schema & Rules   (2 hrs)
6. Cloud Run Deployment       (2 hrs)
7. GitHub Actions CI/CD       (1 hr)
8. Anthropic API Integration  (30 mins)
9. Health Check API           (30 mins)
10. Documentation             (30 mins)
───────────────────────────────────────
TOTAL:                        ~13.5 hours
```

---

## 💻 HOW TO USE CLAUDE CODE

**For each checkpoint:**

1. Open `/home/claude/CLAUDE-CODE-PROMPT-SPRINT0-ALL-CHECKPOINTS.md`
2. Find checkpoint section (e.g., "## ⏳ CHECKPOINT #2")
3. Copy entire section
4. Go to Claude Code (claude.ai)
5. Paste into chat
6. Follow Claude Code's instructions
7. When done, commit:
   ```bash
   git add .
   git commit -m "feat(checkpoint): checkpoint #X complete"
   git push origin main
   ```
8. Move to next checkpoint

---

## ✅ SUCCESS CRITERIA

**Sprint 0 complete when:**
- ✅ All 10 checkpoints done
- ✅ 10 commits in git history
- ✅ React running on localhost:5173
- ✅ Express running on localhost:3000
- ✅ /health endpoint returns ok
- ✅ Cloud Run deployed
- ✅ GitHub Actions passing
- ✅ Docs complete

---

## 🚨 IF STUCK

**Common solutions:**

| Issue | Fix |
|-------|-----|
| Port 3000 in use | `lsof -i :3000` then kill process |
| npm install fails | `npm cache clean --force` then retry |
| Firebase emulator won't start | `firebase emulators:start --verbose` |
| Git push fails | Check GitHub SSH keys or use HTTPS |
| Docker build fails | Check file paths, ensure .gitignore exists |

**Still stuck?**
→ Ask Claude Code: "Why did X fail?" (paste error)

---

## 📊 LOCKED DECISIONS

**Don't change:**
- ✅ Tech stack (React/Express/Firebase/Cloud Run)
- ✅ Scope (MVP 1 only: Login + Company + Dashboard + AI)
- ✅ Agents (Only CEO, Knowledge, Content active)
- ✅ Knowledge files (Only 6)
- ✅ Templates (Only 5-6)

**If you think something should change:**
→ Add to BACKLOG.md (not roadmap)
→ Review after dogfooding

---

## 📅 TIMELINE

```
TODAY:
└─ GitHub setup (15 mins)

Days 1-2:
└─ Checkpoints #1-5 (8 hours)

Days 2-3:
└─ Checkpoints #6-10 (5.5 hours)

Day 4+:
└─ Sprint 1 begins (Features)
```

---

## 🔑 KEY PRINCIPLES

**Remember these:**

1. **Build → Use → Measure → Improve**
   - Don't plan endlessly, build fast

2. **Code + Docs + Tests**
   - Every feature needs all three

3. **Scope Lock**
   - No new features in MVP 1

4. **Dogfooding First**
   - Real usage data drives Sprint 2+

5. **Git commits**
   - One commit per checkpoint

---

## 📞 REFERENCE DOCS

**If you need:**

| Need | Reference |
|------|-----------|
| Architecture details | 02-SYSTEM-ARCHITECTURE.md |
| Database schema | 04-FIRESTORE-SCHEMA.md |
| Code standards | 13-ENGINEERING-STANDARDS.md |
| Verification checklist | SPRINT-0-CHECKLIST.md |
| Feature specs | SPRINT-1-CHECKLIST.md |
| Testing protocol | DOGFOODING-PLAYBOOK.md |
| Complete overview | AI-DMOS-PROJECT-SUMMARY.md |

---

## 🎯 RIGHT NOW (NEXT 5 MINS)

1. **Open START-HERE.md** (`~/claude/START-HERE.md`)
   - Read it completely
   - Verify prerequisites
   - Check you have GitHub repo

2. **Setup GitHub repo** (15 mins)
   ```bash
   cd ai-dmos
   cp ~/claude/*.md ./
   git add .
   git commit -m "chore: add foundation docs"
   git push origin main
   ```

3. **Open Claude Code**
   - Open ai-dmos folder
   - Copy CHECKPOINT #1 prompt
   - Paste into Claude Code
   - Follow instructions

4. **Commit Checkpoint #1**
   ```bash
   git add .
   git commit -m "chore: setup monorepo structure"
   git push origin main
   ```

5. **Move to Checkpoint #2**
   - Copy next prompt
   - Follow instructions
   - Repeat

---

## ✨ YOU'VE GOT THIS

**What you have:**
- ✅ Clear architecture
- ✅ Locked scope
- ✅ Step-by-step prompts
- ✅ Reference docs
- ✅ Testing protocol
- ✅ Full timeline

**What you need to do:**
- ✅ Follow prompts (don't skip)
- ✅ Test after each checkpoint
- ✅ Commit regularly
- ✅ Ask Claude Code if stuck

---

**Ready?**

→ Open `/home/claude/START-HERE.md`  
→ Follow instructions  
→ Start coding  

**Let's build! 🚀**

---

*Last updated: 15 July 2026*  
*Next: Sprint 0 infrastructure setup*
