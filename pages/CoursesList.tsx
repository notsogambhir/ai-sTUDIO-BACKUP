/**
 * @file CoursesList.tsx
 * @description
 * This file defines the `CoursesList` component, which is the main page for viewing and
 * managing courses. It's a very dynamic page that changes its appearance and functionality
 * based on the logged-in user's role.
 *
 * Key Responsibilities:
 * 1.  **Display Courses**: Shows courses grouped by their status ("Active", "Future", "Completed").
 * 2.  **Role-Based Filtering**: The list of courses is heavily filtered.
 *     - An **Admin** can see courses for any college/program they select in the sidebar.
 *     - A **Program Co-ordinator** sees all courses for their specific program.
 *     - A **Teacher** only sees the courses they are personally assigned to.
 * 3.  **Course Management (for PC/Admin)**:
 *     - Allows adding a new course manually via a form.
 *     - Allows bulk-uploading courses from an Excel file.
 *     - Allows assigning a teacher to a course via a dropdown.
 *     - Allows changing the status of one or more courses (e.g., from "Future" to "Active").
 * 4.  **Bulk Actions**: When a user selects multiple courses, a "bulk action" bar appears at the top,
 *     allowing them to change the status of all selected courses at once.
 * 5.  **Student Enrollment**: When a course is marked as "Active", it automatically enrolls all
 *     active students from the currently selected batch into that course.
 */

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../hooks/useAppContext';
import { Course, CourseStatus, Enrollment, User } from '../types';
import ExcelUploader from '../components/ExcelUploader';
import { ChevronDown, ChevronUp } from '../components/Icons';
import ConfirmationModal from '../components/ConfirmationModal';

/**
 * A small helper component that creates a "collapsible" section.
 * It shows a title and a count, and when you click it, it expands to show its `children`.
 * It's used to hide the "Future" and "Completed" course lists until the user wants to see them.
 */
