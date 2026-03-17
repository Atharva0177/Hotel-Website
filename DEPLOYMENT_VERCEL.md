# Deploying to Vercel with Supabase

This guide explains how to host the Hotel Website on Vercel using Supabase as the persistent PostgreSQL database.

## 1. Set up Supabase (Database)

1.  **Create an account** at [supabase.com](https://supabase.com/).
2.  **Create a new project** (e.g., "Hotel-Website").
3.  Go to **Project Settings** > **Database**.
4.  Copy the **Connection String** (use the **URI** format). It looks like:
    `postgresql://postgres:[YOUR-PASSWORD]@db.[REF].supabase.co:5432/postgres`
    *Make sure to replace `[YOUR-PASSWORD]` with the password you set during project creation.*

> [!IMPORTANT]
> **Special Characters in Password**: If your password contains special characters like `@`, you **must** URL-encode them. For example, if your password is `My@Password`, use `My%40Password` in the connection string.

## 2. Deploy to Vercel

1.  **Push your code** to a GitHub repository.
2.  **Import the project** in [Vercel](https://vercel.com/new).
3.  In the **Environment Variables** section, add the following:
    - `DATABASE_URL`: The Supabase Connection String you copied above.
    - `SECRET_KEY`: A random strong string (e.g., `hotel-secret-123`).
4.  Click **Deploy**.

## 3. Initialize the Database

Since you are using a new remote database, you need to create the tables and (optionally) seed the sample data.

### Option A: Run locally (Recommended)
Before deploying, or after setting the environment variable locally, run:
```bash
# Windows PowerShell
$env:DATABASE_URL="your-supabase-connection-string"
python init_db.py
```
*This will connect to Supabase, create the tables, and seed the default admin account.*

### Option B: Automatic Table Creation
The application is configured to call `db.create_all()` on startup if the tables don't exist. However, this won't create the sample rooms or the admin user. You would need to use `init_db.py` to get the default `admin/admin123` account.

## 4. Admin Access
Once deployed and initialized, you can access the admin panel at:
`https://your-deployment.vercel.app/admin/login`

Default credentials (if seeded):
- **Username**: `admin`
- **Password**: `admin123`

---

> [!TIP]
> **Static Files**: Vercel handles static files (images, CSS, JS) automatically via the `static/` directory. For user-uploaded images in a real production environment, consider using Supabase Storage or AWS S3.
