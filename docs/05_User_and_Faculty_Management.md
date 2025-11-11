# PRD 5: User and Faculty Management

This document specifies the requirements for managing user accounts and the hierarchical relationships between faculty members.

---

## 1. User Stories

-   **As an Administrator,** I want to create, edit, and delete any user account in the system to manage access and roles.
-   **As a Department Head,** I want to assign Program Co-ordinators (PCs) to programs and assign Teachers to one or more PCs.
-   **As a Program Co-ordinator,** I want to view a list of teachers who report to me.

---

## 2. Feature Requirements

### 2.1. Global User Management (Admin Only)
-   **Location:** `Admin Panel > User Management`
-   **FR-UFM-1.1:** The Admin shall have a complete view of all users with search functionality.
-   **FR-UFM-1.2:** A modal (`UserEditModal`) shall be used for both creating new users and editing existing ones.
-   **FR-UFM-1.3:** The modal form must be dynamic, showing role-specific assignment fields (e.g., a College dropdown for a `Department` role, a multi-select PC list for a `Teacher` role).
-   **FR-UFM-1.4:** Deleting any user must trigger a confirmation modal.

### 2.2. Department-Level Faculty Management (Department Head Only)
-   **Location:** `Department > Faculty Management`
-   **FR-UFM-2.1 (PC Assignments):** The page must allow the Department Head to assign one PC to each program in their college via dropdowns. These changes must use a **draft state** and be saved via the `SaveBar`.
-   **FR-UFM-2.2 (Teacher Assignments):** The page must allow the Department Head to assign a Teacher to one or more PCs via a "Manage" button that opens a modal with checkboxes. These changes are saved **immediately** when the modal is saved.

### 2.3. Teacher Management View (PC & Department Head)
-   **Location:** `Teachers`
-   **FR-UFM-3.1:** The list of teachers must be scoped: PCs see their direct reports; Department Heads see all teachers in their department's hierarchy.
-   **FR-UFM-3.2:** Users shall be able to change a teacher's status (`Active`/`Inactive`), triggering a confirmation modal.
-   **FR-UFM-3.3:** Each teacher row must link to that teacher's detailed dashboard.

---

## 3. How-To Guide for Administrators

### 3.1. To Manage Any User:
1.  Navigate to **`Admin > User Management`**.
2.  **To Add:** Click "Add New User". Fill out the form in the modal. The fields will change based on the **Role** you select. Click "Create User".
3.  **To Edit:** Click the **Edit** icon next to a user. Modify their details in the modal and click "Save Changes".
4.  **To Delete:** Click the **Trash** icon and confirm the action.

## 4. How-To Guide for Department Heads

### 4.1. To Assign Faculty:
1.  Navigate to **`Department > Faculty Management`**.
2.  **Assign Program Co-ordinators:**
    -   In the top table, use the dropdown next to each program to select the responsible PC.
    -   When you are done with all assignments, click **"Save Changes"** in the bar at the bottom.
3.  **Assign Teachers to Co-ordinators:**
    -   In the bottom table, find the teacher you wish to assign.
    -   Click the **"Manage"** button.
    -   In the popup, check the boxes next to the PC(s) this teacher reports to.
    -   Click **"Save Assignments"**. This change is saved instantly.
