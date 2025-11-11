# PRD 5: Feature - User and Faculty Management

This document specifies the requirements for managing user accounts and the hierarchical relationships between faculty members. This functionality is critical for maintaining data security and proper workflow delegation.

## 1. User Stories

-   **As an Administrator,** I want to create, edit, and delete any user account in the system so that I can manage access and roles for all personnel.
-   **As a Department Head,** I want to assign Program Co-ordinators to the programs within my college so that they can manage their respective curricula.
-   **As a Department Head,** I want to assign Teachers to one or more Program Co-ordinators so that the reporting structure is clear.
-   **As a Program Co-ordinator,** I want to view a list of teachers who report to me so that I can monitor their course assignments and progress.

## 2. Feature Requirements

### 2.1. Global User Management (Admin Only)
-   **Location:** `Admin Panel > User Management`
-   **UI:** A table view of all users with search functionality, an "Add New User" button, and Edit/Delete actions per user.
-   **FR-UFM-1.1:** The Admin shall see a list of all users in the system, displaying their Name, Employee ID, Username, Role, and current Assignment (e.g., College for Dept Head, reporting PCs for Teacher).
-   **FR-UFM-1.2:** The Admin shall be able to search for users by Name, Username, Role, or Employee ID.
-   **FR-UFM-1.3:** Clicking "Add New User" or "Edit" shall open the `UserEditModal`.
-   **FR-UFM-1.4 (UserEditModal):** The modal form must be dynamic based on the selected "Role":
    -   **If Role = `Department`:** A dropdown shall appear to assign the user to a `College`.
    -   **If Role = `Program Co-ordinator`:** A dropdown shall appear to assign the user to a `Department Head`.
    -   **If Role = `Teacher`:** A multi-select box shall appear to assign the user to one or more `Program Co-ordinators`.
    -   For all other roles, no assignment fields are necessary.
-   **FR-UFM-1.5:** When creating a new user, all fields (including password) are required.
-   **FR-UFM-1.6:** When editing an existing user, the password field is optional. If left blank, the password remains unchanged.
-   **FR-UFM-1.7:** The Admin shall be able to delete any user account, which must trigger a confirmation modal.

### 2.2. Department-Level Faculty Management (Department Head Only)
-   **Location:** `Department > Faculty Management`
-   **UI:** A two-part page for managing PC and Teacher assignments.

#### 2.2.1. Program Co-ordinator Assignments
-   **FR-UFM-2.1:** The page shall display a table of all Programs within the Department Head's college.
-   **FR-UFM-2.2:** Each program row shall have a dropdown menu listing all `Program Co-ordinators` who report to this Department Head.
-   **FR-UFM-2.3:** The Department Head can assign one PC to each program. Selecting a PC for a program that is already assigned to another PC will effectively re-assign the program.
-   **FR-UFM-2.4:** Changes to PC assignments must use a **draft state**. The `SaveBar` component shall appear upon any change, requiring the user to explicitly "Save Changes" or "Cancel".

#### 2.2.2. Teacher Assignments to Co-ordinators
-   **FR-UFM-2.5:** The page shall display a table of all `Teachers` who report to any of the PCs managed by this Department Head.
-   **FR-UFM-2.6:** Each teacher row shall display the name(s) of the PC(s) they are currently assigned to.
-   **FR-UFM-2.7:** Each teacher row shall have a "Manage" button that opens a modal.
-   **FR-UFM-2.8 (Assignment Modal):** The modal shall contain a list of all PCs in the department, each with a checkbox. The Department Head can check one or more PCs to whom the teacher reports.
-   **FR-UFM-2.9:** Saving the modal shall **immediately** update the teacher's `programCoordinatorIds` and close the modal. This action does not use the page-level `SaveBar`.

### 2.3. Teacher Management View (PC & Department Head)
-   **Location:** `Teachers`
-   **UI:** A table view of teachers with search functionality.
-   **FR-UFM-3.1:** The list of teachers displayed shall be scoped to the user's role:
    -   **Program Co-ordinator:** Sees only teachers assigned to them.
    -   **Department Head:** Sees all teachers assigned to any PC within their department.
-   **FR-UFM-3.2:** The user can change a teacher's `status` ('Active' / 'Inactive') via a dropdown in the table. This action must trigger a confirmation modal.
-   **FR-UFM-3.3:** Each teacher row shall have a "View Dashboard" link that navigates to the detailed `TeacherDetails` page for that specific teacher (`/teachers/:teacherId`).
