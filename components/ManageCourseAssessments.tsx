/**
 * @file ManageCourseAssessments.tsx
 * @description
 * This component is the "Assessments" tab within the `CourseDetail` page. It's the starting
 * point for managing all tests, exams, and assignments for a course.
 *
 * A key architectural point is that assessments are tied to specific **Sections** (class groups),
 * not just the course in general. This component manages that complexity.
 *
 * What it does:
 * 1.  **Section Selection**: It displays a dropdown to select a specific class section.
 *     The list of sections is filtered based on the user's role:
 *     - A **Teacher** only sees the sections they are assigned to for this course.
 *     - A **PC** or **Admin** sees all sections that have students enrolled in this course.
 * 2.  **Display Assessments**: Once a section is selected, it shows a list of all assessments
 *     created for that section.
 * 3.  **Create Assessments**: It provides a "Create Assessment" button (which opens a modal)
 *     to create new assessments for the selected section.
 * 4.  **Navigation**: It acts as a navigator. When a user clicks "Manage Questions" on an
 *     assessment, it hides the list view and shows the detailed `AssessmentDetails` component
 *     for that specific assessment.
 */

import React, { useState, useMemo, useEffect } from 'react';
import { Course } from '../types';
import { useAppContext } from '../hooks/useAppContext';
import AssessmentDetails from './AssessmentDetails';
import CreateAssessmentModal from './CreateAssessmentModal';

// This defines the "props" or properties that this component accepts.
interface ManageCourseAssessmentsProps {
  course: Course; // It receives the full `Course` object it's working with.
}

const ManageCourseAssessments: React.FC<ManageCourseAssessmentsProps> = ({ course }) => {
  // We get our app's data, tools, and the current user from the "magic backpack".
  const { data, setData, currentUser } = useAppContext();

  // --- State Management ---
  // A piece of memory to remember which assessment the user wants to see details for.
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string | null>(null);
  // A piece of memory to remember which class section is currently selected in the dropdown.
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  // A piece of memory to control whether the "Create Assessment" popup is open.
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);

  // A simple boolean to check if the user is a PC or Admin.
  const isPC = currentUser?.role === 'Program Co-ordinator' || currentUser?.role === 'Admin';

  // `useMemo` is a "smart calculator" that only recalculates this list of sections when its dependencies change.
  // This is where the complex role-based filtering of the dropdown happens.
  const sectionsForDropdown = useMemo(() => {
    // First, find all sections that have students enrolled in this course. This is our master list.
    const enrolledSectionIds = new Set(data.enrollments.filter(e => e.courseId === course.id && e.sectionId).map(e => e.sectionId));
    const allCourseSections = data.sections.filter(s => enrolledSectionIds.has(s.id));

    // If the user is a PC or Admin, they can see all sections.
    if (isPC) {
        return allCourseSections;
    }
    
    // If the user is not a Teacher, they see nothing.
    if (!currentUser || currentUser.role !== 'Teacher') return [];
    
    // For a Teacher, find the sections they are explicitly assigned to for this course.
    const teacherSectionIds = Object.entries(course.sectionTeacherIds || {})
        .filter(([, teacherId]) => teacherId === currentUser.id)
        .map(([sectionId]) => sectionId);

    if (teacherSectionIds.length > 0) {
        // If they have specific section assignments, they only see those sections.
        return allCourseSections.filter(s => teacherSectionIds.includes(s.id));
    }
    
    // If they have no specific assignments but are the main teacher for the course, they see all sections.
    if (course.teacherId === currentUser.id) {
        return allCourseSections; 
    }

    // Otherwise, the teacher has no access to any sections for this course.
    return [];
  }, [data.enrollments, data.sections, course, currentUser, isPC]);

  // `useEffect` runs "on the side". This effect automatically selects the first section
  // in the dropdown if no section is currently selected.
  useEffect(() => {
    if (sectionsForDropdown.length > 0 && !sectionsForDropdown.some(s => s.id === selectedSectionId)) {
        setSelectedSectionId(sectionsForDropdown[0].id);
    } else if (sectionsForDropdown.length === 0) {
        setSelectedSectionId(null);
    }
  }, [sectionsForDropdown, selectedSectionId]);

  // This effect resets the view. If the user changes the section, we should go back
  // from the details view to the list view.
  useEffect(() => {
    setSelectedAssessmentId(null);
  }, [selectedSectionId]);

  // `useMemo` calculates the list of assessments to show based on the `selectedSectionId`.
  const assessments = useMemo(() => {
    if (!selectedSectionId) return [];
    return data.assessments.filter(a => a.sectionId === selectedSectionId);
  }, [data.assessments, selectedSectionId]);

  // This function handles deleting an assessment.
  const handleDeleteAssessment = (assessmentId: string) => {
    if (window.confirm("Are you sure you want to delete this assessment and all its questions and marks? This action cannot be undone.")) {
      setData(prev => ({
        ...prev,
        assessments: prev.assessments.filter(a => a.id !== assessmentId), // Remove the assessment.
        marks: prev.marks.filter(m => m.assessmentId !== assessmentId) // Also remove all associated marks.
      }));
    }
  }
  
  // A helper to get the name of the currently selected section for display.
  const sectionName = sectionsForDropdown.find(s => s.id === selectedSectionId)?.name || '';

  // The JSX for the section dropdown, stored in a variable so it can be reused.
  const SectionSelector = (
    <div className="mb-6 pb-4 border-b">
        <label htmlFor="section-select" className="block text-sm font-medium text-gray-700">Select Section</label>
        <select id="section-select" value={selectedSectionId || ''} onChange={(e) => setSelectedSectionId(e.target.value)} disabled={sectionsForDropdown.length === 0} className="mt-1 block w-full max-w-sm pl-3 pr-10 py-2 text-base bg-white text-gray-900 border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md disabled:bg-gray-100">
            {sectionsForDropdown.map(section => (
                <option key={section.id} value={section.id}>Section {section.name}</option>
            ))}
        </select>
        {sectionsForDropdown.length === 0 && <p className="mt-2 text-sm text-gray-500">You are not assigned to any sections for this course, or no sections have been created.</p>}
    </div>
  );

  // --- Main Render Logic ---
  // If an assessment has been selected, we show the details view.
  if (selectedAssessmentId) {
    return (
        <div className="space-y-6">
            {isPC && SectionSelector} {/* A PC can still switch sections from the details view. */}
            <AssessmentDetails 
                assessmentId={selectedAssessmentId} 
                onBack={() => setSelectedAssessmentId(null)} // Pass a function to go back.
                course={course}
            />
        </div>
    );
  }

  // Otherwise, we show the list view.
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
        )}
      </div>
      
      <div className="space-y-4">
        {assessments.map(assessment => {
          const totalMaxMarks = assessment.questions.reduce((sum, q) => sum + q.maxMarks, 0);
          const hasMarks = data.marks.some(m => m.assessmentId === assessment.id);
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
        {assessments.length === 0 && selectedSectionId && <p className="text-gray-500 text-center py-4">No assessments found for this section.</p>}
      </div>
      {isCreateModalOpen && selectedSectionId && (
        <CreateAssessmentModal sectionId={selectedSectionId} onClose={() => setCreateModalOpen(false)} />
      )}
    </div>
  );
};

export default ManageCourseAssessments;