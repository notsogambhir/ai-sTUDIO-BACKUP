# PRD 11: UI Design System and Component Library

This document specifies the visual design language, user interface (UI) components, and user experience (UX) principles for the NBA OBE Portal. It serves as a guide for developers to ensure a consistent, intuitive, and professional user interface across the entire application.

---

## 1. Design Philosophy & Principles

The UI/UX of the portal is guided by the following core principles:

-   **Clarity and Focus:** The primary goal is to present complex academic data in a clear and understandable manner. Dashboards, tables, and forms must be easy to read at a glance. Visual clutter is to be minimized, with a strong emphasis on data hierarchy.

-   **Professionalism and Trust:** The aesthetic is clean, modern, and professional, reflecting the serious nature of academic accreditation. The branding is inspired by Chitkara University's identity, using a primary color palette of reds and deep blues to convey authority and reliability.

-   **Consistency and Predictability:** UI elements, interaction patterns, and terminology must be consistent throughout the application. A user should be able to predict how an element will behave based on its appearance, which reduces the cognitive load and makes the application easier to learn.

-   **Role-Awareness:** The UI must clearly adapt to the user's role. Elements that are not relevant or permitted for a given user should be hidden or disabled, not just error-out on click. This simplifies the interface for each user, showing them only what they need to see.

-   **Efficiency and Workflow Optimization:** Workflows, especially those involving repetitive data entry (like managing outcomes or assigning faculty), should be streamlined. Features like bulk upload, inline editing, and draft states with a single save action are implemented to make users more efficient.

---

## 2. Color Palette

The color palette is designed for clarity, branding, and accessibility.

| Type | Color Name | Hex Code | Usage |
| :--- | :--- | :--- | :--- |
| **Primary (Brand)** | `Red-600` | `#DC2626` | Login button, primary branding elements, highlights. |
| **Primary (Action)** | `Indigo-600` | `#4F46E5` | Secondary actions (Add, Create), links, focus rings. |
| **Accent** | `Blue-500` | `#3B82F6` | Active navigation links, highlighting statistical data. |
| **Feedback: Success**| `Green-600` | `#16A34A` | Save buttons, success messages, 'Active' status, positive attainment. |
| **Feedback: Warning** | `Yellow-500`| `#EAB308` | 'Pending' status, confirmation modals for non-destructive actions. |
| **Feedback: Error** | `Red-600` | `#DC2626` | Error messages, delete actions, 'Inactive' status, negative attainment. |
| **Neutrals** | `Gray-800` | `#1F2937` | Main body text, titles. |
| | `Gray-600` | `#4B5563` | Secondary text, labels. |
| | `Gray-500` | `#6B7280` | Tertiary text, placeholders, icons. |
| | `Gray-200` | `#E5E7EB` | Borders, dividers. |
| | `Gray-100` | `#F3F4F6` | Main page background. |
| | `Gray-50` | `#F9FAFB` | Light backgrounds for table headers, cards, and hover states. |
| | `White` | `#FFFFFF` | Main content background for cards, modals, and sidebars. |

---

## 3. Typography

-   **Font Family:** System default `sans-serif` (`font-sans`). This ensures a clean, modern look that is native to the user's operating system.
-   **Headings:**
    -   `h1` (Page Titles): `text-3xl font-bold text-gray-800`
    -   `h2` (Section Titles): `text-xl font-semibold text-gray-700`
    -   `h3` (Card/Modal Titles): `text-lg font-bold text-gray-800`
-   **Body Text:** `text-base text-gray-800` (for paragraphs and general content).
-   **Labels & Metadata:** `text-sm font-medium text-gray-700` (for form labels) or `text-sm text-gray-600` (for descriptions).
-   **Buttons:** `font-bold` or `font-semibold` depending on hierarchy.

---

## 4. Iconography

-   **Style:** Feather Icons (outline, stroke-based). The style is clean, modern, and easily recognizable.
-   **Implementation:** All icons are centralized in **`components/Icons.tsx`** as functional SVG components.
-   **Usage:** Icons provide quick visual cues for navigation links, actions (edit, delete, upload), and statistical cards. They must always be accompanied by a text label or a `title` attribute for accessibility.

---

## 5. Component Library

