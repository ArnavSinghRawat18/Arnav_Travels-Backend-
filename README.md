# Arnav Travels — Backend
This is the backend API for the Arnav Travels project (Express + Node + MongoDB). It provides endpoints for hotel data, categories, authentication (register/login), and wishlist functionality.

## Current status (summary of recent work)
- The server boots with `nodemon` and connects to MongoDB.
- Authentication endpoints (`POST /api/auth/register` and `POST /api/auth/login`) return a flattened user object with a top-level `accessToken`.
- Passwords are stored AES-encrypted using `CryptoJS` (new registrations). Helper scripts to migrate existing plaintext passwords were added in `scripts/`.
- Wishlist endpoints (`POST /api/wishlist`, `GET /api/wishlist`, `DELETE /api/wishlist/:id`) return the saved documents and were fixed after earlier syntax issues.
- Numerous stray Markdown/JSON artifacts embedded in JS files were removed (this resolves many syntax crashes). Models and routers were corrected to export the expected values.

## Local setup
1. Copy `.env.example` to `.env` and fill the values (do not commit `.env`).
2. Install dependencies:

	npm install

3. Start the dev server:

	npm run dev

The server listens on the port configured in `.env` or defaults to 3500.

## Required environment variables
- DATABASE_URL (or MONGODB_URI) — MongoDB connection string
- PASSWORD_SECRET_KEY — AES secret used to encrypt user passwords
- ACCESS_TOKEN — JWT secret used to sign access tokens

## Important routes
- POST /api/auth/register — register a new user. Returns the user object (no password) and `accessToken` at top level.
- POST /api/auth/login — login by `username` or `number` + `password`. Returns user + `accessToken` at top level.
- POST /api/wishlist — add a wishlist item (returns saved doc)
- GET /api/wishlist — get all wishlist items
- DELETE /api/wishlist/:id — remove a wishlist item
- GET /api/hotels — hotels endpoints (see `routes/` for complete list)

Example successful auth response (register/login):

{
	"_id": "...",
	"username": "...",
	"number": "...",
	"email": "...",
	"__v": 0,
	"accessToken": "eyJ..."
}

## One-time migration utilities
- `scripts/encrypt-users.js` — encrypt plain-text user passwords in DB and save them as AES ciphertexts using `PASSWORD_SECRET_KEY`.
- `scripts/decrypt-user.js` — helper to debug/decrypt a given cipher text locally.

Run them only locally and after taking a DB backup.

## Troubleshooting notes (what was fixed)
- Removed accidental Markdown/JSON blocks embedded in JS files that caused repeated SyntaxError crashes.
- Fixed model exports (some models exported schema instead of model) which produced runtime TypeErrors.
- Added JSON-parse error middleware in `server.js` to return a clean 400 for invalid JSON bodies.
- Rewrote auth handlers to always return a flattened object and the token at the top level.

## Next steps (recommended)
- Add JWT-protected routes for wishlist and attach user id when saving.
- Add schema validation (Joi / express-validator) for request bodies.
- Add unit tests for auth and wishlist handlers.

---

If you want, I can: add the JWT middleware, wire it into wishlist routes, and create a short test script to exercise register/login and wishlist flows.
# Arnav_Travels-Backend-

# MongoDB connection (Atlas example) — replace the placeholders
DATABASE_URL=mongodb+srv://<DB_USER>:<DB_PASS>@cluster0.mongodb.net/<DB_NAME>?retryWrites=true&w=majority

# JWT secret used by jsonwebtoken
ACCESS_TOKEN=replace_with_a_long_random_string_for_jwt_signing

# AES key used by CryptoJS.AES
PASSWORD_SECRET_KEY=replace_with_a_long_random_string_for_aes

# Node environment
NODE_ENV=production

service:
  name: arnav-travels-backend
  env: node
  branch: development
  plan: free
  buildCommand: npm install
  startCommand: npm start

# Note: set real secrets in Render dashboard, not here.

// config check — require JWT secret in production
if (process.env.NODE_ENV === 'production' && !process.env.ACCESS_TOKEN) {
  console.error('ERROR: ACCESS_TOKEN environment variable is required in production.');
  process.exit(1);
}
