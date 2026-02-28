# YanguShop

YanguShop is a full-stack demo marketplace for managing shops, products, agents, and payments. It includes a Node/Express backend and a React frontend with a local sample data setup for development.

## Project structure
- `backend/` — Express server, routes, controllers, models and scripts for seeding and admin creation.
- `frontend/` — React single-page application (CRA-like) with componentized UI, pages, and styles.
- `docs/` — Design and implementation notes.

Key frontend folders:
- `frontend/src/components/` — UI components and layout.
- `frontend/src/pages/` — Page-level styles and screens.
- `frontend/src/data/sampleProducts.js` — Local sample products used in development.

Key backend folders:
- `backend/src/controllers/` — Request handlers.
- `backend/src/models/` — Mongoose models.
- `backend/server.js` — App entrypoint.

## Local development

Prerequisites: Node.js (>=16 recommended) and npm.

1. Install dependencies

```bash
cd backend
npm install
cd ../frontend
npm install
```

2. Start the backend

```bash
cd backend
npm start
# or `npm run dev` if available
```

3. Start the frontend

```bash
cd frontend
npm start
```

The frontend runs on `http://localhost:3000` by default. The backend runs on `http://localhost:5000` (or as configured in `backend/src/config/env.js`).

## Notes on recent work
- Product images: `resolveImageUrl()` was updated to avoid proxying `data:`/`blob:` URIs; `ProductCard` includes an image fallback.
- Theme: pink accents have been migrated toward a blue+orange theme using CSS variables (`--blue`, `--orange`), with an ongoing repo-wide sweep.
- Header/footer: header promo emoji removed and footer styles were corrected after a CSS syntax issue caused PostCSS build failures.

## Scripts
- `backend`: run inside `backend` folder — `npm start`, `npm run seed` (see `backend/package.json`).
- `frontend`: run inside `frontend` folder — `npm start`, `npm run build`.

## Testing and QA
- Start both servers and visit the frontend to verify UI, categories (including the `Phones` category), images, and colors.

## Contributing
- Make feature branches and open PRs with focused changes. Run the frontend dev server to verify CSS changes (PostCSS/webpack will fail on syntax errors).

If you want, I can finish the remaining color-swap across the repo and polish the header layout; reply here and I'll continue.
