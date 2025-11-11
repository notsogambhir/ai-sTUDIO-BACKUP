# PRD 7: Assessment and Grading Workflow

This document details the requirements and user guide for the entire assessment lifecycle, from creation and question management to the grading workflow. This feature set is central to gathering performance data for attainment calculations.

---

## 1. User Stories

-   **As a Teacher or PC,** I want to create assessments for a specific class section so I can evaluate my students.
-   **As a Teacher or PC,** I want to add questions to an assessment and map them to the relevant COs so my evaluation is aligned with learning goals.
-   **As a Teacher or PC,** I want a simple way to upload marks for all my students for an assessment to save time and reduce errors.

---

## 2. Feature Requirements

### 2.1. Assessment Management
-   **Architectural Principle:** All assessments are tied to a **Section**, not directly to a Course.
-   **FR-AG-1.1:** On the `Course Detail > Assessments Tab`, the user must first select a Section from a role-based dropdown.
-   **FR-AG-1.2:** Users can create a new assessment for the selected section, providing a Name and Type (`Internal`/`External`).
-   **FR-AG-1.3:** PCs and Admins can delete an assessment, which must trigger a confirmation modal warning that all associated questions and marks will also be deleted.

### 2.2. Question Management and CO Mapping
-   **Location:** `Assessment Details` view.
-   **FR-AG-2.1:** Authorized users (PC, assigned Teacher) can perform CRUD operations on questions for an assessment.
-   **FR-AG-2.2:** Each question must have a Name (e.g., "Q1") and Max Marks.
-   **FR-AG-2.3 (CO Mapping):** The UI must provide a table of checkboxes to map each question to one or more COs.
-   **FR-AG-2.4:** All changes to questions and mappings must use a **draft state** and be saved via the `SaveBar`.

### 2.3. Grading Workflow
-   **Location:** `Assessment Details` view.
-   **FR-AG-3.1 (Download Template):** A "Download Template" button must generate an Excel file pre-populated with the student list for the assessment's section and columns for each question.
-   **FR-AG-3.2 (Upload Marks):** An "Upload Marks" button must allow the user to upload the completed Excel template. The system must parse the file and store the marks.
-   **FR-AG-3.3:** Marks are saved **immediately** on upload and do not use the `SaveBar`.

---

## 3. How-To Guide for Teachers & PCs

This is the standard process for setting up and grading an assessment.

### Step 1: Create the Assessment
1.  Navigate to the desired course and click the **"Assessments"** tab.
2.  Select the **Section** you want to assess from the dropdown menu.
3.  Click **"Create Assessment"**.
4.  Give the assessment a **Name** (e.g., "Mid-Term Exam") and select its **Type**. Click **Create**.

### Step 2: Add and Map Questions
1.  From the assessments list, click **"Manage Questions"** on the assessment you just created.
2.  **Add Questions:** Use the form at the bottom of the table to add questions one by one, specifying the **Question Name** (e.g., Q1, Q2a) and **Max Marks**. Alternatively, use the **"Upload Questions"** button for bulk creation.
3.  **Map to COs:** In the main table, check the box for each question under the CO(s) it is designed to measure.
4.  A **Save Bar** will appear. Click **"Save Changes"** to confirm your questions and mappings.

### Step 3: Grade the Assessment
1.  On the **Assessment Details** screen, find the "Upload Student Marks" section.
2.  **Download:** Click **"Download Template"**. This gives you an Excel file with the correct student list and question columns.
3.  **Enter Marks:** Open the file, enter the marks for each student, and save it.
4.  **Upload:** Click **"Upload Marks"** and select your completed Excel file. The system will process the file and save the scores.

Once marks are uploaded, the assessment is complete, and its data will be automatically included in all attainment calculations.
