/**
 * @file ProgramOutcomesList.tsx
 * @description
 * This file defines the `ProgramOutcomesList` component, which is the main page for managing
 * Program Outcomes (POs) and viewing PO attainment data.
 *
 * What it does:
 * 1.  **Displays POs**: It shows a list of all Program Outcomes defined for the currently
 *     selected program.
 * 2.  **Manages POs (Role-based)**: For authorized users (Admins, PCs), it provides buttons to
 *     "Add New PO" (which opens a modal) and "Upload POs" from an Excel file. It also
 *     allows deleting existing POs.
 * 3.  **Contains Dashboards**: This page acts as a container for two very important and complex
 *     dashboard components:
 *     - `POAttainmentDashboard`: Calculates and displays the final attainment for each PO.
 *     - `CoursePoLinkageDashboard`: Shows how strongly each course contributes to each PO.
 * 4.  **Manages Dashboard Settings**: It manages the "draft state" for the settings on the
 *     `POAttainmentDashboard` (like the direct/indirect weights). When a user changes these
 *     settings, the `SaveBar` appears, allowing them to save or cancel the changes for their
 *     current session.
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

const ProgramOutcomesList: React.FC = () => {
  // We get our app's data, tools, and the current user from the "magic backpack".
  // We need `currentUser` to check permissions.
  const { selectedProgram, data, setData, currentUser } = useAppContext();
  
  // A piece of memory to control whether the "Add New PO" popup is open.
  const [isModalOpen, setModalOpen] = useState(false);

  // A boolean to check if the current user has permission to manage POs.
  const canManagePOs = currentUser?.role === 'Admin' || currentUser?.role === 'Program Co-ordinator';
  
  // `useMemo` is a smart calculator that gets the POs and relevant courses for the selected program.
  const { programOutcomes, coursesForProgram } = useMemo(() => {
    const outcomes = data.programOutcomes.filter(po => po.programId === selectedProgram?.id);
    const courses = data.courses.filter(c => c.programId === selectedProgram?.id && c.status !== 'Future');
    return { programOutcomes: outcomes, coursesForProgram: courses };
  }, [data.programOutcomes, data.courses, selectedProgram?.id]);

  // --- State Management for the Dashboard's Draftable Settings ---
  // `originalState` holds the saved version of the dashboard settings.
  const [originalState, setOriginalState] = useState({ weights: { direct: 90, indirect: 10 }, indirectAttainment: {} as {[poId: string]: string} });
  // `draftState` holds the temporary changes the user is making to the settings.
  const [draftState, setDraftState] = useState(originalState);
  
  // `useEffect` runs this code whenever the selected program changes. It resets the dashboard settings.
  useEffect(() => {
    const initialState = { weights: { direct: 90, indirect: 10 }, indirectAttainment: {} };
    setDraftState(initialState);
    setOriginalState(initialState);
  }, [selectedProgram?.id]);

  // `isDirty` checks if there are unsaved changes by comparing the draft and original states.
  const isDirty = useMemo(() => JSON.stringify(originalState) !== JSON.stringify(draftState), [originalState, draftState]);

  // This runs when "Save Changes" is clicked on the SaveBar.
  const handleSave = () => {
    // In our mock app, we just "commit" the draft to be the new original state for this session.
    setOriginalState(draftState);
    alert("Attainment values have been saved for this session.");
  };

  // This runs when "Cancel" is clicked. It discards the changes.
  const handleCancel = () => {
    setDraftState(originalState);
  };

  // This is called by the ExcelUploader when a file is parsed.
  const handleExcelUpload = (uploadedData: { number: string; description: string }[]) => {
    if (!selectedProgram) return;
    // Convert the Excel rows into ProgramOutcome objects.
    const newPOs: ProgramOutcome[] = uploadedData
      .filter(row => row.number && row.description)
      .map((row, i) => ({
        id: `po_excel_${Date.now()}_${i}`, programId: selectedProgram.id, number: row.number, description: row.description
    }));
    // Add the new POs to our main application data.
    setData(prev => ({ ...prev, programOutcomes: [...prev.programOutcomes, ...newPOs] }));
    alert(`${newPOs.length} POs uploaded successfully!`);
  };
  
  // This runs when the trash can icon next to a PO is clicked.
  const handleDeletePo = (poId: string) => {
    if (window.confirm("Are you sure you want to delete this Program Outcome?")) {
        // It removes the PO from the main application data.
        setData(prev => ({
            ...prev,
            programOutcomes: prev.programOutcomes.filter(po => po.id !== poId)
        }));
    }
  }

  return (
    // `pb-20` adds padding at the bottom so the SaveBar doesn't cover content.
    <div className="space-y-6 pb-20">
      <div className="flex justify-between items-start">
        <h1 className="text-3xl font-bold text-gray-800">Program Outcomes (POs)</h1>
        {/* The Add/Upload buttons are now only shown to users with permission. */}
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
      
      {/* The list of current POs. */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Current POs</h2>
         <ul className="space-y-3">
            {programOutcomes.map(po => (
                <li key={po.id} className="p-4 bg-gray-100 rounded-lg flex justify-between items-center">
                    <div>
                        <span className="font-bold text-gray-800">{po.number}:</span>
                        <span className="ml-2 text-gray-600">{po.description}</span>
                    </div>
                    {/* The Delete button is also only shown to users with permission. */}
                    {canManagePOs && (
                      <button onClick={() => handleDeletePo(po.id)} className="text-red-600 hover:text-red-800">
                          <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                </li>
            ))}
            {programOutcomes.length === 0 && <p className="text-gray-500 text-center py-4">No Program Outcomes defined for this program yet.</p>}
        </ul>
      </div>
      
      {/* The main PO Attainment Dashboard component.
          We pass it the draft state and a function to update the draft state (`onStateChange`).
          This is called "lifting state up", where the parent component manages the state for the child. */}
      <POAttainmentDashboard 
        programOutcomes={programOutcomes}
        draftState={draftState}
        onStateChange={setDraftState}
        selectedProgram={selectedProgram}
      />

      {/* The second dashboard, which shows how courses link to POs. */}
      <CoursePoLinkageDashboard 
        programOutcomes={programOutcomes}
        courses={coursesForProgram}
      />
      
      {/* The modal for adding a new PO is only shown if `isModalOpen` is true. */}
      {isModalOpen && (
        <AddProgramOutcomeModal onClose={() => setModalOpen(false)} />
      )}
      
      {/* The SaveBar only appears if `isDirty` is true. */}
      <SaveBar isDirty={isDirty} onSave={handleSave} onCancel={handleCancel} />
    </div>
  );
};

export default ProgramOutcomesList;