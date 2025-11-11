/**
 * @file CoPoMappingMatrix.tsx
 * @description
 * This component is the "CO-PO Mapping" tab within the `CourseDetail` page. It's responsible
 * for displaying and managing the relationships between a course's Course Outcomes (COs)
 * and the program's Program Outcomes (POs).
 *
 * What it does:
 * 1.  **Displays a Matrix**: It shows a grid or table where the rows are the COs for the
 *     current course, and the columns are the POs for the program.
 * 2.  **Manages Mappings**: In each cell of the grid, it displays a dropdown (0-3) that
 *     represents the strength of the mapping between that CO and PO (0 means no mapping).
 * 3.  **Handles Data Transformation**: The mapping data in `mockData.json` is stored as a flat
 *     list of connections (e.g., `{ courseId, coId, poId, level }`). This component transforms
 *     that list into a nested object structure that's easier for the UI to read (like a 2D array).
 * 4.  **Draft State**: It uses a "draft state" pattern. When a user changes a mapping level
 *     in a dropdown, the change is stored in a temporary "draft". The `SaveBar` appears,
 *     allowing the user to save all changes at once or cancel them.
 * 5.  **Saves Data**: When saving, it transforms the nested object back into a flat list
 *     to update the main application data.
 */

import React, { useState, useMemo, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { CoPoMapping, CoPoMap } from '../types';
import { useAppContext } from '../hooks/useAppContext';
import SaveBar from './SaveBar';


const CoPoMappingMatrix: React.FC = () => {
  // Get the `courseId` from the URL to know which course we're working with.
  const { courseId } = useParams<{ courseId: string }>();
  // Get data, tools, and user info from the "magic backpack".
  const { data, setData, currentUser } = useAppContext();
  
  // Check if the current user has permission to edit the mappings.
  const canManage = currentUser?.role === 'Teacher' || currentUser?.role === 'Program Co-ordinator';

  // `useMemo` is a "smart calculator" that gets all the relevant COs, POs, and existing mappings for this course.
  const { courseOutcomes, programOutcomes, initialMapArray } = useMemo(() => {
    const course = data.courses.find(c => c.id === courseId);
    return {
      courseOutcomes: data.courseOutcomes.filter(co => co.courseId === courseId),
      programOutcomes: data.programOutcomes.filter(po => po.programId === course?.programId),
      initialMapArray: data.coPoMapping.filter(m => m.courseId === courseId),
    };
  }, [courseId, data]);
  
  // --- State Management for Drafts ---
  // `draftMapping` is the nested object that backs our UI. It looks like: { "co_id_1": { "po_id_1": 3 } }
  const [draftMapping, setDraftMapping] = useState<CoPoMap>({});
  // `initialMapping` is the saved version, used for checking if there are unsaved changes.
  const [initialMapping, setInitialMapping] = useState<CoPoMap>({});

  // This `useEffect` hook performs the initial data transformation.
  // It runs once when the component loads, converting the `initialMapArray` (a flat list)
  // into the `CoPoMap` structure (a nested object) for our state.
  useEffect(() => {
    const map: CoPoMap = {};
    // First, create an entry for every CO.
    for (const co of courseOutcomes) {
      map[co.id] = {};
    }
    // Then, fill in the mapping levels from the flat array.
    for (const m of initialMapArray) {
      if (map[m.coId]) {
        map[m.coId][m.poId] = m.level;
      }
    }
    setDraftMapping(map); // Set both draft and initial states to this transformed data.
    setInitialMapping(map);
  }, [courseOutcomes, initialMapArray]);

  // `isDirty` checks for unsaved changes by comparing the text versions of the draft and initial mappings.
  const isDirty = useMemo(() => JSON.stringify(draftMapping) !== JSON.stringify(initialMapping), [draftMapping, initialMapping]);

  // This function runs every time a user changes a value in one of the dropdowns.
  const handleMappingChange = (coId: string, poId: string, value: string) => {
    const level = parseInt(value, 10);
    // Update the `draftMapping` state with the new level.
    setDraftMapping(prev => ({
      ...prev,
      [coId]: {
        ...prev[coId],
        [poId]: level
      }
    }));
  };

  // This function runs when the "Save Changes" button is clicked in the SaveBar.
  const handleSave = () => {
    if (!courseId) return;
    
    // --- Data Transformation (Reverse) ---
    // Here, we convert our nested `draftMapping` object back into a flat array,
    // which is the format our main application data expects.
    const newMappingArray: CoPoMapping[] = [];
    Object.keys(draftMapping).forEach(coId => {
      Object.keys(draftMapping[coId]).forEach(poId => {
        const level = draftMapping[coId][poId];
        if (level > 0) { // We only save mappings with a level greater than 0.
          newMappingArray.push({ courseId, coId, poId, level });
        }
      });
    });

    // Update the main application data in the "magic backpack".
    setData(prev => ({
      ...prev,
      coPoMapping: [
        ...prev.coPoMapping.filter(m => m.courseId !== courseId), // Remove all old mappings for this course.
        ...newMappingArray // Add the new mappings from our draft.
      ]
    }));
    
    // The draft is now the new saved state.
    setInitialMapping(draftMapping);
    alert("Mapping saved successfully!");
  };

  // This function runs when the "Cancel" button is clicked. It discards all changes.
  const handleCancel = () => {
    setDraftMapping(initialMapping);
  };

  return (
    <div className="space-y-6 pb-20">
      <h2 className="text-xl font-semibold text-gray-700">CO-PO Mapping Matrix</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse border border-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th className="border border-gray-300 p-2 text-xs font-medium text-gray-500 uppercase">CO</th>
              {programOutcomes.map(po => (
                <th key={po.id} className="border border-gray-300 p-2 text-xs font-medium text-gray-500 uppercase" title={po.description}>
                  {po.number}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {courseOutcomes.map(co => (
              <tr key={co.id} className="bg-white hover:bg-gray-50">
                <td className="border border-gray-300 p-2 text-sm font-medium text-gray-900" title={co.description}>
                  {co.number}
                </td>
                {programOutcomes.map(po => (
                  <td key={po.id} className="border border-gray-300 p-1">
                    <select
                      value={draftMapping[co.id]?.[po.id] || 0}
                      onChange={(e) => handleMappingChange(co.id, po.id, e.target.value)}
                      className="w-full bg-white text-gray-900 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
                      disabled={!canManage}
                    >
                      <option value="0">-</option>
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                    </select>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* The SaveBar only appears if `isDirty` is true. */}
      <SaveBar isDirty={isDirty} onSave={handleSave} onCancel={handleCancel} />
    </div>
  );
};

export default CoPoMappingMatrix;