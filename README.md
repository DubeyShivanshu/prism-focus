# Prism
### AI-Powered Cognitive Friction Productivity Platform

> *"Clarity through friction."*

Prism reduces digital distraction using behavioral psychology and AI — not by blocking sites outright, but by making them progressively unrewarding through visual degradation (grayscale, blur, overlays), interaction slowdowns, and dopamine trigger suppression via a Chrome Extension.

---

## Features

### 🧠 Cognitive Friction Engine (Chrome Extension)
- **3-level friction system** applied in real-time on blocked sites:
  - **Level 1 — Mild**: Subtle grayscale + brightness reduction
  - **Level 2 — Moderate**: Grayscale + blur + slowed animations
  - **Level 3 — Severe**: Full dark overlay with "Cognitive Friction Active" warning + algorithmic feed hiding
- Runs at `document_start` for instant effect before page renders
- Feed-hiding selectors for YouTube, Twitter/X, Instagram, Reddit

### 📊 Dashboard
- Live productivity score, streak, and focus time widgets
- 84-day activity heatmap (GitHub-style)
- Recent sessions list
- Integrated Pomodoro / Deep Work timer widget

### ⏱ Focus Timer (Pomodoro)
- SVG circular countdown with glow ring animation
- Session states: `idle → running → paused → break → completed`
- Notes modal on session completion
- Today's focus stats + sessions log sidebar
- Synced to backend (`POST /api/sessions`)

### 🔮 Aria — AI Productivity Coach
- Powered by **Gemini 2.5 Flash**
- Context-aware suggestions based on your real session/block data
- Streaming chat with formatted markdown responses
- Chip-based quick-prompt shortcuts

### 🚫 Blocked Sites Manager
- Add/edit/remove sites with domain, category, and friction level
- Per-site toggle (Active / Paused)
- Filter by category + search
- Stats: total, active, paused, override count

### 🏆 Achievements
- 14 computed achievements across 4 categories: Sessions, Time, Streak, Focus
- Progress bars for locked achievements
- Overall completion percentage bar
- Computed live from analytics data — no extra backend needed

### ⚙️ Settings
- Profile management (name, avatar)
- Pomodoro duration configuration with live pattern preview
- Productivity goal target with animated progress bar
- Notification preferences + friction mode selector (Auto / Manual)
- Account logout

### 🔐 Auth
- Email/password (JWT access + refresh token, httpOnly cookies)
- Google OAuth 2.0 via Passport.js
- Silent token refresh with rotation
- Token bridge to Chrome Extension

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite 5, Zustand, React Router v6, Recharts |
| Backend | Node.js 20, Express 4, Mongoose 8, Socket.io 4 |
| Database | MongoDB Atlas |
| AI | Google Gemini 2.5 Flash |
| Auth | JWT (access + refresh token rotation), Google OAuth 2.0, Passport.js |
| Chrome Extension | Manifest V3, Vanilla JS, Service Worker |
| Styling | Vanilla CSS (custom design system, CSS variables, dark mode) |

---

## Project Structure

```
Prism/
├── backend/                    # Express API — layered architecture
│   └── src/
│       ├── config/             # env, passport, db
│       ├── controllers/        # request handlers
│       ├── middleware/         # auth, rate limiter, error handler
│       ├── models/             # Mongoose schemas
│       ├── repositories/       # data access layer
│       ├── routes/             # API route definitions
│       └── services/           # business logic
│
├── frontend/                   # React + Vite dashboard
│   └── src/
│       ├── components/
│       │   └── Layout/         # Sidebar, Navbar, AppShell
│       ├── hooks/              # useAuth, useTimer
│       ├── pages/
│       │   ├── auth/           # Login, Register, AuthCallback (OAuth)
│       │   ├── dashboard/      # Dashboard with heatmap + timer widget
│       │   ├── analytics/      # Charts, heatmap, session log
│       │   ├── coach/          # Aria AI chat interface
│       │   ├── sites/          # Blocked sites manager
│       │   ├── achievements/   # Gamified achievement cards
│       │   ├── pomodoro/       # Full-page focus timer
│       │   └── settings/       # User preferences
│       ├── services/
│       │   ├── api.js          # Axios instance with interceptors
│       │   └── extensionBridge.js  # Auto-sends JWT to Chrome Extension
│       └── store/              # Zustand stores (auth, timer, session)
│
└── extension/                  # Chrome Extension MV3
    ├── background/
    │   └── service-worker.js   # Rule sync, token storage, message router
    ├── content/
    │   └── content.js          # Cognitive Friction Engine
    ├── popup/
    │   ├── index.html
    │   └── popup.js            # Connection UI + session status
    ├── styles/
    │   └── distortion.css      # Base friction styles
    └── manifest.json
```

---

