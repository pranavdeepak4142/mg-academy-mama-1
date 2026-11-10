# MG ACADEMY

**Tagline:** *EVERY CHILD IS AN ARTIST*

A premium children's creative learning academy website with integrated frontend and backend structure.

## Project Structure

- `frontend/` – static landing page, admin dashboard and styling
- `backend/` – Express API, validation, authentication and MongoDB-ready models

## Features

- kid-friendly premium landing page
- responsive navigation and mobile menu
- creative programs cards and gallery
- parent testimonials
- enrollment form with validation
- contact form and map section
- admin login and dashboard for enrollments and contact messages
- Node.js + Express + MongoDB integration ready

## Local Setup

1. Navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Copy the environment template:
   ```bash
   copy .env.example .env
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the server:
   ```bash
   npm start
   ```

The app will run at:

- Frontend: http://localhost:5000/
- Admin dashboard: http://localhost:5000/admin

## Default Admin Credentials

- Username: `admin`
- Password: `admin123`

## MongoDB Setup

For a local MongoDB development setup, install MongoDB Community Edition and start it with the default port:

```bash
mongod
```

The app uses:

```text
mongodb://127.0.0.1:27017/little-creators-academy
```

If MongoDB is unavailable, the app automatically runs in demo mode so forms still work locally.

## Deployment

### Option 1: Render / Railway / Heroku

- Set environment variables in the deployment dashboard:
  - `PORT`
  - `MONGO_URI`
  - `ADMIN_USERNAME`
  - `ADMIN_PASSWORD`
  - `JWT_SECRET`
- Run `npm install` and `npm start` in the backend service.
- Serve the frontend assets from the same server by keeping the `frontend/` directory in the project root.

### Option 2: Traditional VPS / Node hosting

- Upload the project folder.
- Install dependencies with `npm install`.
- Set environment variables.
- Start with a process manager like `pm2`.

## Notes

This project is intentionally built as a clean starter for a creative academy brand, with a premium pastel aesthetic and a working admin view.
