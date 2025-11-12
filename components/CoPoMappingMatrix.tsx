/**
 * @file CoPoMappingMatrix.tsx
 * @description
 * This component is the "CO-PO Mapping" tab within the `CourseDetail` page.
 */

import React, { useState, useMemo, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { CoPoMapping, CoPoMap } from '../types';
import { useAppContext } from '../hooks/useAppContext';
import SaveBar from './SaveBar';
import apiClient from '../api';

const CoPoMappingMatrix: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { data, fetchAppData, currentUser } = useAppContext();
  
  const canManage = currentUser?.role === 'Teacher' || currentUser?.role === 'Program Co-ordinator';

  const [courseOutcomes, setCourseOutcomes] = useState([]);
  const [programOutcomes, setProgramOutcomes] = useState([]);
  const [initialMapArray, setInitialMapArray] = useState([]);
  
  const [draftMapping, setDraftMapping] = useState<CoPoMap>({});
  const [initialMapping, setInitialMapping] = useState<CoPoMap>({});

  useEffect(() => {
    if (!courseId) return;

    const fetchData = async () => {
      try {
        const [coRes, poRes, mapRes] = await Promise.all([
          apiClient.get(`/course-outcomes/?course_id=${courseId}`),
          apiClient.get(`/program-outcomes/?course_id=${courseId}`),
          apiClient.get(`/co-po-mapping/?course_id=${courseId}`),
        ]);
        setCourseOutcomes(coRes.data);
        setProgramOutcomes(poRes.data);
        setInitialMapArray(mapRes.data);
      } catch (error) {
        console.error('Failed to fetch mapping data:', error);
      }
    };

    fetchData();
  }, [courseId]);

  useEffect(() => {
    const map: CoPoMap = {};
    for (const co of courseOutcomes) {
      map[co.id] = {};
    }
    for (const m of initialMapArray) {
      if (map[m.coId]) {
        map[m.coId][m.poId] = m.level;
      }
    }
    setDraftMapping(map);
    setInitialMapping(map);
  }, [courseOutcomes, initialMapArray]);

  const isDirty = useMemo(() => JSON.stringify(draftMapping) !== JSON.stringify(initialMapping), [draftMapping, initialMapping]);

  const handleMappingChange = (coId: string, poId: string, value: string) => {
    const level = parseInt(value, 10);
    setDraftMapping(prev => ({
      ...prev,
      [coId]: {
        ...prev[coId],
        [poId]: level
      }
    }));
  };

  const handleSave = async () => {
    if (!courseId) return;
    
    const newMappingArray: Omit<CoPoMapping, 'id'>[] = [];
    Object.keys(draftMapping).forEach(coId => {
      Object.keys(draftMapping[coId]).forEach(poId => {
        const level = draftMapping[coId][poId];
        if (level > 0) {
          newMappingArray.push({ courseId, coId, poId, level });
        }
      });
    });

    try {
      // First, delete all existing mappings for this course
      await Promise.all(initialMapArray.map(mapping => apiClient.delete(`/co-po-mapping/${mapping.id}/`)));
      // Then, create the new mappings
      await Promise.all(newMappingArray.map(mapping => apiClient.post('/co-po-mapping/', mapping)));

      await fetchAppData();
      setInitialMapping(draftMapping);
      alert("Mapping saved successfully!");
    } catch (error) {
      console.error('Failed to save mapping:', error);
      alert('Failed to save mapping. Please try again.');
    }
  };

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
      
      <SaveBar isDirty={isDirty} onSave={handleSave} onCancel={handleCancel} />
    </div>
  );
};

export default CoPoMappingMatrix;
