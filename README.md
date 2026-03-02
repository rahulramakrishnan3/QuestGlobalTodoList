# Quest Global Todo List

Angular 20 single-page todo application with:
- Login gate (localStorage-based demo auth)
- Protected home page
- Todo CRUD from a REST API
- Manual sync action
- PWA service worker in production builds

## Tech Stack
- Angular `20.3.x`
- TypeScript `5.9.x`
- RxJS `7.8.x`
- Angular Service Worker
- Karma + Jasmine (default Angular test setup)

## Current Repository Scope
This repository now contains both:
- Angular frontend
- Node.js/Express backend (`server/index.js`)

The frontend is configured to call:
- `http://localhost:5000/api`

## Features
- Login page with route guard
- Home page with route guard
- Add, edit, and delete todos
- Optional ETA (`datetime-local`) per todo
- Manual "Sync to Server" action
- Local persistence of todos in browser `localStorage`

## Demo Credentials
Authentication is hardcoded in the frontend auth service:
- Username: `admin`
- Password: `admin123`

## Project Structure
```text
src/
  app/
    guards/            # auth and guest route guards
    pages/
      login-page/      # login UI + form
      home-page/       # todo dashboard UI + actions
    services/
      auth.service.ts  # localStorage auth/session logic
      todo-api.service.ts # HTTP calls to /api/todos
  environments/        # API base URL config
public/
  manifest.webmanifest # PWA manifest
server/
  index.js             # Express API server + MongoDB integration
  .env.example         # required backend env vars
```

## Prerequisites
- Node.js `18+` (Node `20 LTS` recommended)
- npm `9+`
- A running backend exposing endpoints under `http://localhost:5000/api`

## Setup and Run
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start Angular dev server:
   ```bash
   npm start
   ```
3. Start backend API (new terminal):
   ```bash
   npm run start:backend
   ```
4. Open:
   - `http://localhost:4200`

## Available Scripts
- `npm start` -> `ng serve`
- `npm run start:backend` -> starts Express API on `:5000`
- `npm run build` -> production build to `dist/`
- `npm run watch` -> development watch build
- `npm test` -> unit tests via Karma

## Environment Configuration
Development frontend points to:
- `apiBaseUrl: 'http://localhost:5000/api'`

Files:
- `src/environments/environment.ts`
- `src/environments/environment.production.ts`

Before production build, set `src/environments/environment.production.ts` with your hosted backend URL:
- `apiBaseUrl: 'https://your-backend-domain.com/api'`

## Backend Environment Variables
Create `server/.env` (copy from `server/.env.example`) and set:
- `PORT=5000`
- `MONGODB_URI=<your mongodb connection string>`
- `DB_NAME=quest_global_todos`
- `FRONTEND_ORIGIN=<your hosted frontend URL>`

The backend reads these via host platform environment variables (recommended for production).

## API Contract Expected by Frontend
Base path:
- `/api/todos`

Requests used:
- `GET /api/todos` -> list todos
- `POST /api/todos` -> create todo
- `PUT /api/todos/:id` -> update todo
- `DELETE /api/todos/:id` -> delete todo
- `POST /api/todos/sync` -> manual sync payload
- `GET /api/health` -> backend health check

### Expected Todo shape from API
`todo-api.service.ts` maps API objects in this form:
```json
{
  "_id": "string",
  "title": "string",
  "completed": false,
  "clientId": "string|null",
  "createdAt": "ISO string",
  "updatedAt": "ISO string",
  "__v": 0
}
```

Notes:
- Frontend `eta` is UI/local payload data and is not sent in create/update API calls.
- UI todo ids are derived from API `_id`.

## Auth and Routing Behavior
- `/login` is available only for unauthenticated users (`guestGuard`)
- `/home` is protected (`authGuard`)
- Default route redirects to `/home`
- Session flags are stored in `localStorage`:
  - `isLoggedIn`
  - `username`

## PWA Behavior
- Service worker is enabled for production builds only.
- Config file: `ngsw-config.json`

## Known Limitations
- Demo authentication is hardcoded and not secure for production.
- Backend sync endpoint currently replaces the full todo collection.
- `eta` is not persisted through backend CRUD unless backend is extended to store it.

## Troubleshooting
- Login fails:
  - Use `admin` / `admin123`.
- Todos fail to load or save:
  - Verify backend is running on `http://localhost:5000`.
  - Check CORS configuration on backend.
  - Confirm backend routes match the API contract above.
- Port conflict:
  - Run `ng serve --port <your-port>`.

## Future Improvements
- Replace hardcoded auth with real auth API + JWT/session.
- Persist ETA in backend schema.
- Add integration/e2e tests.
- Add Docker setup for frontend + backend.

## Deploy Backend (MongoDB + Hosting)
1. Create MongoDB database (MongoDB Atlas recommended) and get `MONGODB_URI`.
2. Deploy backend folder to a Node host (Render/Railway/Fly.io/EC2).
3. Set environment variables on the host:
   - `MONGODB_URI`
   - `DB_NAME`
   - `PORT` (optional; many hosts set this automatically)
   - `FRONTEND_ORIGIN` (your frontend domain)
4. Start command:
   - `npm run start:backend`
5. Verify backend:
   - `GET https://<your-backend-domain>/api/health`
6. Update frontend production API base URL in `src/environments/environment.production.ts`.
7. Rebuild and redeploy frontend:
   - `npm run build`
