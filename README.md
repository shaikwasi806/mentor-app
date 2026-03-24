# OnyxLearn - Premium Modern LMS Platform

A full-stack, state-of-the-art Learning Management System built for modern creators and students. Packed with progress tracking, video resumes, strict sequential unlocking, and a gorgeous glassmorphic aesthetic.

## Tech Stack
- **Frontend**: Next.js (App Router), React, Tailwind CSS, TypeScript, Zustand, Axios
- **Backend**: Node.js, Express, TypeScript, MySQL, JWT Authentication

## Project Setup Instructions

Follow these exact steps to run the platform locally on your machine.

### 1. Database Setup
1. Ensure you have **MySQL** running locally (e.g., via XAMPP, Homebrew, or Docker).
2. Open your preferred SQL client (MySQL Workbench, TablePlus, or command line).
3. Open the `database/schema.sql` file and execute all scripts to create the `lms_db` and tables.
4. (Optional but recommended) Run `database/seed.sql` to populate initial users, subjects, and video courses.

### 2. Backend Setup
1. Open a new terminal and navigate to the `backend/` directory.
2. If dependencies are not already installed, run:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend/` directory (or use `.env.example`) and map your MySQL credentials:
   ```env
   PORT=5000
   DB_HOST=localhost
   DB_USER=root      # (Change this to your MySQL username if different)
   DB_PASSWORD=      # (Add your MySQL password if you have one)
   DB_NAME=lms_db
   JWT_SECRET=your_super_secret_jwt_key
   JWT_REFRESH_SECRET=your_super_secret_refresh_key
   ```
4. Start the development server (Hot Reloading via `ts-node-dev`):
   ```bash
   npm run dev
   ```
   > The backend API should now be running on `http://localhost:5000`.

### 3. Frontend Setup
1. Open a new terminal and navigate to the `frontend/` directory.
2. If dependencies are not already installed, run:
   ```bash
   npm install
   ```
3. Start the Next.js development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your web browser.

### Authentication Details
If you ran the `seed.sql` script, you can log in with:
- **Admin**: `admin@example.com` / `password123`
- **Student**: `student@example.com` / `password123`

## Features

- **Strict Sequential Unlocking**: Users must complete anterior lessons to progress.
- **Auto-Sync Video Tracking**: ReactPlayer seamlessly tracks `playedSeconds`, saving states automatically every 10 seconds.
- **Smart Completion**: Reaching 90% of a video natively checks and marks a lesson as completed.
- **Resume Capability**: Next time a user visits a lesson, it effortlessly seeks to the exact saved timestamp.
- **Role Guards**: Admin panel explicitly protected via middlewares and Next.js wrappers. 

Enjoy your next-level learning environment!
