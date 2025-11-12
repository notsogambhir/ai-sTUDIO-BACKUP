# Backend Development Guide: NBA OBE Portal (Django REST Framework)

This document provides a comprehensive, step-by-step guide for building and running the backend server for the NBA OBE Portal frontend. The stack is **Django**, **Django REST Framework (DRF)**, and **PostgreSQL**.

The primary goal is to replace the `mockData.json` file and all client-side `setData` calls with live API requests to this backend.

**New Backend Assets**: As a concrete implementation example, refer to the following files:
- **`schema.sql.txt`**: Contains `CREATE TABLE` statements for a PostgreSQL database.
- **`data_insertion.sql.txt`**: Contains `INSERT` statements to populate the database with the mock data.

---

## **Table of Contents**

1.  [Technology Stack](#1-technology-stack)
2.  [Step 1: Project Setup](#2-step-1-project-setup)
3.  [Step 2: Database Setup](#3-step-2-database-setup)
4.  [Step 3: Running the Development Environment](#4-step-3-running-the-development-environment)
5.  [Step 4: Models & Migrations](#5-step-4-models--migrations)
6.  [Step 5: Seeding Initial Data](#6-step-5-seeding-initial-data)
7.  [Step 6: Serializers](#7-step-6-serializers)
8.  [Step 7: Views, ViewSets, & Filtering Logic](#8-step-7-views-viewsets--filtering-logic)
9.  [Step 8: URLs & Routing](#9-step-8-urls--routing)
10. [Step 9: Authentication & Permissions](#10-step-9-authentication--permissions)
11. [Step 10: API Endpoint Cheatsheet](#11-step-10-api-endpoint-cheatsheet)
12. [Step 11: Frontend Refactoring Strategy](#12-step-11-frontend-refactoring-strategy)
13. [Step 12: Deployment Considerations](#13-step-12-deployment-considerations)

---

## 1. Technology Stack

*   **Backend Framework**: Django
*   **API Toolkit**: Django REST Framework (DRF)
*   **Database**: PostgreSQL
*   **Dependencies**: `psycopg2-binary`, `djangorestframework`, `django-cors-headers`, `gunicorn`

## 2. Step 1: Project Setup

First, set up the basic Django project structure.

```bash
# 1. Navigate to the backend directory
cd obe-portal-backend

# 2. Create a virtual environment
python3 -m venv venv
source venv/bin/activate

# 3. Install dependencies
pip install -r requirements.txt
```

## 3. Step 2: Database Setup

Set up the PostgreSQL database for the project.

1.  **Create a new PostgreSQL database:**
    ```sql
    CREATE DATABASE obe_portal_db;
    ```
2.  **Create a new user:**
    ```sql
    CREATE USER obe_user WITH PASSWORD 'obe_password';
    ```
3.  **Grant all privileges on the database to the new user:**
    ```sql
    GRANT ALL PRIVILEGES ON DATABASE obe_portal_db TO obe_user;
    ```

## 4. Step 3: Running the Development Environment

With the database set up, you can now run the Django development server.

1.  **Set the environment variables:**
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
2.  **Run the database migrations:**
    ```bash
    python manage.py migrate
    ```
3.  **Run the development server:**
    ```bash
    python manage.py runserver
    ```
Your Django API will now be running and accessible at `http://localhost:8000`.

## 5. Step 4: Models & Migrations

Define your relational models in `api/models.py`. These models must be consistent with the frontend's `types.ts` and the provided `schema.sql.txt`. Use `ForeignKey` and `ManyToManyField` to represent relationships. For fields like `section_teacher_ids`, `questions`, and `scores`, Django's `JSONField` is a suitable choice. For `program_coordinator_ids`, an `ArrayField` (from `django.contrib.postgres.fields`) can be used.

**Running Migrations**:
```bash
# Generate migration files
python manage.py makemigrations

# Apply migrations to the database
python manage.py migrate
```

## 6. Step 5: Seeding Initial Data

Seed the database with the initial data from the `data_insertion.sql.txt` script.
```bash
psql -U obe_user -d obe_portal_db -a -f data_insertion.sql.txt
```

## 7. Step 6: Serializers

Define serializers in `api/serializers.py` to convert your Django models into JSON and vice versa. Use `ModelSerializer` for simplicity.

```python
# api/serializers.py
from rest_framework import serializers
from .models import Program, Course, Student

class ProgramSerializer(serializers.ModelSerializer):
    class Meta:
        model = Program
        fields = '__all__'

# ... Define serializers for all other models ...
```

## 8. Step 7: Views, ViewSets, & Filtering Logic

This is where the core API logic resides. Use `ModelViewSet` for standard CRUD operations. The most critical part is overriding `get_queryset` in each ViewSet to enforce role-based data filtering.

**Example `api/views.py` with Filtering:**

```python
from rest_framework import viewsets
from .models import Course
from .serializers import CourseSerializer

class CourseViewSet(viewsets.ModelViewSet):
    serializer_class = CourseSerializer

    def get_queryset(self):
        """
        Dynamically filter the queryset based on the user's role and query params.
        """
        user = self.request.user
        queryset = Course.objects.all()

        # Role-based filtering
        if user.role == 'Teacher':
            # A more complex query is needed here to check both teacherId and sectionTeacherIds
            return queryset.filter(teacherId=user.id) # Simplified example
        
        elif user.role == 'Program Co-ordinator':
            return queryset.filter(program_id=user.program.id)

        elif user.role == 'Department':
            return queryset.filter(program__college_id=user.college.id)
        
        # For Admin/University, we allow further filtering via query parameters
        program_id = self.request.query_params.get('program_id')
        if program_id:
            queryset = queryset.filter(program_id=program_id)
            
        college_id = self.request.query_params.get('college_id')
        if college_id:
            queryset = queryset.filter(program__college_id=college_id)
            
        return queryset
```

## 9. Step 8: URLs & Routing

Use DRF's `DefaultRouter` to automatically generate URL patterns for your ViewSets.

**`api/urls.py`:**
```python
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProgramViewSet, CourseViewSet # ... and other viewsets

router = DefaultRouter()
router.register(r'programs', ProgramViewSet)
router.register(r'courses', CourseViewSet)
# ... register all other viewsets

urlpatterns = [
    path('', include(router.urls)),
]
```

Include these URLs in your main `obe_portal/urls.py`.

## 10. Step 9: Authentication & Permissions

DRF's token authentication is configured in `settings.py`. To handle role-specific access (e.g., only Admins can delete), create custom permission classes. Refer to the **API Endpoint Cheatsheet** below for a detailed breakdown of the required permission logic for every endpoint and user role.

**`api/permissions.py` (Example):**
```python
from rest_framework import permissions

class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Allow all methods for admins, but only safe methods (GET, HEAD, OPTIONS) for others.
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.role == 'Admin'

class IsProgramCoordinator(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.role == 'Program Co-ordinator'
```
You can then apply these in your views: `permission_classes = [IsAdminOrReadOnly]`

## 11. Step 10: API Endpoint Cheatsheet

This section provides a detailed list of required endpoints, permissions, and filtering logic. The base URL is `/api/`.

| Endpoint & Method | Description | Permissions (by Role) | Filtering Logic / Scoping Notes |
| :--- | :--- | :--- | :--- |
| **`auth/login/`** `POST` | Authenticate user, get auth token. | **Public** (all users). | N/A |
| **`auth/user/`** `GET` | Get details of the currently authenticated user. | **Authenticated** (all roles). | Returns the user object for the request user. |
| **`app-data/`** `GET` | Get initial bootstrap data for the frontend. | **Authenticated** (all roles). | Data is scoped to the user's role. **Admin/Univ**: All data. **Dept**: Data for their college. **PC**: Data for their program. **Teacher**: Data for their assigned courses. |
| **`colleges/`** | CRUD for Colleges. | **GET**: Admin, Univ, Dept. <br> **POST/PATCH/DELETE**: Admin only. | N/A - Returns all colleges. |
| **`programs/`** | CRUD for Programs. | **GET**: All roles. <br> **POST/PATCH/DELETE**: Admin only. | **GET Scope**: <br> - **Admin/Univ**: All. Filter by `?college_id=`. <br> - **Dept**: Programs in their college. <br> - **PC**: Their assigned program. <br> - **Teacher**: Associated programs. |
| **`batches/`** | CRUD for Batches. | **GET**: All roles. <br> **POST/PATCH/DELETE**: Admin only. | **GET Scope**: Must be filtered by `?program_id=`. Access follows program permissions. |
| **`sections/`** | CRUD for Sections. | **GET**: All roles. <br> **POST/PATCH/DELETE**: Admin, Department. | **GET Scope**: Must be filtered by `?batch_id=`. <br> **Write Scope**: Dept can only manage sections in their college. |
| **`courses/`** | CRUD for Courses. | **GET**: All roles. <br> **POST**: Admin, PC. <br> **PATCH**: Admin, PC, Dept, assigned Teacher. <br> **DELETE**: Admin, PC. | **GET Scope**: <br> - **Admin/Univ**: All. Filter by `?college_id=`, `?program_id=`. <br> - **Dept**: Courses in their college. <br> - **PC**: Courses in their program. <br> - **Teacher**: Assigned courses only. <br> **Write Scope**: Dept/PC/Teacher restricted to their scope. |
| **`students/`** | CRUD for Students. | **GET**: All roles. <br> **POST**: Admin, PC, Department. <br> **PATCH**: Admin, PC, Department. <br> **DELETE**: Admin only. | **GET Scope**: <br> - **Admin/Univ**: All. Filter by `?college_id=`, `?program_id=`, `?batch_name=`. <br> - **Dept**: Students in their college. <br> - **PC/Teacher**: Students in their program. <br> **Write Scope**: Dept/PC restricted to their college/program. |
| **`users/`** | CRUD for Users. | **GET**: Admin, Dept, PC. <br> **POST/PATCH/DELETE**: Admin only. | **GET Scope**: <br> - **Admin**: All users. <br> - **Dept**: PCs and Teachers in their college. <br> - **PC**: Teachers they manage. |
| **`course-outcomes/`** | CRUD for Course Outcomes. | **GET**: All roles. <br> **POST/PATCH/DELETE**: Admin, PC, assigned Teacher. | Must be filtered by `?course_id=`. Write access only if user has rights to the course. |
| **`program-outcomes/`** | CRUD for Program Outcomes. | **GET**: All roles. <br> **POST/PATCH/DELETE**: Admin, PC. | Must be filtered by `?program_id=`. Write access only if user has rights to the program. |
| **`co-po-mapping/`** | CRUD for CO-PO mapping. | **GET**: All roles. <br> **POST/PATCH/DELETE**: Admin, PC, assigned Teacher. | Must be filtered by `?course_id=`. Write access only if user has rights to the course. |
| **`assessments/`** | CRUD for Assessments. | **GET**: All roles. <br> **POST/PATCH/DELETE**: Admin, PC, assigned Teacher. | Must be filtered by `?section_id=`. Write access only if user has rights to the section's course. |
| **`marks/`** | CRUD for student marks. | **GET**: All roles. <br> **POST/PATCH**: Admin, PC, assigned Teacher. | `GET` filtered by `?assessment_id=`. `POST/PATCH` requires `assessment_id` in payload. Write access only if user has rights to the assessment. |
| **`reports/po-attainment/`** `GET` | **Calculated**: Get PO attainment data. | **GET only**: Admin, Univ, Dept, PC. | Requires `?program_id=` and `?batch_name=`. Performs complex aggregation on the backend. |
| **`reports/co-attainment/`** `GET` | **Calculated**: Get CO attainment data. | **GET only**: Admin, Dept, PC, assigned Teacher. | Requires `?course_id=`. Optional `?section_id=`. Performs complex aggregation on the backend. |


## 12. Step 11: Frontend Refactoring Strategy

1.  **Create an API Client**: Use a library like `axios` to create a centralized API client that automatically attaches the auth token to headers. Set the `baseURL` to `http://localhost:8000/api`.
2.  **Replace `fetch('./mockData.json')`**: In `AppContext.tsx`, replace the `fetch` call with a request to your new `/api/app-data/` endpoint. This will provide the initial state.
3.  **Replace `setData` Calls**: Go through every component that calls `setData`. Replace these client-side state mutations with API calls (e.g., `apiClient.patch('/courses/C101/', { status: 'Active' })`). After a successful API call, you'll need to re-fetch the relevant data to update the UI.

## 13. Step 12: Deployment Considerations

*   **Production Server**: Use a production-ready web server like Gunicorn to run the Django application.
*   **Environment Variables**: Instead of hardcoding, use your hosting provider's secrets management (e.g., AWS Secrets Manager, GitHub Actions Secrets) to inject environment variables at runtime. **Never commit production secrets.**
*   **Web Server/Reverse Proxy**: Use `Nginx` as a reverse proxy. It will handle incoming traffic on ports 80/443, manage SSL termination, and forward requests to your Gunicorn server.
*   **Static Files**: Run `python manage.py collectstatic` to gather all static files into a single directory. The Nginx server should serve these files directly, which is much more efficient.
