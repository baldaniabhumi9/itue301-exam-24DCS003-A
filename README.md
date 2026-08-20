# ITUE301 Library Book Management System

Public repository for `itue301-exam-24DCS003-A`.

## Project structure

- `frontend/` React and Vite client
- `backend/` Express API and Mongoose models
- `.env.example` MongoDB configuration template

## Setup

Install dependencies in each application folder:

```bash
cd backend
npm install
cp ../.env.example .env
```

Set `MONGO_URI` in `backend/.env`, then start the API:

```bash
npm start
```

The backend supports both `MONGO_URI` and `MONGODB_URI`. Mongoose schemas for books, members, and borrowing records are in `backend/models/`. MongoDB validation and collection counts can be checked with `GET /api/mongo/summary`.

In another terminal, start the React client:

```bash
cd frontend
npm install
npm run dev
```

The frontend proxies `/api` requests to `http://localhost:5050`. For a production client build, run `npm run build` in `frontend/` and start the backend with `NODE_ENV=production npm start`.
