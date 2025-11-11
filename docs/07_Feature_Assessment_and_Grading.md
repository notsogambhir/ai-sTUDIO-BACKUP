# PRD 7: Feature - Assessment and Grading

This document details the requirements for the entire assessment lifecycle, from creation and question management to the grading workflow. This feature set is central to gathering the raw performance data needed for attainment calculations.

## 1. User Stories

-   **As a Teacher or PC,** I want to create different types of assessments (e.g., Sessional Test, Final Exam) for a specific class section so I can evaluate my students.
-   **As a Teacher or PC,** I want to add questions to an assessment and map them to the relevant Course Outcomes (COs) so that my evaluation is aligned with the learning goals.
-   **As a Teacher or PC,** I want a simple way to enter and upload marks for all my students for a given assessment to save time and reduce errors.

## 2. Core Architectural Principle: Section-Level Assessments

-   **REQ-AG-1:** All assessments are fundamentally tied to a **Section**, not directly to a Course. This allows different teachers to have different assessments for their respective sections (e.g., Section A and Section B) within the same course.

## 3. Feature Requirements

### 3.1. Assessment Management
-   **Location:** `Course Detail > Assessments Tab`
-   **UI:** A view that first requires section selection, then lists assessments for that section.
-   **FR-AG-1.1:** The user must first select a class **Section** from a dropdown menu. This dropdown is filtered based on the user's role:
    -   **Teacher:** Sees only the sections they are assigned to for this course.
    -   **PC/Admin:** Sees all sections that have students enrolled in the course.
-   **FR-AG-1.2:** Once a section is selected, the user shall see a list of all assessments created for that section.
-   **FR-AG-1.3:** A "Create Assessment" button shall be available. Clicking it opens the `CreateAssessmentModal`.
-   **FR-AG-1.4 (Modal):** The creation form requires an **Assessment Name** and a **Type** (`Internal` or `External`). The new assessment is created with an empty list of questions.
-   **FR-AG-1.5:** PC and Admin users shall have a "Delete" button for each assessment, which must trigger a confirmation modal warning that all associated questions and student marks will also be deleted.

### 3.2. Assessment Details and Question Management
-   **Location:** Accessed by clicking "Manage Questions" on an assessment.
-   **UI:** A detailed view for a single assessment, showing question management and grading tools.
-   **FR-AG-2.1:** Authorized users (PC, assigned Teacher) shall be able to add a new question via an inline form, providing a **Question Name** (e.g., "Q1", "Q2a") and **Max Marks**.
-   **FR-AG-2.2:** Authorized users shall be able to bulk-upload questions from an Excel file (`.xlsx`) with `q` and `maxMarks` columns.
-   **FR-AG-2.3:** Authorized users shall be able to edit a question's name and max marks inline.
-   **FR-AG-2.4:** Authorized users shall be able to delete a question. This must trigger a confirmation modal.
-   **FR-AG-2.5 (CO Mapping):** The main view shall be a table with questions as rows and the course's COs as columns. Each cell shall contain a checkbox, allowing the user to map a question to one or more COs.
-   **FR-AG-2.6:** All changes to questions and their CO mappings must use a **draft state**, with changes committed via the `SaveBar`.

### 3.3. Grading Workflow
-   **Location:** `Assessment Details` view.
-   **UI:** A section with buttons for downloading a template and uploading marks.
-   **FR-AG-3.1 (Download Template):** A "Download Template" button shall generate and download an Excel file.
    -   The file must be pre-populated with the list of all `Active` students enrolled in the assessment's specific section.
    -   The columns must be `Student ID`, `Student Name`, followed by a column for each question in the assessment (e.g., `Q1`, `Q2`). The marks columns should be empty.
-   **FR-AG-3.2 (Upload Marks):** An "Upload Marks" button shall allow the user to upload the completed Excel template.
-   **FR-AG-3.3:** The system must parse the uploaded file, matching rows to students by `Student ID` and columns to questions by the question name (e.g., `Q1`).
-   **FR-AG-3.4:** The marks data shall be saved **immediately** upon successful upload. This action does not use the `SaveBar`. The user should be notified of how many students' marks were processed.