## Getting Started

### Prerequisites
- Node.js >= 20
- npm >= 10
- MongoDB Atlas URI (or local MongoDB)
- Google Gemini API key
- Google OAuth credentials (for Google login)

### 1. Clone & Install

```bash
git clone https://github.com/your-username/prism.git
cd prism

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

### 2. Configure Environment

#### `backend/.env`
```env
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:5173

MONGODB_URI=your_mongodb_atlas_uri

JWT_ACCESS_SECRET=your_access_secret_min_32_chars
JWT_REFRESH_SECRET=your_refresh_secret_min_32_chars
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d

GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash

RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=1000
AUTH_RATE_LIMIT_MAX=50

COOKIE_SECRET=your_cookie_secret
```

#### `frontend/.env`
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
VITE_APP_NAME=Prism
```

### 3. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a project → APIs & Services → Credentials
3. Create OAuth 2.0 Client ID (Web Application)
4. Add Authorized Redirect URI: `http://localhost:5000/api/auth/google/callback`
5. Copy Client ID + Secret into `backend/.env`

### 4. Run Development Servers

```bash
# Terminal 1 — Backend
cd backend
npm run dev
# → http://localhost:5000

# Terminal 2 — Frontend
cd frontend
npm run dev
# → http://localhost:5173
```

---

## Chrome Extension Setup

1. Open `chrome://extensions` in Chrome
2. Enable **Developer Mode** (top right toggle)
3. Click **Load unpacked**
4. Select the `extension/` folder from this project
5. The extension loads with a default icon

### Connecting the Extension
The extension auto-receives the JWT token from the dashboard after login (via `extensionBridge.js`). If it doesn't connect automatically:

1. Click the Prism extension icon in Chrome toolbar
2. Paste your JWT token (get it from DevTools Console: `window.__prism_access_token__`)
3. Click **Connect** → **Sync Now**

### Testing Friction
1. Add a site in the dashboard → `/sites` → `+ Add Site`
2. Set domain (e.g. `youtube.com`), category, and friction level
3. Open that site in a new tab
4. Level 1 (Mild) → subtle grayscale
5. Level 2 (Moderate) → grayscale + blur
6. Level 3 (Severe) → full overlay with dismiss/go-back

---

## API Routes

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | ❌ | Register with email/password |
| POST | `/api/auth/login` | ❌ | Login, returns access token |
| POST | `/api/auth/refresh` | ❌ | Rotate refresh token |
| POST | `/api/auth/logout` | ✅ | Invalidate refresh token |
| GET | `/api/auth/me` | ✅ | Get current user profile |
| GET | `/api/auth/google` | ❌ | Initiate Google OAuth flow |
| GET | `/api/auth/google/callback` | ❌ | Google OAuth callback |
| GET | `/api/analytics/summary` | ✅ | Productivity stats summary |
| GET | `/api/analytics/heatmap` | ✅ | Activity heatmap data |
| GET | `/api/sessions` | ✅ | List focus sessions |
| POST | `/api/sessions/start` | ✅ | Start a new session |
| PATCH | `/api/sessions/:id/complete` | ✅ | Complete a session |
| PATCH | `/api/sessions/:id/abandon` | ✅ | Abandon a session |
| GET | `/api/sessions/active` | ✅ | Get current active session |
| GET | `/api/blocks` | ✅ | List blocked sites |
| POST | `/api/blocks` | ✅ | Add a blocked site |
| PATCH | `/api/blocks/:id` | ✅ | Update site / friction level |
| DELETE | `/api/blocks/:id` | ✅ | Remove a site |
| GET | `/api/settings` | ✅ | Get user settings |
| PATCH | `/api/settings` | ✅ | Update settings |
| POST | `/api/ai/chat` | ✅ | Chat with Aria AI coach |
| GET | `/api/ai/suggestions` | ✅ | Get AI productivity suggestions |
| GET | `/api/health` | ❌ | Server health check |

---

## Responsiveness

The dashboard is **desktop-first**. It includes responsive breakpoints at `1100px` and `700px` that collapse the sidebar and adjust layouts. For best experience, use on a screen width ≥ 900px.

---

## Deployment

| Service | Platform | Notes |
|---|---|---|
| Frontend | [Vercel](https://vercel.com) | Set `VITE_API_URL` to your backend URL |
| Backend | [Render](https://render.com) | Set all env vars in Render dashboard |
| Database | [MongoDB Atlas](https://mongodb.com/atlas) | Whitelist Render's IP |

For production, set `NODE_ENV=production` and update:
- `GOOGLE_CALLBACK_URL` → your Render backend URL
- `CLIENT_URL` → your Vercel frontend URL
- `RATE_LIMIT_MAX` → `100` (re-enable rate limiting)

---

## License

MIT
