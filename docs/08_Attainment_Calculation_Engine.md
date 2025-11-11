# PRD 8: Attainment Calculation Engine

This document provides a detailed technical specification for the core business logic of the NBA OBE Portal: the automated attainment calculation engine. The formulas and processes described herein must be implemented precisely to ensure accurate and compliant reporting.

---

## 1. Overview

The calculation is a three-tiered process:
1.  **Tier 1: Student-Level CO Attainment:** Calculating an individual student's performance for each CO.
2.  **Tier 2: Course-Level CO Attainment:** Aggregating student performance to determine the overall class attainment level for each CO.
3.  **Tier 3: Program-Level PO Attainment:** Aggregating course-level data to determine the final attainment for each PO.

---

## 2. Tier 1: Student CO Attainment Calculation

This is the most granular calculation.

-   **Objective:** To determine a single student's percentage achievement for a single Course Outcome (CO) within a course.
-   **Inputs:**
    -   `Student ID`
    -   `Course ID`
    -   `CO ID`
    -   All `Assessments` for the course's sections.
    -   All `Marks` for the student.
-   **Process:**
    1.  Identify all `AssessmentQuestions` across all `Assessments` for the course that are mapped to the given `CO ID`.
    2.  For the given `Student ID`, find all their `MarkScores` for the questions identified in step 1.
    3.  Calculate `TotalObtainedCoMarks`: Sum the `marks` from all found `MarkScores`.
    4.  Calculate `TotalMaxCoMarks`: Sum the `maxMarks` from all `AssessmentQuestions` identified in step 1 for which the student has a corresponding mark entry (i.e., the question was part of an attempted assessment).
-   **Formula:**
    ```
    Student CO Attainment % = (TotalObtainedCoMarks / TotalMaxCoMarks) * 100
    ```
-   **Edge Case:** If `TotalMaxCoMarks` is 0 (i.e., the student attempted no questions related to this CO), the attainment is 0%.

---

## 3. Tier 2: Course CO Attainment Calculation

This calculation determines the overall class performance for a single CO.

-   **Objective:** To determine the final attainment level (0, 1, 2, or 3) for a single CO.
-   **Inputs:**
    -   `CO ID`
    -   The set of `Students` in the calculation scope (either a specific section or the entire course).
    -   The `Course.target` percentage.
    -   The `Course.attainmentLevels` thresholds.
-   **Process:**
    1.  For each `Student` in the scope, calculate their `Student CO Attainment %` using the Tier 1 logic.
    2.  Initialize `StudentsMeetingTarget` counter to 0.
    3.  Iterate through each student: If their `Student CO Attainment %` is >= `Course.target`, increment `StudentsMeetingTarget`.
    4.  Calculate the percentage of the class that met the target.
-   **Formula (Part 1):**
    ```
    Percentage Meeting Target = (StudentsMeetingTarget / Total Students in Scope) * 100
    ```
-   **Formula (Part 2 - Final Level):**
    ```
    if (Percentage Meeting Target >= Course.attainmentLevels.level3) { return 3; }
    else if (Percentage Meeting Target >= Course.attainmentLevels.level2) { return 2; }
    else if (Percentage Meeting Target >= Course.attainmentLevels.level1) { return 1; }
    else { return 0; }
    ```

---

## 4. Tier 3: Program Outcome (PO) Attainment Calculation

This is the final aggregation that determines the achievement of program-level goals.

### 4.1. Direct PO Attainment
-   **Objective:** To calculate the PO attainment based on aggregated course performance.
-   **Inputs:**
    -   `PO ID`
    -   All `Course CO Attainment Levels` (from Tier 2) for all active/completed courses in the program.
    -   The entire `CoPoMapping` table.
-   **Process:**
    1.  Identify all `CoPoMapping` entries where `poId` matches the target `PO ID`.
    2.  Initialize `WeightedSum` = 0 and `TotalWeight` = 0.
    3.  For each mapping found:
        -   Get the `Course CO Attainment Level` for the `coId` in the mapping.
        -   Get the `level` (1, 2, or 3) from the mapping entry.
        -   `WeightedSum += (CO Attainment Level * Mapping Level)`
        -   `TotalWeight += Mapping Level`
-   **Formula:**
    ```
    Direct PO Attainment = WeightedSum / TotalWeight
    ```
-   **Edge Case:** If `TotalWeight` is 0, Direct PO Attainment is 0. The result should be rounded to two decimal places.

### 4.2. Overall PO Attainment
-   **Objective:** To combine direct (calculated) and indirect (manual) data.
-   **Inputs:**
    -   `Direct PO Attainment` value.
    -   `Indirect PO Attainment` value (a manually entered number from 0-3).
    -   `Direct Weight %` and `Indirect Weight %` (from system/dashboard settings).
-   **Formula:**
    ```
    Overall PO Attainment = (Direct PO Attainment * (Direct Weight / 100)) + (Indirect PO Attainment * (Indirect Weight / 100))
    ```
-   **Default:** If no `Indirect PO Attainment` value is entered for a PO, it should default to `3` for the calculation.
