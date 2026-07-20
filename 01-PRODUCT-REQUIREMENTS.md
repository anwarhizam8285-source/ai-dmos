# 01 — PRODUCT REQUIREMENTS

## Platform AI Digital Marketing Operating System (AI-DMOS)

**Tarikh:** Juli 2026  
**Versi:** 1.0  
**Status:** Foundation Architecture  

---

## 1. RINGKASAN PRODUK

AI-DMOS ialah platform SaaS yang mengintegrasikan kecerdasan buatan (AI Agent) untuk menguruskan media sosial, pemasaran digital dan strategi kandungan secara komprehensif bagi UKM Malaysia.

Platform ini **bukan sekadar alat penjana caption**, tetapi berfungsi seperti **agensi pemasaran digital lengkap yang dimotori AI** — dengan CEO Agent sebagai orchestrator, Knowledge Agent sebagai pusat pembelajaran, dan agent khusus untuk setiap fungsi (Content, Marketing, Analytics, Planner, Comment, Messenger, Automation, Image, Trend).

### Matlamat Utama

Membantu pemilik UKM Malaysia:
- ✅ Menguruskan media sosial dari satu dashboard
- ✅ Menjana kandungan berkualiti tinggi secara konsisten
- ✅ Merancang kampanye pemasaran dengan strategi yang jelas
- ✅ Menganalisis prestasi dan membuat keputusan data-driven
- ✅ Menjadualkan dan menerbitkan kandungan secara otomatis
- ✅ Membalas pelanggan dengan respons yang konsisten
- ✅ Mengoptimasi spending pemasaran dengan ROI yang lebih baik

---

## 2. VISI JANGKA PANJANG

Platform ini akan berkembang menjadi **AI-powered Marketing Operating System** yang:

1. **Fasa 1 (MVP 1-2)**: Fokus pada Facebook + Instagram dengan Content + Marketing Agent
2. **Fasa 2 (MVP 3-4)**: Analytics, Automation, Scheduled Publishing
3. **Fasa 3 (MVP 5-6)**: Comment Management, Inbox, Image Generation
4. **Fasa 4 (2027)**: Multi-platform (TikTok, LinkedIn, YouTube), CRM Integration, WhatsApp API
5. **Fasa 5 (2027-2028)**: Email Marketing, Advanced Analytics, Team Collaboration, Billing/SaaS

Semua ini tanpa mengubah architecture teras.

---

## 3. MVP BREAKDOWN

### MVP 1: Foundation & Content Generation (Minggu 1-2)
**Slogan:** "Generate Kandungan, Jadikalkan Strategi"

**Fitur Utama:**
- ✅ Authentication (Firebase Auth, login/register)
- ✅ Dashboard (welcome, quick access)
- ✅ Company Profile (menyimpan maklumat perniagaan)
- ✅ CEO Agent (orchestrator, routing tugasan)
- ✅ Content Agent (caption, hashtag, CTA, campaign ideas)
- ✅ AI Chat Interface (multi-turn conversation)
- ✅ History Panel (simpan semua hasil sebelumnya)
- ✅ Export (Markdown, PDF)
- ✅ Responsive Design (desktop & tablet)

**Apa yang Tidak Included:**
- ❌ Calendar (akan MVP 2)
- ❌ Analytics/Insights (akan MVP 3)
- ❌ Automation/Publishing (akan MVP 4)
- ❌ Image Generation (akan MVP 6)

