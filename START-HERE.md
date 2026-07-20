# START HERE - CLAUDE CODE DEVELOPMENT GUIDE

**Siap nak mula coding? Ikut guide ini.**

---

## 📋 QUICK SUMMARY

**Apa yang dah sedia:**
- ✅ 9 foundation docs created
- ✅ 2 Claude Code prompts ready (Sprint 0 checkpoints)
- ✅ Project summary document
- ✅ Memory saved

**Apa yang perlu kau buat:**
1. Setup GitHub repo locally (15 mins)
2. Follow Sprint 0 prompts (13 hours, spread 3-4 days)
3. Deploy to Cloud Run (infrastructure ready)
4. Start Sprint 1 (features development)

---

## 🚀 STEP 1: SETUP GITHUB (15 MINS)

**Prerequisites - Verify kau ada:**
```bash
node --version          # Should be 18+
npm --version           # Should be 9+
git --version           # Installed
```

**Setup:**
```bash
# 1. Create GitHub account (if belum ada)
# 2. Create private repo: ai-dmos
# 3. Clone locally
git clone https://github.com/[your-username]/ai-dmos.git
cd ai-dmos

# 4. Configure git
git config --global user.name "Your Name"
git config --global user.email "your-email@example.com"

# 5. Folder structure (if not created)
mkdir -p client server shared firebase docs prompts knowledge templates tests deployment .github/workflows

# 6. Copy all docs to repo
# Copy from /home/claude/*.md to your repo
cp ~/claude/*.md ./
cp ~/claude/SCOPE-LOCK.md ./
cp ~/claude/SPRINT-0-CHECKLIST.md ./
cp ~/claude/SPRINT-1-CHECKLIST.md ./
cp ~/claude/DOGFOODING-PLAYBOOK.md ./

# 7. First commit
git add .
git commit -m "chore: initialize monorepo with foundation docs"
git push origin main

# 8. Verify
git log --oneline
# Should show your commit
```

---

## 🎯 STEP 2: OPEN CLAUDE CODE & START SPRINT 0

**Open Claude Code:**
1. Go to https://claude.ai
2. Click "Claude Code" (or "Claude in your IDE")
3. Open project folder: ai-dmos/

**For Checkpoint #1 (GitHub Setup):**
- Copy prompt from: `CLAUDE-CODE-PROMPT-SPRINT0-CHECKPOINT1.md`
- Paste into Claude Code
- Follow instructions
- Commit when done

**For Checkpoints #2-10:**
- Open: `CLAUDE-CODE-PROMPT-SPRINT0-ALL-CHECKPOINTS.md`
- Copy one checkpoint at a time
- Paste into Claude Code
- Follow instructions
- Commit when done

---

## 📍 FILE REFERENCE

**Location:** `/home/claude/`

```
QUICK REFERENCE:
├── START-HERE.md                              (This file)
├── AI-DMOS-PROJECT-SUMMARY.md                 (Complete overview)
├── CLAUDE-CODE-PROMPT-SPRINT0-CHECKPOINT1.md  (GitHub setup)
└── CLAUDE-CODE-PROMPT-SPRINT0-ALL-CHECKPOINTS.md (10 checkpoints)

FOUNDATION DOCS:
├── 01-PRODUCT-REQUIREMENTS.md    (Product vision)
├── 02-SYSTEM-ARCHITECTURE.md     (Architecture)
├── 04-FIRESTORE-SCHEMA.md        (Database)
├── 13-ENGINEERING-STANDARDS.md   (Code standards)
├── SCOPE-LOCK.md                 (What's locked)
├── SPRINT-0-CHECKLIST.md         (Verification)
├── SPRINT-1-CHECKLIST.md         (Features spec)
└── DOGFOODING-PLAYBOOK.md        (Testing protocol)
```

---

## 🏁 SPRINT 0 CHECKPOINTS (13.5 hours total)

```
✅ Checkpoint #1:  GitHub Monorepo          (45 mins)
⏳ Checkpoint #2:  React + Vite             (2 hrs)
⏳ Checkpoint #3:  Express API              (2 hrs)
⏳ Checkpoint #4:  Firebase Auth            (2 hrs)
⏳ Checkpoint #5:  Firestore Schema         (2 hrs)
⏳ Checkpoint #6:  Cloud Run Deployment     (2 hrs)
⏳ Checkpoint #7:  GitHub Actions CI/CD     (1 hr)
⏳ Checkpoint #8:  Anthropic API            (30 mins)
⏳ Checkpoint #9:  Health Check API         (30 mins)
⏳ Checkpoint #10: Documentation            (30 mins)
─────────────────────────────────────────────────
TOTAL: ~13.5 hours (spread over 3-4 days)
```

---

## 📝 HOW TO USE CLAUDE CODE PROMPTS

**Workflow for each checkpoint:**

