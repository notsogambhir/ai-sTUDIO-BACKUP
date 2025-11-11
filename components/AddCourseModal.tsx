/**
 * @file AddCourseModal.tsx
 * @description
 * This file defines the `AddCourseModal` component.
 *
 * **NOTE: This is an older, deprecated component and is no longer actively used in the application.**
 *
 * What was its purpose?
 * Imagine our app is a big library. This component was like a small pop-up window that would appear
 * whenever you wanted to add one new book (a "Course") to the library. You would fill out the
 * book's details in the pop-up and click "Add".
 *
 * Why is it no longer used?
 * We found that having to open a pop-up every time was a bit slow. Instead, we built a special
 * "intake desk" (an inline form) right at the top of the main library room (`pages/CoursesList.tsx`).
 * Now, you can add a new book right from the main page without any pop-ups. It's much faster and
 * more convenient.
 *
 * Because we have this new, better system, this old pop-up window is no longer needed. It's kept
 * here for historical reasons but can be safely removed in a future cleanup.
 */

import React, { useState } from 'react';
import { Course } from '../types';
import Modal from './Modal'; // It used the generic Modal component as a base.

// This defines the "props" or properties the component was designed to accept.
interface AddCourseModalProps {
  onClose: () => void; // A function to close the modal.
  onAdd: (course: Course) => void; // A function to pass the newly created course back to the parent.
  programId: string; // The ID of the program the new course would belong to.
}

// This is the main (and now deprecated) component function.
const AddCourseModal: React.FC<AddCourseModalProps> = ({ onClose, onAdd, programId }) => {
    // It used its own internal memory (`useState`) for the form fields.
    const [code, setCode] = useState('');
    const [name, setName] = useState('');
    const [target, setTarget] = useState(50);

    // This function ran when the form was submitted.
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault(); // Stop the page from reloading.
        
        // It would create a new `Course` object with some default values.
        const newCourse: Course = {
            id: `c_manual_${Date.now()}`,
            programId,
            code,
            name,
            target,
            internalWeightage: 25,
            externalWeightage: 75,
            attainmentLevels: { level3: 80, level2: 70, level1: 50 },
            status: 'Future', // New courses always started as 'Future'.
        };
        // It would then call the `onAdd` function passed from its parent to add the course.
        onAdd(newCourse);
    }

    return (
        // The component rendered a form inside the generic `Modal` wrapper.
        <Modal title="Add New Course" onClose={onClose}>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Course Code</label>
                    <input type="text" value={code} onChange={e => setCode(e.target.value)} className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" required/>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Course Name</label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" required/>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Target Attainment (%)</label>
                    <input type="number" value={target} onChange={e => setTarget(Number(e.target.value))} className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" required/>
                </div>
                <div className="flex justify-end pt-4">
                    <button type="button" onClick={onClose} className="mr-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg">Cancel</button>
                    <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg">Add Course</button>
                </div>
            </form>
        </Modal>
    )
}

export default AddCourseModal;