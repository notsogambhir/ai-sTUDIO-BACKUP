/**
 * @file ManageCourseAssessments.tsx
 * @description
 * This component is the "Assessments" tab within the `CourseDetail` page.
 */

import React, { useState, useMemo, useEffect } from 'react';
import { Course } from '../types';
import { useAppContext } from '../hooks/useAppContext';
import AssessmentDetails from './AssessmentDetails';
import CreateAssessmentModal from './CreateAssessmentModal';
import apiClient from '../api';

interface ManageCourseAssessmentsProps {
  course: Course;
}

const ManageCourseAssessments: React.FC<ManageCourseAssessmentsProps> = ({ course }) => {
  const { data, fetchAppData, currentUser } = useAppContext();

  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);

  const isPC = currentUser?.role === 'Program Co-ordinator' || currentUser?.role === 'Admin';

  const [sections, setSections] = useState([]);
  const [assessments, setAssessments] = useState([]);

  useEffect(() => {
    const fetchSections = async () => {
      try {
        const response = await apiClient.get(`/sections/?course_id=${course.id}`);
        setSections(response.data);
        if (response.data.length > 0) {
          setSelectedSectionId(response.data[0].id);
        }
      } catch (error) {
        console.error('Failed to fetch sections:', error);
      }
    };

    fetchSections();
  }, [course.id]);

  useEffect(() => {
    if (!selectedSectionId) return;
    const fetchAssessments = async () => {
      try {
        const response = await apiClient.get(`/assessments/?section_id=${selectedSectionId}`);
        setAssessments(response.data);
      } catch (error) {
        console.error('Failed to fetch assessments:', error);
      }
    };

    fetchAssessments();
  }, [selectedSectionId]);

  const handleDeleteAssessment = async (assessmentId: string) => {
    if (window.confirm("Are you sure you want to delete this assessment and all its questions and marks? This action cannot be undone.")) {
      try {
        await apiClient.delete(`/assessments/${assessmentId}/`);
        await fetchAppData();
      } catch (error) {
        console.error('Failed to delete assessment:', error);
        alert('Failed to delete assessment. Please try again.');
      }
    }
  }
  
  const sectionName = sectionsForDropdown.find(s => s.id === selectedSectionId)?.name || '';

  const SectionSelector = (
    <div className="mb-6 pb-4 border-b">
        <label htmlFor="section-select" className="block text-sm font-medium text-gray-700">Select Section</label>
        <select id="section-select" value={selectedSectionId || ''} onChange={(e) => setSelectedSectionId(e.target.value)} disabled={sectionsForDropdown.length === 0} className="mt-1 block w-full max-w-sm pl-3 pr-10 py-2 text-base bg-white text-gray-900 border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md disabled:bg-gray-100">
            {sectionsForDropdown.map(section => (
                <option key={section.id} value={section.id}>Section {section.name}</option>
            ))}
        </select>
        {sectionsForDropdown.length === 0 && <p className="mt-2 text-sm text-gray-500\">You are not assigned to any sections for this course, or no sections have been created.</p>}
    </div>
  );

  if (selectedAssessmentId) {
    return (
        <div className="space-y-6">
            {isPC && SectionSelector}
            <AssessmentDetails 
                assessmentId={selectedAssessmentId} 
                onBack={() => setSelectedAssessmentId(null)}
                course={course}
            />
        </div>
    );
  }

  return (
    <div className="space-y-6">
      {SectionSelector}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-700">
            {selectedSectionId ? `Assessments for Section ${sectionName}` : 'Select a section to view assessments'}
        </h2>
        {(isPC || sectionsForDropdown.length > 0) && (
          <button onClick={() => setCreateModalOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg disabled:bg-indigo-300 disabled:cursor-not-allowed" disabled={!selectedSectionId} title={!selectedSectionId ? "Please select a section first" : "Create a new assessment"}>
            Create Assessment
          </button>
        )}\
      </div>
      
      <div className="space-y-4">
        {assessments.map(assessment => {
          const totalMaxMarks = assessment.questions.reduce((sum, q) => sum + q.maxMarks, 0);
          const hasMarks = data?.marks.some(m => m.assessmentId === assessment.id);
          return (
            <div key={assessment.id} className="bg-gray-50 p-4 rounded-lg flex justify-between items-center border border-gray-200">
              <div>
                <p className="font-semibold text-gray-800 flex items-center">
                  {assessment.name}
                  {hasMarks && (<span className="ml-2 text-xs font-semibold bg-green-100 text-green-800 px-2 py-0.5 rounded-full">✓ Marks Uploaded</span>)}
                </p>
                <p className="text-sm text-gray-500">{assessment.type} | Max Marks: {totalMaxMarks}</p>
              </div>
              <div className="space-x-4">
                <button onClick={() => setSelectedAssessmentId(assessment.id)} className="text-indigo-600 hover:text-indigo-800 font-semibold">
                  Manage Questions
                </button>
                {isPC && (<button onClick={() => handleDeleteAssessment(assessment.id)} className="text-red-600 hover:text-red-800 font-semibold">Delete</button>)}
              </div>
            </div>
          )
        })}
        {assessments.length === 0 && selectedSectionId && <p className="text-gray-500 text-center py-4\">No assessments found for this section.</p>}
      </div>
      {isCreateModalOpen && selectedSectionId && (
        <CreateAssessmentModal sectionId={selectedSectionId} onClose={() => setCreateModalOpen(false)} />
      )}
    </div>
  );
};

export default ManageCourseAssessments;
