/**
 * @file CreateAssessmentModal.tsx
 * @description
 * This component is a popup modal for creating a new assessment.
 */

import React, { useState } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import Modal from './Modal';
import { Assessment } from '../types';
import apiClient from '../api';

interface CreateAssessmentModalProps {
  sectionId: string;
  onClose: () => void;
}

const CreateAssessmentModal: React.FC<CreateAssessmentModalProps> = ({ sectionId, onClose }) => {
  const { fetchAppData } = useAppContext();
  
  const [name, setName] = useState('');
  const [type, setType] = useState<'Internal' | 'External'>('Internal');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { alert("Please provide an assessment name."); return; }
    
    const newAssessment: Omit<Assessment, 'id'> = {
      sectionId,
      name: name.trim(),
      type,
      questions: []
    };
    
    try {
      await apiClient.post('/assessments/', newAssessment);
      await fetchAppData();
      onClose();
    } catch (error) {
      console.error('Failed to create assessment:', error);
      alert('Failed to create assessment. Please try again.');
    }
  };

  return (
    <Modal title="Create New Assessment" onClose={onClose}>
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Assessment Name</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Assessment Type</label>
          <select
            value={type}
            onChange={e => setType(e.target.value as 'Internal' | 'External')}
            className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="Internal">Internal</option>
            <option value="External">External</option>
          </select>
        </div>
        <div className="flex justify-end pt-4 gap-3">
            <button type="button" onClick={onClose} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg">Cancel</button>
            <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg">Create</button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateAssessmentModal;
