# PRD 6: Feature - Course and Outcome Management

This document details the requirements for managing the core components of the curriculum: Courses, Course Outcomes (COs), Program Outcomes (POs), and the critical mapping between them.

## 1. User Stories

-   **As a Program Co-ordinator,** I want to create, upload, and manage all courses for my program so that the curriculum is accurately represented.
-   **As a Program Co-ordinator,** I want to define the specific learning outcomes (COs) for each course and the broader outcomes (POs) for my program.
-   **As a Teacher or PC,** I want to map each CO to the relevant POs to establish the relationship between course-level learning and program-level goals.
-   **As a Teacher,** I want to view the details of my assigned courses and manage their COs and assessments.

## 2. Feature Requirements

### 2.1. Course Lifecycle Management
-   **Location:** `Courses`
-   **UI:** A list of courses grouped by status ("Active", "Future", "Completed").
-   **FR-COM-1.1:** A user with management rights (PC or Admin) shall be able to add a new course via an inline form, providing a Course Code and Name. New courses default to "Future" status.
-   **FR-COM-1.2:** A user with management rights shall be able to bulk-upload courses from an Excel file (`.xlsx`). The file must contain `code` and `name` columns.
-   **FR-COM-1.3:** The system shall support three course statuses:
    -   `Future`: A course planned but not yet running.
    -   `Active`: A course currently in session.
    -   `Completed`: A course that has finished for the academic cycle.
-   **FR-COM-1.4 (Auto-Enrollment):** When a course's status is changed from "Future" or "Completed" to **"Active"**, the system must automatically enroll all `Active` students from the currently selected `Batch` into the course. A confirmation modal must warn the user of this action.

### 2.2. Course Detail View
-   **Location:** `/courses/:courseId` (accessed by clicking "Manage" on the `CoursesList` page).
-   **UI:** A tabbed interface for managing different aspects of a single course.

#### 2.2.1. Overview Tab
-   **FR-COM-2.1:** This tab shall display general course settings: CO Target (%), Internal/External Weightage (%), and Attainment Level Thresholds.
-   **FR-COM-2.2:** A Program Co-ordinator shall be able to edit these values. The fields will be read-only for all other roles.
-   **FR-COM-2.3:** All changes on this tab must use a **draft state**, with changes committed only upon clicking "Save Changes" on the `SaveBar`.

#### 2.2.2. Course Outcomes (COs) Tab
-   **FR-COM-2.4:** This tab shall display a table of all COs for the course.
-   **FR-COM-2.5:** Authorized users (PC, assigned Teacher) shall be able to add a new CO via an inline form at the bottom of the table. The `number` (e.g., CO4, CO5) shall be auto-suggested.
-   **FR-COM-2.6:** Authorized users shall be able to edit a CO's number and description inline within the table.
-   **FR-COM-2.7:** Authorized users shall be able to delete a CO.
-   **FR-COM-2.8:** All changes on this tab (add, edit, delete) must use a **draft state**, with changes committed via the `SaveBar`.

### 2.3. Program Outcome (PO) Management
-   **Location:** `Program Outcomes`
-   **UI:** A list of existing POs and a dashboard for attainment calculation.
-   **FR-COM-3.1:** Authorized users (PC, Admin) shall be able to add a new PO via a modal form, providing a `number` (e.g., PO1) and `description`.
-   **FR-COM-3.2:** Authorized users shall be able to bulk-upload POs from an Excel file (`.xlsx`).
-   **FR-COM-3.3:** Authorized users shall be able to delete an existing PO, which must trigger a confirmation modal.

### 2.4. CO-PO Mapping Matrix
-   **Location:** `Course Detail > CO-PO Mapping Tab`
-   **UI:** A matrix/table with COs as rows and the program's POs as columns.
-   **FR-COM-4.1:** Each cell in the matrix shall contain a dropdown menu with values `0` (or `-`), `1`, `2`, `3`.
-   **FR-COM-4.2:** The selected value represents the strength of the correlation:
    -   `1`: Low correlation
    -   `2`: Medium correlation
    -   `3`: High correlation
    -   `0`: No correlation
-   **FR-COM-4.3:** The dropdowns shall be enabled for authorized users (PC, assigned Teacher) and disabled for others.
-   **FR-COM-4.4:** All changes to the mapping levels must use a **draft state**, with changes committed via the `SaveBar`.