const CollapsibleSection: React.FC<{ title: string; children: React.ReactNode; count: number }> = ({ title, children, count }) => {
    // A piece of memory to remember if this section is open or closed.
    const [isOpen, setIsOpen] = useState(false);
    // If there are no items to show in this section, we don't render anything at all.
    if (count === 0) return null;

    return (
        <div className="bg-white rounded-lg shadow-md">
            <button
                className="w-full flex justify-between items-center p-4 text-left font-semibold text-lg text-gray-700"
                onClick={() => setIsOpen(!isOpen)} // When clicked, flip the `isOpen` value.
            >
                <span>{title} ({count})</span>
                {/* Show a different arrow icon depending on whether it's open or closed. */}
                {isOpen ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
            </button>
            {/* The `children` are only rendered if `isOpen` is true. */}
            {isOpen && (
                <div className="border-t border-gray-200">
                    {children}
                </div>
            )}
        </div>
    );
};

// This is the main component for the Courses List page.
const CoursesList: React.FC = () => {
    // We ask our "magic backpack" (AppContext) for all the data and tools we need.
    const { selectedProgram, selectedBatch, data, setData, currentUser, selectedCollegeId } = useAppContext();
    const navigate = useNavigate(); // A tool to navigate to other pages.

    // --- State Management ---
    // Pieces of memory for the "Add Course" form.
    const [newCourseCode, setNewCourseCode] = useState('');
    const [newCourseName, setNewCourseName] = useState('');
    // A piece of memory to keep track of which courses the user has selected with checkboxes.
    const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([]);
    
    // A piece of memory for the confirmation popup (modal).
    const [confirmation, setConfirmation] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
    } | null>(null);

    // Some handy booleans to check the user's role.
    const isProgramCoordinator = currentUser?.role === 'Program Co-ordinator';
    const isAdmin = currentUser?.role === 'Admin';
    const canManageCourses = isProgramCoordinator || isAdmin; // Only PCs and Admins can manage courses.

    /**
     * `useMemo` is a performance optimization. It's like a smart calculator that only
     * re-does its calculations when one of its inputs (the values in the `[]` array) changes.
     * This is a very complex calculation, so we don't want to run it on every single render.
     */
    const { activeCourses, futureCourses, completedCourses, teachersForPC, pageTitle } = useMemo(() => {
        let courses: Course[];

        // --- Step 1: Filter courses based on the user's role and their selections. ---
        if (isAdmin) {
            courses = data.courses; // An admin starts with all courses.
            if (selectedProgram) { // If they selected a program in the sidebar...
                courses = courses.filter(c => c.programId === selectedProgram.id); // ...filter by that program.
            } else if (selectedCollegeId) { // If they only selected a college...
                const programIdsInCollege = new Set(data.programs.filter(p => p.collegeId === selectedCollegeId).map(p => p.id));
                courses = courses.filter(c => programIdsInCollege.has(c.programId)); // ...filter by all programs in that college.
            }
        } else if (currentUser?.role === 'Teacher') {
            // A teacher only sees courses where they are the main teacher OR assigned to a specific section.
            courses = data.courses.filter(c => 
                c.teacherId === currentUser.id || 
                (c.sectionTeacherIds && Object.values(c.sectionTeacherIds).includes(currentUser.id))
            );
        } else { // This handles Program Co-ordinators and other roles.
            courses = data.courses.filter((c) => c.programId === selectedProgram?.id);
        }
        
        // Sort the final list of courses alphabetically by code.
        courses = courses.sort((a, b) => a.code.localeCompare(b.code));

        // --- Step 2: Get the list of teachers that a PC or Admin can assign. ---
        let teachersForPC: User[] = [];
        if (isProgramCoordinator) {
            // A PC can assign any teacher that reports to them.
            const myManagedTeacherIds = new Set(data.users
                .filter(u => u.role === 'Teacher' && u.programCoordinatorIds?.includes(currentUser.id))
                .map(u => u.id));
            teachersForPC = data.users.filter(u => myManagedTeacherIds.has(u.id));
        } else if (isAdmin) {
             // An admin can assign any teacher in the system.
             teachersForPC = data.users.filter(u => u.role === 'Teacher');
        }

        // --- Step 3: Determine the title for the page. ---
        const title = isAdmin
            ? selectedProgram
                ? `Courses for ${selectedProgram.name}`
                : selectedCollegeId
                    ? `Courses in ${data.colleges.find(c => c.id === selectedCollegeId)?.name}`
                    : 'All Courses'
            : currentUser?.role === 'Teacher'
                ? 'My Assigned Courses'
                : 'Courses';

        // --- Step 4: Return all the calculated data. ---
        return {
            activeCourses: courses.filter(c => c.status === 'Active'),
            futureCourses: courses.filter(c => c.status === 'Future'),
            completedCourses: courses.filter(c => c.status === 'Completed'),
            teachersForPC,
            pageTitle: title
        };
    }, [data, selectedProgram, currentUser, selectedCollegeId, isProgramCoordinator, isAdmin]);
    
    // Check if the user has permission to add courses.
    const canAddCourse = canManageCourses && (isProgramCoordinator || (isAdmin && selectedProgram));

    // This function is called by the ExcelUploader component when a file is successfully parsed.
    const handleExcelUpload = (uploadedData: { code: string; name: string }[]) => {
        if (!selectedProgram) {
             alert("Please select a program before bulk uploading courses.");
             return;
        }
        // Convert the simple data from the Excel file into full `Course` objects.
        const newCourses: Course[] = uploadedData.map((row, index) => ({
            id: `c_excel_${Date.now()}_${index}`, code: row.code || 'N/A', name: row.name || 'Untitled Course',
            programId: selectedProgram.id, target: 50, internalWeightage: 25, externalWeightage: 75,
            attainmentLevels: { level3: 80, level2: 70, level1: 50 }, status: 'Future', teacherId: null
        }));
        // Update the main application data in our magic backpack.
        setData(prev => ({ ...prev, courses: [...prev.courses, ...newCourses] }));
    };

    // This runs when the user submits the "Add Course" form.
    const handleAddCourse = (e: React.FormEvent) => {
        e.preventDefault(); // Stop the page from reloading.
        if (!newCourseCode.trim() || !newCourseName.trim() || !selectedProgram) return;
        // Create a new course object from the form data.
        const newCourse: Course = {
            id: `c_manual_${Date.now()}`, programId: selectedProgram.id, code: newCourseCode.trim(),
            name: newCourseName.trim(), target: 50, internalWeightage: 25, externalWeightage: 75,
            attainmentLevels: { level3: 80, level2: 70, level1: 50 }, status: 'Future', teacherId: null
        };
        // Add the new course to our main data.
        setData(prev => ({ ...prev, courses: [...prev.courses, newCourse] }));
        // Clear the form fields.
        setNewCourseCode(''); setNewCourseName('');
    };

    // This function actually performs the status update after the user confirms.
    const performStatusUpdate = (ids: string[], newStatus: CourseStatus) => {
        setData(prev => {
            let newEnrollments: Enrollment[] = [...prev.enrollments];
            const updatedCourses = prev.courses.map(c => {
                if (ids.includes(c.id)) {
                    // **SPECIAL LOGIC**: If a course is being activated...
                    if (newStatus === 'Active' && c.status !== 'Active') {
                        if (selectedProgram && selectedBatch) {
                            // Find all active students in the currently selected batch.
                            const batch = prev.batches.find(b => b.programId === selectedProgram.id && b.name === selectedBatch);
                            if (batch) {
                                const sectionsForBatch = prev.sections.filter(s => s.batchId === batch.id);
                                const sectionIdsForBatch = new Set(sectionsForBatch.map(s => s.id));
                        
                                const activeStudentsForBatch = prev.students.filter(s => 
                                    s.programId === selectedProgram.id && 
                                    s.status === 'Active' &&
                                    s.sectionId &&
                                    sectionIdsForBatch.has(s.sectionId)
                                );
                        
                                // Find which students are already enrolled to avoid duplicates.
                                const existingEnrollments = new Set(newEnrollments.filter(e => e.courseId === c.id).map(e => e.studentId));
                                
                                // Create new enrollment records for the students who aren't already enrolled.
                                const enrollmentsToAdd = activeStudentsForBatch
                                    .filter(s => !existingEnrollments.has(s.id))
                                    .map(s => ({ courseId: c.id, studentId: s.id, sectionId: s.sectionId }));
                                    
                                newEnrollments.push(...enrollmentsToAdd);
                            }
                        }
                    }
                    // Return the course with its new status.
                    return { ...c, status: newStatus };
                }
                return c;
            });
            // Return the updated data for both courses and enrollments.
            return { ...prev, courses: updatedCourses, enrollments: newEnrollments };
        });
        // Clean up: clear the selection and close the confirmation modal.
        setSelectedCourseIds([]);
        setConfirmation(null);
    };

    // This function opens the "Are you sure?" popup before changing a status.
    const promptStatusChange = (ids: string[], newStatus: CourseStatus) => {
        let message = '';
        if (ids.length === 1) { // A message for a single course.
            const courseName = data.courses.find(c => c.id === ids[0])?.name;
            message = `Are you sure you want to mark '${courseName}' as ${newStatus}?`;
        } else { // A message for multiple courses.
            message = `Are you sure you want to mark ${ids.length} selected courses as ${newStatus}?`;
        }
        // Add an extra warning if activating a course.
        if (newStatus === 'Active') {
            if (!selectedBatch) {
                alert("Please select a batch from the sidebar before activating a course.");
                return;
            }
            message += ` This will enroll all active students from the ${selectedBatch} batch into the course.`;
        }
        // Open the confirmation modal with the correct message and action.
        setConfirmation({
            isOpen: true, title: 'Confirm Status Change', message,
            onConfirm: () => performStatusUpdate(ids, newStatus),
        });
    };
    
    // This function actually assigns the teacher after confirmation.
    const performTeacherAssignment = (courseId: string, teacherId: string) => {
        setData(prev => ({
            ...prev,
            courses: prev.courses.map(c => 
                c.id === courseId ? { ...c, teacherId: teacherId || null } : c
            )
        }));
        setConfirmation(null);
    };

    // This runs when a PC changes the teacher in the dropdown for a course.
    const handleAssignTeacherChange = (courseId: string, newTeacherId: string) => {
        const course = data.courses.find(c => c.id === courseId);
        if (!course) return;

        // If the course already has a different teacher, show a confirmation popup.
        if (course.teacherId && course.teacherId !== newTeacherId) {
             setConfirmation({
                isOpen: true,
                title: 'Confirm Teacher Reassignment',
                message: "Changing the assigned teacher will unassign the course from the previous teacher. Are you sure you want to proceed?",
                onConfirm: () => performTeacherAssignment(courseId, newTeacherId),
            });
        } else {
            // If there was no previous teacher, just assign them directly.
            performTeacherAssignment(courseId, newTeacherId);
        }
    };

    // --- Selection Handlers ---
    const handleToggleSelection = (courseId: string) => {
        setSelectedCourseIds(prev =>
            prev.includes(courseId) ? prev.filter(id => id !== courseId) : [...prev, courseId]
        );
    };
    
    const handleToggleSelectAll = (courseIds: string[]) => {
        const allSelected = courseIds.every(id => selectedCourseIds.includes(id));
        if (allSelected) { // If all are selected, unselect them all.
            setSelectedCourseIds(prev => prev.filter(id => !courseIds.includes(id)));
        } else { // Otherwise, select them all.
            setSelectedCourseIds(prev => [...new Set([...prev, ...courseIds])]);
        }
    };

    /**
     * A reusable function to render a table of courses.
     * We pass it a list of courses, and it returns the JSX for the table.
     */
    const renderCourseTable = (courses: Course[]) => {
        const courseIds = courses.map(c => c.id);
        const areAllSelected = courseIds.length > 0 && courseIds.every(id => selectedCourseIds.includes(id));

        return (
            <div className="overflow-x-auto">
                <table className="min-w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            {canManageCourses && <th className="p-4 text-left"><input type="checkbox" checked={areAllSelected} onChange={() => handleToggleSelectAll(courseIds)} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" /></th>}
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course Code</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course Name</th>
                            {(isProgramCoordinator || isAdmin) && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned Teacher</th>}
                            {canManageCourses && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>}
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {courses.map((course) => (
                            <tr key={course.id} className={`hover:bg-gray-50 ${selectedCourseIds.includes(course.id) ? 'bg-indigo-50' : ''}`}>
                                {canManageCourses && <td className="p-4"><input type="checkbox" checked={selectedCourseIds.includes(course.id)} onChange={() => handleToggleSelection(course.id)} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" /></td>}
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{course.code}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{course.name}</td>
                                {(isProgramCoordinator || isAdmin) && (
                                     <td className="px-6 py-4 whitespace-nowrap text-sm">
                                         <select
                                             value={course.teacherId || ''}
                                             onChange={(e) => handleAssignTeacherChange(course.id, e.target.value)}
                                             className="p-2 border bg-white text-gray-900 border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                         >
                                             <option value="">-- Unassigned --</option>
                                             {teachersForPC.map(teacher => (
                                                 <option key={teacher.id} value={teacher.id}>{teacher.name}</option>
                                             ))}
                                         </select>
                                     </td>
                                )}
                                {canManageCourses && (
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                        <select value={course.status} onChange={(e) => promptStatusChange([course.id], e.target.value as CourseStatus)} className="p-2 border bg-white text-gray-900 border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                                            <option value="Future">Future</option>
                                            <option value="Active">Active</option>
                                            <option value="Completed">Completed</option>
                                        </select>
                                    </td>
                                )}
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button onClick={() => navigate(`/courses/${course.id}`)} className="text-indigo-600 hover:text-indigo-800">Manage</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    // --- Main Render Logic ---
    // If the user is a Teacher, we show a simplified, read-only view.
    if (currentUser?.role === 'Teacher') {
        return (
           <div className="space-y-8">
              <h1 className="text-3xl font-bold text-gray-800">{pageTitle}</h1>
              <div className="bg-white rounded-lg shadow-md">
                <h2 className="text-xl font-bold text-gray-800 p-4 border-b">Active Courses ({activeCourses.length})</h2>
                {renderCourseTable(activeCourses)}
              </div>
              <CollapsibleSection title="Completed Courses" count={completedCourses.length}>
                  {renderCourseTable(completedCourses)}
              </CollapsibleSection>
              <CollapsibleSection title="Future Courses" count={futureCourses.length}>
                  {renderCourseTable(futureCourses)}
              </CollapsibleSection>
           </div>
        );
    }

    // This is the full view for PCs and Admins.
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800">{pageTitle}</h1>
                {canAddCourse && (<ExcelUploader<{ code: string; name: string }> onFileUpload={handleExcelUpload} label="Bulk Upload" format="cols: code, name" />)}
            </div>

            {canAddCourse && (
                <div className="bg-white p-4 rounded-lg shadow-md">
                    <form onSubmit={handleAddCourse} className="flex flex-wrap md:flex-nowrap gap-4 items-end">
                        <div className="flex-grow"><label htmlFor="new-course-code" className="text-sm font-medium text-gray-600 block">Course Code</label><input id="new-course-code" type="text" placeholder="e.g. CS101" value={newCourseCode} onChange={e => setNewCourseCode(e.target.value)} className="w-full p-2 mt-1 border border-gray-300 rounded-md bg-white text-gray-900" required /></div>
                        <div className="flex-grow-[2]"><label htmlFor="new-course-name" className="text-sm font-medium text-gray-600 block">Course Name</label><input id="new-course-name" type="text" placeholder="e.g. Intro to Programming" value={newCourseName} onChange={e => setNewCourseName(e.target.value)} className="w-full p-2 mt-1 border border-gray-300 rounded-md bg-white text-gray-900" required /></div>
                        <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg h-[42px] w-full md:w-auto">Add Course</button>
                    </form>
                </div>
            )}
            
            {/* The bulk action bar only appears if one or more courses are selected. */}
            {selectedCourseIds.length > 0 && (
                <div className="bg-gray-800 text-white p-4 rounded-lg shadow-lg flex items-center justify-between sticky top-2 z-10">
                    <span className="font-semibold">{selectedCourseIds.length} course(s) selected</span>
                    <div className="flex gap-2">
                        <button onClick={() => promptStatusChange(selectedCourseIds, 'Future')} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-1 px-3 rounded-lg text-sm">Mark as Future</button>
                        <button onClick={() => promptStatusChange(selectedCourseIds, 'Active')} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-1 px-3 rounded-lg text-sm">Mark as Active</button>
                        <button onClick={() => promptStatusChange(selectedCourseIds, 'Completed')} className="bg-green-600 hover:bg-green-500 text-white font-bold py-1 px-3 rounded-lg text-sm">Mark as Completed</button>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-lg shadow-md">
                <h2 className="text-xl font-bold text-gray-800 p-4 border-b">Active Courses ({activeCourses.length})</h2>
                {renderCourseTable(activeCourses)}
            </div>

            <CollapsibleSection title="Future Courses" count={futureCourses.length}>
                {renderCourseTable(futureCourses)}
            </CollapsibleSection>

            <CollapsibleSection title="Completed Courses" count={completedCourses.length}>
                {renderCourseTable(completedCourses)}
            </CollapsibleSection>

            {/* The confirmation modal is only rendered if it has been activated. */}
            {confirmation && (
                <ConfirmationModal 
                    isOpen={confirmation.isOpen}
                    title={confirmation.title}
                    message={confirmation.message}
                    onConfirm={confirmation.onConfirm}
                    onClose={() => setConfirmation(null)}
                />
            )}
        </div>
    );
};

export default CoursesList;