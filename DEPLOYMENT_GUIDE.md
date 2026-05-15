# Full Stack Deployment Guide for IntraDesk

Based on your project files, you have a **React** frontend (using `create-react-app`) and a **Node.js/Express** backend using **Prisma** as your ORM to connect to **PostgreSQL**. 

You also have both `frontend` and `backend` in the same main folder (a "monorepo" style).

Here is the exact step-by-step guide to deploying this specific setup for free.

---

## Phase 1: Prepare Your Code for Production

Before uploading anything, we need to make a few tweaks to ensure your code works in a live environment.

### 1. Update Frontend API Calls
Right now, your `frontend/package.json` has `"proxy": "http://localhost:3001"`. This only works locally. For production, you must use Environment Variables.
1. In your `frontend` folder, create a file named `.env.production` (if you don't have one).
2. Add this line to it:
   ```env
   REACT_APP_API_URL=https://your-backend-url.onrender.com
   ```
   *(We will get this actual URL in Phase 3. For now, just know you need to update your Axios/fetch calls to use `process.env.REACT_APP_API_URL` instead of relying on the proxy).*

### 2. Push Code to GitHub
Both Render (Backend) and Vercel (Frontend) will pull your code directly from GitHub.
1. Go to [GitHub](https://github.com/) and create a new private or public repository.
2. Open a terminal in your main `d:\Portal` folder and run:
   ```bash
   git init
   git add .
   git commit -m "Initial commit for deployment"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git push -u origin main
   ```

---

## Phase 2: Host the Database (Neon.tech)

We will use **Neon** because it provides an excellent, free serverless PostgreSQL database that works perfectly with Prisma.

1. Go to [Neon.tech](https://neon.tech/) and sign up for a free account.
2. Click **New Project**.
3. Name it `intradesk-db` and select the region closest to you.
4. Once created, you will see a **Connection String** that looks like this:
   `postgresql://neondb_owner:password123@ep-cool-snowflake-123.region.aws.neon.tech/neondb?sslmode=require`
5. **Copy this Connection String**. You will need it for the backend.

---

## Phase 3: Host the Backend (Render.com)

Your backend uses Prisma, so we have to tell Render to generate the Prisma client and apply your database migrations when it builds.

1. Go to [Render.com](https://render.com/) and sign up with your GitHub account.
2. Click **New** -> **Web Service**.
3. Select **Build and deploy from a Git repository**.
4. Connect your GitHub account and select your `Portal` repository.
5. **Configuration Settings:**
   * **Name:** `intradesk-api`
   * **Root Directory:** `backend` *(Crucial: This tells Render your backend is inside the backend folder)*
   * **Environment:** `Node`
   * **Build Command:** `npm install && npx prisma generate && npx prisma migrate deploy && npm run build`
   * **Start Command:** `npm start`
6. **Environment Variables** (Scroll down to find this section). Add:
   * Key: `DATABASE_URL` | Value: *(Paste your Neon Connection String here)*
   * Key: `PORT` | Value: `3001`
   * *(Add any other environment variables your backend `.env` uses, like JWT secrets or Azure AD credentials).*
7. Click **Create Web Service**.
8. Wait a few minutes. Once it says "Live", copy the Render URL (e.g., `https://intradesk-api.onrender.com`).

---

## Phase 4: Host the Frontend (Vercel.com)

Now that the backend is live, we need to deploy the frontend and connect it to the live backend URL.

1. Go to [Vercel.com](https://vercel.com/) and sign up with GitHub.
2. Click **Add New** -> **Project**.
3. Import your `Portal` repository from GitHub.
4. **Configuration Settings:**
   * **Project Name:** `intradesk`
   * **Framework Preset:** `Create React App`
   * **Root Directory:** Click "Edit" and select `frontend`.
5. **Environment Variables:**
   * Key: `REACT_APP_API_URL`
   * Value: *(Paste the Render URL you copied in Phase 3, e.g., `https://intradesk-api.onrender.com`)*
6. Click **Deploy**.
7. Vercel will now build your React app. Since you are using `react-scripts build`, Vercel knows exactly how to handle it.
8. Once finished, Vercel will give you a live URL for your frontend!

---

## Final Checklist
✅ **Database:** Running on Neon.tech
✅ **Backend:** Running on Render, connected to Neon via `DATABASE_URL`.
✅ **Frontend:** Running on Vercel, talking to the Backend via `REACT_APP_API_URL`.

Your entire stack is now live on the internet, completely for free!
