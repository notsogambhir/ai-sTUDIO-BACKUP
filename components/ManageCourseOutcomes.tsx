/**
 * @file ManageCourseOutcomes.tsx
 * @description
 * This component is the "COs" tab within the `CourseDetail` page.
 */

import React, { useState, useMemo, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { CourseOutcome } from '../types';
import { useAppContext } from '../hooks/useAppContext';
import ExcelUploader from './ExcelUploader';
import SaveBar from './SaveBar';
import apiClient from '../api';

const ManageCourseOutcomes: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { data, fetchAppData, currentUser } = useAppContext();

  const [draftOutcomes, setDraftOutcomes] = useState<CourseOutcome[]>([]);
  const [initialOutcomes, setInitialOutcomes] = useState<CourseOutcome[]>([]);

  useEffect(() => {
    if (!courseId) return;
    const fetchOutcomes = async () => {
      try {
        const response = await apiClient.get(`/course-outcomes/?course_id=${courseId}`);
        setDraftOutcomes(response.data);
        setInitialOutcomes(response.data);
      } catch (error) {
        console.error('Failed to fetch course outcomes:', error);
      }
    };

    fetchOutcomes();
  }, [courseId]);

  const isDirty = useMemo(() => JSON.stringify(draftOutcomes) !== JSON.stringify(initialOutcomes), [draftOutcomes, initialOutcomes]);

  const nextCoNumber = useMemo(() => {
    const highestNum = draftOutcomes.reduce((max, co) => {
      const num = parseInt(co.number.replace('CO', ''), 10);
      return !isNaN(num) && num > max ? num : max;
    }, 0);
    return `CO${highestNum + 1}`;
  }, [draftOutcomes]);

  const [newCoNumber, setNewCoNumber] = useState(nextCoNumber);
  const [newCoDescription, setNewCoDescription] = useState('');

  useEffect(() => {
    setNewCoNumber(nextCoNumber);
  }, [nextCoNumber]);

  const [editingCoId, setEditingCoId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState({ number: '', description: '' });

  const canManage = currentUser?.role === 'Teacher' || currentUser?.role === 'Program Co-ordinator';

  const handleExcelUpload = (uploadedData: { code: string; description: string }[]) => {
    if (!courseId) return;
    const newOutcomes: Omit<CourseOutcome, 'id'>[] = uploadedData
      .filter(row => row.code && row.description)
      .map(row => ({
        courseId: courseId,
        number: row.code,
        description: row.description
      }));
    
    // This is a bulk operation, so we'll just add to the draft and save.
    // A more robust solution would be a dedicated bulk create endpoint.
    const newDraftOutcomes = [...draftOutcomes, ...newOutcomes.map((o, i) => ({...o, id: `temp_${i}`}))];
    setDraftOutcomes(newDraftOutcomes);

    alert(`${newOutcomes.length} COs staged for upload. Click 'Save Changes' to commit.`);
  };

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
    setDraftOutcomes(prev => [...prev, newCo]);
    setNewCoDescription('');
  };

  const handleDeleteCo = (coId: string) => {
    if (window.confirm("Are you sure you want to remove this Course Outcome? This change will be saved when you click 'Save Changes'.")) {
      setDraftOutcomes(prev => prev.filter(co => co.id !== coId));
    }
  };

  const handleEditStart = (co: CourseOutcome) => {
    setEditingCoId(co.id);
    setEditingText({ number: co.number, description: co.description });
  };

  const handleEditCancel = () => {
    setEditingCoId(null);
    setEditingText({ number: '', description: '' });
  };

  const handleEditSave = () => {
    if (!editingCoId || !editingText.number.trim() || !editingText.description.trim()) return;
    setDraftOutcomes(prev => prev.map(co =>
      co.id === editingCoId
        ? { ...co, number: editingText.number.trim(), description: editingText.description.trim() }
        : co
    ));
    handleEditCancel();
  };

  const handleSave = async () => {
    if (!courseId) return;

    try {
      // Delete outcomes that are in initial but not in draft
      const draftIds = new Set(draftOutcomes.map(o => o.id));
      const toDelete = initialOutcomes.filter(o => !draftIds.has(o.id));
      await Promise.all(toDelete.map(o => apiClient.delete(`/course-outcomes/${o.id}/`)));

      // Create or update outcomes
      const toCreateOrUpdate = draftOutcomes.map(o => {
        if (o.id.startsWith('co_manual_') || o.id.startsWith('temp_')) {
          const { id, ...rest } = o;
          return apiClient.post('/course-outcomes/', rest);
        } else {
          return apiClient.patch(`/course-outcomes/${o.id}/`, o);
        }
      });
      await Promise.all(toCreateOrUpdate);

      await fetchAppData();
      setInitialOutcomes(draftOutcomes);
      alert("Course Outcomes saved successfully!");
    } catch (error) {
      console.error('Failed to save course outcomes:', error);
      alert('Failed to save course outcomes. Please try again.');
    }
  };
  
  const handleCancel = () => {
    setDraftOutcomes(initialOutcomes);
    setEditingCoId(null);
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-700\">Manage Course Outcomes (COs)</h2>
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6\">CO Code</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider\">Description</th>
              {canManage && <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6\">Actions</th>}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {draftOutcomes.map(co => (
              <tr key={co.id}>
                {editingCoId === co.id ? (
                  <>
                    <td className="px-6 py-4">
                      <input type="text" value={editingText.number} onChange={(e) => setEditingText({ ...editingText, number: e.target.value })} className="w-full p-2 border border-gray-300 rounded-md\"/>
                    </td>
                    <td className="px-6 py-4">
                      <input type="text" value={editingText.description} onChange={(e) => setEditingText({ ...editingText, description: e.target.value })} className="w-full p-2 border border-gray-300 rounded-md\"/>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button onClick={handleEditSave} className="text-green-600 hover:text-green-800 mr-4\">Apply</button>
                      <button onClick={handleEditCancel} className="text-gray-600 hover:text-gray-800\">Cancel</button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900\">{co.number}</td>
                    <td className="px-6 py-4 whitespace-normal text-sm text-gray-600\">{co.description}</td>
                    {canManage && (
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button onClick={() => handleEditStart(co)} className="text-indigo-600 hover:text-indigo-800 mr-4\">Edit</button>
                        <button onClick={() => handleDeleteCo(co.id)} className="text-red-600 hover:text-red-800\">Delete</button>
                      </td>
                    )}
                  </>
                )}
              </tr>
            ))}
            {canManage && editingCoId === null && (
              <tr className="bg-gray-50/50">
                <td className="px-6 py-4">
                  <input type="text" value={newCoNumber} readOnly className="w-full p-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500 cursor-not-allowed focus:ring-0 focus:border-gray-300\"/>
                </td>
                <td className="px-6 py-4">
                  <input type="text" placeholder="Description Input" value={newCoDescription} onChange={(e) => setNewCoDescription(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500\"/>
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
      <SaveBar isDirty={isDirty} onSave={handleSave} onCancel={handleCancel} />
    </div>
  );
};

export default ManageCourseOutcomes;
