# Lumière Studio — Salon Booking App

A full-stack appointment scheduling application for salons and service-based businesses.

**Stack:** Vite + React · Tailwind CSS v4 · Supabase · Zustand · react-hook-form + Zod · date-fns

---

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Create a Supabase project

Go to [supabase.com](https://supabase.com), create a new project, then copy your **Project URL** and **anon public key** from *Settings → API*.

### 3. Configure environment

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

```
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_SALON_ID=00000000-0000-0000-0000-000000000001
```

> `VITE_SALON_ID` matches the fixed UUID in the seed data. Keep it as-is during development.

### 4. Run database migrations

In the Supabase dashboard → **SQL Editor**, run both files in order:

1. `supabase/migrations/001_initial_schema.sql`
2. `supabase/migrations/002_seed_data.sql`

### 5. Start the dev server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page with hero, featured services, team, and testimonials |
| `/book` | 5-step booking flow |
| `/confirmation` | Post-booking success screen with reference number |
| `/admin` | Dashboard to view, confirm, cancel, and complete appointments |

## Booking Flow

```
Step 1 → Choose Services   (multi-select with category filter)
Step 2 → Choose Stylist    (filtered by selected services, or "No Preference")
Step 3 → Date & Time       (calendar + live availability check)
Step 4 → Your Details      (validated form: name, email, phone, notes)
Step 5 → Review & Confirm  (summary + submit to Supabase)
```

## Project Structure

```
src/
├── components/
│   ├── booking/          # ServiceSelection, StaffSelection, DateTimeSelection,
│   │                     # ClientDetails, ConfirmationSummary
│   ├── layout/           # Navbar, Footer
│   └── ui/               # LoadingSpinner, ProgressBar
├── lib/
│   └── supabase.js       # All Supabase queries
├── pages/
│   ├── Home.jsx
│   ├── Booking.jsx
│   ├── Confirmation.jsx
│   └── Admin.jsx
├── store/
│   └── bookingStore.js   # Zustand store for multi-step state
└── index.css             # Global styles, animations, Tailwind v4 theme
supabase/
├── migrations/
│   ├── 001_initial_schema.sql
│   └── 002_seed_data.sql
```

## Customising

- **Business hours / slot interval:** `src/components/booking/DateTimeSelection.jsx` — `BUSINESS_START`, `BUSINESS_END`, `SLOT_INTERVAL`
- **Salon branding:** Update "Lumière" in `Navbar.jsx`, `Footer.jsx`, `Home.jsx`
- **Staff avatars / service images:** Set `avatar_url` / `image_url` columns in Supabase with any public image URL; falls back to initials/emoji if null
# salon-appointment
