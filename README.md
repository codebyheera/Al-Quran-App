# 📖 Al-Quran — MERN Stack Quran Web App

A full-featured, beautiful Quran reading app built with **React**, **Node/Express**, and **MongoDB**.

## Features

- 📖 **Browse all 114 Surahs** — with Arabic text, English translation
- 📚 **Browse all 30 Juz** — grouped by Surah within each part  
- 🔊 **Audio recitation** — per-verse playback (Abdul Samad, EveryAyah CDN)
- 🔖 **Bookmarks** — save verses, stored in MongoDB, no login required
- 🔍 **Search** — global text search across English translation
- 🌙 **Dark / Light mode** — persisted to localStorage
- ⬅➡ **Prev / Next navigation** between Surahs and Juz
- 📱 **Mobile-first responsive design**

---

## Project Structure

```
Quran App/
├── backend/       ← Node.js + Express + MongoDB
│   ├── models/    ← Mongoose schemas (User, Bookmark)
│   ├── routes/    ← API routes (surah, juz, bookmarks, search)
│   ├── server.js
│   └── package.json
└── frontend/      ← React (Vite)
    ├── src/
    │   ├── components/   ← Navbar, AudioPlayer
    │   ├── context/      ← ThemeContext, BookmarkContext
    │   ├── pages/        ← Home, SurahList, JuzList, SurahView, JuzView, BookmarksPage, SearchPage
    │   └── styles/       ← global.css, per-component CSS
    └── package.json
```

---

## Running Locally

### Prerequisites
- [Node.js](https://nodejs.org) v18+
- [MongoDB Atlas](https://www.mongodb.com/atlas) account (free tier works)

### 1. Clone / navigate to the project

```bash
cd "Quran App"
```

### 2. Set up the Backend

```bash
cd backend
copy .env.example .env
```

Open `.env` and replace the `MONGO_URI` with your **MongoDB Atlas** connection string:

```
MONGO_URI=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/quranapp?retryWrites=true&w=majority
```

Then install dependencies and start:

```bash
npm install
npm run dev     # uses nodemon for auto-reload
# Server runs on http://localhost:5000
```

### 3. Set up the Frontend

```bash
cd ../frontend
npm install
npm run dev
# App opens on http://localhost:5173
```

> The Vite dev server automatically proxies `/api/*` to `http://localhost:5000`.

---

## API Routes (Backend)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/surah` | List all 114 Surahs (metadata) |
| GET | `/api/surah/:n` | Surah Arabic + English text |
| GET | `/api/juz` | List all 30 Juz |
| GET | `/api/juz/:n` | Juz Arabic + English text |
| GET | `/api/bookmarks?clientId=x` | Get user bookmarks |
| POST | `/api/bookmarks` | Create bookmark |
| DELETE | `/api/bookmarks/:id` | Delete bookmark |
| GET | `/api/search?q=keyword` | Search English translation |

---

## Deployment

### Frontend → Vercel / Netlify
1. Build: `npm run build` inside `frontend/`
2. Set environment variable: `VITE_API_URL=https://your-backend.com`
3. Deploy `frontend/dist/`

### Backend → Render / Railway
1. Set `MONGO_URI` and `PORT` env vars
2. Set start command: `node server.js`
3. Set `FRONTEND_URL` to your deployed frontend URL (for CORS)

### Database → MongoDB Atlas
- Free M0 cluster is sufficient to start
- Whitelist all IPs (`0.0.0.0/0`) for cloud deployment

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, React Router v6 |
| Styling | Vanilla CSS, Google Fonts (Amiri, Noto Naskh Arabic, Inter) |
| Backend | Node.js, Express 4 |
| Database | MongoDB (Mongoose) |
| Quran Data | [AlQuran Cloud API](https://alquran.cloud/api) |
| Audio | [EveryAyah CDN](https://everyayah.com) |

---

## License

MIT — free to use, modify, and distribute.
