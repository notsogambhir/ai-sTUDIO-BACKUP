/**
 * @file App.tsx
 * @description
 * This is the main "brain" or "traffic controller" of the entire application.
 */

import React from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAppContext } from './hooks/useAppContext';

import LoginScreen from './pages/LoginScreen';
import ProgramSelectionScreen from './pages/ProgramSelectionScreen';
import MainLayout from './components/MainLayout';
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

const ProtectedRoutes: React.FC = () => {
    const { currentUser, selectedProgram, selectedBatch } = useAppContext();
    const location = useLocation();

    if (!currentUser) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    const rolesWithSidebarSelectors = ['Admin', 'University', 'Department'];
    const needsProgramSelection = !selectedProgram || !selectedBatch;

    if (needsProgramSelection && !rolesWithSidebarSelectors.includes(currentUser.role)) {
        return <ProgramSelectionScreen />;
    }
    
    return (
        <MainLayout>
            <Routes>
                <Route path="/admin/academic-structure" element={<AdminPanel view="Academic Structure" />} />
                <Route path="/admin/user-management" element={<AdminPanel view="User Management" />} />
                <Route path="/admin/system-settings" element={<AdminPanel view="System Settings" />} />
                
                <Route path="/department/students" element={<DepartmentStudentManagement />} />
                <Route path="/department/faculty" element={<DepartmentFacultyManagement />} />

                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/courses" element={<CoursesList />} />
                <Route path="/courses/:courseId" element={<CourseDetail />} />
                <Route path="/courses/:courseId/report" element={<StudentCOAttainmentReport />} />
                <Route path="/program-outcomes" element={<ProgramOutcomesList />} />
                <Route path="/students" element={<StudentsList />} />
                <Route path="/teachers" element={<TeacherManagement />} />
                <Route path="/teachers/:teacherId" element={<TeacherDetails />} />
                <Route path="/reports" element={<AttainmentReports />} />
                <Route path="/program-selection" element={<ProgramSelectionScreen />} />
                
                <Route path="*" element={<Navigate to={
                    currentUser.role === 'Department' ? "/department/faculty" : "/dashboard"
                } replace />} />
            </Routes>
        </MainLayout>
    );
};

const App: React.FC = () => {
  const { currentUser } = useAppContext();

  return (
    <HashRouter>
        <Routes>
            <Route path="/login" element={<LoginScreen />} />
            <Route path="/*" element={currentUser ? <ProtectedRoutes /> : <Navigate to="/login" />} />
        </Routes>
    </HashRouter>
  );
};

export default App;
