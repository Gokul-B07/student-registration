# Pathway campus placement portal

## Run locally

1. Ensure `server/.env` contains the MongoDB connection string as `MONGO_URI=...`.
2. In `server`, run `npm run dev` to start the API on port 5000.
3. In `client`, run `npm run dev` to start the Vite app. Its `/api` requests are proxied to the API.

The registration API validates student and company preference fields before saving them to MongoDB. The admin dashboard reads its registration list from the same API.