**First Customer:** KIRA Senang (Tenant #0001)

**Success Metrics:**
- Dapat login dan set up company profile < 2 minit
- Generate caption dengan CTA dalam < 10 saat
- Simpan 10+ history entries tanpa lag
- Dapat export ke PDF dengan format konsisten

---

### MVP 2: Planning & Trend (Minggu 3-4)
**Slogan:** "Rancang Kandungan, Monitor Trend Semasa"

**Tambahan Fitur:**
- ✅ Planner Agent (content calendar, campaign planning)
- ✅ Trend Agent (research idea, seasonal topic)
- ✅ Calendar Integration (FullCalendar.js)
- ✅ Drag & Drop Scheduling (draft → published)
- ✅ 30-Day Content Calendar (template generator)
- ✅ Trend Database (Malaysian cultural events, business cycle)

---

### MVP 3: Analytics (Minggu 5-6)
**Slogan:** "Ukur Prestasi, Optimasi Strategi"

**Tambahan Fitur:**
- ✅ Analytics Agent (parse insights, recommendations)
- ✅ Facebook Insights Importer (CSV/JSON)
- ✅ Dashboard Metrics (reach, engagement, followers)
- ✅ Performance Charts (Chart.js)
- ✅ Recommendations (timing, content type, tone)

---

### MVP 4: Automation (Minggu 7-8)
**Slogan:** "Jadualkan Posting, Biarkan AI Bekerja"

**Tambahan Fitur:**
- ✅ Automation Agent (publishing workflow)
- ✅ Meta Graph API Integration (auto-publish)
- ✅ Queue Management (scheduled posts)
- ✅ Retry Logic (jika publish gagal)
- ✅ Bulk Scheduling

---

### MVP 5: Comment & Messenger (Minggu 9-10)
**Slogan:** "Balasan Cerdas, Pelanggan Puas"

**Tambahan Fitur:**
- ✅ Comment Agent (reply suggestion, sentiment detection)
- ✅ Messenger Agent (auto-response)
- ✅ Inbox Integration (see all comments in one place)
- ✅ Response Templates (consistent tone)
- ✅ Approval Workflow (moderator review sebelum publish)

---

### MVP 6: Image & Media (Minggu 11-12)
**Slogan:** "Desain Poster, Buat Banner, Ciptakan Visual"

**Tambahan Fitur:**
- ✅ Image Agent (AI prompt generation)
- ✅ Media Library (organize, tag, search)
- ✅ Poster Templates (drag & drop editor)
- ✅ Banner Generator (automated sizing)
- ✅ OpenAI DALL-E Integration (image generation)

---

## 4. USER STORIES (KIRA SENANG SEBAGAI REFERENCE)

### User Persona 1: KIRA Senang Marketing Manager
**Nama:** Nurul, Pengurus Pemasaran KIRA Senang

**Story 1: Generate Weekly Campaign**
```
Sebagai pengurus pemasaran,
Saya ingin menjana idea kampanye mingguan dengan strategi yang jelas,
Supaya saya dapat posting dengan confidence dan meningkatkan engagement.

Acceptance Criteria:
✓ Buka AI-DMOS dan pilih Content Agent
✓ Input: "Kami menjual sistem POS untuk UKM. Minggu ni kita focus promotion. Target: calon pembeli POS"
✓ Output: Campaign idea dengan 5 caption variations, hashtag, CTA, timing recommendation
✓ Simpan hasil ke history untuk future reference
✓ Export caption ke Markdown untuk share dengan team
```

**Story 2: Monitor Trend & Create Content**
```
Sebagai pengurus pemasaran,
Saya ingin tahu trend terkini dan idea kandungan berdasarkan current events,
Supaya kandungan saya selalu relevant dan timely.

Acceptance Criteria:
✓ Buka Trend Agent
✓ System show: "Bulan Ramadan dimulai 3 minggu. Trend: discounts, charitable giving, family time"
✓ Generate 3 content idea berdasarkan Ramadan theme
✓ Integrate dengan Cultural Calendar
```

**Story 3: Analyse Performance & Optimise**
```
Sebagai pengurus pemasaran,
Saya ingin upload Facebook Insights dan dapatkan recommendations,
Supaya saya tahu jenis kandungan dan waktu posting yang paling berkesan.

Acceptance Criteria:
✓ Analytics Agent baca CSV dari Facebook
✓ Show: Engagement rate by day/time, top performing posts, audience demographics
✓ Recommendation: "Posting pada Hari Jumaat jam 7-9 malam dapat engagement 40% lebih tinggi"
✓ Suggest content type yang paling resonate
```

### User Persona 2: UKM Retail Owner
**Nama:** Aziz, Pemilik Kedai Runcit

**Story 4: Generate Promo Caption**
```
Sebagai pemilik kedai,
Saya tidak ada background marketing tetapi perlu jual produk,
Saya ingin AI generate caption yang menarik dengan CTA yang jelas.

Acceptance Criteria:
✓ Input: "Kami baru ada stock Susu Panda. Harga RM10.90, promo RM8.90"
✓ Output: Caption dengan hook, benefit, urgency, CTA (WhatsApp/visit shop)
✓ Include emoji, hashtag, bilingual option
✓ Saya hanya copy-paste ke Facebook
```

**Story 5: Schedule & Auto-Publish**
```
Sebagai pemilik kedai dengan waktu limited,
Saya ingin schedule posting untuk 2 minggu ke depan,
Supaya saya tidak perlu ingat posting every day.

Acceptance Criteria:
✓ Draft 10 posting
✓ Schedule setiap hari pada waktu optimal (7am, 12pm, 7pm)
✓ System auto-publish pada waktu yang ditentukan
✓ Dashboard show scheduled queue
```

---

## 5. FEATURE PRIORITI (MVP 1)

| Feature | Priority | Effort | Impact | Included MVP 1? |
|---------|----------|--------|--------|-----------------|
| Login/Register | P0 | 2h | Critical | ✅ Yes |
| Dashboard | P0 | 3h | Critical | ✅ Yes |
| Company Profile | P1 | 2h | High | ✅ Yes |
| CEO Agent | P1 | 4h | High | ✅ Yes |
| Content Agent - Caption | P1 | 3h | High | ✅ Yes |
| Content Agent - CTA | P2 | 2h | Medium | ✅ Yes |
| Content Agent - Hashtag | P2 | 1h | Medium | ✅ Yes |
| History Panel | P2 | 2h | Medium | ✅ Yes |
| Export (Markdown) | P2 | 1.5h | Medium | ✅ Yes |
| Calendar | P1 | 4h | High | ❌ MVP 2 |
| Analytics | P1 | 5h | High | ❌ MVP 3 |
| Meta API Integration | P1 | 3h | High | ❌ MVP 4 |

**Total MVP 1 Effort:** ~25 jam development + testing

---

## 6. TARGET AUDIENCE

### Primary Market: UKM Malaysia

**Business Size:**
- 5-50 employees
- Annual revenue RM 300K - RM 5M
- Existing social media presence (Facebook minimal)

**Industry Vertical:**
- Retail (Runcit, Fashion, Elektronik)
- Food & Beverage (Restoran, Bakery, Kopi)
- Services (Salon, Laundry, Gym)
- Manufacturing (Kecil-kecilan)
- E-Commerce (Shopee, Lazada seller)

**Pain Points:**
1. **Kesulitan jaga consistency** — posting sporadically
2. **Tidak ada marketing background** — tak tahu mana copywriting yang berkesan
3. **Timeless** — sibuk dengan operasi, media sosial terlupa
4. **Budget terbatas** — tak mampu bayar agensi marketing
5. **ROI unclear** — posting tapi tak tahu impact-nya

### Secondary Market: Digital Agencies

Agensi digital yang ingin:
- Menggunakan AI untuk accelerate content creation
- Manage multiple client social media dari satu platform
- Reduce operational cost
- Scale content production

---

## 7. MONETIZATION STRATEGY

### Fasa 1 (MVP 1-3): Freemium
- **Free Tier**: 5 posts/bulan, AI Agent access limited, history 30 days
- **Starter (RM99/bulan)**: Unlimited posts, all agents, 90 days history
- **Pro (RM199/bulan)**: + Scheduling, Analytics, Auto-publish
- **Enterprise (Custom)**: + Meta API, Bulk operations, Priority support

### Fasa 2 (MVP 4+): Usage-based Pricing
- Base subscription + token/API usage
- Analytics: add-on RM50/bulan
- Meta API: add-on RM100/bulan
- Premium Support: add-on RM200/bulan

---

## 8. SUCCESS METRICS (MVP 1)

### User Acquisition
- 50 sign-ups dalam 1 bulan (dogfooding + word-of-mouth)
- 30 active users (weekly usage)
- 80% retention rate (usage after week 1)

### Product Quality
- Page load < 2 detik (Lighthouse score > 80)
- AI response time < 10 detik (95th percentile)
- 99.5% uptime
- Zero data loss (backup daily)

### Business Metrics
- 10 paid users (Starter/Pro) dalam MVP 1 (dogfooding KIRA Senang first)
- MRR RM 1,000 target untuk akhir MVP 2

---

## 9. DESIGN PRINCIPLES

1. **Malaysian-First**
   - Content dalam Bahasa Melayu Malaysia
   - Konteks lokal (budaya, cukai, platform lokal)
   - Currency RM, payment method lokal (FPX, TNG)

2. **Simple for Non-Techies**
   - Zero learning curve
   - Clear instruction
   - Help contextual

3. **AI-Assisted, Human-Controlled**
   - AI jadi suggestions, bukan automation paksa
   - User boleh edit sebelum publish
   - Approval workflow built-in

4. **Data Privacy**
   - Comply dengan Malaysia data protection
   - No data selling
   - Transparent about AI usage

5. **Scalable Architecture**
   - Multi-tenant dari hari pertama
   - API-first design
   - Ready untuk future integrations

---

## 10. CONSTRAINTS & ASSUMPTIONS

### Constraints
- ✓ Cloud Run deployment (Google Cloud)
- ✓ Firestore backend (real-time sync)
- ✓ Claude Sonnet 4.6 untuk text generation
- ✓ OpenAI DALL-E untuk image generation (Phase 6)
- ✓ Malaysia regulatory compliance (SST, e-Invoice, data protection)

### Assumptions
- ✓ Founder dapat allocate 40+ jam/minggu untuk development
- ✓ KIRA Senang team boleh provide feedback iteratively
- ✓ Market willing to adopt AI-powered social media tools
- ✓ Anthropic API quotas sufficient untuk 100+ concurrent users

---

## 11. TIMELINE & MILESTONES

| Milestone | Target Date | Deliverables |
|-----------|-------------|--------------|
| Fasa 0 (Documentation) | 15 Juli 2026 | 12 docs + prompts |
| MVP 1 Alpha | 22 Juli 2026 | Beta testing with KIRA Senang |
| MVP 1 Production | 29 Juli 2026 | Live, public access |
| MVP 2 Alpha | 12 Agustus 2026 | Calendar + Trend Agent |
| MVP 3 Alpha | 2 September 2026 | Analytics + Insights |
| MVP 4 Alpha | 23 September 2026 | Automation + Meta API |
| MVP 5 Alpha | 14 Oktober 2026 | Comment + Messenger |
| MVP 6 Alpha | 4 November 2026 | Image Generation |

---

## 12. RISKS & MITIGATION

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| API Rate Limiting (Claude/OpenAI) | Medium | High | Implement queue, caching, tiered pricing |
| Firestore Cost Overrun | Medium | Medium | Monitor usage, optimize queries, cache aggressively |
| Market Adoption Slow | Low-Medium | High | Focus on KIRA Senang dogfooding, word-of-mouth |
| AI Output Quality Inconsistent | Medium | High | Detailed prompts, few-shot examples, human review |
| Facebook API Changes | Low | Medium | Maintain abstraction layer, quick response time |

---

## 13. GLOSSARY

- **AI Agent**: Autonomous system yang menggunakan Claude untuk tugasan tertentu
- **CEO Agent**: Orchestrator yang merancang tugasan dan mengagih kepada agent lain
- **Knowledge Agent**: RAG system yang supply context dan knowledge kepada agent lain
- **Tenant**: Satu company yang menggunakan platform (multi-tenant SaaS)
- **Workspace**: Bagian dari tenant untuk organizational hierarchy
- **Brand**: Identiti jenama dengan voice, tone, guidelines
- **Social Account**: Linked Facebook page, Instagram profile, TikTok account, dsb
- **Dogfooding**: Menggunakan produk sendiri sebelum release ke public
- **MVP**: Minimum Viable Product (version terkecil yang bisa digunakan)

---

**Document Version:** 1.0  
**Last Updated:** 15 July 2026  
**Maintained By:** AI-DMOS Product Team
