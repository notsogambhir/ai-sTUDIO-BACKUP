/**
 * @file Dashboard.tsx
 * @description
 * This file defines the `Dashboard` component. It's a smart component that acts as a
 * "dashboard router", showing different content based on the logged-in user's role.
 *
 * What it does:
 * 1.  **Checks User Role**: It first looks at the `currentUser` from the "magic backpack".
 * 2.  **Teacher View**: If the user is a 'Teacher', it renders the specialized `TeacherDashboard`
 *     component, which is designed specifically for their needs.
 * 3.  **Default View**: For all other roles (like Program Co-ordinator, Admin, etc.), it
 *     renders a general dashboard with "Stat Cards" showing key numbers for the selected
 *     program and "Quick Actions" buttons.
 */

import React, { useMemo } from 'react';
import { useAppContext } from '../hooks/useAppContext'; // Helper to get shared data.
import { useNavigate } from 'react-router-dom';
import { BookOpen, Users, Target, PieChart } from '../components/Icons'; // Imports icon images.
import StatCard from '../components/StatCard'; // Imports the reusable stat card component.
import TeacherDashboard from '../components/TeacherDashboard'; // Import the new, specialized dashboard for teachers.

// This is the main component function for the Dashboard.
const Dashboard: React.FC = () => {
    // We ask our "magic backpack" (AppContext) for the data and user info we need.
    const { data, selectedProgram, currentUser } = useAppContext();
    
    // `useNavigate` gives us a function to tell the app to go to a different page.
    const navigate = useNavigate();

    // --- Role-Based Rendering Logic ---
    // If the current user is a Teacher, we show them their own special dashboard.
    if (currentUser?.role === 'Teacher') {
        return <TeacherDashboard />;
    }

    // --- Default Dashboard for Other Roles ---
    // The rest of this component will only be rendered if the user is NOT a teacher.

    // `useMemo` is a performance helper. It only recalculates this list of courses
    // when the underlying data or selected program changes.
    const programCourses = useMemo(() => {
        // First, get all courses that belong to the currently selected program.
        // The check for 'Teacher' role is redundant here because the TeacherDashboard is
        // rendered for teachers before this code is reached.
        const courses = data.courses.filter(c => c.programId === selectedProgram?.id);
        return courses;
    }, [data.courses, selectedProgram]);

    // Get all students and Program Outcomes that belong to the selected program.
    const programStudents = data.students.filter(s => s.programId === selectedProgram?.id);
    const programPOs = data.programOutcomes.filter(po => po.programId === selectedProgram?.id);
  
    // The JSX below describes what the Dashboard looks like for non-teacher roles.
    return (
        <div className="space-y-6">
            {/* This grid displays the four main statistics cards. */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    title={"Courses in Program"} 
                    value={programCourses.length} 
                    icon={<BookOpen />} 
                    color="blue" 
                />
                <StatCard 
                    title="Students in Program" 
                    value={programStudents.length} 
                    icon={<Users />} 
                    color="green" 
                />
                <StatCard 
                    title="Program Outcomes" 
                    value={programPOs.length} 
                    icon={<Target />} 
                    color="purple" 
                />
                <StatCard 
                    title="Courses to Assess" 
                    value={programCourses.length} 
                    icon={<PieChart />} 
                    color="red" 
                />
            </div>
            {/* The "Quick Actions" section with navigation buttons. */}
            <div className="bg-white p-6 rounded-xl shadow-md">
                <h2 className="text-xl font-semibold text-gray-700 mb-4">Quick Actions</h2>
                <div className="flex flex-wrap gap-4">
                    {/* When this button is clicked, it uses `navigate` to go to the "/courses" page. */}
                    <button onClick={() => navigate('/courses')} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                        Manage Courses
                    </button>
                    {/* When this button is clicked, it goes to the "/reports" page. */}
                    <button onClick={() => navigate('/reports')} className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
                        View Reports
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;