/**
 * @file App.tsx
 * @description
 * This is the main "brain" or "traffic controller" of the entire application.
 * It's the highest-level component that decides which page or layout to show the user.
 * 
 * It uses a tool called React Router (`HashRouter`) to act like a GPS for the app.
 * Based on the URL in the browser's address bar and whether the user is logged in,
 * it directs the user to the correct screen.
 * 
 * Main responsibilities:
 * 1.  Manages the primary routing logic (e.g., `/login`, `/dashboard`).
 * 2.  Acts as a gatekeeper: It shows the `LoginScreen` if the user is not logged in.
 * 3.  If the user is logged in, it passes control to the `ProtectedRoutes` component,
 *     which handles all the screens for authenticated users.
 */

import React from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAppContext } from './hooks/useAppContext'; // Helper to get shared data like the current user.

// Importing all the different "pages" or "screens" of the application.
// Think of these as the different destinations our app's GPS can navigate to.
import LoginScreen from './pages/LoginScreen';
import ProgramSelectionScreen from './pages/ProgramSelectionScreen';
import MainLayout from './components/MainLayout'; // The main visual structure (Sidebar + Header).
import Dashboard from './pages/Dashboard';
import CoursesList from './pages/CoursesList';
import CourseDetail from './pages/CourseDetail';
import ProgramOutcomesList from './pages/ProgramOutcomesList';
import StudentCOAttainmentReport from './pages/StudentCOAttainmentReport';
import AttainmentReports from './pages/AttainmentReports';
import StudentsList from './pages/StudentsList';
import TeacherManagement from './pages/TeacherManagement';
import TeacherDetails from './pages/TeacherDetails';
import DepartmentStudentManagement from './pages/DepartmentStudentManagement';
import DepartmentFacultyManagement from './pages/DepartmentFacultyManagement';
import AdminPanel from './pages/AdminPanel';

/**
 * A special component that handles all the routing for a user who is already logged in.
 * It acts as a security guard and a smart navigator inside the main app.
 */
const ProtectedRoutes: React.FC = () => {
    // We ask our "magic backpack" (AppContext) for the current user and their selections.
    const { currentUser, selectedProgram, selectedBatch } = useAppContext();
    const location = useLocation(); // This tells us the user's current URL.

    // If for some reason there's no user, send them back to the login page immediately.
    if (!currentUser) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // These users have dropdowns in their sidebar to choose programs, so they don't need the full-page selection screen.
    const rolesWithSidebarSelectors = ['Admin', 'University', 'Department'];
    // Check if the user needs to pick a program and batch to continue.
    const needsProgramSelection = !selectedProgram || !selectedBatch;

    // If a user (like a Teacher or PC) needs to select a program but hasn't yet,
    // we stop them and show them the ProgramSelectionScreen.
    if (needsProgramSelection && !rolesWithSidebarSelectors.includes(currentUser.role)) {
        return <ProgramSelectionScreen />;
    }
    
    // If the user is logged in and has made their selections (or doesn't need to),
    // we show them the main application layout with all the possible pages inside.
    return (
        // `MainLayout` provides the consistent Sidebar and Header for all pages.
        <MainLayout>
            {/* The `Routes` component looks at the URL and decides which page `element` to show. */}
            <Routes>
                {/* Admin-specific pages */}
                <Route path="/admin/academic-structure" element={<AdminPanel view="Academic Structure" />} />
                <Route path="/admin/user-management" element={<AdminPanel view="User Management" />} />
                <Route path="/admin/system-settings" element={<AdminPanel view="System Settings" />} />
                
                {/* Department-specific pages */}
                <Route path="/department/students" element={<DepartmentStudentManagement />} />
                <Route path="/department/faculty" element={<DepartmentFacultyManagement />} />

                {/* Standard pages accessible by multiple roles (Teacher, PC, Admin, Department, etc.) */}
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/courses" element={<CoursesList />} />
                {/* The ":courseId" part is a placeholder for the actual ID of a course. */}
                <Route path="/courses/:courseId" element={<CourseDetail />} />
                <Route path="/courses/:courseId/report" element={<StudentCOAttainmentReport />} />
                <Route path="/program-outcomes" element={<ProgramOutcomesList />} />
                <Route path="/students" element={<StudentsList />} />
                <Route path="/teachers" element={<TeacherManagement />} />
                <Route path="/teachers/:teacherId" element={<TeacherDetails />} />
                <Route path="/reports" element={<AttainmentReports />} />
                <Route path="/program-selection" element={<ProgramSelectionScreen />} />
                
                {/* This is the default "catch-all" route. If the URL doesn't match anything above,
                    it will redirect the user to a default page based on their role. */}
                <Route path="*" element={<Navigate to={
                    // A Department user's default page is different from others.
                    currentUser.role === 'Department' ? "/department/faculty" : "/dashboard"
                } replace />} />
            </Routes>
        </MainLayout>
    );
};


/**
 * The main App component. This is the root of our entire application's UI.
 */
const App: React.FC = () => {
  // Get the current user from our shared data "backpack".
  const { currentUser } = useAppContext();

  return (
    // `HashRouter` is the component that enables all the routing functionality (the app's GPS).
    <HashRouter>
        {/* `Routes` decides which of the top-level routes to render. */}
        <Routes>
            {/* If the URL is `/login`, show the LoginScreen. */}
            <Route path="/login" element={<LoginScreen />} />
            {/* For any other URL (`/*`), check if a user is logged in.
                If yes, render the `ProtectedRoutes` component which contains the main app.
                If no, redirect them back to the `/login` page. */}
            <Route path="/*" element={currentUser ? <ProtectedRoutes /> : <Navigate to="/login" />} />
        </Routes>
    </HashRouter>
  );
};

export default App;