<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# NBA Outcome Based Education (OBE) Portal

This is a comprehensive web application designed for educational institutions to manage, track, and calculate learning outcomes in accordance with the National Board of Accreditation (NBA) guidelines.

## Run Locally

### Prerequisites

- Python 3.9 or higher
- Node.js 16 or higher
- PostgreSQL 13 or higher

### Backend Setup

1. **Navigate to the backend directory:**
   ```bash
   cd obe-portal-backend
   ```

2. **Create a virtual environment:**
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up the PostgreSQL database:**
   - Create a new PostgreSQL database named `obe_portal_db`.
   - Create a new user named `obe_user` with the password `obe_password`.
   - Grant all privileges on the `obe_portal_db` database to the `obe_user`.

5. **Set the environment variables:**
   - Create a `.env` file in the `obe-portal-backend` directory.
   - Add the following environment variables to the `.env` file:
     ```
     SECRET_KEY=your_secret_key_for_development_only_change_in_production
     DJANGO_SETTINGS_MODULE=obe_portal.settings
     DB_NAME=obe_portal_db
     DB_USER=obe_user
     DB_PASSWORD=obe_password
     DB_HOST=localhost
     DB_PORT=5432
     ```

6. **Run the database migrations:**
   ```bash
   python manage.py migrate
   ```

7. **Seed the database:**
   ```bash
   psql -U obe_user -d obe_portal_db -a -f data_insertion.sql.txt
   ```

8. **Run the backend development server:**
   ```bash
   python manage.py runserver
   ```

### Frontend Setup

1. **Navigate to the root directory:**
   ```bash
   cd ..
   ```

2. **Install dependencies:**
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Run the frontend development server:**
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:3000`.
