# AI Website SEO Auditor

A production-ready, full-stack SaaS platform that crawls real websites, executes deep technical and on-page SEO audits, computes an authentic 0–100 SEO score, generates contextual AI recommendations with copyable fixes, and produces downloadable PDF reports.

Built with **React (Vite) + Tailwind CSS** on the frontend, and **Node.js + Express + MySQL** on the backend.

---

## Key Features

1. **Queue-Based Website Crawler**:
   - Discovers internal pages on the same domain with configurable crawl depth (up to 50 pages).
   - SSRF Protection: Blocks private IPs (`10.x`, `172.16.x`, `192.168.x`), loopback (`127.0.0.1`, `localhost`), and non-HTTP protocols.
   - Deduplicates URLs, normalizes trailing slashes, strips query fragments, and handles redirects and timeouts.

2. **50+ Deep SEO Analysis Checks**:
   - **Technical SEO**: HTTPS, HTTP status codes, robots.txt, canonical tags, viewport, charset, favicon, language tags.
   - **On-Page SEO**: Title tags (length, keyword presence), meta descriptions (length, missing), H1-H6 heading hierarchy.
   - **Content SEO**: Real word counts, readability indices, keyword distribution, thin content penalties.
   - **Images & Links**: Missing image alt attributes, broken images, internal vs. external link distribution, empty anchors.
   - **Social & Schema**: Open Graph tags, Twitter cards, and Schema.org JSON-LD detection (Organization, LocalBusiness, FAQ, Breadcrumbs).
   - **Local SEO**: Business name, contact numbers, address signals, and geographic schema detection.

3. **Grounded 0–100 SEO Scoring Engine**:
   - Strict weighted scoring model:
     - Technical SEO: 25%
     - On-Page SEO: 25%
     - Content SEO: 20%
     - Performance: 15%
     - Structured Data: 5%
     - Social SEO: 5%
     - Local SEO: 5%
   - No random numbers or fabricated scores. Scores and issues reflect genuine crawl metrics.

4. **Contextual AI Intelligence**:
   - OpenAI-compatible integration with a deterministic fallback engine strictly grounded in actual audit data.
   - One-Click Code Fix Generator: Generates copyable `<meta>`, `<h1>`, `alt`, and JSON-LD snippets.
   - AI Meta Title & Description Generator with live character counter.
   - AI Content Optimizer: Analyzes user-pasted text against target keywords for readability and keyword density.
   - Grounded AI SEO Consultant: Answers questions about the current audit using real detected issues.

5. **Interactive 4-Phase SEO Growth Roadmap (30-60-90 Days)**:
   - Generated automatically after every website audit.
   - Organized into 4 execution phases:
     - **Phase 1 (Days 1–14)**: Foundation & Crawlability Triage (HTTPS, 404s, viewport, noindex).
     - **Phase 2 (Days 15–30)**: On-Page Relevance & Metadata (Titles, descriptions, image alt, content expansion).
     - **Phase 3 (Days 31–60)**: Backlinks & Anchor Words Architecture (Anchor text diversification, internal linking).
     - **Phase 4 (Days 61–90+)**: Authority Scaling, Rich Snippets (Schema.org JSON-LD, Core Web Vitals).
   - Interactive checklist with status toggles (To Do, In Progress, Completed), effort ratings, code fixes, and export to CSV or Markdown.

6. **Backlit Words & Backlink Intelligence Hub**:
   - **Visual "Backlit Words" Keyword Scanner**: Illuminates target keywords, anchor words, and key terms in neon glowing badges with real-time prominence scores and density analytics.
   - **Backlink & Anchor Words Profile**: Crawls all link texts, computes anchor word distributions (Branded, Keyword, Partial, Generic, Naked URL, Empty), and provides copyable link outreach pitch templates.

7. **Live Robots.txt & Sitemap Deep Inspector**:
   - Real-time diagnostic tester for `robots.txt` and `sitemap.xml`.
   - Inspects user-agents, disallows, crawl-delays, and extracts live sitemap URLs.

8. **Competitor SEO Head-to-Head Comparison**:
   - Side-by-side audit comparison between two websites with metric-by-metric breakdown and winner verdicts.

