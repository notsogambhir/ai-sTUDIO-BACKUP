/**
 * @file AdminAcademicStructureTab.tsx
 * @description
 * This component is the "Academic Structure" tab within the `AdminPanel`. It's a powerful
 * and complex page that allows an Administrator to define the entire academic hierarchy
 * of the institution.
 *
 * It is broken down into three main management sections:
 * 1.  **Manage Colleges**:
 *     - A form to add a new college.
 *     - A list of existing colleges with "Edit" and "Delete" buttons.
 * 2.  **Manage Programs**:
 *     - A form to add a new program and assign it to a college.
 *     - A list of existing programs with "Edit" and "Delete" buttons.
 * 3.  **Manage Batches**:
 *     - A dropdown to select a program.
 *     - A form to add a new batch (e.g., "2025-2029") to the selected program. The end year
 *       is automatically calculated based on the program's duration.
 *     - A list of existing batches for that program with "Delete" buttons.
 *
 * All create, update, and delete operations happen immediately (they do not use a "draft state").
 * It uses confirmation modals for all delete operations to prevent accidental data loss.
 */

import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { College, Program, Batch } from '../../types';
import { Trash2, Edit } from '../Icons';
import ConfirmationModal from '../ConfirmationModal';

const AdminAcademicStructureTab: React.FC = () => {
    // Get all the data and tools from the "magic backpack".
    const { data, setData } = useAppContext();

    // --- State Management for Forms ---
    // State for the "Manage Colleges" form. `editingCollege` remembers if we're editing an existing one.
    const [collegeName, setCollegeName] = useState('');
    const [editingCollege, setEditingCollege] = useState<typeof data.colleges[0] | null>(null);

    // State for the "Manage Programs" form.
    const [programName, setProgramName] = useState('');
    const [programCollegeId, setProgramCollegeId] = useState<College | ''>('');
    const [programDuration, setProgramDuration] = useState<number>(4);
    const [editingProgram, setEditingProgram] = useState<Program | null>(null);

    // State for the "Manage Batches" form.
    const [selectedProgramIdForBatch, setSelectedProgramIdForBatch] = useState<string>('');
    const [batchStartYear, setBatchStartYear] = useState<string>('');

    // State for the "Are you sure?" confirmation popup.
    const [confirmation, setConfirmation] = useState<{ isOpen: boolean, title: string, message: string, onConfirm: () => void } | null>(null);

    // `useMemo` is a smart calculator that finds the batches for the program selected in the dropdown.
    const batchesForSelectedProgram = useMemo(() => {
        if (!selectedProgramIdForBatch) return [];
        return data.batches.filter(b => b.programId === selectedProgramIdForBatch).sort((a, b) => b.name.localeCompare(a.name));
    }, [data.batches, selectedProgramIdForBatch]);


    // --- Handlers for College Management ---
    const handleAddOrUpdateCollege = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingCollege) { // If we are editing...
            setData(prev => ({ ...prev, colleges: prev.colleges.map(c => c.id === editingCollege.id ? { ...c, name: collegeName } : c) }));
            setEditingCollege(null);
        } else { // If we are adding a new one...
            const newCollege = { id: collegeName.toUpperCase().replace(/\s/g, '') as College, name: collegeName };
            setData(prev => ({ ...prev, colleges: [...prev.colleges, newCollege] }));
        }
        setCollegeName(''); // Reset the form.
    };

    const handleDeleteCollege = (collegeId: College) => {
        // Open the confirmation popup before deleting.
        setConfirmation({
            isOpen: true, title: "Delete College", message: "Are you sure? Deleting a college will also delete all its programs and associated data.",
            onConfirm: () => {
                // This is where the actual deletion happens, after user confirmation.
                // NOTE: In a real app with a database, this would be a "cascading delete".
                setData(prev => ({ ...prev, colleges: prev.colleges.filter(c => c.id !== collegeId) }));
                setConfirmation(null);
            }
        });
    };

    // --- Handlers for Program Management ---
    const handleAddOrUpdateProgram = (e: React.FormEvent) => {
        e.preventDefault();
        if (!programName || !programCollegeId) return;

        if (editingProgram) {
            setData(prev => ({
                ...prev,
                programs: prev.programs.map(p => p.id === editingProgram.id ? { ...p, name: programName, collegeId: programCollegeId, duration: programDuration } : p)
            }));
            setEditingProgram(null);
        } else {
            const newProgram: Program = {
                id: `P_${Date.now()}`,
                name: programName,
                collegeId: programCollegeId,
                duration: programDuration,
            };
            setData(prev => ({ ...prev, programs: [...prev.programs, newProgram] }));
        }
        setProgramName('');
        setProgramCollegeId('');
        setProgramDuration(4);
    };
    
    const handleDeleteProgram = (programId: string) => {
        setConfirmation({
            isOpen: true, title: "Delete Program", message: "Are you sure? Deleting a program will also delete its batches, courses, and other associated data.",
            onConfirm: () => {
                setData(prev => ({ ...prev, programs: prev.programs.filter(p => p.id !== programId) }));
                setConfirmation(null);
            }
        });
    };

    // --- Handlers for Batch Management ---
    const handleAddBatch = (e: React.FormEvent) => {
        e.preventDefault();
        const program = data.programs.find(p => p.id === selectedProgramIdForBatch);
        if (!program || !batchStartYear) return;

        // Calculate the batch name (e.g., "2025-2029") from the start year and program duration.
        const startYearNum = parseInt(batchStartYear, 10);
        const endYear = startYearNum + program.duration;
        const batchName = `${startYearNum}-${endYear}`;

        // Check for duplicates before adding.
        if (data.batches.some(b => b.programId === program.id && b.name === batchName)) {
            alert(`Batch ${batchName} already exists for this program.`); return;
        }
        // Create the new batch and add it to the main data.
        const newBatch: Batch = { id: `B_${program.id}_${startYearNum}`, programId: program.id, name: batchName };
        setData(prev => ({ ...prev, batches: [...prev.batches, newBatch] }));
        setBatchStartYear(''); // Reset the form.
    };

    const handleDeleteBatch = (batchId: string) => {
        setConfirmation({
            isOpen: true, title: "Delete Batch", message: "Are you sure? Deleting a batch will also remove its sections and affect student assignments.",
            onConfirm: () => {
                setData(prev => ({ ...prev, batches: prev.batches.filter(b => b.id !== batchId) }));
                setConfirmation(null);
            }
        });
    };

    return (
        <div className="space-y-8">
            {/* Section 1: College Management */}
            <section>
                <h3 className="text-xl font-semibold text-gray-700 mb-4">Manage Colleges</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <form onSubmit={handleAddOrUpdateCollege} className="space-y-4 p-4 border rounded-lg bg-gray-50">
                        <h4 className="font-medium">{editingCollege ? 'Edit College' : 'Add New College'}</h4>
                        <div>
                            <label htmlFor="collegeName" className="block text-sm font-medium text-gray-700">College Name</label>
                            <input type="text" id="collegeName" value={collegeName} onChange={e => setCollegeName(e.target.value)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" required />
                        </div>
                        <div className="flex gap-2">
                            <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">{editingCollege ? 'Update' : 'Add'}</button>
                            {editingCollege && <button type="button" onClick={() => { setEditingCollege(null); setCollegeName(''); }} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300">Cancel</button>}
                        </div>
                    </form>
                    <div>
                        <h4 className="font-medium mb-2">Existing Colleges</h4>
                        <ul className="space-y-2">
                            {data.colleges.map(college => (
                                <li key={college.id} className="flex justify-between items-center p-2 bg-gray-100 rounded">
                                    <span>{college.name} ({college.id})</span>
                                    <div className="space-x-2">
                                        <button onClick={() => { setEditingCollege(college); setCollegeName(college.name); }} className="p-1 text-blue-600 hover:text-blue-800"><Edit className="w-4 h-4" /></button>
                                        <button onClick={() => handleDeleteCollege(college.id)} className="p-1 text-red-600 hover:text-red-800"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </section>

            {/* Section 2: Program Management */}
            <section>
                <h3 className="text-xl font-semibold text-gray-700 mb-4 border-t pt-8">Manage Programs</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <form onSubmit={handleAddOrUpdateProgram} className="space-y-4 p-4 border rounded-lg bg-gray-50">
                        <h4 className="font-medium">{editingProgram ? 'Edit Program' : 'Add New Program'}</h4>
                        <div>
                            <label htmlFor="programName" className="block text-sm font-medium text-gray-700">Program Name</label>
                            <input type="text" id="programName" value={programName} onChange={e => setProgramName(e.target.value)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" required />
                        </div>
                        <div>
                            <label htmlFor="programCollege" className="block text-sm font-medium text-gray-700">College</label>
                            <select id="programCollege" value={programCollegeId} onChange={e => setProgramCollegeId(e.target.value as College)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" required>
                                <option value="">-- Select College --</option>
                                {data.colleges.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="programDuration" className="block text-sm font-medium text-gray-700">Duration (years)</label>
                            <input type="number" id="programDuration" value={programDuration} onChange={e => setProgramDuration(Number(e.target.value))} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" required />
                        </div>
                        <div className="flex gap-2">
                            <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">{editingProgram ? 'Update' : 'Add'}</button>
                            {editingProgram && <button type="button" onClick={() => { setEditingProgram(null); setProgramName(''); setProgramCollegeId(''); setProgramDuration(4); }} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300">Cancel</button>}
                        </div>
                    </form>
                    <div>
                        <h4 className="font-medium mb-2">Existing Programs</h4>
                        <ul className="space-y-2 max-h-96 overflow-y-auto">
                            {data.programs.map(program => (
                                <li key={program.id} className="flex justify-between items-center p-2 bg-gray-100 rounded">
                                    <div>
                                        <p className="font-medium">{program.name}</p>
                                        <p className="text-sm text-gray-500">{data.colleges.find(c=>c.id === program.collegeId)?.name}</p>
                                    </div>
                                    <div className="space-x-2">
                                        <button onClick={() => { setEditingProgram(program); setProgramName(program.name); setProgramCollegeId(program.collegeId); setProgramDuration(program.duration); }} className="p-1 text-blue-600 hover:text-blue-800"><Edit className="w-4 h-4" /></button>
                                        <button onClick={() => handleDeleteProgram(program.id)} className="p-1 text-red-600 hover:text-red-800"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </section>
            
            {/* Section 3: Batch Management */}
            <section>
                <h3 className="text-xl font-semibold text-gray-700 mb-4 border-t pt-8">Manage Batches</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <label htmlFor="programForBatch" className="block text-sm font-medium text-gray-700">Select Program</label>
                        <select id="programForBatch" value={selectedProgramIdForBatch} onChange={e => setSelectedProgramIdForBatch(e.target.value)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" required>
                            <option value="">-- Select a Program --</option>
                            {data.programs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                        
                        {selectedProgramIdForBatch && (
                            <form onSubmit={handleAddBatch} className="space-y-4 p-4 mt-4 border rounded-lg bg-gray-50">
                                <h4 className="font-medium">Add New Batch</h4>
                                <div>
                                    <label htmlFor="batchStartYear" className="block text-sm font-medium text-gray-700">Start Year (e.g., 2025)</label>
                                    <input type="number" id="batchStartYear" value={batchStartYear} onChange={e => setBatchStartYear(e.target.value)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" placeholder="2025" required />
                                </div>
                                <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">Add Batch</button>
                            </form>
                        )}
                    </div>
                    <div>
                        <h4 className="font-medium mb-2">Existing Batches for Selected Program</h4>
                        <ul className="space-y-2 max-h-96 overflow-y-auto">
                            {batchesForSelectedProgram.map(batch => (
                                <li key={batch.id} className="flex justify-between items-center p-2 bg-gray-100 rounded">
                                    <span>{batch.name}</span>
                                    <button onClick={() => handleDeleteBatch(batch.id)} className="p-1 text-red-600 hover:text-red-800"><Trash2 className="w-4 h-4" /></button>
                                </li>
                            ))}
                            {selectedProgramIdForBatch && batchesForSelectedProgram.length === 0 && <p className="text-sm text-gray-500">No batches found.</p>}
                        </ul>
                    </div>
                </div>
            </section>

            {/* The confirmation modal is only rendered if it has been activated. */}
            {confirmation?.isOpen && (
                <ConfirmationModal isOpen={confirmation.isOpen} title={confirmation.title} message={confirmation.message} onConfirm={confirmation.onConfirm} onClose={() => setConfirmation(null)}/>
            )}
        </div>
    );
};

export default AdminAcademicStructureTab;
