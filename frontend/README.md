# LLM Testbench Frontend

React + TypeScript + Vite dashboard for the existing Express backend.

## Run
1. Extract this folder next to your `backend` folder (or keep it elsewhere).
2. Open a terminal in this folder and run `npm install`.
3. In another terminal, start your backend: `cd ..\backend` then `npm run dev`.
4. In the frontend folder, run `npm run dev`.
5. Open the local URL Vite prints, usually http://localhost:5173.

Vite proxies `/api` and `/health` to `http://localhost:3000`. Keep `GEMINI_API_KEY` only in `backend/.env`, never in frontend code.

Model IDs shown in the dashboard are editable examples. If Google returns 404, replace them with model IDs available to your Gemini API key. The dashboard expects the existing API response fields (`ok`, `model`, `output`, `latencyMs`, token counts, and `error`) and comparison payload `{ prompt, results, completed, failed }`.
