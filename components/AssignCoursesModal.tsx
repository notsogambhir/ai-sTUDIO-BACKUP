/**
 * @file AssignCoursesModal.tsx
 * @description
 * This file defines the `AssignCoursesModal` component.
 *
 * **NOTE: This is an older, deprecated component and is no longer actively used in the application.**
 *
 * What was its purpose?
 * Imagine our app is a big library. This component was like a pop-up clipboard that a manager
 * (a "Program Co-ordinator") would use. They would pick a librarian (a "Teacher"), and this
 * clipboard would pop up, showing a list of all the unassigned books (Courses). The manager
 * could then check off which books to assign to that librarian.
 *
 * Why is it no longer used?
 * We found that using a separate clipboard for this was inefficient. Instead, we went to the main
 * list of all books (`pages/CoursesList.tsx`) and added a little dropdown menu next to each book.
 * Now, the manager can just pick a librarian's name from the dropdown right next to the book.
 * It's much faster and easier to see who is assigned to what at a glance.
 *
 * Because this new system is in place, this old pop-up clipboard is no longer needed.
 */

import React, { useState, useMemo } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { User, Course } from '../types';
import Modal from './Modal'; // It used the generic Modal component as a base.

// This defines the "props" or properties the component was designed to accept.
interface AssignCoursesModalProps {
    teacher: User; // The teacher to whom the courses would be assigned.
    onClose: () => void; // A function to close the modal.
}

// This is the main (and now deprecated) component function.
const AssignCoursesModal: React.FC<AssignCoursesModalProps> = ({ teacher, onClose }) => {
    // It got its data and tools from the "magic backpack".
    const { data, setData, currentUser } = useAppContext();
    // It used its own memory (`useState`) to keep track of which courses were checked.
    const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([]);

    // It calculated the list of available, unassigned courses for the PC's program.
    const unassignedCourses = useMemo(() => {
        if (!currentUser?.programId) return [];
        return data.courses.filter(c => c.programId === currentUser.programId && !c.teacherId);
    }, [data.courses, currentUser]);

    // This function handled checking and unchecking the boxes.
    const handleToggleSelection = (courseId: string) => {
        setSelectedCourseIds(prev =>
            prev.includes(courseId) ? prev.filter(id => id !== courseId) : [...prev, courseId]
        );
    };

    // This function ran when the "Assign" button was clicked.
    const handleAssignCourses = () => {
        // It updated the main application data by setting the `teacherId` on the selected courses.
        setData(prev => ({
            ...prev,
            courses: prev.courses.map(c =>
                selectedCourseIds.includes(c.id) ? { ...c, teacherId: teacher.id } : c
            )
        }));
        onClose(); // Close the modal.
    };

    return (
        // The component rendered a list of checkboxes inside the generic `Modal` wrapper.
        <Modal title={`Assign Courses to ${teacher.name}`} onClose={onClose}>
            <div className="p-6">
                <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
                    {unassignedCourses.length > 0 ? (
                        unassignedCourses.map(course => (
                            <label key={course.id} className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={selectedCourseIds.includes(course.id)}
                                    onChange={() => handleToggleSelection(course.id)}
                                    className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                />
                                <span className="ml-3 text-gray-800 font-medium">{course.code} - {course.name}</span>
                            </label>
                        ))
                    ) : (
                        <p className="text-center text-gray-500 py-4">No unassigned courses available in this program.</p>
                    )}
                </div>
                <div className="mt-6 flex justify-end gap-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 font-semibold">Cancel</button>
                    <button
                        type="button"
                        onClick={handleAssignCourses}
                        disabled={selectedCourseIds.length === 0}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-semibold disabled:bg-indigo-300 disabled:cursor-not-allowed"
                    >
                        Assign ({selectedCourseIds.length})
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default AssignCoursesModal;