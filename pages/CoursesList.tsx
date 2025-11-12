/**
 * @file CoursesList.tsx
 * @description
 * This file defines the `CoursesList` component, which is the main page for viewing and
 * managing courses.
 */

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../hooks/useAppContext';
import { Course, CourseStatus, Enrollment, User } from '../types';
import ExcelUploader from '../components/ExcelUploader';
import { ChevronDown, ChevronUp } from '../components/Icons';
import ConfirmationModal from '../components/ConfirmationModal';
import apiClient from '../api';

const CollapsibleSection: React.FC<{ title: string; children: React.ReactNode; count: number }> = ({ title, children, count }) => {
    const [isOpen, setIsOpen] = useState(false);
    if (count === 0) return null;

    return (
        <div className="bg-white rounded-lg shadow-md">
            <button
                className="w-full flex justify-between items-center p-4 text-left font-semibold text-lg text-gray-700"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span>{title} ({count})</span>
                {isOpen ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
            </button>
            {isOpen && (
                <div className="border-t border-gray-200">
                    {children}
                </div>
            )}
        </div>
    );
};

const CoursesList: React.FC = () => {
    const { selectedProgram, selectedBatch, data, fetchAppData, currentUser, selectedCollegeId } = useAppContext();
    const navigate = useNavigate();

    const [newCourseCode, setNewCourseCode] = useState('');
    const [newCourseName, setNewCourseName] = useState('');
    const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([]);
    
    const [confirmation, setConfirmation] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
    } | null>(null);

    const isProgramCoordinator = currentUser?.role === 'Program Co-ordinator';
    const isAdmin = currentUser?.role === 'Admin';
    const canManageCourses = isProgramCoordinator || isAdmin;

    const { activeCourses, futureCourses, completedCourses, teachersForPC, pageTitle } = useMemo(() => {
        if (!data) return { activeCourses: [], futureCourses: [], completedCourses: [], teachersForPC: [], pageTitle: 'Courses' };

        let courses: Course[];

        if (isAdmin) {
            courses = data.courses;
            if (selectedProgram) {
                courses = courses.filter(c => c.programId === selectedProgram.id);
            } else if (selectedCollegeId) {
                const programIdsInCollege = new Set(data.programs.filter(p => p.collegeId === selectedCollegeId).map(p => p.id));
                courses = courses.filter(c => programIdsInCollege.has(c.programId));
            }
        } else if (currentUser?.role === 'Teacher') {
            courses = data.courses.filter(c => 
                c.teacherId === currentUser.id || 
                (c.sectionTeacherIds && Object.values(c.sectionTeacherIds).includes(currentUser.id))
            );
        } else {
            courses = data.courses.filter((c) => c.programId === selectedProgram?.id);
        }
        
        courses = courses.sort((a, b) => a.code.localeCompare(b.code));

        let teachersForPC: User[] = [];
        if (isProgramCoordinator) {
            const myManagedTeacherIds = new Set(data.users
                .filter(u => u.role === 'Teacher' && u.programCoordinatorIds?.includes(currentUser.id))
                .map(u => u.id));
            teachersForPC = data.users.filter(u => myManagedTeacherIds.has(u.id));
        } else if (isAdmin) {
             teachersForPC = data.users.filter(u => u.role === 'Teacher');
        }

        const title = isAdmin
            ? selectedProgram
                ? `Courses for ${selectedProgram.name}`
                : selectedCollegeId
                    ? `Courses in ${data.colleges.find(c => c.id === selectedCollegeId)?.name}`
                    : 'All Courses'
            : currentUser?.role === 'Teacher'
                ? 'My Assigned Courses'
                : 'Courses';

        return {
            activeCourses: courses.filter(c => c.status === 'Active'),
            futureCourses: courses.filter(c => c.status === 'Future'),
            completedCourses: courses.filter(c => c.status === 'Completed'),
            teachersForPC,
            pageTitle: title
        };
    }, [data, selectedProgram, currentUser, selectedCollegeId, isProgramCoordinator, isAdmin]);
    
    const canAddCourse = canManageCourses && (isProgramCoordinator || (isAdmin && selectedProgram));

    const handleExcelUpload = async (uploadedData: { code: string; name: string }[]) => {
        if (!selectedProgram) {
             alert("Please select a program before bulk uploading courses.");
             return;
        }
        const newCourses: Omit<Course, 'id'>[] = uploadedData.map(row => ({
            code: row.code || 'N/A', name: row.name || 'Untitled Course',
            programId: selectedProgram.id, target: 50, internalWeightage: 25, externalWeightage: 75,
            attainmentLevels: { level3: 80, level2: 70, level1: 50 }, status: 'Future', teacherId: null
        }));

        try {
            await Promise.all(newCourses.map(course => apiClient.post('/courses/', course)));
            await fetchAppData();
        } catch (error) {
            console.error('Failed to upload courses:', error);
            alert('Failed to upload courses. Please try again.');
        }
    };

    const handleAddCourse = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCourseCode.trim() || !newCourseName.trim() || !selectedProgram) return;
        const newCourse: Omit<Course, 'id'> = {
            programId: selectedProgram.id, code: newCourseCode.trim(),
            name: newCourseName.trim(), target: 50, internalWeightage: 25, externalWeightage: 75,
            attainmentLevels: { level3: 80, level2: 70, level1: 50 }, status: 'Future', teacherId: null
        };

        try {
            await apiClient.post('/courses/', newCourse);
            await fetchAppData();
            setNewCourseCode('');
            setNewCourseName('');
        } catch (error) {
            console.error('Failed to add course:', error);
            alert('Failed to add course. Please try again.');
        }
    };

    const performStatusUpdate = async (ids: string[], newStatus: CourseStatus) => {
        try {
            await Promise.all(ids.map(id => apiClient.patch(`/courses/${id}/`, { status: newStatus })));
            await fetchAppData();
            setSelectedCourseIds([]);
            setConfirmation(null);
        } catch (error) {
            console.error('Failed to update course status:', error);
            alert('Failed to update status. Please try again.');
        }
    };

    const promptStatusChange = (ids: string[], newStatus: CourseStatus) => {
        let message = '';
        if (ids.length === 1) {
            const courseName = data?.courses.find(c => c.id === ids[0])?.name;
            message = `Are you sure you want to mark '${courseName}' as ${newStatus}?`;
        } else {
            message = `Are you sure you want to mark ${ids.length} selected courses as ${newStatus}?`;
        }
        if (newStatus === 'Active') {
            if (!selectedBatch) {
                alert("Please select a batch from the sidebar before activating a course.");
                return;
            }
            message += ` This will enroll all active students from the ${selectedBatch} batch into the course.`;
        }
        setConfirmation({
            isOpen: true, title: 'Confirm Status Change', message,
            onConfirm: () => performStatusUpdate(ids, newStatus),
        });
    };
    
    const performTeacherAssignment = async (courseId: string, teacherId: string) => {
        try {
            await apiClient.patch(`/courses/${courseId}/`, { teacherId: teacherId || null });
            await fetchAppData();
            setConfirmation(null);
        } catch (error) {
            console.error('Failed to assign teacher:', error);
            alert('Failed to assign teacher. Please try again.');
        }
    };

    const handleAssignTeacherChange = (courseId: string, newTeacherId: string) => {
        const course = data?.courses.find(c => c.id === courseId);
        if (!course) return;

        if (course.teacherId && course.teacherId !== newTeacherId) {
             setConfirmation({
                isOpen: true,
                title: 'Confirm Teacher Reassignment',
                message: "Changing the assigned teacher will unassign the course from the previous teacher. Are you sure you want to proceed?",
                onConfirm: () => performTeacherAssignment(courseId, newTeacherId),
            });
        } else {
            performTeacherAssignment(courseId, newTeacherId);
        }
    };

    const handleToggleSelection = (courseId: string) => {
        setSelectedCourseIds(prev =>
            prev.includes(courseId) ? prev.filter(id => id !== courseId) : [...prev, courseId]
        );
    };
    
    const handleToggleSelectAll = (courseIds: string[]) => {
        const allSelected = courseIds.every(id => selectedCourseIds.includes(id));
        if (allSelected) {
            setSelectedCourseIds(prev => prev.filter(id => !courseIds.includes(id)));
        } else {
            setSelectedCourseIds(prev => [...new Set([...prev, ...courseIds])]);
        }
    };

    const renderCourseTable = (courses: Course[]) => {
        return (
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        {canManageCourses && <th className="px-6 py-3 w-12"><input type="checkbox" onChange={() => handleToggleSelectAll(courses.map(c => c.id))} checked={courses.length > 0 && courses.every(c => selectedCourseIds.includes(c.id))} /></th>}
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                        {canManageCourses && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned Teacher</th>}
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {courses.map(course => (
                        <tr key={course.id} className={selectedCourseIds.includes(course.id) ? 'bg-blue-50' : ''}>
                            {canManageCourses && <td className="px-6 py-4"><input type="checkbox" checked={selectedCourseIds.includes(course.id)} onChange={() => handleToggleSelection(course.id)} /></td>}
                            <td className="px-6 py-4 whitespace-nowrap cursor-pointer" onClick={() => navigate(`/courses/${course.id}`)}>
                                <div className="text-sm font-medium text-gray-900">{course.name}</div>
                                <div className="text-sm text-gray-500">{course.code}</div>
                            </td>
                            {canManageCourses && (
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <select
                                        value={course.teacherId || ''}
                                        onChange={(e) => handleAssignTeacherChange(course.id, e.target.value)}
                                        className="w-full p-2 border border-gray-300 rounded-md bg-white text-gray-900"
                                        disabled={!isProgramCoordinator && !isAdmin}
                                    >
                                        <option value="">-- Unassigned --</option>
                                        {teachersForPC.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                    </select>
                                </td>
                            )}
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                {course.status === 'Future' && <button onClick={() => promptStatusChange([course.id], 'Active')} className="text-blue-600 hover:text-blue-900">Activate</button>}
                                {course.status === 'Active' && <button onClick={() => promptStatusChange([course.id], 'Completed')} className="text-green-600 hover:text-green-900">Complete</button>}
                                {course.status === 'Completed' && <button onClick={() => promptStatusChange([course.id], 'Active')} className="text-gray-600 hover:text-gray-900">Re-activate</button>}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    };

    if (currentUser?.role === 'Teacher') {
        return (
           <div className="space-y-8">
              <h1 className="text-3xl font-bold text-gray-800\">{pageTitle}</h1>
              <div className="bg-white rounded-lg shadow-md">
                <h2 className="text-xl font-bold text-gray-800 p-4 border-b\">Active Courses ({activeCourses.length})</h2>
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

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800\">{pageTitle}</h1>
                {canAddCourse && (<ExcelUploader<{ code: string; name: string }> onFileUpload={handleExcelUpload} label="Bulk Upload" format="cols: code, name" />)}
            </div>

            {canAddCourse && (
                <div className="bg-white p-4 rounded-lg shadow-md">
                    <form onSubmit={handleAddCourse} className="flex flex-wrap md:flex-nowrap gap-4 items-end">
                        <div className="flex-grow\"><label htmlFor="new-course-code\" className="text-sm font-medium text-gray-600 block\">Course Code</label><input id="new-course-code\" type="text" placeholder="e.g. CS101" value={newCourseCode} onChange={e => setNewCourseCode(e.target.value)} className="w-full p-2 mt-1 border border-gray-300 rounded-md bg-white text-gray-900\" required /></div>
                        <div className="flex-grow-[2]\"><label htmlFor="new-course-name\" className="text-sm font-medium text-gray-600 block\">Course Name</label><input id="new-course-name\" type="text" placeholder="e.g. Intro to Programming" value={newCourseName} onChange={e => setNewCourseName(e.target.value)} className="w-full p-2 mt-1 border border-gray-300 rounded-md bg-white text-gray-900\" required /></div>
                        <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg h-[42px] w-full md:w-auto\">Add Course</button>
                    </form>
                </div>
            )}
            
            {selectedCourseIds.length > 0 && (
                <div className="bg-gray-800 text-white p-4 rounded-lg shadow-lg flex items-center justify-between sticky top-2 z-10">
                    <span className="font-semibold\">{selectedCourseIds.length} course(s) selected</span>
                    <div className="flex gap-2">
                        <button onClick={() => promptStatusChange(selectedCourseIds, 'Future')} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-1 px-3 rounded-lg text-sm\">Mark as Future</button>
                        <button onClick={() => promptStatusChange(selectedCourseIds, 'Active')} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-1 px-3 rounded-lg text-sm\">Mark as Active</button>
                        <button onClick={() => promptStatusChange(selectedCourseIds, 'Completed')} className="bg-green-600 hover:bg-green-500 text-white font-bold py-1 px-3 rounded-lg text-sm\">Mark as Completed</button>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-lg shadow-md">
                <h2 className="text-xl font-bold text-gray-800 p-4 border-b\">Active Courses ({activeCourses.length})</h2>
                {renderCourseTable(activeCourses)}
            </div>

            <CollapsibleSection title="Future Courses" count={futureCourses.length}>
                {renderCourseTable(futureCourses)}
            </CollapsibleSection>

            <CollapsibleSection title="Completed Courses" count={completedCourses.length}>
                {renderCourseTable(completedCourses)}
            </CollapsibleSection>

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
