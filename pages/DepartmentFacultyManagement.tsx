/**
 * @file DepartmentFacultyManagement.tsx
 * @description
 * This is a specialized management page for the "Department" user role.
 */

import React, { useMemo, useState, useEffect } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { User } from '../types';
import Modal from '../components/Modal';
import { Edit } from '../components/Icons';
import SaveBar from '../components/SaveBar';
import apiClient from '../api';

const TeacherAssignmentModal: React.FC<{ teacher: User; onClose: () => void; }> = ({ teacher, onClose }) => {
    const { currentUser, data, fetchAppData } = useAppContext();
    const [selectedPcIds, setSelectedPcIds] = useState<string[]>(teacher.programCoordinatorIds || []);
    
    const programCoordinators = useMemo(() =>
        data?.users.filter(u => u.role === 'Program Co-ordinator' && u.departmentId === currentUser?.id) || []
    , [data?.users, currentUser]);

    const handleCheckboxChange = (pcId: string, isChecked: boolean) => {
        setSelectedPcIds(prev => isChecked ? [...prev, pcId] : prev.filter(id => id !== pcId));
    };

    const handleSave = async () => {
        try {
            await apiClient.patch(`/users/${teacher.id}/`, { programCoordinatorIds: selectedPcIds });
            await fetchAppData();
            onClose();
        } catch (error) {
            console.error('Failed to assign teacher:', error);
            alert('Failed to assign teacher. Please try again.');
        }
    };

    return (
        <Modal title={`Assign Co-ordinators for ${teacher.name}`} onClose={onClose}>
            <>
                <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                    <p className="text-sm text-gray-600\">Select the Program Co-ordinators this teacher reports to.</p>
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
                    {programCoordinators.length === 0 && <p className="text-gray-500\">No Program Co-ordinators found in this department.</p>}
                </div>
                <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t">
                    <button type="button" onClick={onClose} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50\">Cancel</button>
                    <button type="button" onClick={handleSave} className="bg-indigo-600 text-white py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium hover:bg-indigo-700\">Save Assignments</button>
                </div>
            </>
        </Modal>
    );
};


const DepartmentFacultyManagement: React.FC = () => {
    const { currentUser, data, fetchAppData } = useAppContext();
    const [editingTeacher, setEditingTeacher] = useState<User | null>(null);

    const { programs, programCoordinators, teachers } = useMemo(() => {
        if (!currentUser?.collegeId || !data) return { programs: [], programCoordinators: [], teachers: [] };
        
        const collegePrograms = data.programs.filter(p => p.collegeId === currentUser.collegeId);
        const collegePcs = data.users.filter(u => u.role === 'Program Co-ordinator' && u.departmentId === currentUser.id);
        const pcIds = new Set(collegePcs.map(pc => pc.id));
        const collegeTeachers = data.users.filter(u => u.role === 'Teacher' && (u.programCoordinatorIds || []).some(id => pcIds.has(id)));

        return { programs: collegePrograms, programCoordinators: collegePcs, teachers: collegeTeachers };
    }, [currentUser, data]);

    const [draftPcAssignments, setDraftPcAssignments] = useState<{ [programId: string]: string }>({});
    const [initialPcAssignments, setInitialPcAssignments] = useState<{ [programId: string]: string }>({});

    useEffect(() => {
        const assignments: { [programId: string]: string } = {};
        programs.forEach(p => {
            const assignedPC = programCoordinators.find(pc => pc.programId === p.id);
            assignments[p.id] = assignedPC ? assignedPC.id : '';
        });
        setDraftPcAssignments(assignments);
        setInitialPcAssignments(assignments);
    }, [programs, programCoordinators]);

    const isDirty = useMemo(() => JSON.stringify(draftPcAssignments) !== JSON.stringify(initialPcAssignments), [draftPcAssignments, initialPcAssignments]);

    const handleProgramAssignmentChange = (programId: string, pcId: string) => {
        setDraftPcAssignments(prev => ({ ...prev, [programId]: pcId }));
    };

    const handleSave = async () => {
        try {
            await Promise.all(Object.entries(draftPcAssignments).map(([programId, pcId]) =>
                apiClient.patch(`/programs/${programId}/`, { programCoordinatorId: pcId || null })
            ));
            await fetchAppData();
            setInitialPcAssignments(draftPcAssignments);
            alert("PC assignments saved successfully!");
        } catch (error) {
            console.error('Failed to save PC assignments:', error);
            alert('Failed to save assignments. Please try again.');
        }
    };

    const handleCancel = () => {
        setDraftPcAssignments(initialPcAssignments);
    };
    
    return (
        <div className="space-y-8 pb-20">
            <h1 className="text-3xl font-bold text-gray-800\">Faculty Management</h1>

            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold text-gray-700 mb-4\">Program Co-ordinator Assignments</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider\">Program</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider\">Assigned Co-ordinator</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {programs.map(program => (
                                <tr key={program.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900\">{program.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500\">
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

            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold text-gray-700 mb-4\">Teacher Assignments to Co-ordinators</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                             <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider\">Teacher</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider\">Assigned Co-ordinator(s)</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider\">Actions</th>
                            </tr>
                        </thead>
                         <tbody className="bg-white divide-y divide-gray-200">
                            {teachers.map(teacher => (
                                <tr key={teacher.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900\">{teacher.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500\">
                                        {teacher.programCoordinatorIds?.map(pcId => data?.users.find(u => u.id === pcId)?.name).filter(Boolean).join(', ') || 'N/A'}
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

            {editingTeacher && (
                <TeacherAssignmentModal teacher={editingTeacher} onClose={() => setEditingTeacher(null)} />
            )}

            <SaveBar isDirty={isDirty} onSave={handleSave} onCancel={handleCancel} />
        </div>
    );
};

export default DepartmentFacultyManagement;
