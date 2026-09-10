# 🏏 Cricket Player Auction Command Center (Next.js Web App)

Full-stack Next.js (App Router) cricket auction control panel deployable directly to Vercel.

### Prerequisites
- Node.js 18+
- MongoDB (Atlas or local)

### Quick Start
```bash
npm install
npm run seed       # Seeds the database with 43 players & 3 teams
npm run verify-db  # Verifies the database records
npm run dev        # Starts development server at http://localhost:3000
npm run build      # Production build
npm run start      # Production server
```

### Git Branch Push Fix
If pushing to GitHub returns `error: src refspec main does not match any`:
```bash
git branch -M main
git push -u origin main
```
