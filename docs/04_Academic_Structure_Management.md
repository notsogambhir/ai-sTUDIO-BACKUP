# PRD 4: Academic Structure Management

This document outlines the requirements and user guide for features related to managing the institution's core academic hierarchy. This functionality is primarily used by **Administrators** and **Department Heads**.

---

## 1. User Stories

-   **As an Administrator,** I want to define, edit, and delete colleges, programs, and batches so that the portal's structure accurately reflects the institution's organization.
-   **As a Department Head,** I want to create and manage the class sections for a specific batch of students so that I can properly organize students for teaching and assessment.

---

## 2. Feature Requirements

### 2.1. Manage Colleges (Admin Only)
-   **FR-AS-1.1:** An Admin must be able to perform CRUD (Create, Read, Update, Delete) operations on Colleges.
-   **FR-AS-1.2:** Deleting a College requires a confirmation modal warning of the cascading deletion of all related data (programs, courses, etc.).

### 2.2. Manage Programs (Admin Only)
-   **FR-AS-2.1:** An Admin must be able to perform CRUD operations on Programs.
-   **FR-AS-2.2:** Creating or editing a program requires specifying its Name, associated College, and Duration (in years).

### 2.3. Manage Batches (Admin Only)
-   **FR-AS-3.1:** An Admin must first select a Program before they can manage its batches.
-   **FR-AS-3.2:** The system must automatically calculate the batch name (e.g., "2025-2029") based on a given Start Year and the program's duration.
-   **FR-AS-3.3:** An Admin can add or delete batches for the selected program.

### 2.4. Manage Sections (Department Head & Admin)
-   **FR-AS-4.1:** A user must first select a Program and a Batch to manage sections.
-   **FR-AS-4.2:** Users can create or delete sections (e.g., "A", "B") for the selected batch.
-   **FR-AS-4.3:** Deleting a section must set the `sectionId` to `null` for all students who were assigned to it.

---

## 3. How-To Guide for Administrators

As an Administrator, you can build the entire academic structure of the university.

### 3.1. To Manage Colleges, Programs, and Batches:
1.  Navigate to **`Admin > Academic Structure`** from the sidebar.
2.  **Colleges:** Use the form in the "Manage Colleges" section to add a new college. Use the edit/delete icons in the list to manage existing ones.
3.  **Programs:** Use the "Manage Programs" form to add a new program, making sure to select its parent college and set its duration.
4.  **Batches:**
    -   First, select a program from the dropdown in the "Manage Batches" section.
    -   Enter a **Start Year** for a new batch and click "Add Batch". The name will be generated for you.
    -   Use the delete icon in the list to remove a batch.

## 4. How-To Guide for Department Heads

As a Department Head, you are responsible for organizing students into sections.

### 4.1. To Manage Sections:
1.  Navigate to **`Department > Student Management`** from the sidebar.
2.  Use the dropdowns at the top to select the **Program** and **Batch** you wish to organize.
3.  The "Manage Sections" card will display.
4.  Enter a name for a new section (e.g., "C") in the form and click "Add Section".
5.  Use the trash icon to delete an existing section. You will be asked to confirm this action.
