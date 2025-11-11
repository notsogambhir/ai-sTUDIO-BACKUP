/**
 * @file ProgramOutcomesList.tsx
 * @description
 * This file defines the `ProgramOutcomesList` component, which is the main page for managing
 * Program Outcomes (POs) and viewing PO attainment data.
 */

import React, { useState, useMemo, useEffect } from 'react';
import { ProgramOutcome } from '../types';
import ExcelUploader from '../components/ExcelUploader';
import { useAppContext } from '../hooks/useAppContext';
import POAttainmentDashboard from '../components/POAttainmentDashboard';
import { Trash2 } from '../components/Icons';
import AddProgramOutcomeModal from '../components/AddProgramOutcomeModal';
import SaveBar from '../components/SaveBar';
import CoursePoLinkageDashboard from '../components/CoursePoLinkageDashboard';
import apiClient from '../api';

const ProgramOutcomesList: React.FC = () => {
  const { selectedProgram, data, fetchAppData, currentUser } = useAppContext();
  
  const [isModalOpen, setModalOpen] = useState(false);

  const canManagePOs = currentUser?.role === 'Admin' || currentUser?.role === 'Program Co-ordinator';
  
  const { programOutcomes, coursesForProgram } = useMemo(() => {
    if (!data) return { programOutcomes: [], coursesForProgram: [] };
    const outcomes = data.programOutcomes.filter(po => po.programId === selectedProgram?.id);
    const courses = data.courses.filter(c => c.programId === selectedProgram?.id && c.status !== 'Future');
    return { programOutcomes: outcomes, coursesForProgram: courses };
  }, [data, selectedProgram?.id]);

  const [originalState, setOriginalState] = useState({ weights: { direct: 90, indirect: 10 }, indirectAttainment: {} as {[poId: string]: string} });
  const [draftState, setDraftState] = useState(originalState);
  
  useEffect(() => {
    const initialState = { weights: { direct: 90, indirect: 10 }, indirectAttainment: {} };
    setDraftState(initialState);
    setOriginalState(initialState);
  }, [selectedProgram?.id]);

  const isDirty = useMemo(() => JSON.stringify(originalState) !== JSON.stringify(draftState), [originalState, draftState]);

  const handleSave = () => {
    setOriginalState(draftState);
    alert("Attainment values have been saved for this session.");
  };

  const handleCancel = () => {
    setDraftState(originalState);
  };

  const handleExcelUpload = async (uploadedData: { number: string; description: string }[]) => {
    if (!selectedProgram) return;
    const newPOs: Omit<ProgramOutcome, 'id'>[] = uploadedData
      .filter(row => row.number && row.description)
      .map(row => ({
        programId: selectedProgram.id,
        number: row.number,
        description: row.description
    }));

    try {
        await Promise.all(newPOs.map(po => apiClient.post('/program-outcomes/', po)));
        await fetchAppData();
        alert(`${newPOs.length} POs uploaded successfully!`);
    } catch (error) {
        console.error('Failed to upload POs:', error);
        alert('Failed to upload POs. Please try again.');
    }
  };
  
  const handleDeletePo = async (poId: string) => {
    if (window.confirm("Are you sure you want to delete this Program Outcome?")) {
        try {
            await apiClient.delete(`/program-outcomes/${poId}/`);
            await fetchAppData();
        } catch (error) {
            console.error('Failed to delete PO:', error);
            alert('Failed to delete PO. Please try again.');
        }
    }
  }

  return (
    <div className="space-y-6 pb-20">
      <div className="flex justify-between items-start">
        <h1 className="text-3xl font-bold text-gray-800\">Program Outcomes (POs)</h1>
        {canManagePOs && (
          <div className="flex items-start gap-4">
              <ExcelUploader<{ number: string; description: string }>
                  onFileUpload={handleExcelUpload}
                  label="Upload POs"
                  format="columns: number, description"
              />
              <button onClick={() => setModalOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg">
                  Add New PO
              </button>
          </div>
        )}
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4 text-gray-700\">Current POs</h2>
         <ul className="space-y-3">
            {programOutcomes.map(po => (
                <li key={po.id} className="p-4 bg-gray-100 rounded-lg flex justify-between items-center">
                    <div>
                        <span className="font-bold text-gray-800\">{po.number}:</span>
                        <span className="ml-2 text-gray-600\">{po.description}</span>
                    </div>
                    {canManagePOs && (
                      <button onClick={() => handleDeletePo(po.id)} className="text-red-600 hover:text-red-800">
                          <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                </li>
            ))}
            {programOutcomes.length === 0 && <p className="text-gray-500 text-center py-4\">No Program Outcomes defined for this program yet.</p>}
        </ul>
      </div>
      
      <POAttainmentDashboard 
        programOutcomes={programOutcomes}
        draftState={draftState}
        onStateChange={setDraftState}
        selectedProgram={selectedProgram}
      />

      <CoursePoLinkageDashboard 
        programOutcomes={programOutcomes}
        courses={coursesForProgram}
      />
      
      {isModalOpen && (
        <AddProgramOutcomeModal onClose={() => setModalOpen(false)} />
      )}
      
      <SaveBar isDirty={isDirty} onSave={handleSave} onCancel={handleCancel} />
    </div>
  );
};

export default ProgramOutcomesList;
