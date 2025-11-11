# PRD 9: Reporting and Analytics

This document specifies the requirements for the reporting dashboard, details the content of each report, and provides a user guide for generating and downloading reports.

---

## 1. User Stories

-   **As a Teacher or PC,** I want to generate a summary of CO attainment for my course to quickly assess performance.
-   **As a PC or Department Head,** I want to compare student performance across different assessments in a course to identify trends.
-   **As any user,** I want to download a professional-looking, multi-page PDF of any report for documentation and accreditation purposes.

---

## 2. Feature Requirements

### 2.1. Attainment Reports Dashboard
-   **Location:** `Reports`
-   **FR-CR-1.1:** The page must present a clear, tile-based interface for selecting a report type.
-   **FR-CR-1.2:** Contextual filter dropdowns for `Course` and `Scope` (Overall Course vs. a specific Section) must be provided. Filters should be enabled/disabled based on the requirements of the selected report type.
-   **FR-CR-1.3:** A "Generate Report" button must trigger a full-screen preview modal (`PrintableReport`).

### 2.2. Printable Report Modal & PDF Generation
-   **FR-CR-2.1:** The preview modal must display the full report content in a clean, print-optimized layout.
-   **FR-CR-2.2:** A "Download PDF" button must be present. This action will use `html2canvas` and `jsPDF` to generate a high-quality, multi-page A4 PDF of the report content and trigger a browser download.

### 2.3. Report Specifications

#### 2.3.1. Course Attainment Summary
-   **Required Filters:** `Course`, `Scope`.
-   **Content:**
    1.  **Header:** University logo, report title, and metadata (Program, Batch, Course, Scope, Faculty Name).
    2.  **Section 1: Overall CO Attainment:** A summary table showing each CO, its description, the percentage of students who met the target, and the final calculated Attainment Level (0-3).
    3.  **Section 2: Student-wise Breakdown:** A detailed table with students as rows and COs as columns. Each cell must show the student's attainment percentage for that CO, colored green if it meets the course target and red if it does not.

#### 2.3.2. Assessment Comparison Report
-   **Required Filters:** `Course`.
-   **Content:**
    1.  **Header:** Same as above.
    2.  **Main Table:** A comparison table with students as rows and all assessments for the course/scope as columns. Each cell must display the student's final percentage score for that specific assessment.

---

## 3. How-To Guide: Generating Reports

This guide explains how to use the "Attainment Reports" page.

### Step 1: Select a Report Type
Navigate to the **`Reports`** page. The top section displays tiles for each available report. Click on the tile corresponding to the report you need (e.g., "Course Attainment Summary").

### Step 2: Set Your Filters
Once a report type is selected, the filter dropdowns will become active.
-   **Course:** Select the specific course you want to analyze.
-   **Scope:** Choose whether you want the report to cover the **Overall Course** (all students in the batch) or a specific **Section**.

### Step 3: Generate and Download
1.  Click the large **"Generate Report"** button.
2.  A full-screen preview of your report will appear. Scroll through to review the data and layout.
3.  If you are satisfied, click the **"Download PDF"** button in the top-right corner.
4.  Your browser will prompt you to save the generated PDF file.
5.  Click **"Close"** to exit the preview.
