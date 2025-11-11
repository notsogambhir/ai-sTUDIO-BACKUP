# PRD 3: Core Features and Functionality

This document provides a high-level overview of the major features and functional areas of the NBA OBE Portal. Each section briefly describes a core component of the application, with detailed requirements specified in subsequent PRD documents.

## 1. Authentication and Authorization
-   **Functionality:** Secure user login, session management, and role-based access control.
-   **Key Aspects:**
    -   Username/password authentication.
    -   A hierarchical permission system that restricts access based on user role.
    -   A clear separation between public-facing pages (Login) and protected application routes.
-   **Reference:** See PRD-02 for a detailed permissions breakdown.

## 2. Role-Based Dashboards & Navigation
-   **Functionality:** A dynamic user interface that adapts to the logged-in user.
-   **Key Aspects:**
    -   A context-aware sidebar that displays relevant navigation links and data filters for the user's role.
    -   A centralized dashboard that presents a high-level overview of relevant statistics for most roles.
    -   A specialized dashboard for Teachers, focusing on their assigned courses and tasks.

## 3. Academic Structure Management
-   **Functionality:** Tools for Administrators and Department Heads to define and manage the institution's academic hierarchy.
-   **Key Aspects:**
    -   CRUD (Create, Read, Update, Delete) operations for Colleges.
    -   CRUD for Programs, including assignment to a College and defining its duration.
    -   CRUD for Batches within a Program.
    -   CRUD for Sections within a Batch.
-   **Reference:** See PRD-04 for detailed requirements.

## 4. User and Faculty Management
-   **Functionality:** Interfaces for managing all user accounts and their roles/assignments within the academic structure.
-   **Key Aspects:**
    -   Administrator control over all user accounts.
    -   Department Head control over assigning Program Co-ordinators to programs and Teachers to Program Co-ordinators.
-   **Reference:** See PRD-05 for detailed requirements.

## 5. Curriculum and Outcome Management
-   **Functionality:** The core workflow for defining the curriculum and its intended learning outcomes.
-   **Key Aspects:**
    -   CRUD for Courses within a program, including setting status (Future, Active, Completed).
    -   CRUD for Course Outcomes (COs) for each course.
    -   CRUD for Program Outcomes (POs) for each program.
    -   A matrix interface for mapping COs to POs with varying levels of correlation (1-3).
-   **Reference:** See PRD-06 for detailed requirements.

## 6. Assessment and Grading Workflow
-   **Functionality:** A comprehensive system for creating assessments, managing questions, and recording student marks.
-   **Key Aspects:**
    -   Assessments are created at the **Section** level, not the course level.
    -   Ability to add questions to an assessment and map each question to one or more COs.
    -   A streamlined workflow for grading: download a pre-formatted Excel template, fill in marks, and upload the completed file.
-   **Reference:** See PRD-07 for detailed requirements.

## 7. Attainment Calculation Engine
-   **Functionality:** The automated engine that performs all complex attainment calculations based on raw assessment data.
-   **Key Aspects:**
    -   Calculates individual student attainment for each CO.
    -   Calculates the overall attainment level (0-3) for each CO based on class performance against a target.
    -   Calculates Direct PO attainment through a weighted average of CO attainment levels.
    -   Calculates Overall PO attainment by combining direct data with manually entered indirect data.
-   **Reference:** See PRD-08 for detailed calculation logic.

## 8. Reporting and Data Visualization
-   **Functionality:** An interactive dashboard for generating, previewing, and downloading various summary reports required for accreditation.
-   **Key Aspects:**
    -   Generation of a "Course Attainment Summary" report.
    -   Generation of an "Assessment Comparison Report".
    -   A print preview modal with a one-click "Download PDF" feature.
-   **Reference:** See PRD-08 for detailed report specifications.
