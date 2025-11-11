# PRD 8: Feature - Attainment Calculation and Reporting

This document specifies the requirements for the core calculation engine and the reporting features of the portal. This is the primary value proposition of the application, automating the most complex part of the OBE process.

## 1. Calculation Logic

The system performs a multi-stage calculation to determine outcome attainment. The logic must be executed precisely as described.

### 1.1. Student-Level CO Attainment
This is the base-level calculation for a single student's performance on a single Course Outcome.
-   **Formula:**
    ```
    Student CO Attainment % = (Sum of marks obtained in all questions mapped to CO X) / (Sum of max marks for all questions mapped to CO X) * 100
    ```
-   **REQ-CR-1.1:** This calculation must be performed for every student for every CO in a course they are enrolled in.
-   **REQ-CR-1.2:** If a student has no marks for any question mapped to a CO, their attainment for that CO is 0%. Questions not attempted are treated as 0 marks.

### 1.2. Course-Level CO Attainment
This calculation determines how well the class as a whole has achieved a specific CO.
-   **Process:**
    1.  For a given CO, identify the `CO Target %` from the course settings.
    2.  Count the number of students whose `Student CO Attainment %` is greater than or equal to the `CO Target %`.
    3.  Calculate the percentage of the class that met the target: `(% Students Meeting Target) = (Count from step 2) / (Total Students in Scope) * 100`.
    4.  Compare this percentage against the course's `Attainment Level Thresholds` to determine the final level.
-   **Formula:**
    ```
    If (% Students Meeting Target >= Level 3 Threshold), Attainment Level = 3
    Else if (% Students Meeting Target >= Level 2 Threshold), Attainment Level = 2
    Else if (% Students Meeting Target >= Level 1 Threshold), Attainment Level = 1
    Else, Attainment Level = 0
    ```
-   **REQ-CR-2.1:** This calculation must be performed for every CO in a course, and can be scoped to either the entire course or a specific section.

### 1.3. Program Outcome (PO) Attainment
This is the final, high-level calculation that aggregates course-level data.
-   **Process:**
    1.  **Calculate Direct Attainment:** For each PO, find all COs across all active/completed courses in the program that are mapped to it.
        -   **Formula:** `Direct PO Attainment = Σ(CO Attainment Level * CO-PO Mapping Level) / Σ(CO-PO Mapping Level)`
        -   This is a weighted average of the CO levels, weighted by the strength of the CO-PO link (1, 2, or 3).
    2.  **Input Indirect Attainment:** This is a manually entered value (scale 0-3) for each PO, typically from surveys or feedback.
    3.  **Calculate Overall Attainment:** Combine the direct and indirect values using system-defined weights.
        -   **Formula:** `Overall PO Attainment = (Direct PO Attainment * Direct Weight %) + (Indirect PO Attainment * Indirect Weight %)`

## 2. Reporting Features

### 2.1. Attainment Reports Dashboard
-   **Location:** `Reports`
-   **UI:** An interactive dashboard for selecting and generating reports.
-   **FR-CR-1.1:** The page shall display a tile-based selector for available report types.
-   **FR-CR-1.2:** Based on the selected report type, contextual filter dropdowns (e.g., for Course, Section) shall be enabled or disabled.
-   **FR-CR-1.3:** A "Generate Report" button shall trigger a full-screen `PrintableReport` modal to preview the report.

### 2.2. Printable Report Modal
-   **UI:** A full-screen modal with a clean, print-friendly layout.
-   **FR-CR-2.1:** The modal must display the generated report content.
-   **FR-CR-2.2:** The modal must have a "Download PDF" button.
-   **FR-CR-2.3:** The PDF generation must use `html2canvas` to capture the report content and `jsPDF` to create a multi-page A4 PDF document, correctly handling content that spans multiple pages.

### 2.3. Report Types

#### 2.3.1. Course Attainment Summary
-   **FR-CR-3.1:** This report shall contain:
    -   A professional header with university logo, report title, and key metadata (Program, Batch, Course, Scope, Faculty Name).
    -   A summary table of **Overall CO Attainment**, showing each CO, its description, the percentage of students who met the target, and the final calculated Attainment Level (0-3).
    -   A detailed **Student-wise Attainment** table with students as rows and COs as columns, where each cell shows the student's attainment percentage for that CO, colored green if it meets the target and red if it does not.

#### 2.3.2. Assessment Comparison Report
-   **FR-CR-3.2:** This report shall contain:
    -   A professional header with the same metadata as the summary report.
    -   A comparison table with students as rows and all assessments for the course/scope as columns.
    -   Each cell in the table shall display the student's final percentage score for that specific assessment.
