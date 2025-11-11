/**
 * @file TeacherDetails.tsx
 * @description
 * This file defines the `TeacherDetails` component. It serves as a personal "dashboard"
 * for a specific teacher, showing an overview of the courses they are assigned to.
 * It's the page a user lands on after clicking "View Dashboard" on the `TeacherManagement` page.
 *
 * What it does:
 * 1.  **Gets Teacher ID**: It uses the `useParams` hook from React Router to read the
 *     `teacherId` from the URL (e.g., in `/teachers/TCH301`, it knows the ID is "TCH301").
 * 2.  **Finds Teacher Data**: It finds the full user object for that teacher from the main
 *     application data and displays their reporting structure (who their Program Co-ordinators are).
 * 3.  **Calculates Course Stats**: For each course assigned to the teacher, it calculates
 *     a summary of key information, such as the overall CO attainment (mocked for simplicity)
 *     and the status of assessments (Uploaded/Pending).
 * 4.  **Displays Information**: It shows a card for each assigned course with this summary data.
 * 5.  **Navigation**: It provides a "Manage Course" link to go to the full `CourseDetail`
 *     page for each course, and a "Back" button to return to the previous screen.
 */

import React, { useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../hooks/useAppContext';
import { ArrowLeft } from '../components/Icons';

const TeacherDetails: React.FC = () => {
    // `useParams` gets the `teacherId` from the URL.
    const { teacherId } = useParams<{ teacherId: string }>();
    // We get our app's data from the "magic backpack".
    const { data } = useAppContext();
    // `useNavigate` gives us a function to go back to the previous page.
    const navigate = useNavigate();

    // `useMemo` is a smart calculator that finds the teacher's data only when needed.
    const teacher = useMemo(() => data.users.find(u => u.id === teacherId), [data.users, teacherId]);

    /**
     * `useMemo` again, this time to find the names of the Program Co-ordinators this teacher reports to.
     */
    const reportingToPCs = useMemo(() => {
        if (!teacher?.programCoordinatorIds) return 'N/A';
        
        // Find the user object for each ID in the teacher's list.
        const pcNames = teacher.programCoordinatorIds
            .map(pcId => data.users.find(u => u.id === pcId)?.name)
            .filter(Boolean); // This removes any names that weren't found.
            
        return pcNames.length > 0 ? pcNames.join(', ') : 'N/A';
    }, [data.users, teacher]);

    /**
     * `useMemo` for a more complex calculation: finding all of the teacher's
     * courses and summarizing their performance data.
     */
    const assignedCoursesData = useMemo(() => {
        if (!teacher) return [];
        // Find all courses where this teacher is the main assigned teacher.
        const courses = data.courses.filter(c => c.teacherId === teacher.id);
        
        // For each course, create a summary object.
        return courses.map(course => {
            const enrolledStudentIds = new Set(data.enrollments.filter(e => e.courseId === course.id).map(e => e.studentId));
            const totalStudents = enrolledStudentIds.size;
            
            // NOTE: This is a simplified, mocked calculation for the overall CO attainment.
            // A real calculation would be much more complex, like on the report pages.
            let studentsMeetingTargetCount = Math.floor(totalStudents * (Math.random() * (0.9 - 0.4) + 0.4));
            const overallCoAttainment = totalStudents > 0 ? (studentsMeetingTargetCount / totalStudents) * 100 : 0;
            
            // Find all assessments for this course by looking at its sections.
            const sectionIdsForCourse = new Set(data.enrollments.filter(e => e.courseId === course.id && e.sectionId).map(e => e.sectionId!));
            const assessments = data.assessments
                .filter(a => sectionIdsForCourse.has(a.sectionId))
                .map(assessment => ({
                    ...assessment,
                    // Check if any marks have been uploaded for this assessment.
                    hasMarks: data.marks.some(m => m.assessmentId === assessment.id)
                }));

            return {
                ...course,
                overallCoAttainment,
                assessments,
            };
        });
    }, [data, teacher]);

    // If the teacher ID from the URL is not found, show an error.
    if (!teacher) {
        return <div className="text-center p-8 text-red-500">Teacher not found.</div>;
    }

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-md flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">{teacher.name}'s Dashboard</h1>
                    <p className="text-gray-500 mt-1">Employee ID: {teacher.employeeId}</p>
                    <p className="text-gray-500">Reports to: <span className="font-medium">{reportingToPCs}</span></p>
                </div>
                {/* The Back button. `navigate(-1)` tells the app's GPS to go back one step. */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold transition-colors"
                    aria-label="Go back to previous page"
                >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back
                </button>
            </div>
            
            {/* We loop through the summarized course data and display a card for each course. */}
            {assignedCoursesData.map(course => (
                <div key={course.id} className="bg-white p-6 rounded-lg shadow-md">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">{course.name} ({course.code})</h2>
                            <p className={`font-semibold text-lg ${course.overallCoAttainment >= course.target ? 'text-green-600' : 'text-orange-500'}`}>
                                Overall CO Attainment: {course.overallCoAttainment.toFixed(2)}%
                            </p>
                        </div>
                        <Link to={`/courses/${course.id}`} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 font-semibold">
                            Manage Course
                        </Link>
                    </div>
                    <div className="mt-4 border-t pt-4">
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">Assessments</h3>
                        <div className="space-y-2">
                            {course.assessments.map(assessment => (
                                <div key={assessment.id} className="flex justify-between items-center p-2 bg-gray-50 rounded-md">
                                    <p className="text-gray-800">{assessment.name}</p>
                                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${assessment.hasMarks ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                        {assessment.hasMarks ? 'Marks Uploaded' : 'Pending'}
                                    </span>
                                </div>
                            ))}
                            {course.assessments.length === 0 && <p className="text-gray-500">No assessments created for this course yet.</p>}
                        </div>
                    </div>
                </div>
            ))}
             {assignedCoursesData.length === 0 && (
                <div className="text-center p-8 bg-white rounded-lg shadow-md">
                    <p className="text-gray-500">This teacher has not been assigned any courses yet.</p>
                </div>
            )}
        </div>
    );
};

export default TeacherDetails;