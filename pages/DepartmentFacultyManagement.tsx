/**
 * @file DepartmentFacultyManagement.tsx
 * @description
 * This is a specialized management page exclusively for the "Department" user role. It allows
 * them to manage the faculty hierarchy within their college.
 *
 * The page is divided into two main sections:
 *
 * 1.  **Program Co-ordinator (PC) Assignments**:
 *     - It shows a table of all programs in the Department Head's college.
 *     - For each program, it provides a dropdown to assign a single PC to manage it.
 *     - This section uses a "draft state" pattern. Changes are not saved immediately,
 *       and the `SaveBar` appears to allow saving or canceling all changes at once.
 *
 * 2.  **Teacher Assignments**:
 *     - It shows a table of all teachers who report to the PCs in this department.
 *     - For each teacher, it shows which PC(s) they are currently assigned to.
 *     - It provides a "Manage" button that opens a popup modal (`TeacherAssignmentModal`),
 *       where the Department Head can use checkboxes to assign a teacher to one or more PCs.
 *     - Changes made in this modal are saved immediately when the modal is saved.
 */

import React, { useMemo, useState, useEffect } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { User } from '../types';
import Modal from '../components/Modal';
import { Edit } from '../components/Icons';
import SaveBar from '../components/SaveBar';

/**
 * A private component for the popup modal used to assign teachers to PCs.
 * It's defined inside this file because it's only used here.
 */
const TeacherAssignmentModal: React.FC<{ teacher: User; onClose: () => void; }> = ({ teacher, onClose }) => {
    const { currentUser, data, setData } = useAppContext();
    // A piece of memory to keep track of which checkboxes are checked.
    const [selectedPcIds, setSelectedPcIds] = useState<string[]>(teacher.programCoordinatorIds || []);
    
    // Find all PCs that belong to the current Department Head.
    const programCoordinators = useMemo(() =>
        data.users.filter(u => u.role === 'Program Co-ordinator' && u.departmentId === currentUser?.id)
    , [data.users, currentUser]);

    // This runs when a checkbox is clicked.
    const handleCheckboxChange = (pcId: string, isChecked: boolean) => {
        setSelectedPcIds(prev => isChecked ? [...prev, pcId] : prev.filter(id => id !== pcId));
    };

    // This runs when the "Save Assignments" button in the modal is clicked.
    const handleSave = () => {
        // It updates the main application data immediately.
        setData(prev => ({
            ...prev,
            users: prev.users.map(u => u.id === teacher.id ? {...u, programCoordinatorIds: selectedPcIds } : u)
        }));
        onClose(); // Close the modal.
    };

    return (
        <Modal title={`Assign Co-ordinators for ${teacher.name}`} onClose={onClose}>
            {/* FIX: Replaced placeholder comment with actual modal content to satisfy the 'children' prop requirement. */}
            <>
                <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                    <p className="text-sm text-gray-600">Select the Program Co-ordinators this teacher reports to.</p>
                    {programCoordinators.map(pc => (
                        <div key={pc.id} className="flex items-center">
                            <input
                                type="checkbox"
                                id={`pc-assign-${pc.id}`}
                                checked={selectedPcIds.includes(pc.id)}
                                onChange={(e) => handleCheckboxChange(pc.id, e.target.checked)}
                                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <label htmlFor={`pc-assign-${pc.id}`} className="ml-3 text-sm text-gray-700">
                                {pc.name}
                            </label>
                        </div>
                    ))}
                    {programCoordinators.length === 0 && <p className="text-gray-500">No Program Co-ordinators found in this department.</p>}
                </div>
                <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t">
                    <button type="button" onClick={onClose} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                    <button type="button" onClick={handleSave} className="bg-indigo-600 text-white py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium hover:bg-indigo-700">Save Assignments</button>
                </div>
            </>
        </Modal>
    );
};


