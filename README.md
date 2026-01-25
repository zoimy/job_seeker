<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# JobMatcher Platform 🚀

AI-powered job matching platform with beautiful glassmorphism UI. Match your skills with perfect job opportunities using Google Gemini AI.

View your app in AI Studio: https://ai.studio/apps/drive/1pBrkOO3qpLFCAuW25NydvcyGXKouw-kv

## ✨ Features

- 🔍 **Real Job Scraping**: Fetches actual vacancies from rabota.md
- 🎯 **Smart Matching**: AI-powered match score calculation based on your profile
- 🎨 **Modern UI**: Glassmorphism design with animated backgrounds
- 💼 **Profile Management**: Customize your skills, experience, and preferences
- 🔔 **Integrations**: Connect Telegram, Email, Slack, Discord and more
- 📱 **Responsive**: Works perfectly on desktop and mobile
- ⚡ **Real-time**: Always shows fresh, actual job postings

## 🚀 Run Locally

**Prerequisites:** Node.js (v18 or higher)

### 1. Install dependencies

**Frontend:**
```bash
npm install
```

**Backend:**
```bash
cd backend
npm install
cd ..
```

### 2. Start the backend scraper (REQUIRED)

```bash
cd backend
npm start
```

You'll see:
```
🚀 Backend server running on http://localhost:5000
```

Keep this terminal running!

### 3. Start the frontend

In a new terminal:
```bash
npm run dev
```

The app will be available at:
- **Local:** http://localhost:3000/
- **Network:** http://[your-ip]:3000/

> **IMPORTANT:** Backend must be running for the app to work! Without backend, you'll see "No vacancies found" message.

### 4. Build for production (optional)
```bash
npm run dev
```

The app will be available at:
- **Local:** http://localhost:3000/
- **Network:** http://[your-ip]:3000/

### 4. Build for production (optional)
```bash
npm run build
npm run preview
```

## 🛠️ Tech Stack

**Frontend:**
- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Fast build tool
- **Tailwind CSS** - Styling
- **Lucide Icons** - Beautiful icons

**Backend:**
- **Node.js + Express** - API server
- **Axios** - HTTP requests
- **Cheerio** - HTML parsing
- **NodeCache** - Response caching

## 📁 Project Structure

```
job_tracker/
├── App.tsx                    # Main app component
├── index.tsx                  # Entry point
├── types.ts                   # TypeScript types
├── components/                # UI components
│   ├── Navigation.tsx
│   ├── VacancyCard.tsx
│   ├── ProfileEditor.tsx
│   ├── IntegrationsPage.tsx
│   └── ...
├── services/
│   ├── geminiService.ts       # Main vacancy fetching logic
│   └── realVacancyService.ts  # Backend API communication
└── backend/                   # Scraping backend
    ├── src/
    │   ├── scrapers/
    │   │   └── rabotaMdScraper.js
    │   ├── routes/
    │   │   └── scrape.js
    │   └── server.js
    └── package.json
```

## 🔐 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_BACKEND_URL` | Backend scraper URL | Yes (default: http://localhost:5000) |
| `VITE_APP_NAME` | Application name | No (default: JobMatcher) |
| `VITE_APP_PORT` | Development server port | No (default: 3000) |

## 🎯 How It Works

1. User sets preferences in Profile (role, location, skills, salary)
2. User clicks "AI Scan" button
3. Frontend sends request to backend scraper
4. Backend scrapes rabota.md for matching jobs
5. Results are transformed and matched against user profile
6. Match scores calculated based on skills, location, salary
7. Real job listings displayed in beautiful UI with match percentage

## 📝 License

MIT


