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
This repository currently contains the Angular frontend only.

The frontend is configured to call a backend API at:
- `http://localhost:5000/api`

Folders such as `api/` and `server/` are present but currently empty in this repository snapshot, so you must run a separate backend service (or add one) for todo operations to work.

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
3. Open:
   - `http://localhost:4200`

## Available Scripts
- `npm start` -> `ng serve`
- `npm run build` -> production build to `dist/`
- `npm run watch` -> development watch build
- `npm test` -> unit tests via Karma

## Environment Configuration
Both environment files currently point to:
- `apiBaseUrl: 'http://localhost:5000/api'`

Files:
- `src/environments/environment.ts`
- `src/environments/environment.production.ts`

If your backend runs elsewhere, update `apiBaseUrl` accordingly.

## API Contract Expected by Frontend
Base path:
- `/api/todos`

Requests used:
- `GET /api/todos` -> list todos
- `POST /api/todos` -> create todo
- `PUT /api/todos/:id` -> update todo
- `DELETE /api/todos/:id` -> delete todo
- `POST /api/todos/sync` -> manual sync payload

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
- If backend is unavailable, create/update/delete/sync actions show error states.
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
