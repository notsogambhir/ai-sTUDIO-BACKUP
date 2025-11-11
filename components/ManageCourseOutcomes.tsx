/**
 * @file ManageCourseOutcomes.tsx
 * @description
 * This component is the "COs" tab within the `CourseDetail` page. It's where a user can
 * manage all the Course Outcomes for a specific course.
 *
 * What it does:
 * 1.  Displays a table of all existing COs for the course.
 * 2.  Allows authorized users (Teachers, PCs) to add a new CO via a form at the bottom of the table.
 * 3.  Allows users to upload a list of COs from an Excel file.
 * 4.  Provides "Edit" and "Delete" buttons for each CO. Editing happens "inline" (directly in the table).
 * 5.  Uses a "draft state" pattern: Changes like adding, editing, or deleting are not saved
 *     immediately. They are held in a temporary "draft" state, which triggers the `SaveBar`
 *     to appear, allowing the user to save all changes at once or cancel them.
 */

import React, { useState, useMemo, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { CourseOutcome } from '../types';
import { useAppContext } from '../hooks/useAppContext';
import ExcelUploader from './ExcelUploader';
import SaveBar from './SaveBar';

const ManageCourseOutcomes: React.FC = () => {
  // `useParams` gets the `courseId` from the URL, so we know which course we're working with.
  const { courseId } = useParams<{ courseId: string }>();
  // We get our app's data, tools, and the current user from the "magic backpack".
  const { data, setData, currentUser } = useAppContext();

  // --- State Management for Drafts and Forms ---
  // `draftOutcomes` is our temporary copy of the COs. Any changes are made to this copy first.
  const [draftOutcomes, setDraftOutcomes] = useState<CourseOutcome[]>([]);
  // `initialOutcomes` is a snapshot of the saved data. We compare it with the draft to see if there are unsaved changes.
  const [initialOutcomes, setInitialOutcomes] = useState<CourseOutcome[]>([]);

  // `useEffect` runs code "on the side". This code runs whenever the course changes.
  // It loads the COs for the current course into both our draft and initial states.
  useEffect(() => {
    if (!courseId) return;
    const outcomesForCourse = data.courseOutcomes.filter(co => co.courseId === courseId);
    setDraftOutcomes(outcomesForCourse);
    setInitialOutcomes(outcomesForCourse);
  }, [data.courseOutcomes, courseId]);

  // `isDirty` is a boolean that tells us if there are unsaved changes.
  // `useMemo` is a "smart calculator" that only re-calculates this value when the draft or initial state changes.
  // It compares the text versions of the two arrays to see if they are different.
  const isDirty = useMemo(() => JSON.stringify(draftOutcomes) !== JSON.stringify(initialOutcomes), [draftOutcomes, initialOutcomes]);

  // This `useMemo` automatically calculates the next available CO number (e.g., "CO5").
  const nextCoNumber = useMemo(() => {
    const highestNum = draftOutcomes.reduce((max, co) => {
      const num = parseInt(co.number.replace('CO', ''), 10);
      return !isNaN(num) && num > max ? num : max;
    }, 0);
    return `CO${highestNum + 1}`;
  }, [draftOutcomes]);

  // State for the "Add New CO" form fields.
  const [newCoNumber, setNewCoNumber] = useState(nextCoNumber);
  const [newCoDescription, setNewCoDescription] = useState('');

  // This `useEffect` keeps the "Add New CO" number field up-to-date.
  useEffect(() => {
    setNewCoNumber(nextCoNumber);
  }, [nextCoNumber]);

  // State for handling inline editing.
  const [editingCoId, setEditingCoId] = useState<string | null>(null); // Which CO are we editing?
  const [editingText, setEditingText] = useState({ number: '', description: '' }); // The text in the edit inputs.

  // Check if the current user has permission to make changes.
  const canManage = currentUser?.role === 'Teacher' || currentUser?.role === 'Program Co-ordinator';

  // This function is called by the ExcelUploader when a file is parsed.
  const handleExcelUpload = (uploadedData: { code: string; description: string }[]) => {
    if (!courseId) return;
    // Convert the data from the Excel file into full `CourseOutcome` objects.
    const newOutcomes: CourseOutcome[] = uploadedData
      .filter(row => row.code && row.description)
      .map((row, i) => ({
        id: `co_excel_${Date.now()}_${i}`,
        courseId: courseId,
        number: row.code,
        description: row.description
      }));
    
    // Add the new outcomes to our draft state.
    setDraftOutcomes(prev => [...prev, ...newOutcomes]);
    alert(`${newOutcomes.length} COs staged for upload. Click 'Save Changes' to commit.`);
  };

  // This runs when the "Add" button is clicked for a new CO.
  const handleAddCo = () => {
    if (!newCoDescription.trim() || !courseId) {
      alert("Please fill in the Description.");
      return;
    }
    const newCo: CourseOutcome = {
      id: `co_manual_${Date.now()}`,
      courseId,
      number: newCoNumber.trim(),
      description: newCoDescription.trim()
    };
    // Add the new CO to our draft and clear the input field.
    setDraftOutcomes(prev => [...prev, newCo]);
    setNewCoDescription('');
  };

  // This runs when the "Delete" button is clicked for a CO.
  const handleDeleteCo = (coId: string) => {
    if (window.confirm("Are you sure you want to remove this Course Outcome? This change will be saved when you click 'Save Changes'.")) {
      // It only removes the CO from the draft state.
      setDraftOutcomes(prev => prev.filter(co => co.id !== coId));
    }
  };

  // This runs when the "Edit" button is clicked. It prepares the inline editing form.
  const handleEditStart = (co: CourseOutcome) => {
    setEditingCoId(co.id);
    setEditingText({ number: co.number, description: co.description });
  };

  // This runs when the "Cancel" button is clicked during an inline edit.
  const handleEditCancel = () => {
    setEditingCoId(null);
    setEditingText({ number: '', description: '' });
  };

  // This runs when the "Apply" button is clicked during an inline edit.
  const handleEditSave = () => {
    if (!editingCoId || !editingText.number.trim() || !editingText.description.trim()) return;
    // It updates the CO in our draft state with the new text.
    setDraftOutcomes(prev => prev.map(co =>
      co.id === editingCoId
        ? { ...co, number: editingText.number.trim(), description: editingText.description.trim() }
        : co
    ));
    handleEditCancel(); // Close the inline edit form.
  };

  // This runs when the user clicks "Save Changes" in the SaveBar.
  const handleSave = () => {
    if (!courseId) return;
    // This is where we finally update the main application data in the "magic backpack".
    setData(prev => ({
      ...prev,
      courseOutcomes: [
        ...prev.courseOutcomes.filter(co => co.courseId !== courseId), // Remove all old COs for this course.
        ...draftOutcomes // Add all the COs from our draft.
      ]
    }));
    // After saving, the draft becomes the new "initial" state, so `isDirty` becomes false.
    setInitialOutcomes(draftOutcomes);
    alert("Course Outcomes saved successfully!");
  };
  
  // This runs when the user clicks "Cancel" in the SaveBar. It discards all changes.
  const handleCancel = () => {
    setDraftOutcomes(initialOutcomes);
    setEditingCoId(null); // Also cancel any active inline edit.
  };

  return (
    // The `pb-20` adds padding at the bottom so the SaveBar doesn't cover content.
    <div className="space-y-6 pb-20">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-700">Manage Course Outcomes (COs)</h2>
        {canManage && (
          <ExcelUploader<{ code: string; description: string }>
            onFileUpload={handleExcelUpload}
            label="Upload COs"
            format="columns: code, description"
          />
        )}
      </div>

      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">CO Code</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              {canManage && <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">Actions</th>}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {draftOutcomes.map(co => (
              <tr key={co.id}>
                {/* If we are editing this CO, show input fields. Otherwise, show text. */}
                {editingCoId === co.id ? (
                  <>
                    <td className="px-6 py-4">
                      <input type="text" value={editingText.number} onChange={(e) => setEditingText({ ...editingText, number: e.target.value })} className="w-full p-2 border border-gray-300 rounded-md"/>
                    </td>
                    <td className="px-6 py-4">
                      <input type="text" value={editingText.description} onChange={(e) => setEditingText({ ...editingText, description: e.target.value })} className="w-full p-2 border border-gray-300 rounded-md"/>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button onClick={handleEditSave} className="text-green-600 hover:text-green-800 mr-4">Apply</button>
                      <button onClick={handleEditCancel} className="text-gray-600 hover:text-gray-800">Cancel</button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{co.number}</td>
                    <td className="px-6 py-4 whitespace-normal text-sm text-gray-600">{co.description}</td>
                    {canManage && (
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button onClick={() => handleEditStart(co)} className="text-indigo-600 hover:text-indigo-800 mr-4">Edit</button>
                        <button onClick={() => handleDeleteCo(co.id)} className="text-red-600 hover:text-red-800">Delete</button>
                      </td>
                    )}
                  </>
                )}
              </tr>
            ))}
            {/* The "Add New CO" form row is only shown if the user can manage and is not currently editing another CO. */}
            {canManage && editingCoId === null && (
              <tr className="bg-gray-50/50">
                <td className="px-6 py-4">
                  <input type="text" value={newCoNumber} readOnly className="w-full p-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500 cursor-not-allowed focus:ring-0 focus:border-gray-300"/>
                </td>
                <td className="px-6 py-4">
                  <input type="text" placeholder="Description Input" value={newCoDescription} onChange={(e) => setNewCoDescription(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500"/>
                </td>
                <td className="px-6 py-4 text-right">
                  <button onClick={handleAddCo} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg">
                    Add
                  </button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {/* The SaveBar is only visible if `isDirty` is true. */}
      <SaveBar isDirty={isDirty} onSave={handleSave} onCancel={handleCancel} />
    </div>
  );
};

export default ManageCourseOutcomes;