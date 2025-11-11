# Hotel Website — Flask + SQLite Booking Platform

![Hotel Website Banner](static/images/home.png)

<div align="center">
  
[![Python](https://img.shields.io/badge/Python-3.8%2B-blue.svg)](https://www.python.org/)
[![Flask](https://img.shields.io/badge/Flask-2.3.3-green.svg)](https://flask.palletsprojects.com/)
[![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-3.0.5-red.svg)](https://www.sqlalchemy.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

</div>

A full‑stack hotel booking web application built with Flask and SQLAlchemy. It supports:
- A modern, responsive public website for listing rooms and their details
- Real, multi‑room bookings with date‑range availability checks
- An Admin Panel for managing rooms, bookings, and inventory
- Simple REST endpoints for room data and availability checks

---

## Table of Contents
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Screenshots](#screenshots)
- [Screens and URLs](#screens-and-urls)
- [Project Structure](#project-structure)
- [Data Model](#data-model)
- [Installation and Setup](#installation-and-setup)
  - [Prerequisites](#prerequisites)
  - [Clone and Environment Setup](#clone-and-environment-setup)
  - [Install Dependencies](#install-dependencies)
  - [Environment Configuration](#environment-configuration)
  - [Initialize the Database](#initialize-the-database)
  - [Run the Application (Development)](#run-the-application-development)
- [Seeding and Admin Account](#seeding-and-admin-account)
- [Admin Panel Guide](#admin-panel-guide)
- [Booking Flow](#booking-flow)
- [API Reference](#api-reference)
- [Templates & Static Assets](#templates--static-assets)
- [Troubleshooting](#troubleshooting)
- [Security & Production Hardening](#security--production-hardening)
- [Deployment (Production)](#deployment-production)
- [Common Tasks & Tips](#common-tasks--tips)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgements](#acknowledgements)

---

## Key Features
- Public site for browsing available rooms with images, amenities, and descriptions
- Room detail pages with gallery and media
- Multi‑room selection and booking in a single order
- Date‑range availability validation based on existing bookings and inventory
- Inventory tracking per room type via `total_rooms`
- Admin authentication and panel to:
  - Add / Edit / Delete rooms
  - Set availability, price, capacity, and inventory per type
  - Review bookings, update statuses, and delete as needed
  - Dashboard stats and quick insights
- JSON‑based media/amenities fields stored in the DB (simple and flexible)
- Lightweight REST endpoints to power async UI interactions

---

## Tech Stack
- Backend: Flask, Flask‑SQLAlchemy
- Database: SQLite (default), configurable via DATABASE_URL
- Auth/Hashing: Werkzeug
- Templates: Jinja2
- Frontend: HTML, CSS, JavaScript (vanilla)
- Runtime: Python 3.9+ (recommended 3.10+)

See requirements in [requirements.txt](requirements.txt).

---

## Screenshots

Note:
- The following image paths assume screenshots are saved under static/images/.
- If your paths differ, update the links below accordingly.

### Overview
| Home Page | Rooms Listing | Room Detail |
|---|---|---|
| ![Home Page](static/images/home.png) | ![Rooms Listing](static/images/rooms.png) | ![Room Detail](static/images/room-detail.png) |

### Booking Flow
| Select Rooms | Booking Form | Booking Success |
|---|---|---|
| ![Select Rooms](static/images/room-select.png) | ![Booking Form](static/images/room-book.png) | ![Booking Success](static/images/confirm.png) |

### Admin Panel
| Admin Login | Dashboard | Manage Rooms | Manage Bookings |
|---|---|---|---|
| ![Admin Login](static/images/admin-login.png) | ![Admin Dashboard](static/images/dashboard.png) | ![Manage Rooms](static/images/manage-room.png) | ![Manage Bookings](static/images/manage-booking.png) |


---

## Screens and URLs
Public:
- Home: `/`
- Room listing with filter: `/rooms?type=all|Suite|Business|Family|Standard`
- Room detail: `/room/<room_id>`
- Multi‑room selection (start a booking): `/booking-select`
- Booking form (multi): `/booking-multi?rooms=<id:qty,id:qty,...>`
- Booking success: `/booking-success/<booking_id>`

Admin:
- Login: `/admin/login`
- Logout: `/admin/logout`
- Dashboard: `/admin/dashboard`
- Manage Rooms: `/admin/rooms`
- Manage Bookings: `/admin/bookings`

API:
- GET `/api/rooms` — list available rooms
- POST `/api/check-availability` — validate availability for given dates and quantity

---

## Project Structure
High‑level layout of important files and directories:

```
Hotel-Website/
├─ app.py                     # Main Flask app, models, routes, admin, APIs
├─ config.py                  # Optional config class (env‑driven defaults)
├─ init_db.py                 # Recreate DB (with optional sample data)
├─ update_db.py               # Lightweight migration / schema updater for SQLite
├─ models.py                  # (Not used at runtime; models live in app.py)
├─ requirements.txt           # Python package dependencies
├─ templates/
│  ├─ base.html               # Base layout template
│  ├─ index.html              # Home page
│  ├─ rooms.html              # Room list with filters
│  ├─ room-detail.html        # Room detail page
│  ├─ booking.html            # Legacy single-room flow (redirects to multi)
│  ├─ booking-select.html     # Multi-room selection UI
│  ├─ booking-multi.html      # Multi-room booking form
│  ├─ booking-success.html    # Legacy success page
│  ├─ booking-success-multi.html
│  └─ admin/
│     ├─ login.html
│     ├─ manage-rooms.html
│     └─ manage-bookings.html
├─ static/
│  ├─ css/                    # CSS assets
│  ├─ js/                     # JavaScript assets
│  └─ images/                 # Screenshot and UI image assets (add your PNG/JPGs here)
└─ instance/                  # Optional: SQLite runtime folder (see notes)
```

Notes:
- Models are defined in `app.py`.
- By default, the SQLite DB is `sqlite:///hotel.db` in the project root via `app.config`.
- `update_db.py` expects `instance/hotel.db` by default—see [Initialize the Database](#initialize-the-database) to align paths.

---

## Data Model

Defined in `app.py` using SQLAlchemy models:

Room:
- id: Integer (PK)
- name: String(100)
- type: String(50) — e.g., Suite, Business, Family, Standard
- price: Float — per night
- capacity: Integer — guests per room
- description: Text
- amenities: Text — JSON string (list of strings)
- images: Text — JSON string (list of URLs)
- videos: Text — JSON string (list of URLs)
- available: Boolean — whether bookable in general
- total_rooms: Integer — inventory units for this room type
- created_at: DateTime
- relationships:
  - bookings (legacy)
  - booking_items (modern multi‑room model)

Booking:
- id: Integer (PK)
- guest_name, guest_email, guest_phone
- check_in: Date
- check_out: Date
- special_requests: Text
- total_price: Float (computed)
- status: String — pending | confirmed | cancelled
- created_at: DateTime
- items: relationship to BookingItem (cascade delete)
- room_id, guests: legacy fields for compatibility

BookingItem:
- id: Integer (PK)
- booking_id: FK -> Booking.id
- room_id: FK -> Room.id
- quantity: Integer — units of the room type in this booking
- guests: Integer — per room type in this item
- price_per_night: Float
- subtotal: Float

Admin:
- id: Integer (PK)
- username: unique
- password_hash
- email: unique
- created_at

Availability Algorithm (high level):
- For each room type, subtract the count of units reserved across overlapping bookings in the target date range from `total_rooms`.
- Considers both modern `BookingItem` and legacy `Booking.room_id` to maintain compatibility.

---

## Installation and Setup

### Prerequisites
- Python 3.9+ (recommended 3.10+)
- pip
- A virtual environment tool (venv, pyenv, or conda)
- Git

### Clone and Environment Setup
```bash
git clone https://github.com/Atharva0177/Hotel-Website.git
cd Hotel-Website

# Create and activate a virtual environment (pick one)
python -m venv .venv
# Windows
. .venv\Scripts\activate
# macOS/Linux
source .venv/bin/activate
```

### Install Dependencies
```bash
pip install --upgrade pip
pip install -r requirements.txt
```

### Environment Configuration
The app supports basic environment variables (via `config.py` pattern and `app.py` defaults):

- SECRET_KEY: Flask secret key
- DATABASE_URL: SQLAlchemy DB URL (e.g., `sqlite:///hotel.db`, `postgresql://...`)

By default in `app.py`:
- `SECRET_KEY` defaults to `'your-secret-key-change-this-in-production'`
- `SQLALCHEMY_DATABASE_URI` defaults to `sqlite:///hotel.db` (project root)

Recommended for local development:
```bash
# Replace with your own secret
export SECRET_KEY="dev-secret-key"
# Use the default SQLite DB in project root (or set your own)
export DATABASE_URL="sqlite:///hotel.db"
```

Windows PowerShell:
```powershell
$env:SECRET_KEY = "dev-secret-key"
$env:DATABASE_URL = "sqlite:///hotel.db"
```

### Initialize the Database

You have three options—pick ONE:

1) Quick Start with Sample Data (recommended for first run)
- This will recreate the database and seed sample rooms and an admin user.
- WARNING: It deletes any existing `hotel.db`.

```bash
python init_db.py
# Confirm when prompted
```
What it does:
- Drops existing SQLite file if present
- Creates all tables (Room, Booking, BookingItem, Admin)
- Seeds several sample rooms and a default admin:
  - username: `admin`
  - password: `admin123`

2) Update Existing Database (light migration)
- If you already have an `instance/hotel.db` and want to add `total_rooms` and the `booking_item` table:

By default, `update_db.py` looks for `instance/hotel.db`. You can:
- Move or create your DB at `instance/hotel.db`, OR
- Edit `update_db.py` to point to your actual SQLite path (e.g., `hotel.db` in project root).

Then run:
```bash
python update_db.py
```

3) Create Empty Schema (no seeds)
- Let Flask create tables on first boot:
```bash
python -c "from app import app, db; 
from contextlib import contextmanager
from flask import Flask
print('Creating tables...'); 
import app as application; 
from app import app, db; 
app.app_context().push(); 
db.create_all(); 
print('Done.')"
```
Or simply run the app once (see next section) — `app.py` calls `db.create_all()` when executed directly.

Important Path Note:
- `app.py` uses `sqlite:///hotel.db` (project root) by default.
- `update_db.py` uses `instance/hotel.db` by default.
To avoid confusion, either:
- Use `init_db.py` (option 1), or
- Align both paths by editing `update_db.py` or `app.config['SQLALCHEMY_DATABASE_URI']`, or
- Set `DATABASE_URL` consistently via environment variable.

### Run the Application (Development)
```bash
python app.py
# Server starts on http://0.0.0.0:8000 with debug=True
```

Open:
- Public site: http://localhost:8000/
- Admin login: http://localhost:8000/admin/login

---

## Seeding and Admin Account
If you used `init_db.py`, a default admin is created:
- Username: `admin`
- Password: `admin123`

Change this immediately in production.

If you did not seed:
- Manually add an admin via the DB, or extend a small CLI snippet to create one using `werkzeug.security.generate_password_hash`.

---

## Admin Panel Guide

Login
- URL: `/admin/login`
- Enter admin credentials

Rooms Management `/admin/rooms`
- Add: name, type, price, capacity, description
- Amenities: JSON array string, e.g. `["WiFi", "Smart TV", "Mini Bar"]`
- Images: JSON array of URLs, e.g. `["https://.../img1.jpg", "https://.../img2.jpg"]`
- Videos: JSON array of URLs, e.g. `["https://player.vimeo.com/video/251650410"]`
- Availability: checkbox/flag
- Inventory: `total_rooms` — number of units for that room type

Bookings Management `/admin/bookings`
- Filter by status: all | pending | confirmed | cancelled
- Update booking status
- Delete bookings

Dashboard `/admin/dashboard`
- Overview stats: total rooms, available rooms, total bookings, pending bookings
- Recent bookings list
- Revenue sum (confirmed + pending)

Logout `/admin/logout`
- Ends session

---

## Booking Flow

1) Discover rooms
- Browse `/rooms` or the home page `/`
- View details at `/room/<id>`

2) Select rooms
- Go to `/booking-select`
- Choose multiple room types and quantities
- The UI can check availability using `/api/check-availability`

3) Fill booking form
- `/booking-multi` captures guest info and selected rooms payload (`rooms_data`)

4) Submit booking
- Backend verifies each requested room type has enough units over the date range
- Computes nights and total price
- Creates `Booking` + multiple `BookingItem` entries
- Redirects to `/booking-success/<booking_id>`

Availability Details
- `get_available_rooms(room_id, check_in, check_out)` subtracts overlapping existing bookings from `total_rooms`
- Considers both `BookingItem` and legacy `Booking.room_id` entries
- Returns non‑negative available count

---

## API Reference

Base URL: `http://localhost:8000`

1) List available rooms
- GET `/api/rooms`
- Response (200):
```json
[
  {
    "id": 1,
    "name": "Deluxe Ocean View Suite",
    "type": "Suite",
    "price": 299.99,
    "capacity": 2,
    "total_rooms": 5,
    "images": ["https://..."]
  }
]
```

2) Check availability for dates and quantity
- POST `/api/check-availability`
- Request JSON:
```json
{
  "room_id": 1,
  "check_in": "2025-12-01",
  "check_out": "2025-12-05",
  "quantity": 2
}
```
- Response (200):
```json
{
  "available": true,
  "available_count": 7,
  "requested": 2
}
```

3) Create booking (form POST)
- POST `/book`
- Form fields:
  - `guest_name`, `guest_email`, `guest_phone`, `check_in` (YYYY-MM-DD), `check_out` (YYYY-MM-DD), `special_requests` (optional)
  - `rooms_data`: JSON string array of items:
    - `[{ "room_id": 1, "quantity": 2, "guests": 3 }, ...]`
- On success: Redirect to `/booking-success/<booking_id>`
- On validation error: Flash message + redirect to `/booking-select`

---

## Templates & Static Assets

Key templates:
- `templates/base.html` — base layout and shared includes
- `templates/index.html`, `templates/rooms.html`, `templates/room-detail.html` — public pages
- `templates/booking-select.html`, `templates/booking-multi.html`, `templates/booking-success-multi.html` — multi‑room booking UX
- `templates/admin/*` — admin login, room management, and booking management

Jinja2 Helpers:
- Custom filter `from_json` is registered in `app.py` to safely parse JSON strings in templates.

Static:
- `static/css/` and `static/js/` hold assets for styling and behavior.
- `static/images/` is the suggested location for screenshots and UI images referenced in [Screenshots](#screenshots).

---

## Troubleshooting

- Database not found / inconsistent paths:
  - Default runtime DB path: `sqlite:///hotel.db` (project root).
  - `update_db.py` uses `instance/hotel.db` by default. Align the paths:
    - Edit `update_db.py` DB path, or
    - Set `DATABASE_URL`, or
    - Move your DB file accordingly.

- Booking creation fails with flash “Error processing booking: ...”
  - Check console/server logs for full exception trace.
  - Verify `rooms_data` is supplied and valid JSON.
  - Ensure `check_in` < `check_out` and date format `YYYY-MM-DD`.

- Admin login fails
  - If using seeded data: user `admin`, pass `admin123`.
  - If you didn’t seed, create an admin user manually or via a small script using `generate_password_hash`.

- Availability always shows zero
  - Ensure `total_rooms` > 0 for the room type.
  - Check for overlapping bookings in the target range.
  - Confirm the database rows were created as expected.

- Screenshots not visible
  - Ensure the image files exist under `static/images/` and the filenames match those in the [Screenshots](#screenshots) section.
  - When viewing on GitHub, relative paths render if the files are committed to the repo.
  - When serving locally, Flask serves static files from `/static/...` by default.

---

## Security & Production Hardening

- Change `SECRET_KEY` to a strong, unique value.
- Create unique, strong admin credentials; do NOT keep defaults.
- Disable debug mode in production (run via WSGI server).
- Use HTTPS with a reverse proxy (Nginx/Apache).
- Consider migrating to a production‑grade DB (PostgreSQL/MySQL).
- Implement proper migrations (Alembic) for schema changes if you plan to iterate.
- Validate and sanitize JSON media URLs; use a CDN for static assets if possible.

---

## Deployment (Production)

Example with Gunicorn (Linux/macOS):
```bash
# Ensure venv and dependencies are installed
export SECRET_KEY="your-strong-secret"
export DATABASE_URL="sqlite:///hotel.db"  # or your Postgres URL
export FLASK_ENV=production

# Pre-create the DB tables (once)
python -c "from app import app, db; app.app_context().push(); db.create_all()"

# Run Gunicorn
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:8000 app:app
```

Behind Nginx:
- Reverse proxy traffic to `127.0.0.1:8000`
- Force HTTPS
- Serve static files via Nginx for performance

Using a different DB:
- Set `DATABASE_URL` to your DSN, e.g., `postgresql://user:pass@host:5432/dbname`
- Install necessary drivers (e.g., `psycopg2` or `psycopg2-binary`)

---

## Common Tasks & Tips

- Add a new room type quickly via admin panel
  - Make sure amenities/images/videos are valid JSON arrays
- Adjust inventory (`total_rooms`) seasonally or for promotions
- Export bookings: add a simple admin route to serialize `Booking` and `BookingItem` data to CSV/JSON
- Add image uploads: integrate a storage service (S3/GCS) instead of raw URLs
- Add payments: integrate a provider (Stripe/PayPal) during the booking confirmation step
- Add email confirmations: use a transactional email service from the booking success path
- Keep screenshots current: update images in `static/images/` after major UI changes

---

## Contributing
Contributions are welcome! Ideas:
- Improve UI/UX for selection and checkout
- Add unit tests and CI
- Introduce migrations (Alembic)
- Add pagination and search on rooms and bookings
- Dockerize for easy deployment

Please open an issue or a pull request with a clear description and steps to validate.

---

## License

MIT License

```
MIT License

Copyright (c) 2025 Atharva

Permission is hereby granted, free of charge, to any person obtaining a copy
...
```

See [LICENSE](LICENSE) for full text.

---

## Acknowledgements
- Sample room images in seed data reference Unsplash image URLs as examples.
- Flask and SQLAlchemy communities for documentation and examples.

---

Happy building! If you run into issues, see [Troubleshooting](#troubleshooting) or open an issue with logs, steps to reproduce, and environment details.

