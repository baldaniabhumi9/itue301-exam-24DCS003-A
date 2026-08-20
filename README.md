# ITUE301 Library Book Management System

Repository: `itue301-exam-24DCS003-A`

## 1. Project Name

Library Book Management System for managing books and borrowing records.

## 2. Frontend Setup

The frontend uses React and Vite.

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5174` if port `5173` is already in use.

## 3. Backend Setup

The backend uses Express.js, Mongoose, and Node.js.

```bash
cd backend
npm install
npm start
```

The API runs at `http://localhost:5050`.

## 4. MongoDB Setup

1. Open MongoDB Compass.
2. Connect to `mongodb://127.0.0.1:27017`.
3. Use the database name `library_management`.
4. Copy the environment template and start the backend:

```bash
cd backend
cp ../.env.example .env
npm start
```

The MongoDB connection can be checked at `GET http://localhost:5050/api/health`. A successful response includes `"database": true`.

## 5. Environment Variables

Create `backend/.env` from `.env.example`:

```env
MONGO_URI=mongodb://127.0.0.1:27017/library_management
PORT=5050
```

Do not commit `.env`. The committed `.env.example` file contains only safe placeholder configuration.
