/**
 * @file DepartmentStudentManagement.tsx
 * @description
 * This is a specialized management page exclusively for the "Department" user role. It gives
 * them a powerful interface to manage the student body within their college at a high level.
 *
 * What it does:
 * 1.  **Cascading Selection**: It provides dropdowns for the Department Head to first select a
 *     Program within their college, and then a specific Batch for that program.
 * 2.  **Section Management**:
 *     - It shows a list of all class sections (e.g., "A", "B") created for the selected batch.
 *     - It allows the Department Head to create new sections and delete existing ones.
 * 3.  **Student Assignment**:
 *     - It displays a table of all students who belong to the selected program.
 *     - For each student, it provides a dropdown to assign them to one of the created sections.
 *     - It allows changing a student's status ('Active' or 'Inactive').
 * 4.  **Bulk Upload**: It provides an Excel uploader to add a master list of new students to
 *     a program, who can then be assigned to sections.
 * 5.  **Draft State**: All changes to student assignments (changing a section or status) are
 *     held in a temporary "draft state". The `SaveBar` appears, requiring the user to
 *     explicitly save or cancel their changes.
 */

import React, { useState, useMemo, useEffect } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { Section, Student, StudentStatus } from '../types';
import ExcelUploader from '../components/ExcelUploader';
import { Trash2 } from '../components/Icons';
import SaveBar from '../components/SaveBar';
import ConfirmationModal from '../components/ConfirmationModal';