9. **Downloadable PDF Reports**:
   - Multi-page branded PDF reports generated on the backend with PDFKit.
   - Includes overall score, category breakdown, priority action items, SEO Roadmap, Backlinks profile, and crawled pages table.

10. **Modern SaaS UI (Tailwind CSS Only)**:
   - Built exclusively with Tailwind CSS (no Bootstrap, MUI, or external component UI libraries).
   - Light and Dark mode with responsive sidebar and mobile drawer.
   - Visual charts and icons (Lucide React).
   - Live 11-step audit progress checklist.

---

## Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, React Router v6, Axios, Recharts, Lucide React.
- **Backend**: Node.js, Express.js, MySQL (mysql2 pool), JWT, bcryptjs, Cheerio, Axios, PDFKit, Helmet, Winston.
- **Database**: MySQL 5.7+ / 8.0+ (relational schema: `users`, `audits`, `pages`, `seo_issues`, `ai_recommendations`).

---

## Project Structure

```text
SEO/
├── backend/
│   ├── src/
│   │   ├── config/            # Environment & database configuration
│   │   ├── controllers/       # Auth, Audits, AI, Reports, Pages
│   │   ├── middleware/        # JWT auth, error handlers, rate limiting
│   │   ├── models/            # MySQL data models (User, Audit, Page, Issue)
│   │   ├── routes/            # REST API endpoints
│   │   ├── services/
│   │   │   ├── crawler/       # Queue crawler & SSRF guard
│   │   │   ├── seo/           # Analyzer & 0-100 Scorer
│   │   │   ├── ai/            # OpenAI LLM & grounded recommendation engine
│   │   │   └── reports/       # PDFKit report generator
│   │   ├── utils/             # Logger, SSRF guard
│   │   ├── app.js             # Express app setup
│   │   └── server.js          # HTTP server bootstrap & DB initialization
│   ├── tests/                 # Unit and E2E verification test suites
│   └── package.json
├── database/
│   └── schema.sql             # Relational MySQL schema
├── frontend/
│   ├── src/
│   │   ├── components/        # Sidebar, Header, ScoreBadge, SeverityBadge, Modal
│   │   ├── context/           # AuthContext & ThemeContext (Light/Dark)
│   │   ├── pages/             # Landing, Login, Register, Dashboard, Audit, Issues,
│   │   │                      # Pages, AIConsultant, ContentOptimizer, Reports, History
│   │   ├── services/          # API client
│   │   ├── App.jsx            # Router and layout configurations
│   │   ├── main.jsx           # Entry point
│   │   └── index.css          # Tailwind CSS directives
│   ├── index.html
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

---

## Quick Start Guide

### 1. Database Setup
Ensure MySQL is running (e.g. through XAMPP or native MySQL service).
Create the database:
```sql
CREATE DATABASE IF NOT EXISTS ai_seo_auditor;
```
The application will automatically run `database/schema.sql` on startup to initialize and migrate all tables.

### 2. Configure Environment Variables
Copy `.env.example` to `.env` in the root directory (or `backend/.env`):
```env
PORT=5000
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_USER=root
DATABASE_PASSWORD=
DATABASE_NAME=ai_seo_auditor

JWT_SECRET=your_super_secret_jwt_key_at_least_32_characters_long
JWT_EXPIRES_IN=7d

AI_API_KEY=
AI_MODEL=gpt-4o-mini
AI_API_BASE_URL=https://api.openai.com/v1

FRONTEND_URL=http://localhost:5173
```
*(Note: If `AI_API_KEY` is omitted, the application uses an intelligent deterministic AI engine grounded in your real audit data).*

### 3. Install Dependencies & Run

From the project root:

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Start backend (from backend/)
npm run dev

# Start frontend in another terminal (from frontend/)
npm run dev
```

- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5000/api](http://localhost:5000/api)

---

## Running Tests

### Automated Unit Tests (11 test suites)
```bash
cd backend
node tests/unitTests.js
```

### Full-Stack End-to-End Test Suite (12 steps)
```bash
cd backend
node tests/e2eVerification.js
```

Both test suites run against real crawler output, scoring calculations, SSRF validation, and report generation with zero fake data.
#   S E O _ A I  
 