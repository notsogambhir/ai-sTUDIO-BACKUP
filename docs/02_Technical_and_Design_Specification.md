# PRD 2: Technical and Design Specification

This document outlines the technical specifications, data model, non-functional requirements, visual design language, and UI component library for the NBA OBE Portal. It serves as a comprehensive handbook for the development team.

---

## 1. Technical Requirements

### 1.1. Technology Stack (Frontend)
-   **Framework:** React
-   **Language:** TypeScript
-   **Styling:** TailwindCSS
-   **Routing:** React Router (`HashRouter`)
-   **Client-side Data Files:**
    -   SheetJS (`xlsx`) for Excel parsing.
    -   jsPDF & html2canvas for PDF generation.

### 1.2. Backend Integration
-   The frontend must consume a live RESTful API, replacing the static `mockData.json`.
-   All `setData` calls must be replaced with API calls (`POST`, `PATCH`, `DELETE`).
-   An authentication flow storing a session token must be implemented.
-   Backend architecture shall follow the `backend_guide.md`.

### 1.3. Non-Functional Requirements (NFRs)
-   **Performance:** Initial load < 3s; UI interactions < 200ms; Complex calculations < 5s.
-   **Accessibility:** The application must be usable on modern browsers and be keyboard navigable with appropriate ARIA attributes.
-   **Security:** Passwords must be hashed. Access control must be enforced on the backend.
-   **Maintainability:** Code must adhere to best practices and be well-documented with JSDoc comments.

---

## 2. Data Model

The application's data is structured around a set of core entities defined in `types.ts` and `schema.sql.txt`. Key entities include `User`, `College`, `Program`, `Batch`, `Section`, `Course`, `Student`, `Enrollment`, `CourseOutcome (CO)`, `ProgramOutcome (PO)`, `CoPoMapping`, `Assessment`, and `Mark`.

---

## 3. UI Design System

### 3.1. Design Philosophy
-   **Clarity and Focus:** Present complex data in a clear, understandable manner. Minimize visual clutter.
-   **Professionalism and Trust:** A clean, modern aesthetic reflecting the brand identity.
-   **Consistency and Predictability:** UI elements and interaction patterns must be consistent.
-   **Role-Awareness:** The UI must adapt to the user's role, hiding or disabling irrelevant elements.
-   **Efficiency:** Streamline workflows with features like bulk upload, inline editing, and draft states.

### 3.2. Color Palette
| Type | Color Name | Hex Code | Usage |
| :--- | :--- | :--- | :--- |
| **Primary (Brand)** | `Red-600` | `#DC2626` | Login button, primary branding. |
| **Primary (Action)** | `Indigo-600` | `#4F46E5` | Secondary actions (Add, Create), links. |
| **Accent** | `Blue-500` | `#3B82F6` | Active navigation, highlights. |
| **Feedback: Success**| `Green-600` | `#16A34A` | Save buttons, success messages, 'Active' status. |
| **Feedback: Error** | `Red-600` | `#DC2626` | Error messages, delete actions, 'Inactive' status. |
| **Neutrals** | `Gray-800` | `#1F2937` | Main body text, titles. |
| | `Gray-100` | `#F3F4F6` | Main page background. |
| | `White` | `#FFFFFF` | Main content background. |

### 3.3. Typography
-   **Font Family:** System default `sans-serif`.
-   **Headings:** `h1` (3xl, bold), `h2` (xl, semibold), `h3` (lg, bold).
-   **Body Text:** `text-base text-gray-800`.

### 3.4. Component Library
-   **Buttons:** Differentiated by primary (red), secondary (indigo/green), tertiary (link), and neutral (gray) styles. All have hover and disabled states.
-   **Forms & Inputs:** White background, light gray border, rounded corners, with an indigo focus ring.
-   **Modals:** Standard and Confirmation variants, using an overlay and a centered white card.
-   **Tables:** Light gray headers, white rows with hover states, and clear dividers.
-   **Cards:** The primary container for content, using `bg-white`, `rounded-lg`, and `shadow-md`.
-   **Navigation:** Specific active/inactive styles for Sidebar links and Course Detail tabs.
-   **Feedback Elements:** A fixed `SaveBar` for unsaved changes, and colored "pills" for status tags.