const DepartmentStudentManagement: React.FC = () => {
    // We get all the data and tools from the "magic backpack".
    const { currentUser, data, setData } = useAppContext();

    // --- State Management for Forms and UI ---
    // Memory for the cascading dropdowns that filter the page content.
    const [selectedProgramId, setSelectedProgramId] = useState<string>('');
    const [selectedBatch, setSelectedBatch] = useState<string>('');
    // Memory for the "Add New Section" form field.
    const [newSectionName, setNewSectionName] = useState('');

    // Memory for the "Are you sure?" confirmation popup.
    const [confirmation, setConfirmation] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
    } | null>(null);

    // --- Draft State Management for Student Assignments ---
    // `draftStudents` is the temporary copy of the student list we make changes to.
    const [draftStudents, setDraftStudents] = useState<Student[]>([]);
    // `initialStudents` is the saved version, used for comparison to see if there are unsaved changes.
    const [initialStudents, setInitialStudents] = useState<Student[]>([]);

    // `useMemo` is a "smart calculator" that filters the list of programs for the dropdown.
    // It only shows programs that belong to the Department Head's own college.
    const programsInCollege = useMemo(() =>
        data.programs.filter(p => p.collegeId === currentUser?.collegeId)
    , [data.programs, currentUser]);

    // This one calculates the available batches for the selected program.
    const batchesForProgram = useMemo(() => {
        if (!selectedProgramId) return [];
        return data.batches
            .filter(b => b.programId === selectedProgramId)
            .sort((a, b) => b.name.localeCompare(a.name)); // Show newest batches first.
    }, [data.batches, selectedProgramId]);


    /**
     * This `useMemo` hook is the main data filter for the page. Based on the selected program
     * and batch, it figures out exactly which sections and students to display.
     */
    const { sections, students } = useMemo(() => {
        // If the user hasn't selected both a program and a batch, we show nothing.
        if (!selectedProgramId || !selectedBatch) {
            return { sections: [], students: [] };
        }
        const batch = data.batches.find(b => b.programId === selectedProgramId && b.name === selectedBatch);
        if (!batch) {
            return { sections: [], students: [] };
        }

        // Find all sections that belong to the selected batch.
        const sectionsForBatch = data.sections.filter(s => s.batchId === batch.id);
        const sectionIdsForBatch = new Set(sectionsForBatch.map(s => s.id));

        // Find all students in the selected program.
        const allStudentsForProgram = data.students.filter(s => s.programId === selectedProgramId);

        // From those students, we only want to show the ones who are either already in one of
        // this batch's sections, OR who are currently unassigned (`!s.sectionId`).
        const studentsToDisplay = allStudentsForProgram.filter(s => 
            !s.sectionId || sectionIdsForBatch.has(s.sectionId)
        );
        
        // Return the final filtered lists, sorted for consistency.
        return { sections: sectionsForBatch, students: studentsToDisplay.sort((a, b) => a.id.localeCompare(b.id)) };
    }, [selectedProgramId, selectedBatch, data.sections, data.students, data.batches]);
    
    // `useEffect` runs code "on the side". This one runs whenever the `students` list changes
    // (e.g., when the user selects a new batch). It loads the new list of students into our
    // temporary "draft" states.
    useEffect(() => {
        setDraftStudents(students);
        setInitialStudents(students);
    }, [students]);

    // `isDirty` checks if there are any unsaved changes by comparing the draft and initial student lists.
    const isDirty = useMemo(() => JSON.stringify(draftStudents) !== JSON.stringify(initialStudents), [draftStudents, initialStudents]);

    // This is called by the ExcelUploader component when a file is parsed.
    const handleStudentUpload = (uploadedStudents: { id: string; name: string }[]) => {
        if (!selectedProgramId) return;

        const existingStudentIds = new Set(data.students.map(s => String(s.id).toLowerCase()));
        // Convert the Excel rows into proper `Student` objects, filtering out any duplicates.
        const newStudents: Student[] = uploadedStudents
            .filter(row => row.id && row.name && !existingStudentIds.has(String(row.id).toLowerCase()))
            .map(row => ({
                id: String(row.id),
                name: String(row.name),
                programId: selectedProgramId,
                status: 'Active',
                sectionId: null // New students are always unassigned initially.
            }));

        // Add the new students to our main application data.
        setData(prev => ({
            ...prev,
            students: [...prev.students, ...newStudents]
        }));
        alert(`${newStudents.length} new students added to the master list. Please assign them to a section and batch.`);
    };
    
    // This runs when the "Add Section" form is submitted.
    const handleAddSection = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newSectionName.trim() || !selectedProgramId || !selectedBatch) return;

        const batch = data.batches.find(b => b.programId === selectedProgramId && b.name === selectedBatch);
        if (!batch) {
            alert("Selected batch is invalid. Please refresh.");
            return;
        }

        // Create the new section object and add it to our main data.
        const newSection: Section = {
            id: `sec_${Date.now()}`,
            name: newSectionName.trim().toUpperCase(),
            programId: selectedProgramId,
            batchId: batch.id,
        };
        setData(prev => ({...prev, sections: [...prev.sections, newSection]}));
        setNewSectionName(''); // Clear the form field.
    };

    // This is the function that actually performs the deletion after the user confirms.
    const performDeleteSection = (sectionId: string) => {
        setData(prev => {
            // Filter out the section that needs to be deleted.
            const updatedSections = prev.sections.filter(s => s.id !== sectionId);
            
            // Unassign all students who were in the deleted section.
            const updatedStudents = prev.students.map(student => 
                student.sectionId === sectionId ? { ...student, sectionId: null } : student
            );
            
            // Return the new, updated state.
            return { 
                ...prev, 
                sections: updatedSections,
                students: updatedStudents 
            };
        });
        setConfirmation(null); // Close the popup.
    };

    // This runs when the trash can icon next to a section is clicked.
    const handleDeleteSection = (sectionId: string) => {
         if (isDirty) { alert("Please save or cancel your pending student assignment changes before deleting a section."); return; }
        // It opens the "Are you sure?" popup first.
        setConfirmation({
            isOpen: true,
            title: "Confirm Section Deletion",
            message: "Are you sure? All students in this section will be unassigned.",
            onConfirm: () => performDeleteSection(sectionId),
        });
    };
    
    // This runs whenever a user changes a student's "Assigned Section" or "Status" dropdown.
    const handleStudentChange = (studentId: string, field: 'sectionId' | 'status', value: string | null) => {
        // It only updates our temporary `draftStudents` copy, not the main data.
        setDraftStudents(prev => prev.map(s => s.id === studentId ? { ...s, [field]: value } : s));
    };

    // This runs when "Save Changes" is clicked on the SaveBar.
    const handleSave = () => {
        setData(prev => {
            // This is a smart way to update: we find all the students we were editing
            // in our draft, and merge them back into the main list of all students.
            const draftStudentIds = new Set(draftStudents.map(s => s.id));
            const otherStudents = prev.students.filter(s => !draftStudentIds.has(s.id));
            return { ...prev, students: [...otherStudents, ...draftStudents] };
        });
        setInitialStudents(draftStudents); // The draft is now the new "saved" state.
        alert("Student assignments saved!");
    };
    
    // This runs when "Cancel" is clicked. It discards all changes.
    const handleCancel = () => {
        setDraftStudents(initialStudents);
    };

    return (
        // `pb-20` adds padding at the bottom so the SaveBar doesn't cover content.
        <div className="space-y-8 pb-20">
            <h1 className="text-3xl font-bold text-gray-800">Student Management</h1>

            {/* Top section with dropdowns for filtering. */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-white rounded-lg shadow-md">
                <div>
                    <label htmlFor="program-select" className="block text-sm font-medium text-gray-700">Program</label>
                    <select id="program-select" value={selectedProgramId} onChange={e => setSelectedProgramId(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-white text-gray-900 border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                        <option value="">-- Select a Program --</option>
                        {programsInCollege.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="batch-select" className="block text-sm font-medium text-gray-700">Batch</label>
                    <select id="batch-select" value={selectedBatch} onChange={e => setSelectedBatch(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-white text-gray-900 border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md" disabled={!selectedProgramId}>
                        <option value="">-- Select a Batch --</option>
                        {batchesForProgram.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
                    </select>
                </div>
            </div>

            {/* Main content area, only visible after program/batch are selected. */}
            {selectedProgramId && selectedBatch && (
                <>
                    {/* Section Management */}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-xl font-semibold text-gray-700 mb-4">Manage Sections</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="font-semibold text-gray-600 mb-2">Existing Sections</h4>
                                <ul className="space-y-2">
                                    {sections.map(section => (
                                        <li key={section.id} className="flex justify-between items-center p-2 bg-gray-100 rounded">
                                            <span>Section {section.name}</span>
                                            <button onClick={() => handleDeleteSection(section.id)} className="text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4" /></button>
                                        </li>
                                    ))}
                                    {sections.length === 0 && <p className="text-sm text-gray-500">No sections created yet.</p>}
                                </ul>
                            </div>
                            <form onSubmit={handleAddSection} className="space-y-2">
                                <h4 className="font-semibold text-gray-600">Add New Section</h4>
                                <input type="text" value={newSectionName} onChange={e => setNewSectionName(e.target.value)} placeholder="e.g., C" className="w-full p-2 border border-gray-300 rounded-md" required />
                                <button type="submit" className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700">Add Section</button>
                            </form>
                        </div>
                    </div>

                    {/* Student Assignment Table */}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-semibold text-gray-700">Student Assignments</h3>
                            <ExcelUploader<{ id: string; name: string }> onFileUpload={handleStudentUpload} label="Upload Students" format="cols: id, name" />
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student ID</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned Section</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {draftStudents.map(student => (
                                        <tr key={student.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student.id}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{student.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <select
                                                    value={student.sectionId || ''}
                                                    onChange={(e) => handleStudentChange(student.id, 'sectionId', e.target.value || null)}
                                                    className="w-full p-2 border bg-white text-gray-900 border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                >
                                                    <option value="">-- Unassigned --</option>
                                                    {sections.map(section => (
                                                        <option key={section.id} value={section.id}>Section {section.name}</option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <select
                                                    value={student.status}
                                                    onChange={(e) => handleStudentChange(student.id, 'status', e.target.value as StudentStatus)}
                                                    className="w-full p-2 border bg-white text-gray-900 border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                >
                                                    <option value="Active">Active</option>
                                                    <option value="Inactive">Inactive</option>
                                                </select>
                                            </td>
                                        </tr>
                                    ))}
                                     {draftStudents.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="text-center py-8 text-gray-500">
                                                No students found for this program, or no batch selected.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
            
            <SaveBar isDirty={isDirty} onSave={handleSave} onCancel={handleCancel} />
            {confirmation && <ConfirmationModal isOpen={confirmation.isOpen} title={confirmation.title} message={confirmation.message} onConfirm={confirmation.onConfirm} onClose={() => setConfirmation(null)}/>}
        </div>
    );
};

export default DepartmentStudentManagement;