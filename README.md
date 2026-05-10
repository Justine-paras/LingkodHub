# react-example

Local services marketplace app built with React, Express, and SQLite.

## Requirements

- Node.js 20+
- npm

## Environment

Create a `.env` file in the project root:

```env
JWT_SECRET=replace_with_a_strong_secret
PORT=3000
APP_URL=http://localhost:3000
```

## Scripts

- `npm run dev`: start API + Vite in development mode
- `npm run start`: start server with `tsx`
- `npm run build`: build frontend bundle
- `npm run preview`: preview built frontend
- `npm run clean`: remove `dist` (cross-platform)
- `npm run lint`: TypeScript typecheck
- `npm run test`: run automated tests

## Notes

- Messaging conversations endpoint is available at `GET /api/messages/conversations`.
- Auth uses HttpOnly cookies (`access_token`, `refresh_token`) and credentialed requests (`credentials: 'include'`).
<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/501447ca-f7fc-4ee2-a094-2a88b690a67d

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
