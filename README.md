# 🎓 NITK Student Information Portal

A full-stack web application for NIT Kurukshetra students and teachers to manage academic information — including courses, attendance, marks, and enrollments.

**Live Demo:** https://nitk-student-portal-5dze.vercel.app

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite) |
| Backend | Node.js + Express |
| Database | Supabase (PostgreSQL) |
| Deployment | Vercel (frontend) |

---

## Features

- **Student Dashboard** — View enrolled courses, attendance records, and marks
- **Teacher Panel** — Manage courses, mark attendance, and enter grades
- **Role-based Access** — Separate flows for students and teachers
- **Enrollment Management** — Track course enrollments with real-time data via Supabase
- **Grade Evaluation** — Compute and display student results
- **Authentication** — Secure login with password management utilities

---

## Project Structure

```
nitk-student-portal/
├── nitk-react/          # React frontend
├── backend/             # Node.js + Express API server
├── evaluate.js          # Grade evaluation script
├── dump_results.js      # Utility to export results
├── check_teacher.js     # Teacher verification utility
├── restore_passwords.js # Password restore utilities
├── test_*.js            # Integration & end-to-end test scripts
└── package.json         # Root-level dependencies
```

---

## Getting Started

### Prerequisites

- Node.js v18+
- A [Supabase](https://supabase.com) project with the required schema

### 1. Clone the repository

```bash
git clone https://github.com/AMX-99/nitk-student-portal.git
cd nitk-student-portal
```

### 2. Set up the Backend

```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_service_role_key
PORT=5000
```

Start the server:

```bash
node index.js
```

### 3. Set up the Frontend

```bash
cd nitk-react
npm install
```

Create a `.env` file in `nitk-react/`:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_KEY=your_supabase_anon_key
VITE_API_URL=http://localhost:5000
```

Start the dev server:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## Database (Supabase)

The project uses Supabase as its backend-as-a-service database. Key tables include:

- `students` — Student profiles and credentials
- `teachers` — Teacher profiles
- `courses` — Course catalog
- `enrollments` — Student–course relationships
- `attendance` — Per-student attendance records
- `marks` / `results` — Grade and result data

---

## Utility Scripts

These root-level scripts are used for maintenance and testing:

| Script | Purpose |
|---|---|
| `evaluate.js` | Compute and update student grades |
| `dump_results.js` | Export result data from Supabase |
| `check_teacher.js` | Verify teacher account existence |
| `restore_passwords.js` | Reset/restore user passwords in bulk |

---

## Testing

A comprehensive suite of integration tests is included at the root level:

```bash
# Example: run end-to-end test
node test_e2e.js

# Example: test attendance logic
node test_attendance.js

# Example: test enrollment counts
node test_enrollments_count.js
```

Test files cover: attendance, enrollments, courses schema, marks, student/teacher lookups, foreign key validation, and API routes.

---

## Deployment

- **Frontend** is deployed on [Vercel](https://vercel.com). Push to `main` to trigger a redeploy.
- **Backend** can be deployed on any Node.js host (Railway, Render, Heroku, etc.).
- Set all environment variables in your hosting platform's dashboard.

---

## Dependencies

### Root

```json
{
  "@supabase/supabase-js": "^2.99.0",
  "axios": "^1.13.6",
  "puppeteer-core": "^24.38.0"
}
```

### Backend
Node.js + Express + Supabase JS client

### Frontend
React + Vite + Supabase JS client

---

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you'd like to change.

---

## License

This project is not currently under an open-source license. All rights reserved by the author.
