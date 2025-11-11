# File Guide: NBA OBE Portal

This guide provides a simple explanation for each file in the project, helping you understand the overall structure and purpose of the codebase.

---

### Core Application Files

- **`index.html`**: This is the front door to our entire application. It's the first file the web browser opens. It contains the basic structure of the page, loads the necessary styles and scripts (like TailwindCSS, SheetJS for Excel, and jsPDF for downloads), and provides the main `<div id="root"></div>` element where our entire React application will live.

- **`index.tsx`**: This is the "starter" for our React application. It finds the `root` element from `index.html` and tells React to render our main `App` component inside it. It also wraps the `App` in an `AppProvider`, which is like giving the entire application a magic backpack full of shared data that any component can access.

- **`App.tsx`**: This file is the main traffic controller or "brain" of the app. It uses `react-router-dom` (the app's GPS) to decide which page to show the user based on the URL in their browser's address bar and whether they are logged in. It protects pages from being accessed by users who aren't logged in.

- **`types.ts`**: This is the dictionary or "rulebook" for all the data in our application. It defines the exact shape and structure of everything, like what a `User` looks like (it has an `id`, a `name`, a `role`, etc.) or what a `Course` is. This helps prevent bugs by ensuring our data is always consistent.

- **`metadata.json`**: This file provides basic information about the web application, such as its name and description.

- **`mockData.json`**: This file acts as our temporary, fake database. It contains all the sample data (users, courses, students, etc.) that the application uses. In a real-world scenario, this data would come from a real backend server.

### Context (Shared Data)

- **`context/AppContext.tsx`**: This file creates the "magic backpack" (React Context) for our app. It's responsible for:
    1. Loading the initial data from `mockData.json`.
    2. Keeping track of the currently logged-in user.
    3. Remembering which program and batch the user has selected.
    4. Providing functions that any component can use, like `login()`, `logout()`, and `setProgramAndBatch()`.

- **`hooks/useAppContext.ts`**: This is a simple helper file that makes it easy for other components to access the "magic backpack" (the `AppContext`) without writing a lot of boilerplate code.

### Main Layout Components

- **`components/MainLayout.tsx`**: This defines the main visual structure for most pages in the app. It creates the layout that has the `Sidebar` on the left and the `Header` at the top, and then places the main page content in the remaining space.

- **`components/Sidebar.tsx`**: This is the navigation menu on the left side of the screen. It shows different menu items based on the logged-in user's role. For high-level users (like Admins), it also includes dropdowns to select a college, program, and batch, which filters the data for the entire app.

- **`components/Header.tsx`**: This is the bar at the top of the page. It displays the name of the currently selected program and batch, shows information about the logged-in user, and contains the "Logout" button.

### Reusable UI Components

- **`components/Icons.tsx`**: A collection of all the small icon images (like the graduation cap, book, and trash can) used throughout the application. This keeps them organized in one place.
- **`components/Modal.tsx`**: A reusable "popup" window component. Other components can use it to show content on top of the current page.
- **`components/ConfirmationModal.tsx`**: A specific type of modal used to ask the user "Are you sure?" before performing a dangerous action, like deleting something.
- **`components/BatchSelectionModal.tsx`**: The popup that appears after a user selects a program, asking them to choose a specific batch year.
- **`components/ExcelUploader.tsx`**: A reusable button component that allows users to upload Excel files. It handles the logic for reading the file and converting its contents into data the app can use.
- **`components/SaveBar.tsx`**: The bar that appears at the bottom of the screen whenever the user has made unsaved changes on a page, reminding them to save or cancel.
- **`components/StatCard.tsx`**: The small "widget" cards seen on the Dashboard, used to display a single statistic (like "Total Students") with a number and an icon.
- **`components/TeacherDashboard.tsx`**: A dedicated dashboard view for users with the 'Teacher' role, showing their assigned courses and other relevant information.
- **`components/PrintableReport.tsx`**: A reusable component that displays report content in a full-screen "print preview" modal and provides a button to download the content as a PDF.

### Page Components (`pages/`)

These files represent the main screens or pages of the application.

- **`pages/LoginScreen.tsx`**: The first screen a user sees. It displays the login form for entering a username and password.
- **`pages/ProgramSelectionScreen.tsx`**: For users who need to choose a program before starting (like Teachers and Program Co-ordinators), this screen shows a grid of available programs to select from.
- **`pages/Dashboard.tsx`**: The main landing page after logging in. It's a "smart" component that shows the `TeacherDashboard` for teachers and a statistical view for all other roles.
- **`pages/CoursesList.tsx`**: A page for viewing and managing all courses. It allows users to see courses by status (Active, Future, Completed) and, for certain roles, to add new courses or assign teachers.
- **`pages/CourseDetail.tsx`**: The central hub for managing a single course. It uses a tabbed interface to switch between different management screens for that course.
- **`pages/StudentsList.tsx`**: A page for viewing and managing students within a program. It includes features for searching, adding, and changing the status of students.
- **`pages/ProgramOutcomesList.tsx`**: A page dedicated to managing the Program Outcomes (POs) for a selected program. It also includes the main PO Attainment Dashboard.
- **`pages/TeacherManagement.tsx`**: A screen for Program Co-ordinators and Department Heads to view the teachers they manage.
- **`pages/TeacherDetails.tsx`**: A dashboard view for a specific teacher, showing the courses they are assigned to and their performance.
- **`pages/DepartmentStudentManagement.tsx`**: A specialized page for Department Heads to manage student sections and assignments across different programs and batches within their college.
- **`pages/DepartmentFacultyManagement.tsx`**: A specialized page for Department Heads to manage faculty assignments (assigning Program Co-ordinators to programs and teachers to Co-ordinators).
- **`pages/AdminPanel.tsx`**: The main container for the Administrator's tools. It switches between different admin views based on the sidebar navigation.
- **`pages/AttainmentReports.tsx`**: An interactive dashboard for generating printable PDF reports. It uses a tile-based interface to select a report type and provides contextual controls for filtering.
- **`pages/StudentCOAttainmentReport.tsx`**: A detailed report showing the Course Outcome (CO) attainment percentage for every student in a specific course. It can act as a standalone page or be embedded in a print preview.

### Course-Specific Components (`components/`)

These components are used within the `CourseDetail` page.

- **`components/CourseOverviewTab.tsx`**: The "Overview" tab in `CourseDetail`, where users can view and edit general course settings like the attainment target and weightages.
- **`components/ManageCourseOutcomes.tsx`**: The "COs" tab, where users can add, edit, and delete the Course Outcomes for a course.
- **`components/ManageCourseAssessments.tsx`**: The "Assessments" tab, which allows users to create and manage tests and assignments for different class sections.
- **`components/AssessmentDetails.tsx`**: A detailed view for managing a single assessment, including adding questions, mapping them to COs, and uploading student marks.
- **`components/CoPoMappingMatrix.tsx`**: The "CO-PO Mapping" tab, displaying a table where users can define the relationship between each Course Outcome (CO) and Program Outcome (PO).
- **`components/CourseCoAttainment.tsx`**: The "CO Attainments" tab, which calculates and displays the final attainment level for each Course Outcome based on student performance.
- **`components/CourseFacultyAssignment.tsx`**: The "Faculty Assignment" tab, allowing Program Co-ordinators or Admins to assign a single teacher to the entire course or different teachers to different sections.
- **`components/CoursePoLinkageDashboard.tsx`**: A dashboard on the Program Outcomes page that shows how strongly each course contributes to the Program Outcomes.

### Admin-Specific Components (`components/admin/`)

- **`components/admin/AdminAcademicStructureTab.tsx`**: The screen for Admins to manage the core structure of the institution, including creating and deleting Colleges, Programs, and Batches.
- **`components/admin/AdminUserManagementTab.tsx`**: The screen for Admins to create, edit, and delete all users in the system and manage their roles and assignments.
- **`components/admin/AdminSystemSettingsTab.tsx`**: The screen for Admins to change system-wide default values, such as the default attainment target for new courses.
- **`components/admin/UserEditModal.tsx`**: The popup form used by the User Management tab to create or edit a user.

### Report Components (`components/reports/`)

- **`components/reports/CourseAttainmentSummaryReport.tsx`**: A detailed, printable report for teachers that includes a professional header, an overall CO attainment summary, and a student-wise performance breakdown.
- **`components/reports/AssessmentComparisonReport.tsx`**: A detailed, printable report that provides a side-by-side comparison of student performance across all assessments for a course.

---

### Backend & Documentation

- **`backend_guide.md`**: A technical document outlining the plan and requirements for building a real backend server (using Django) to replace the `mockData.json` file.
- **`changelog.md`**: A log that keeps track of major changes and new features added to the application over time.
- **`flowchart.md`**: A visual diagram (using Mermaid) that shows the application's overall structure, user flow, and component relationships.
- **`schema.sql.txt`**: A SQL file containing `CREATE TABLE` statements to build a PostgreSQL database that matches the application's data structure.
- **`data_insertion.sql.txt`**: A SQL file containing `INSERT INTO` statements to populate the PostgreSQL database with the exact data from `mockData.json`.