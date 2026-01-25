# Job Tracker Backend 🔧

Backend API for scraping and serving real job vacancies from rabota.md

## 🚀 Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Start the server
```bash
npm start
```

Or for development with auto-reload:
```bash
npm run dev
```

The server will start on **http://localhost:5000**

## 📡 API Endpoints

### POST /api/scrape/rabota-md
Scrape jobs from rabota.md

**Request:**
```json
{
  "query": "Senior Frontend Developer",
  "location": "chisinau",
  "searchPeriodDays": 1
}
```

**Response:**
```json
{
  "success": true,
  "count": 15,
  "vacancies": [
    {
      "id": "abc123",
      "title": "Senior Frontend Developer",
      "company": "TechCompany",
      "description": "...",
      "salary": { "min": 45000, "max": 65000, "currency": "MDL" },
      "location": "Chisinau",
      "postedAt": "2026-01-18T18:00:00.000Z",
      "url": "https://rabota.md/...",
      "source": "rabota.md"
    }
  ],
  "timestamp": "2026-01-18T20:00:00.000Z"
}
```

### GET /api/scrape/test
Test if scraper is working

### GET /health
Health check endpoint

## 🛠️ How It Works

1. **Receives search parameters** from frontend
2. **Builds search URL** for rabota.md
3. **Fetches HTML** with proper headers to avoid blocking
4. **Parses vacancies** using Cheerio selectors
5. **Filters by date** based on search period
6. **Returns structured data** to frontend

## 📁 Project Structure

```
backend/
├── src/
│   ├── scrapers/
│   │   └── rabotaMdScraper.js    # Main scraper logic
│   ├── routes/
│   │   └── scrape.js             # API routes
│   ├── utils/
│   │   └── cache.js              # Caching utility
│   └── server.js                 # Express server
├── package.json
└── README.md
```

## ⚙️ Features

- ✅ **Multi-selector fallback** - Uses multiple CSS selectors for robustness
- ✅ **Date parsing** - Handles relative dates ("сегодня", "вчера", "3 дня назад")
- ✅ **Salary extraction** - Parses salary ranges and currencies
- ✅ **Rate limiting protection** - Built-in request throttling
- ✅ **CORS enabled** - Ready for frontend integration
- ✅ **Error handling** - Graceful degradation on failures
- ✅ **Caching** - 5-minute cache for repeated queries

## 🔒 Notes

- The scraper uses proper User-Agent headers to appear as a real browser
- Respects rabota.md's structure (selectors may need updates if site changes)
- Check rabota.md's Terms of Service before heavy usage
- Consider contacting rabota.md for official API access for production use

## 🐛 Troubleshooting

**Problem:** "403 Forbidden" errors
- **Solution:** The scraper already includes proper headers, but if blocked, wait a few minutes

**Problem:** No vacancies found
- **Solution:** Check if search query matches actual job titles on rabota.md

**Problem:** Server won't start
- **Solution:** Make sure port 5000 is not in use: `lsof -ti:5000 | xargs kill -9`

## 📝 License

MIT
