# PRD 10: Roadmap and Future Considerations

This document outlines potential future enhancements, technical improvements, and a possible roadmap for the NBA OBE Portal beyond its initial implementation.

---

## 1. Proposed Future Features (Phase 2 & Beyond)

### 1.1. Advanced Analytics & Visualization
-   **Description:** Move beyond tabular data to provide rich, interactive visualizations.
-   **Ideas:**
    -   **Trend Analysis:** Charts showing PO/CO attainment trends over multiple academic years.
    -   **Comparative Analysis:** Side-by-side performance comparison of different sections for the same course.
    -   **"What-If" Scenarios:** A tool for PCs to simulate how changes in course targets or CO-PO mapping might affect overall PO attainment.

### 1.2. Automated Notifications and Reminders
-   **Description:** Implement a system to proactively notify users of important deadlines and required actions.
-   **Ideas:**
    -   Email or in-app notifications to teachers when assessment marks are due.
    -   Reminders to PCs to complete CO-PO mapping for new courses.
    -   Alerts about courses with consistently low attainment levels.

### 1.3. Direct Integration with University Systems
-   **Description:** Reduce manual data entry by integrating with existing university platforms.
-   **Ideas:**
    -   **Student Information System (SIS) Integration:** Automatically sync student lists, enrollments, and section assignments.
    -   **Learning Management System (LMS) Integration:** Pull gradebook data directly from platforms like Moodle or Blackboard to automate marks entry.

### 1.4. Enhanced Indirect Attainment Module
-   **Description:** Expand the simple input fields for indirect attainment into a full-fledged survey tool.
-   **Ideas:**
    -   Ability to create and distribute surveys (e.g., course exit surveys, alumni surveys) directly from the portal.
    -   Automatically correlate survey questions to POs and aggregate the results.

---

## 2. Technical and UX Improvements

### 2.1. Full Mobile Responsiveness
-   **Problem:** The current application uses a fixed layout with CSS `transform: scale()`, which is not truly responsive.
-   **Solution:** Refactor the entire UI using responsive design principles (flexbox, grid, media queries) to ensure the application is natively usable on tablets and mobile devices.

### 2.2. Native PDF Generation
-   **Problem:** The current `html2canvas` approach creates image-based PDFs, which can have quality issues and are not text-selectable.
-   **Solution:** Implement a server-side PDF generation library (like WeasyPrint) or a more robust client-side library that builds the PDF from data, producing higher-quality, professional documents.

### 2.3. Codebase Refactoring & Cleanup
-   **Technical Debt:** Some components contain complex calculation logic that should be extracted into dedicated custom hooks for better separation of concerns, reusability, and testability.
-   **Action:** Conduct a full audit to refactor large components and remove all deprecated/unused files (e.g., `AddCourseModal`, `SettingsScreen`, `UserManagement.tsx`).

---

## 3. Potential Development Roadmap

| Phase | Focus | Key Initiatives |
| :--- | :--- | :--- |
| **Phase 1 (Current)** | Core Functionality & MVP | - Implement backend API & database. <br> - Refactor frontend to use live API. <br> - Achieve functional parity with the mock data version. |
| **Phase 2** | User Experience & Analytics | - Implement full mobile responsiveness. <br> - Introduce the Advanced Analytics & Visualization dashboard. <br> - Begin work on the Notification System. |
| **Phase 3** | Integration & Automation | - Integrate with a university SIS for student data synchronization. <br> - Implement the Enhanced Indirect Attainment/Survey module. |
| **Phase 4** | Advanced Workflows | - Integrate with an LMS for gradebook synchronization. <br> - Develop the "What-If" analysis tool for curriculum planning. |
