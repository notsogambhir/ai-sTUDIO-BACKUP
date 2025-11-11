# PRD 9: Technical Requirements and Data Model

This document outlines the technical specifications, data model, and non-functional requirements for the NBA OBE Portal.

## 1. Data Model

The application's data is structured around a set of core entities. The relationships are defined below, mirroring the structure in `types.ts` and the `schema.sql.txt`.

### Core Entities

-   **`User`**: Represents a person using the system. Has a `role` that determines permissions. Can be linked to other entities based on role (e.g., a PC is linked to a `Program`, a Teacher is linked to `PCs`).
-   **`College`**: The highest level of academic organization (e.g., "College of Engineering").
-   **`Program`**: An academic program (e.g., "BE ECE") that belongs to a single `College`.
-   **`Batch`**: A specific cohort of students for a program, defined by a start and end year (e.g., "2025-2029"). Belongs to a single `Program`.
-   **`Section`**: A specific class group within a `Batch` (e.g., "Section A").
-   **`Course`**: A subject taught within a `Program`.
-   **`Student`**: A student enrolled in a `Program` and assigned to a `Section`.
-   **`Enrollment`**: A junction entity that links a `Student` to a `Course`.
-   **`CourseOutcome (CO)`**: A specific learning outcome for a `Course`.
-   **`ProgramOutcome (PO)`**: A broad graduate attribute for a `Program`.
-   **`CoPoMapping`**: A junction entity linking a `CO` to a `PO` with a correlation `level` (1, 2, or 3).
-   **`Assessment`**: A test or exam given to a specific `Section`. Contains a list of `AssessmentQuestions`.
-   **`AssessmentQuestion`**: A single question within an `Assessment`, mapped to one or more `COs`.
-   **`Mark`**: A record of a `Student`'s scores for all questions in a single `Assessment`.

## 2. Technology Stack (Frontend)

-   **Framework:** React
-   **Language:** TypeScript
-   **Styling:** TailwindCSS
-   **Routing:** React Router (`HashRouter`)
-   **Charting:** Chart.js
-   **Client-side Data Files:**
    -   SheetJS (`xlsx`) for Excel parsing.
    -   jsPDF & html2canvas for PDF generation.

## 3. Backend Integration

-   **FR-TR-1.1:** The frontend application must be refactored to consume a live RESTful API instead of the static `mockData.json` file.
-   **FR-TR-1.2:** All data mutation operations (Create, Update, Delete) currently performed via `setData` must be replaced with corresponding API calls (e.g., `POST`, `PATCH`, `DELETE`).
-   **FR-TR-1.3:** The application must implement a robust authentication flow, storing a session token upon successful login and including it in the headers of all subsequent API requests.
-   **FR-TR-1.4:** The backend architecture, endpoints, and database schema shall follow the specifications laid out in the `backend_guide.md` and `schema.sql.txt` documents.

## 4. Non-Functional Requirements (NFRs)

### 4.1. Performance
-   **NFR-P1:** The initial application load (after login) should be visually complete within 3 seconds on a standard broadband connection.
-   **NFR-P2:** All UI interactions (e.g., opening modals, switching tabs) should respond in under 200ms.
-   **NFR-P3:** Complex calculations for reports and dashboards should complete and render in under 5 seconds for a typical program size (e.g., 5 programs, 20 courses, 200 students). The frontend should utilize memoization (`useMemo`) for all expensive calculations to prevent re-computation on unnecessary re-renders.

### 4.2. Usability & Accessibility
-   **NFR-U1:** The application must be usable on all modern desktop web browsers (Chrome, Firefox, Edge, Safari).
-   **NFR-U2:** The UI should be intuitive, with clear labels and consistent design patterns.
-   **NFR-U3:** All interactive elements (buttons, inputs) must have appropriate ARIA attributes and be navigable via keyboard.
-   **NFR-U4:** The current implementation uses CSS `transform: scale(0.75)` for display. A future iteration should refactor this to a fully responsive design that works natively on various screen sizes.

### 4.3. Security
-   **NFR-S1:** User passwords must never be stored in plaintext.
-   **NFR-S2:** The application must enforce strict role-based access control on the **backend**. The frontend should hide UI elements, but the API must be the ultimate gatekeeper, rejecting any unauthorized requests.
-   **NFR-S3:** All communication between the client and server must be over HTTPS in a production environment.

### 4.4. Maintainability
-   **NFR-M1:** The codebase must adhere to standard React and TypeScript best practices.
-   **NFR-M2:** All major components, functions, and complex logic blocks should be documented with JSDoc comments explaining their purpose, props, and behavior.
-   **NFR-M3:** Large, monolithic components should be broken down into smaller, reusable components and custom hooks where appropriate.