This section details the visual specifications and behavior of key reusable UI components.

### 5.1. Buttons

-   **Primary Action (Red):**
    -   **Appearance:** Solid red background (`bg-red-600`), white text.
    -   **Usage:** Reserved for the single most important action on a page, typically a final confirmation or login.
-   **Secondary Action (Indigo/Green):**
    -   **Appearance:** Solid indigo (`bg-indigo-600`) or green (`bg-green-600`) background, white text.
    -   **Usage:** For standard positive actions like "Add", "Create", "Upload", "Generate Report".
-   **Tertiary/Link Style:**
    -   **Appearance:** Plain text, colored `text-indigo-600`.
    -   **Usage:** For actions within a table row or text, like "Manage" or "View Details".
-   **Neutral/Cancel:**
    -   **Appearance:** Light gray background (`bg-gray-200`), dark gray text.
    -   **Usage:** For "Cancel" actions in modals or forms.
-   **Behavior:** All buttons must have a `hover` state that slightly darkens the background color. Disabled buttons have a lighter, faded appearance and a `cursor-not-allowed` pointer.

### 5.2. Forms & Inputs

-   **Text Input / Select:**
    -   **Appearance:** White background, light gray border (`border-gray-300`), rounded corners.
    -   **Behavior:** On focus, displays a blue ring (`focus:ring-indigo-500`) to indicate the active field.
-   **Labels:** Always positioned above their corresponding input field, using `text-sm font-medium text-gray-700`.

### 5.3. Modals

-   **Standard (`Modal.tsx`):**
    -   **Appearance:** A semi-transparent black overlay covering the page. A centered, white, rounded card with a shadow.
    -   **Structure:** A header with the title and a close ('X') button, followed by a content area.
    -   **Behavior:** Clicking the overlay or the 'X' button closes the modal.
-   **Confirmation (`ConfirmationModal.tsx`):**
    -   **Appearance:** A smaller version of the standard modal.
    -   **Structure:** Title, a descriptive message, a "Cancel" button, and a "Confirm" button (typically styled as a destructive red button).

### 5.4. Tables

-   **Header (`thead`):** Light gray background (`bg-gray-50`) with uppercase, medium gray (`text-gray-500`) text for column titles.
-   **Rows (`tbody tr`):** White background with a `hover:bg-gray-50` state for visual feedback. Rows are separated by a light gray border (`divide-y divide-gray-200`).
-   **Density:** Padding should be generous for readability (`px-6 py-4`). For reports intended for printing, padding is reduced (`p-2`).

### 5.5. Cards

-   **Stat Card (`StatCard.tsx`):** White background, rounded corners, `shadow-md`. Contains a colored circle with an icon, a title (`text-gray-500`), and a large numeric value (`text-2xl font-bold`).
-   **Program Selection Card:** White background, rounded (`rounded-xl`), `shadow-md`. Has a `hover` effect that lifts the card (`hover:-translate-y-1`) and increases its shadow (`hover:shadow-xl`).
-   **General Content Card:** The standard container for most page content. White background, `rounded-lg`, `shadow-md`.

### 5.6. Navigation

-   **Sidebar (`Sidebar.tsx`):**
    -   **Active Link:** Solid blue background (`bg-blue-500`), white text, and a slight shadow to make it pop.
    -   **Inactive Link:** Gray text, transparent background, with a light gray background on hover.
-   **Tabs (`CourseDetail.tsx`):**
    -   **Active Tab:** Indigo text (`text-indigo-600`) with a solid indigo border underneath (`border-indigo-500`).
    -   **Inactive Tab:** Gray text (`text-gray-500`) with a transparent border that turns light gray on hover.

### 5.7. Feedback Elements

-   **Save Bar (`SaveBar.tsx`):** A bar fixed to the bottom of the viewport. It has a dark, semi-transparent, blurred background (`backdrop-blur-sm`) to separate it from the content. It contains a "Cancel" (gray) and "Save Changes" (green) button. It only appears when there are unsaved changes.
-   **Status Tags:** Small, rounded pills (`rounded-full`) with a light background and corresponding text color (e.g., `bg-green-100 text-green-800` for "Active"). Used to show status in tables.
-   **Error Messages:** Displayed in red text (`text-red-600`), usually below the form field that has an error.