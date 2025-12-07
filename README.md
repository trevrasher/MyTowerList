# MyTowerList

A web application for tracking, filtering, and exploring JToH towers, with user authentication and completion syncing.

**Live Site:** [https://my-tower-list.vercel.app/](https://my-tower-list.vercel.app/)

## Features

- Browse and filter towers by area, difficulty, and completion status
- Infinite scroll for tower list
- Area and tower images with overlays and acronyms
- User authentication (login/logout)
- Sync completed towers from your profile
- Responsive, modern UI with Tailwind CSS

## Tech Stack

- **Frontend:** Next.js (React), TypeScript, Tailwind CSS
- **Backend:** Django
- **Hosting:** Neon, Render, Vercel, Github for images

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- Python 3.10+
- PostgreSQL (for backend)
- Yarn or npm

### Frontend Setup

1. Install dependencies:
   ```bash
   yarn install
   # or
   npm install
   ```

2. Create a `.env.local` file and set:
   ```
   NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
   ```

3. Run the development server:
   ```bash
   yarn dev
   # or
   npm run dev
   ```

### Backend Setup

1. Create a virtual environment and activate it:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install dependencies:
   ```bash
   pip install -r backend/requirements.txt
   ```

3. Set up your database and environment variables as needed.

4. Run migrations:
   ```bash
   python backend/manage.py migrate
   ```

5. Start the backend server:
   ```bash
   python backend/manage.py runserver
   ```

### Assets

- Place tower and area images in `assets/tower_thumbnails/` and `assets/area_thumbnails/` respectively.
- Image filenames must match the naming conventions used in the code.

## Project Structure

```
app/                # Next.js frontend
  components/       # React components
  towers/           # Tower detail pages
assets/
  area_thumbnails/  # Area images
  tower_thumbnails/ # Tower images
backend/            # Django backend
  api/              # API endpoints
  config/           # Django config
db_backups/         # Database backups
scripts/            # Data import and utility scripts
```