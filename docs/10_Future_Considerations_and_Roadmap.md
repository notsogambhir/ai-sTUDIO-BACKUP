# PRD 10: Future Considerations and Roadmap

This document outlines potential future enhancements, technical improvements, and a possible roadmap for the NBA OBE Portal beyond its initial implementation. These items are intended for consideration in future development cycles.

## 1. Proposed Future Features (Phase 2)

### 1.1. Advanced Analytics & Visualization
-   **Description:** Move beyond tabular data to provide rich, interactive visualizations.
-   **Ideas:**
    -   **Trend Analysis:** Charts showing PO/CO attainment trends over multiple academic years or batches.
    -   **Comparative Analysis:** Compare the performance of different sections for the same course.
    -   **"What-If" Scenarios:** A tool for PCs to simulate how changes in course targets or CO-PO mapping might affect overall PO attainment.

### 1.2. Automated Notifications and Reminders
-   **Description:** Implement a system to proactively notify users of important deadlines and required actions.
-   **Ideas:**
    -   Email or in-app notifications to teachers when assessment marks are due.
    -   Reminders to PCs to complete CO-PO mapping for new courses.
    -   Alerts to Admins or Department Heads about courses with consistently low attainment levels.

### 1.3. Direct Integration with University Systems
-   **Description:** Reduce manual data entry by integrating with existing university platforms.
-   **Ideas:**
    -   **Student Information System (SIS) Integration:** Automatically sync student lists, enrollments, and section assignments instead of relying on manual uploads.
    -   **Learning Management System (LMS) Integration:** Pull gradebook data directly from platforms like Moodle or Blackboard to automate the marks entry process.

### 1.4. Enhanced Indirect Attainment Module
-   **Description:** Expand the simple input fields for indirect attainment into a full-fledged survey tool.
-   **Ideas:**
    -   Ability to create and distribute surveys (e.g., course exit surveys, alumni surveys) directly from the portal.
    -   Automatically correlate survey questions to POs and aggregate the results into the indirect attainment score.

## 2. Technical and UX Improvements

### 2.1. Full Mobile Responsiveness
-   **Problem:** The current application uses a fixed layout with CSS `transform: scale()` to fit on smaller screens. This is not a true responsive design and provides a poor mobile experience.
-   **Solution:** Refactor the entire UI using responsive design principles (flexbox, grid, media queries) to ensure the application is natively usable and aesthetically pleasing on tablets and mobile devices.

### 2.2. Native PDF Generation
-   **Problem:** The current PDF download feature relies on `html2canvas` to take a "screenshot" of the report, which can sometimes result in suboptimal quality and layout issues.
-   **Solution:** Implement a server-side PDF generation library (like WeasyPrint in Python) or a more robust client-side library that builds the PDF from data rather than an image. This would produce higher-quality, text-selectable, and more professional documents.

### 2.3. Codebase Refactoring
-   **Technical Debt:** Some components, particularly those involving complex calculations (`POAttainmentDashboard`, `CourseCoAttainment`), are large and contain significant business logic within the UI layer.
-   **Solution:**
    -   Extract complex calculation logic into dedicated custom hooks to separate concerns and improve reusability and testability.
    -   Break down large components into smaller, more focused child components.
    -   Conduct a full audit to remove deprecated and unused files (e.g., `AddCourseModal`, `SettingsScreen`) to clean up the codebase.

## 3. Potential Roadmap

| Phase | Focus | Key Initiatives |
| :--- | :--- | :--- |
| **Phase 1 (Current)** | Core Functionality & MVP | - Implement backend API & database. <br> - Refactor frontend to use live API. <br> - Achieve functional parity with the mock data version. |
| **Phase 2** | User Experience & Analytics | - Implement full mobile responsiveness. <br> - Introduce the Advanced Analytics & Visualization dashboard. <br> - Begin work on the Notification System. |
| **Phase 3** | Integration & Automation | - Integrate with a university SIS for student data synchronization. <br> - Implement the Enhanced Indirect Attainment/Survey module. |
| **Phase 4** | Advanced Workflows | - Integrate with an LMS for gradebook synchronization. <br> - Develop the "What-If" analysis tool for curriculum planning. |
