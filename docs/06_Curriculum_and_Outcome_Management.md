# PRD 6: Curriculum and Outcome Management

This document details the requirements for managing Courses, Course Outcomes (COs), Program Outcomes (POs), and their mapping. This is a primary workflow for **Program Co-ordinators (PCs)** and **Teachers**.

---

## 1. User Stories

-   **As a Program Co-ordinator,** I want to create and manage all courses, COs, and POs for my program.
-   **As a Teacher or PC,** I want to map each CO to the relevant POs to establish the link between course learning and program goals.

---

## 2. Feature Requirements

### 2.1. Course Lifecycle Management (PC & Admin)
-   **Location:** `Courses`
-   **FR-COM-1.1:** Users can add a new course via an inline form or bulk-upload from Excel.
-   **FR-COM-1.2:** Courses have a status (`Future`, `Active`, `Completed`) that can be changed via a dropdown.
-   **FR-COM-1.3 (Auto-Enrollment):** Changing a course status to **"Active"** must automatically enroll all active students from the selected batch, confirmed via a modal.

### 2.2. Course Outcomes (COs) Management (PC & Teacher)
-   **Location:** `Course Detail > COs Tab`
-   **FR-COM-2.1:** Users can add, edit (inline), and delete COs for a course.
-   **FR-COM-2.2:** All changes use a **draft state** and must be saved via the `SaveBar`.

### 2.3. Program Outcome (PO) Management (PC & Admin)
-   **Location:** `Program Outcomes`
-   **FR-COM-3.1:** Users can add, upload (Excel), and delete POs for their program.

### 2.4. CO-PO Mapping Matrix (PC & Teacher)
-   **Location:** `Course Detail > CO-PO Mapping Tab`
-   **FR-COM-4.1:** A matrix displays COs as rows and POs as columns.
-   **FR-COM-4.2:** Each cell contains a dropdown (0-3) to define the correlation strength.
-   **FR-COM-4.3:** Changes use a **draft state** and are saved via the `SaveBar`.

### 2.5. Faculty Assignment (PC & Dept Head)
-   **Location:** `Course Detail > Faculty Assignment Tab`
-   **FR-COM-5.1:** A PC can assign a single teacher to the entire course.
-   **FR-COM-5.2:** A PC can switch to "Assign by Section" mode to assign a different teacher to each specific section.
-   **FR-COM-5.3:** Changes use a **draft state** and are saved via the `SaveBar`.

---

## 3. How-To Guide for Program Co-ordinators

### 3.1. To Manage Courses:
1.  Navigate to the **`Courses`** page.
2.  Use the form at the top to add a single course, or use the "Bulk Upload" button.
3.  To activate a course for the current batch, find it in the list and change its status dropdown to "Active". Confirm the student enrollment action.

### 3.2. To Define Outcomes:
1.  **For POs:** Go to the **`Program Outcomes`** page. Click "Add New PO" and fill in the details.
2.  **For COs:** Go to the **`Courses`** page, click "Manage" on a course, then go to the **"COs"** tab. Use the form at the bottom of the table to add new COs. Remember to **Save Changes**.

### 3.3. To Map Outcomes:
1.  Go to the detail page for a course and navigate to the **"CO-PO Mapping"** tab.
2.  In the grid, use the dropdown in each cell to set the correlation level (1, 2, or 3) between the CO in that row and the PO in that column.
3.  When you are finished, click **"Save Changes"** on the bar at the bottom.

### 3.4. To Assign Teachers:
1.  Go to the detail page for a course and navigate to the **"Faculty Assignment"** tab.
2.  Choose your mode: "Single Teacher" or "Assign by Section".
3.  Use the dropdowns to select the appropriate teacher(s) from a list of your direct reports.
4.  Click **"Save Changes"**.
