/**
 * @file DepartmentStudentManagement.tsx
 * @description
 * This is a specialized management page for the "Department" user role.
 */

import React, { useState, useMemo, useEffect } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { Section, Student, StudentStatus } from '../types';
import ExcelUploader from '../components/ExcelUploader';
import { Trash2 } from '../components/Icons';
import SaveBar from '../components/SaveBar';
import ConfirmationModal from '../components/ConfirmationModal';
import apiClient from '../api';

const DepartmentStudentManagement: React.FC = () => {
    const { currentUser, data, fetchAppData } = useAppContext();

    const [selectedProgramId, setSelectedProgramId] = useState<string>('');
    const [selectedBatch, setSelectedBatch] = useState<string>('');
    const [newSectionName, setNewSectionName] = useState('');

    const [confirmation, setConfirmation] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
    } | null>(null);

    const [draftStudents, setDraftStudents] = useState<Student[]>([]);
    const [initialStudents, setInitialStudents] = useState<Student[]>([]);

    const programsInCollege = useMemo(() =>
        data?.programs.filter(p => p.collegeId === currentUser?.collegeId) || []
    , [data?.programs, currentUser]);

    const batchesForProgram = useMemo(() => {
        if (!selectedProgramId) return [];
        return data?.batches
            .filter(b => b.programId === selectedProgramId)
            .sort((a, b) => b.name.localeCompare(a.name)) || [];
    }, [data?.batches, selectedProgramId]);


    const { sections, students } = useMemo(() => {
        if (!selectedProgramId || !selectedBatch || !data) {
            return { sections: [], students: [] };
        }
        const batch = data.batches.find(b => b.programId === selectedProgramId && b.name === selectedBatch);
        if (!batch) {
            return { sections: [], students: [] };
        }

        const sectionsForBatch = data.sections.filter(s => s.batchId === batch.id);
        const sectionIdsForBatch = new Set(sectionsForBatch.map(s => s.id));

        const allStudentsForProgram = data.students.filter(s => s.programId === selectedProgramId);

        const studentsToDisplay = allStudentsForProgram.filter(s => 
            !s.sectionId || sectionIdsForBatch.has(s.sectionId)
        );
        
        return { sections: sectionsForBatch, students: studentsToDisplay.sort((a, b) => a.id.localeCompare(b.id)) };
    }, [selectedProgramId, selectedBatch, data]);
    
    useEffect(() => {
        setDraftStudents(students);
        setInitialStudents(students);
    }, [students]);

    const isDirty = useMemo(() => JSON.stringify(draftStudents) !== JSON.stringify(initialStudents), [draftStudents, initialStudents]);

    const handleStudentUpload = async (uploadedStudents: { id: string; name: string }[]) => {
        if (!selectedProgramId) return;

        const existingStudentIds = new Set(data?.students.map(s => String(s.id).toLowerCase()));
        const newStudents: Omit<Student, 'id'>[] = uploadedStudents
            .filter(row => row.id && row.name && !existingStudentIds.has(String(row.id).toLowerCase()))
            .map(row => ({
                name: String(row.name),
                programId: selectedProgramId,
                status: 'Active',
                sectionId: null
            }));

        try {
            await Promise.all(newStudents.map(student => apiClient.post('/students/', student)));
            await fetchAppData();
            alert(`${newStudents.length} new students added.`);
        } catch (error) {
            console.error('Failed to upload students:', error);
            alert('Failed to upload students. Please try again.');
        }
    };
    
    const handleAddSection = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newSectionName.trim() || !selectedProgramId || !selectedBatch) return;

        const batch = data?.batches.find(b => b.programId === selectedProgramId && b.name === selectedBatch);
        if (!batch) {
            alert("Selected batch is invalid. Please refresh.");
            return;
        }

        const newSection: Omit<Section, 'id'> = {
            name: newSectionName.trim().toUpperCase(),
            programId: selectedProgramId,
            batchId: batch.id,
        };

        try {
            await apiClient.post('/sections/', newSection);
            await fetchAppData();
            setNewSectionName('');
        } catch (error) {
            console.error('Failed to add section:', error);
            alert('Failed to add section. Please try again.');
        }
    };

    const performDeleteSection = async (sectionId: string) => {
        try {
            await apiClient.delete(`/sections/${sectionId}/`);
            await fetchAppData();
            setConfirmation(null);
        } catch (error) {
            console.error('Failed to delete section:', error);
            alert('Failed to delete section. Please try again.');
        }
    };

    const handleDeleteSection = (sectionId: string) => {
         if (isDirty) { alert("Please save or cancel your pending student assignment changes before deleting a section."); return; }
        setConfirmation({
            isOpen: true,
            title: "Confirm Section Deletion",
            message: "Are you sure? All students in this section will be unassigned.",
            onConfirm: () => performDeleteSection(sectionId),
        });
    };
    
    const handleStudentChange = (studentId: string, field: 'sectionId' | 'status', value: string | null) => {
        setDraftStudents(prev => prev.map(s => s.id === studentId ? { ...s, [field]: value } : s));
    };

    const handleSave = async () => {
        try {
            await Promise.all(draftStudents.map(student =>
                apiClient.patch(`/students/${student.id}/`, student)
            ));
            await fetchAppData();
            setInitialStudents(draftStudents);
            alert("Student assignments saved!");
        } catch (error) {
            console.error('Failed to save student assignments:', error);
            alert('Failed to save assignments. Please try again.');
        }
    };
    
    const handleCancel = () => {
        setDraftStudents(initialStudents);
    };

    return (
        <div className="space-y-8 pb-20">
            <h1 className="text-3xl font-bold text-gray-800\">Student Management</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-white rounded-lg shadow-md">
                <div>
                    <label htmlFor="program-select\" className="block text-sm font-medium text-gray-700\">Program</label>
                    <select id="program-select\" value={selectedProgramId} onChange={e => setSelectedProgramId(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-white text-gray-900 border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md\">
                        <option value="">-- Select a Program --</option>
                        {programsInCollege.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="batch-select\" className="block text-sm font-medium text-gray-700\">Batch</label>
                    <select id="batch-select\" value={selectedBatch} onChange={e => setSelectedBatch(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-white text-gray-900 border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md\" disabled={!selectedProgramId}>
                        <option value="">-- Select a Batch --</option>
                        {batchesForProgram.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
                    </select>
                </div>
            </div>

            {selectedProgramId && selectedBatch && (
                <>
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-xl font-semibold text-gray-700 mb-4\">Manage Sections</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="font-semibold text-gray-600 mb-2\">Existing Sections</h4>
                                <ul className="space-y-2">
                                    {sections.map(section => (
                                        <li key={section.id} className="flex justify-between items-center p-2 bg-gray-100 rounded">
                                            <span>Section {section.name}</span>
                                            <button onClick={() => handleDeleteSection(section.id)} className="text-red-500 hover:text-red-700\"><Trash2 className="w-4 h-4\" /></button>
                                        </li>
                                    ))}
                                    {sections.length === 0 && <p className="text-sm text-gray-500\">No sections created yet.</p>}
                                </ul>
                            </div>
                            <form onSubmit={handleAddSection} className="space-y-2">
                                <h4 className="font-semibold text-gray-600\">Add New Section</h4>
                                <input type="text" value={newSectionName} onChange={e => setNewSectionName(e.target.value)} placeholder="e.g., C" className="w-full p-2 border border-gray-300 rounded-md\" required />
                                <button type="submit" className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700\">Add Section</button>
                            </form>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-semibold text-gray-700\">Student Assignments</h3>
                            <ExcelUploader<{ id: string; name: string }> onFileUpload={handleStudentUpload} label="Upload Students" format="cols: id, name" />
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider\">Student ID</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider\">Student Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider\">Assigned Section</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider\">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {draftStudents.map(student => (
                                        <tr key={student.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900\">{student.id}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600\">{student.name}</td>
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
                                                    <option value="Active\">Active</option>
                                                    <option value="Inactive\">Inactive</option>
                                                </select>
                                            </td>
                                        </tr>
                                    ))}
                                     {draftStudents.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="text-center py-8 text-gray-500\">
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
