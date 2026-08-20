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

Set `MONGODB_URI` in `backend/.env`, then start the API:

```bash
npm start
```

In another terminal, start the React client:

```bash
cd frontend
npm install
npm run dev
```

The frontend proxies `/api` requests to `http://localhost:5000`. For a production client build, run `npm run build` in `frontend/` and start the backend with `NODE_ENV=production npm start`.
