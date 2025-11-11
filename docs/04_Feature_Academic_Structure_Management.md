# PRD 4: Feature - Academic Structure Management

This document outlines the requirements for features related to the creation and management of the institution's core academic hierarchy. This functionality is primarily accessed by the **Administrator** and **Department Head** roles.

## 1. User Stories

-   **As an Administrator,** I want to define, edit, and delete colleges, programs, and batches so that the portal's structure accurately reflects the institution's organization.
-   **As a Department Head,** I want to create and manage the class sections for a specific batch of students so that I can properly organize students for teaching and assessment.

## 2. Feature Requirements

### 2.1. Manage Colleges (Admin Only)
-   **Location:** `Admin Panel > Academic Structure`
-   **UI:** A dedicated section with a form for adding/editing and a list of existing colleges.
-   **FR-AS-1.1:** The Admin shall be able to create a new College by providing a unique ID and a full Name.
-   **FR-AS-1.2:** The Admin shall be able to edit the Name of an existing College. The ID should be immutable.
-   **FR-AS-1.3:** The Admin shall be able to delete an existing College.
-   **FR-AS-1.4:** When deleting a College, the system must display a confirmation modal warning the user that this action is destructive and will cascade, potentially deleting all associated Programs, Courses, Students, etc.

### 2.2. Manage Programs (Admin Only)
-   **Location:** `Admin Panel > Academic Structure`
-   **UI:** A dedicated section with a form for adding/editing and a list of existing programs.
-   **FR-AS-2.1:** The Admin shall be able to create a new Program by providing:
    -   A full Name (e.g., "BE ECE").
    -   An assignment to an existing College via a dropdown menu.
    -   A Duration in years (numeric input).
-   **FR-AS-2.2:** The Admin shall be able to edit all properties of an existing Program.
-   **FR-AS-2.3:** The Admin shall be able to delete an existing Program.
-   **FR-AS-2.4:** Deleting a Program must trigger a confirmation modal with a cascading delete warning.

### 2.3. Manage Batches (Admin Only)
-   **Location:** `Admin Panel > Academic Structure`
-   **UI:** A dedicated section featuring:
    1.  A dropdown to select a Program.
    2.  A form to add a new batch to the selected program.
    3.  A list of existing batches for the selected program.
-   **FR-AS-3.1:** To add a batch, the Admin must first select a Program from a dropdown list of all existing programs.
-   **FR-AS-3.2:** The "Add New Batch" form shall require a single input: the "Start Year".
-   **FR-AS-3.3:** The system shall automatically calculate the batch name based on the Start Year and the selected Program's `duration`. (e.g., Start Year 2025 + Duration 4 = Batch Name "2025-2029").
-   **FR-AS-3.4:** The system shall prevent the creation of a duplicate batch (same name and program).
-   **FR-AS-3.5:** The Admin shall be able to delete an existing Batch, which will trigger a confirmation modal.

### 2.4. Manage Sections (Department Head & Admin)
-   **Location:** `Department > Student Management`
-   **UI:** A dedicated section within the page featuring:
    1.  A form to add a new section name.
    2.  A list of existing sections for the selected Program and Batch.
-   **FR-AS-4.1:** To manage sections, the user must first select a Program and a Batch from the page's main filter dropdowns.
-   **FR-AS-4.2:** The user shall be able to create a new Section by providing a name (e.g., 'A', 'B', 'CS-1'). The input should be automatically converted to uppercase.
-   **FR-AS-4.3:** The system shall prevent the creation of a duplicate section within the same batch.
-   **FR-AS-4.4:** The user shall be able to delete an existing Section.
-   **FR-AS-4.5:** Deleting a Section must trigger a confirmation modal warning that all students currently in that section will become "Unassigned".
-   **FR-AS-4.6:** When a section is deleted, all students assigned to that `sectionId` must have their `sectionId` set to `null`.