```
1. Open CLAUDE-CODE-PROMPT-SPRINT0-ALL-CHECKPOINTS.md
2. Find checkpoint section (e.g., "CHECKPOINT #2")
3. Copy entire section
4. Paste into Claude Code chat
5. Claude Code will:
   - Understand context
   - Create files
   - Write code
   - Provide terminal commands
6. Follow Claude Code instructions
7. Test as specified
8. Commit: git add . && git commit -m "..." && git push
9. Move to next checkpoint
```

**Example:**
```
Human: [Paste Checkpoint #2 prompt]
Claude: "I'll setup React + Vite. Here's what we're doing:
         1. Create folder structure
         2. Install dependencies
         3. Configure Tailwind
         ... [step by step]
         Now run: npm create vite@latest . -- --template react"
```

---

## ✅ WHEN CHECKPOINT IS COMPLETE

**You'll see:**
- All files created
- Code written
- Tests passing
- Commit message shown
- Ready for next checkpoint

**What to do:**
```bash
# Verify checkpoint complete
git log --oneline | head -1
# Should show checkpoint commit

# Move to NEXT checkpoint
# Copy next section from CLAUDE-CODE-PROMPT-SPRINT0-ALL-CHECKPOINTS.md
```

---

## 🐛 IF STUCK

**Debug process:**
1. Read error message carefully
2. Check if file was created
3. Verify path/folder structure
4. Check git status: `git status`
5. Ask Claude Code (in chat): "Why did X fail?"

**Common issues:**
- Port already in use → `lsof -i :3000`
- npm install fails → `npm cache clean --force`
- Firebase emulator issues → `firebase emulators:start --verbose`

---

## 🎯 EXPECTED OUTCOME (After Sprint 0)

**All 10 checkpoints complete = You'll have:**

✅ React frontend running on http://localhost:5173  
✅ Express backend running on http://localhost:3000  
✅ Firebase Auth + Firestore emulator working  
✅ Cloud Run deployment working  
✅ GitHub Actions CI/CD pipeline  
✅ Anthropic API integrated  
✅ /health endpoint deployed  
✅ Full documentation complete  

**Status:** Infrastructure ready for Sprint 1 feature development

---

## 📅 TIMELINE

```
TODAY:
└─ Setup GitHub (15 mins)

Days 1-2 (Sprint 0):
├─ Checkpoints #1-5 (GitHub, React, Express, Firebase, Firestore)
└─ Total: ~8 hours

Days 2-3 (Sprint 0):
├─ Checkpoints #6-10 (Cloud Run, CI/CD, Anthropic, Health, Docs)
└─ Total: ~5.5 hours

Day 4:
└─ Sprint 1 begins (Feature development)
```

---

## 🎓 REMEMBER

**Key principles:**
- ✅ Follow prompts exactly (they're tested)
- ✅ Commit after each checkpoint
- ✅ Test as instructed (don't skip)
- ✅ Use Claude Code for all coding (faster + accurate)
- ✅ Reference docs when needed

**Don't:**
- ❌ Skip checkpoints
- ❌ Change tech stack
- ❌ Add extra features now (do in Sprint 1)
- ❌ Deploy without testing

---

## 🚀 READY TO START?

**Next action:**

1. **Terminal 1 (Setup):**
   ```bash
   cd ai-dmos
   # Verify GitHub repo is cloned
   git log --oneline
   ```

2. **Terminal 2 (Development):**
   ```bash
   # Will use for npm commands
   npm --version
   ```

3. **Claude Code:**
   - Open ai-dmos folder
   - Copy Checkpoint #1 prompt
   - Paste into Claude Code
   - Follow instructions

---

## 📞 NEED HELP?

**Common questions:**

**Q: Where are the prompts?**
A: `/home/claude/CLAUDE-CODE-PROMPT-*.md`

**Q: How do I know if checkpoint is done?**
A: You'll see commit message in terminal

**Q: Can I skip a checkpoint?**
A: No, each builds on previous. Do them in order.

**Q: Can I use different tech stack?**
A: No, architecture is locked. Follow as specified.

**Q: What if I make a mistake?**
A: Just ask Claude Code to fix it. Version control (git) saves you.

---

## ✨ FINAL CHECKLIST BEFORE YOU START

- [ ] GitHub account created
- [ ] ai-dmos repo cloned locally
- [ ] Git configured (name + email)
- [ ] Node.js 18+ verified
- [ ] Terminal ready
- [ ] Claude Code ready
- [ ] All docs copied to repo
- [ ] First commit pushed
- [ ] This file read completely

**All checked?**

→ **Open Claude Code. Paste Checkpoint #1 prompt. START! 🚀**

---

**Duration:** ~2 weeks from today to MVP 1 live  
**Timeline:** Sprint 0 (3-4 days) → Sprint 1 (2 weeks) → Dogfooding (1-2 weeks)  
**Next milestone:** MVP 1 deployed to production

**Let's build! 💪**
