/**
 * @file AdminAcademicStructureTab.tsx
 * @description
 * This component is the "Academic Structure" tab within the `AdminPanel`.
 */

import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { College, Program, Batch } from '../../types';
import { Trash2, Edit } from '../Icons';
import ConfirmationModal from '../ConfirmationModal';
import apiClient from '../../api';

const AdminAcademicStructureTab: React.FC = () => {
    const { data, fetchAppData } = useAppContext();

    const [collegeName, setCollegeName] = useState('');
    const [editingCollege, setEditingCollege] = useState<College | null>(null);

    const [programName, setProgramName] = useState('');
    const [programCollegeId, setProgramCollegeId] = useState<string>('');
    const [programDuration, setProgramDuration] = useState<number>(4);
    const [editingProgram, setEditingProgram] = useState<Program | null>(null);

    const [selectedProgramIdForBatch, setSelectedProgramIdForBatch] = useState<string>('');
    const [batchStartYear, setBatchStartYear] = useState<string>('');

    const [confirmation, setConfirmation] = useState<{ isOpen: boolean, title: string, message: string, onConfirm: () => void } | null>(null);

    const batchesForSelectedProgram = useMemo(() => {
        if (!selectedProgramIdForBatch) return [];
        return data?.batches.filter(b => b.programId === selectedProgramIdForBatch).sort((a,b) => b.name.localeCompare(a.name)) || [];
    }, [data?.batches, selectedProgramIdForBatch]);

    // Memoize colleges and programs to prevent re-renders
    const colleges = useMemo(() => data?.colleges || [], [data?.colleges]);
    const programs = useMemo(() => data?.programs || [], [data?.programs]);


    const handleAddOrUpdateCollege = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingCollege) {
                await apiClient.patch(`/colleges/${editingCollege.id}/`, { name: collegeName });
                setEditingCollege(null);
            } else {
                const newCollege = { id: collegeName.toUpperCase().replace(/\s/g, ''), name: collegeName };
                await apiClient.post('/colleges/', newCollege);
            }
            await fetchAppData();
            setCollegeName('');
        } catch (error) {
            console.error('Failed to save college:', error);
            alert('Failed to save college. Please try again.');
        }
    };

    const handleDeleteCollege = (collegeId: string) => {
        setConfirmation({
            isOpen: true, title: "Delete College", message: "Are you sure? Deleting a college will also delete all its programs and associated data.",
            onConfirm: async () => {
                try {
                    await apiClient.delete(`/colleges/${collegeId}/`);
                    await fetchAppData();
                    setConfirmation(null);
                } catch (error) {
                    console.error('Failed to delete college:', error);
                    alert('Failed to delete college. Please try again.');
                }
            }
        });
    };

    const handleAddOrUpdateProgram = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const programData = { name: programName, collegeId: programCollegeId, duration: programDuration };
            if (editingProgram) {
                await apiClient.patch(`/programs/${editingProgram.id}/`, programData);
                setEditingProgram(null);
            } else {
                await apiClient.post('/programs/', { ...programData, id: `P_${Date.now()}` });
            }
            await fetchAppData();
            setProgramName('');
            setProgramCollegeId('');
        } catch (error) {
            console.error('Failed to save program:', error);
            alert('Failed to save program. Please try again.');
        }
    };

    const handleDeleteProgram = (programId: string) => {
        setConfirmation({
            isOpen: true, title: "Delete Program", message: "Are you sure?",
            onConfirm: async () => {
                try {
                    await apiClient.delete(`/programs/${programId}/`);
                    await fetchAppData();
                    setConfirmation(null);
                } catch (error) {
                    console.error('Failed to delete program:', error);
                    alert('Failed to delete program. Please try again.');
                }
            }
        });
    };

    const handleAddBatch = async (e: React.FormEvent) => {
        e.preventDefault();
        const program = data?.programs.find(p => p.id === selectedProgramIdForBatch);
        if (!program || !batchStartYear) return;

        const startYearNum = parseInt(batchStartYear, 10);
        const endYear = startYearNum + program.duration;
        const batchName = `${startYearNum}-${endYear}`;

        if (data?.batches.some(b => b.programId === program.id && b.name === batchName)) {
            alert(`Batch ${batchName} already exists for this program.`); return;
        }
        const newBatch: Omit<Batch, 'id'> = { programId: program.id, name: batchName };

        try {
            await apiClient.post('/batches/', { ...newBatch, id: `B_${program.id}_${startYearNum}` });
            await fetchAppData();
            setBatchStartYear('');
        } catch (error) {
            console.error('Failed to add batch:', error);
            alert('Failed to add batch. Please try again.');
        }
    };

    const handleDeleteBatch = (batchId: string) => {
        setConfirmation({
            isOpen: true, title: "Delete Batch", message: "Are you sure?",
            onConfirm: async () => {
                try {
                    await apiClient.delete(`/batches/${batchId}/`);
                    await fetchAppData();
                    setConfirmation(null);
                } catch (error) {
                    console.error('Failed to delete batch:', error);
                    alert('Failed to delete batch. Please try again.');
                }
            }
        });
    };


    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Colleges Section */}
            <div className="lg:col-span-1 space-y-4">
                <h3 className="text-xl font-semibold text-gray-700\">Manage Colleges</h3>
                <form onSubmit={handleAddOrUpdateCollege} className="p-4 bg-gray-50 rounded-lg space-y-3">
                    <input type="text" placeholder="College Name" value={collegeName} onChange={e => setCollegeName(e.target.value)} className="w-full p-2 border rounded" required />
                    <button type="submit" className="w-full bg-indigo-600 text-white p-2 rounded hover:bg-indigo-700">{editingCollege ? 'Update College' : 'Add College'}</button>
                    {editingCollege && <button type="button" onClick={() => { setEditingCollege(null); setCollegeName(''); }} className="w-full bg-gray-300 p-2 rounded">Cancel Edit</button>}
                </form>
                <ul className="space-y-2">
                    {colleges.map(c => (
                        <li key={c.id} className="flex justify-between items-center p-2 border rounded">
                            <span>{c.name}</span>
                            <div>
                                <button onClick={() => { setEditingCollege(c); setCollegeName(c.name); }} className="p-1 text-blue-600 hover:text-blue-800"><Edit /></button>
                                <button onClick={() => handleDeleteCollege(c.id)} className="p-1 text-red-600 hover:text-red-800"><Trash2 /></button>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Programs Section */}
            <div className="lg:col-span-1 space-y-4">
                <h3 className="text-xl font-semibold text-gray-700\">Manage Programs</h3>
                <form onSubmit={handleAddOrUpdateProgram} className="p-4 bg-gray-50 rounded-lg space-y-3">
                    <input type="text" placeholder="Program Name" value={programName} onChange={e => setProgramName(e.target.value)} className="w-full p-2 border rounded" required />
                    <select value={programCollegeId} onChange={e => setProgramCollegeId(e.target.value)} className="w-full p-2 border rounded" required>
                        <option value="">Select College</option>
                        {colleges.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <input type="number" placeholder="Duration (years)" value={programDuration} onChange={e => setProgramDuration(parseInt(e.target.value))} className="w-full p-2 border rounded" required />
                    <button type="submit" className="w-full bg-indigo-600 text-white p-2 rounded hover:bg-indigo-700">{editingProgram ? 'Update Program' : 'Add Program'}</button>
                    {editingProgram && <button type="button" onClick={() => { setEditingProgram(null); setProgramName(''); setProgramCollegeId(''); }} className="w-full bg-gray-300 p-2 rounded">Cancel Edit</button>}
                </form>
                <ul className="space-y-2">
                    {programs.map(p => (
                        <li key={p.id} className="flex justify-between items-center p-2 border rounded">
                            <span>{p.name} ({colleges.find(c => c.id === p.collegeId)?.name})</span>
                            <div>
                                <button onClick={() => { setEditingProgram(p); setProgramName(p.name); setProgramCollegeId(p.collegeId); setProgramDuration(p.duration); }} className="p-1 text-blue-600 hover:text-blue-800"><Edit /></button>
                                <button onClick={() => handleDeleteProgram(p.id)} className="p-1 text-red-600 hover:text-red-800"><Trash2 /></button>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Batches Section */}
            <div className="lg:col-span-1 space-y-4">
                <h3 className="text-xl font-semibold text-gray-700">Manage Batches</h3>
                <div className="p-4 bg-gray-50 rounded-lg space-y-3">
                    <select value={selectedProgramIdForBatch} onChange={e => setSelectedProgramIdForBatch(e.target.value)} className="w-full p-2 border rounded">
                        <option value="">Select Program to Add Batch</option>
                        {programs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                    {selectedProgramIdForBatch && (
                        <form onSubmit={handleAddBatch} className="space-y-3">
                            <input type="text" pattern="\d{4}" title="Enter a 4-digit year" placeholder="Batch Start Year (e.g., 2024)" value={batchStartYear} onChange={e => setBatchStartYear(e.target.value)} className="w-full p-2 border rounded" required />
                            <button type="submit" className="w-full bg-indigo-600 text-white p-2 rounded hover:bg-indigo-700">Add Batch</button>
                        </form>
                    )}
                </div>
                {selectedProgramIdForBatch && (
                    <ul className="space-y-2">
                        {batchesForSelectedProgram.map(b => (
                            <li key={b.id} className="flex justify-between items-center p-2 border rounded">
                                <span>Batch {b.name}</span>
                                <button onClick={() => handleDeleteBatch(b.id)} className="p-1 text-red-600 hover:text-red-800"><Trash2 /></button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {confirmation?.isOpen && (
                <ConfirmationModal isOpen={confirmation.isOpen} title={confirmation.title} message={confirmation.message} onConfirm={confirmation.onConfirm} onClose={() => setConfirmation(null)}/>
            )}
        </div>
    );
};

export default AdminAcademicStructureTab;