// This is the main component for the Department Faculty Management page.
const DepartmentFacultyManagement: React.FC = () => {
    const { currentUser, data, setData } = useAppContext();
    // A piece of memory to remember which teacher is being edited in the modal.
    const [editingTeacher, setEditingTeacher] = useState<User | null>(null);

    // `useMemo` is a smart calculator that filters all the faculty and programs for this department.
    const { programs, programCoordinators, teachers } = useMemo(() => {
        if (!currentUser?.collegeId) return { programs: [], programCoordinators: [], teachers: [] };
        
        const collegePrograms = data.programs.filter(p => p.collegeId === currentUser.collegeId);
        const collegePcs = data.users.filter(u => u.role === 'Program Co-ordinator' && u.departmentId === currentUser.id);
        const pcIds = new Set(collegePcs.map(pc => pc.id));
        const collegeTeachers = data.users.filter(u => u.role === 'Teacher' && (u.programCoordinatorIds || []).some(id => pcIds.has(id)));

        return { programs: collegePrograms, programCoordinators: collegePcs, teachers: collegeTeachers };
    }, [currentUser, data]);

    // --- Draft State for PC Assignments ---
    const [draftPcAssignments, setDraftPcAssignments] = useState<{ [programId: string]: string }>({});
    const [initialPcAssignments, setInitialPcAssignments] = useState<{ [programId: string]: string }>({});

    // This effect loads the initial PC assignments into our draft state.
    useEffect(() => {
        const assignments: { [programId: string]: string } = {};
        programs.forEach(p => {
            const assignedPC = programCoordinators.find(pc => pc.programId === p.id);
            assignments[p.id] = assignedPC ? assignedPC.id : '';
        });
        setDraftPcAssignments(assignments);
        setInitialPcAssignments(assignments);
    }, [programs, programCoordinators]);

    // `isDirty` checks if there are any unsaved PC assignment changes.
    const isDirty = useMemo(() => JSON.stringify(draftPcAssignments) !== JSON.stringify(initialPcAssignments), [draftPcAssignments, initialPcAssignments]);

    // This runs when a PC assignment dropdown is changed.
    const handleProgramAssignmentChange = (programId: string, pcId: string) => {
        setDraftPcAssignments(prev => ({ ...prev, [programId]: pcId }));
    };

    // This runs when "Save Changes" is clicked on the SaveBar.
    const handleSave = () => {
        setData(prev => {
            // This is a complex update. First, it unassigns ALL PCs managed by this department head.
            const updatedUsers = prev.users.map(user => {
                if (user.role === 'Program Co-ordinator' && user.departmentId === currentUser?.id) {
                    const { programId, ...rest } = user; // This removes the `programId` property.
                    return rest as User;
                }
                return user;
            }).map(user => {
                // Then, it re-assigns them based on the `draftPcAssignments`.
                const assignedProgramId = Object.keys(draftPcAssignments).find(
                    progId => draftPcAssignments[progId] === user.id
                );
                return assignedProgramId ? { ...user, programId: assignedProgramId } : user;
            });

            return { ...prev, users: updatedUsers };
        });
        setInitialPcAssignments(draftPcAssignments); // Reset the dirty check.
        alert("PC assignments saved successfully!");
    };

    const handleCancel = () => {
        setDraftPcAssignments(initialPcAssignments);
    };
    
    return (
        <div className="space-y-8 pb-20">
            <h1 className="text-3xl font-bold text-gray-800">Faculty Management</h1>

            {/* Section 1: Program Co-ordinator Assignments */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold text-gray-700 mb-4">Program Co-ordinator Assignments</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Program</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned Co-ordinator</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {programs.map(program => (
                                <tr key={program.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{program.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <select
                                            value={draftPcAssignments[program.id] || ''}
                                            onChange={(e) => handleProgramAssignmentChange(program.id, e.target.value)}
                                            className="w-full max-w-xs p-2 border bg-white text-gray-900 border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        >
                                            <option value="">-- Unassigned --</option>
                                            {programCoordinators.map(pc => (
                                                <option key={pc.id} value={pc.id}>{pc.name}</option>
                                            ))}
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Section 2: Teacher Assignments */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold text-gray-700 mb-4">Teacher Assignments to Co-ordinators</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                             <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teacher</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned Co-ordinator(s)</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                         <tbody className="bg-white divide-y divide-gray-200">
                            {teachers.map(teacher => (
                                <tr key={teacher.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{teacher.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {teacher.programCoordinatorIds?.map(pcId => data.users.find(u => u.id === pcId)?.name).filter(Boolean).join(', ') || 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => setEditingTeacher(teacher)} className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                                            <Edit className="w-4 h-4" /> Manage
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* The modal is only rendered if `editingTeacher` is not null. */}
            {editingTeacher && (
                <TeacherAssignmentModal teacher={editingTeacher} onClose={() => setEditingTeacher(null)} />
            )}

            <SaveBar isDirty={isDirty} onSave={handleSave} onCancel={handleCancel} />
        </div>
    );
};

export default DepartmentFacultyManagement;