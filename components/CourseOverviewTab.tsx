/**
 * @file CourseOverviewTab.tsx
 * @description
 * This component is the "Overview" tab within the `CourseDetail` page. It's responsible for
 * displaying and allowing edits to the general settings of a course.
 *
 * What it does:
 * 1.  Displays settings like "CO Target", "Internal Weightage", and "Attainment Level Thresholds".
 * 2.  Allows a Program Co-ordinator to edit these values. The fields are disabled for other roles.
 * 3.  Uses a "draft state" pattern: when a user makes a change, it's not saved immediately.
 *     Instead, it's stored in a temporary "draft". This allows the user to either save
 *     all their changes at once or cancel them.
 * 4.  It shows the `SaveBar` component at the bottom of the screen as soon as any
 *     changes are made (i.e., when the "draft" is different from the original).
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Course } from '../types';
import { useAppContext } from '../hooks/useAppContext';
import SaveBar from './SaveBar'; // Imports the bar for saving/canceling changes.

// This defines the "props" or properties that this component accepts.
interface CourseOverviewTabProps {
  course: Course; // It receives the full `Course` object it needs to display.
}

const CourseOverviewTab: React.FC<CourseOverviewTabProps> = ({ course }) => {
  // We ask our "magic backpack" (AppContext) for the tools we need.
  const { setData, currentUser } = useAppContext();
  // Check if the current user is a Program Co-ordinator, as they are the only ones who can edit.
  const isCoordinator = currentUser?.role === 'Program Co-ordinator';

  // --- State Management for Drafts ---
  // We use two pieces of state to manage unsaved changes:
  // 1. `draftCourse`: This holds the temporary changes the user is making. It's a copy.
  const [draftCourse, setDraftCourse] = useState<Course>(course);
  // 2. `initialCourse`: This is a snapshot of the original, saved state of the course.
  const [initialCourse, setInitialCourse] = useState<Course>(course);

  // `useEffect` runs code "on the side". This effect runs whenever the `course` prop changes
  // (e.g., if the user navigates from one course to another). It resets both our draft
  // and initial states to match the new course data.
  useEffect(() => {
    setDraftCourse(course);
    setInitialCourse(course);
  }, [course]);
  
  // `useMemo` is a performance helper. It calculates whether there are any unsaved changes
  // by comparing the draft state to the initial state. It only recalculates when one of them changes.
  const isDirty = useMemo(() => JSON.stringify(initialCourse) !== JSON.stringify(draftCourse), [initialCourse, draftCourse]);

  // A helper function to update a single field in our `draftCourse` state.
  const updateDraftCourseField = (field: keyof Course, value: any) => {
    setDraftCourse(prev => ({ ...prev, [field]: value }));
  };

  // A helper function specifically for updating the nested attainment level values.
  const updateDraftAttainmentLevel = (level: 'level1' | 'level2' | 'level3', value: number) => {
     setDraftCourse(prev => ({ ...prev, attainmentLevels: { ...prev.attainmentLevels, [level]: value } }));
  };

  // This function is called when the user clicks "Save Changes" in the SaveBar.
  const handleSave = () => {
    // We update the main application data in our magic backpack.
    setData(prev => ({
      ...prev,
      // We find the matching course in the main `courses` array and replace it with our `draftCourse`.
      courses: prev.courses.map(c => c.id === course.id ? draftCourse : c)
    }));
    // After saving, the new "original" state is our draft. This makes `isDirty` false again.
    setInitialCourse(draftCourse);
    alert("Changes saved successfully!");
  };

  // This function is called when the user clicks "Cancel" in the SaveBar.
  const handleCancel = () => {
    // We discard the draft by resetting it to the original, untouched `initialCourse` state.
    setDraftCourse(initialCourse);
  };


  // The JSX below describes what the tab's content looks like.
  return (
    <div className="space-y-6 pb-20">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">CO Target (%)</label>
          <input 
            type="number" 
            value={draftCourse.target} // The input shows the value from our draft state.
            onChange={e => updateDraftCourseField('target', Number(e.target.value))} // When it changes, we update the draft.
            className="mt-1 w-full p-2 border border-gray-300 rounded-md bg-white text-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed"
            disabled={!isCoordinator} // The input is disabled if the user is not a coordinator.
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Internal Weightage (%)</label>
          <input 
            type="number" 
            value={draftCourse.internalWeightage} 
            onChange={e => updateDraftCourseField('internalWeightage', Number(e.target.value))} 
            className="mt-1 w-full p-2 border border-gray-300 rounded-md bg-white text-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed"
            disabled={!isCoordinator}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">External Weightage (%)</label>
          <input 
            type="number" 
            value={draftCourse.externalWeightage} 
            onChange={e => updateDraftCourseField('externalWeightage', Number(e.target.value))} 
            className="mt-1 w-full p-2 border border-gray-300 rounded-md bg-white text-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed"
            disabled={!isCoordinator}
          />
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Attainment Level Thresholds</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
              <label className="block text-sm font-medium text-gray-700">Level 3 (&ge; X % of students)</label>
              <input 
                type="number" 
                value={draftCourse.attainmentLevels.level3} 
                onChange={e => updateDraftAttainmentLevel('level3', Number(e.target.value))} 
                className="mt-1 w-full p-2 border border-gray-300 rounded-md bg-white text-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed"
                disabled={!isCoordinator}
              />
          </div>
          <div>
              <label className="block text-sm font-medium text-gray-700">Level 2 (&ge; Y % of students)</label>
              <input 
                type="number" 
                value={draftCourse.attainmentLevels.level2} 
                onChange={e => updateDraftAttainmentLevel('level2', Number(e.target.value))} 
                className="mt-1 w-full p-2 border border-gray-300 rounded-md bg-white text-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed"
                disabled={!isCoordinator}
              />
          </div>
           <div>
              <label className="block text-sm font-medium text-gray-700">Level 1 (&ge; Z % of students)</label>
              <input 
                type="number" 
                value={draftCourse.attainmentLevels.level1} 
                onChange={e => updateDraftAttainmentLevel('level1', Number(e.target.value))} 
                className="mt-1 w-full p-2 border border-gray-300 rounded-md bg-white text-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed"
                disabled={!isCoordinator}
              />
          </div>
        </div>
      </div>

      {/* The SaveBar component is only shown if `isDirty` is true. */}
      <SaveBar isDirty={isDirty} onSave={handleSave} onCancel={handleCancel} />
    </div>
  );
};

export default CourseOverviewTab;
