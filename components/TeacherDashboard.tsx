/**
 * @file TeacherDashboard.tsx
 * @description
 * This is a specialized dashboard component designed exclusively for users with the 'Teacher' role.
 * It provides a personalized, at-a-glance overview of a teacher's responsibilities.
 *
 * What it does:
 * 1.  **Personalized Welcome**: Displays a welcome message with the teacher's name.
 * 2.  **Task Overview**: Includes a placeholder section for "Upcoming Deadlines & Tasks" to help
 *     teachers stay organized.
 * 3.  **Assigned Courses**: The main feature is a list of all courses the teacher is assigned to.
 *     For each course, it shows:
 *     - The course name and code.
 *     - A summary of the status of all its assessments (e.g., "Marks Uploaded" or "Pending").
 *     - A convenient "Manage Course" link to navigate directly to the `CourseDetail` page.
 */

import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../hooks/useAppContext';
import { BookOpen } from './Icons'; // Import an icon for the course cards.

// This is the main component function for the Teacher's Dashboard.
const TeacherDashboard: React.FC = () => {
    // We get the current user and all application data from our "magic backpack".
    const { currentUser, data } = useAppContext();

    /**
     * `useMemo` is a performance helper, like a smart calculator. It calculates the teacher's
     * course data and only re-runs the calculation if the data or the teacher changes.
     */
    const assignedCoursesData = useMemo(() => {
        if (!currentUser || currentUser.role !== 'Teacher') return [];
        
        // --- Step 1: Find all courses this teacher is assigned to. ---
        // This includes being the main teacher (`teacherId`) or a section-specific teacher (`sectionTeacherIds`).
        const courses = data.courses.filter(c =>
            c.teacherId === currentUser.id ||
            (c.sectionTeacherIds && Object.values(c.sectionTeacherIds).includes(currentUser.id))
        );

        // --- Step 2: For each course, create a summary of its assessment status. ---
        return courses.map(course => {
            // Find all sections that have students enrolled in this course.
            const sectionIdsForCourse = new Set(data.enrollments.filter(e => e.courseId === course.id && e.sectionId).map(e => e.sectionId!));
            
            // Find all assessments associated with those sections.
            const assessments = data.assessments
                .filter(a => sectionIdsForCourse.has(a.sectionId))
                .map(assessment => ({
                    ...assessment,
                    // For each assessment, check if any marks have been uploaded for it.
                    hasMarks: data.marks.some(m => m.assessmentId === assessment.id)
                }));

            return {
                ...course,
                assessments,
            };
        });
    }, [data, currentUser]);

    // The JSX below describes what the Teacher Dashboard looks like.
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-800">Welcome, {currentUser?.name}</h1>
                <p className="text-gray-500 mt-1">Here's your overview for today.</p>
            </div>
            
            {/* Placeholder section for upcoming tasks or deadlines. */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold text-gray-700 mb-4">Upcoming Deadlines & Tasks</h2>
                <div className="text-center py-4">
                    <p className="text-gray-500">No upcoming tasks. You're all caught up!</p>
                </div>
            </div>

            {/* Main section for displaying assigned courses. */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
                    <BookOpen className="w-6 h-6 mr-3 text-blue-500" /> My Assigned Courses
                </h2>
                <div className="space-y-4">
                    {/* We loop through the course data we calculated and create a card for each course. */}
                    {assignedCoursesData.map(course => (
                        <div key={course.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-800">{course.name} ({course.code})</h3>
                                </div>
                                {/* The "Manage Course" link navigates the user to the detailed course page. */}
                                <Link to={`/courses/${course.id}`} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 font-semibold text-sm">
                                    Manage Course
                                </Link>
                            </div>
                            <div className="mt-3 border-t pt-3">
                                <h4 className="text-sm font-semibold text-gray-600 mb-2">Assessment Status</h4>
                                <div className="space-y-1">
                                    {/* For each assessment in the course, show its name and status. */}
                                    {course.assessments.map(assessment => (
                                        <div key={assessment.id} className="flex justify-between items-center text-sm">
                                            <p className="text-gray-700">{assessment.name}</p>
                                            <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${assessment.hasMarks ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                {assessment.hasMarks ? 'Marks Uploaded' : 'Pending'}
                                            </span>
                                        </div>
                                    ))}
                                    {course.assessments.length === 0 && <p className="text-sm text-gray-500">No assessments created for this course yet.</p>}
                                </div>
                            </div>
                        </div>
                    ))}
                    {/* If the teacher has no courses, show a friendly message. */}
                    {assignedCoursesData.length === 0 && (
                        <div className="text-center py-4">
                            <p className="text-gray-500">You have not been assigned to any courses yet.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TeacherDashboard;