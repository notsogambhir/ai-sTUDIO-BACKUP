/**
 * @file CourseFacultyAssignment.tsx
 * @description
 * This component is the "Faculty Assignment" tab within the `CourseDetail` page. It's where
 * a Program Co-ordinator or Admin can assign teachers to a course.
 *
 * It features a dual-mode assignment system:
 * 1.  **Single Teacher Mode**: Assign one teacher to the entire course. This is the default.
 * 2.  **Assign by Section Mode**: Assign a different teacher to each specific class section.
 *     This overrides the single teacher assignment for those sections.
 *
 * What it does:
 * 1.  **Mode Switching**: Provides buttons to toggle between the two assignment modes. It uses a
 *     confirmation modal to warn the user if switching modes will clear existing assignments.
 * 2.  **Assignment UI**: Shows a different UI based on the selected mode:
 *     - A single dropdown for "Single Teacher" mode.
 *     - A list of sections, each with its own dropdown, for "Assign by Section" mode.
 * 3.  **Draft State**: All assignment changes are held in a temporary "draft state". The `SaveBar`
 *     appears when changes are made, allowing the user to save or cancel.
 * 4.  **Filters Teachers**: The list of available teachers in the dropdowns is filtered based
 *     on the current user's role (a PC sees their managed teachers, an Admin sees all teachers).
 * 5.  **Reset Functionality**: Includes a button to reset all section assignments back to the course default.
 */

import React, { useState, useMemo, useEffect } from 'react';
import { Course, User } from '../types';
import { useAppContext } from '../hooks/useAppContext';
import SaveBar from './SaveBar';
import ConfirmationModal from './ConfirmationModal';

// Defines the "props" or properties this component accepts.
interface CourseFacultyAssignmentProps {
  course: Course;
}
// Defines the possible assignment modes.
type AssignmentMode = 'single' | 'section';

const CourseFacultyAssignment: React.FC<CourseFacultyAssignmentProps> = ({ course }) => {
  // We ask our "magic backpack" (AppContext) for the data and tools we need.
  const { data, setData, currentUser } = useAppContext();
  
  // --- State Management ---
  // Draft state for holding temporary changes to the course.
  const [draftCourse, setDraftCourse] = useState<Course>(course);
  const [initialCourse, setInitialCourse] = useState<Course>(course);
  
  // This `useEffect` resets the state whenever the user navigates to a different course.
  useEffect(() => {
    setDraftCourse(course);
    setInitialCourse(course);
  }, [course]);

  // A piece of memory to remember which mode ('single' or 'section') is currently active.
  const [assignmentMode, setAssignmentMode] = useState<AssignmentMode>(
    course.sectionTeacherIds && Object.keys(course.sectionTeacherIds).length > 0 ? 'section' : 'single'
  );

  // State for the "Are you sure?" confirmation popup.
  const [confirmation, setConfirmation] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
    } | null>(null);

  /**
   * `useMemo` is a smart calculator that figures out which teachers and sections are relevant for this view.
   * It only recalculates when its dependencies change.
   */
  const { managedTeachers, courseSections } = useMemo(() => {
    // Determine which teachers the current user is allowed to assign.
    let teachers: User[] = [];
    if (currentUser?.role === 'Program Co-ordinator') {
        const myManagedTeacherIds = new Set(data.users.filter(u => u.role === 'Teacher' && u.programCoordinatorIds?.includes(currentUser.id)).map(u => u.id));
        teachers = data.users.filter(u => myManagedTeacherIds.has(u.id));
    } else if (currentUser?.role === 'Department' || currentUser?.role === 'Admin') {
        // Department heads and Admins can assign any teacher that reports to PCs in their college.
        const pcsInCollege = data.users.filter(u => u.role === 'Program Co-ordinator' && u.collegeId === currentUser.collegeId);
        const pcIds = new Set(pcsInCollege.map(pc => pc.id));
        teachers = data.users.filter(u => u.role === 'Teacher' && (u.programCoordinatorIds || []).some(id => pcIds.has(id)));
    }

    // Find all sections that have students enrolled in this course.
    const enrolledSectionIds = new Set(data.enrollments
        .filter(e => e.courseId === course.id && e.sectionId)
        .map(e => e.sectionId)
    );
    const sections = data.sections.filter(s => enrolledSectionIds.has(s.id));
    
    return { managedTeachers: teachers, courseSections: sections };
  }, [data, currentUser, course.id]);
  
  // `isDirty` checks if there are any unsaved changes.
  const isDirty = useMemo(() => JSON.stringify(draftCourse) !== JSON.stringify(initialCourse), [draftCourse, initialCourse]);

  /**
   * This function runs when the user clicks to switch assignment modes.
   * It uses a confirmation modal to prevent accidental data loss.
   */
  const handleModeChange = (mode: AssignmentMode) => {
    if (mode === assignmentMode) return; // Do nothing if already in this mode.

    if (mode === 'section') {
      // If switching TO 'section' mode, warn the user it will clear the single-teacher assignment.
      setConfirmation({
        isOpen: true,
        title: "Confirm Assignment Mode Switch",
        message: "Switching to 'Assign by Section' will clear any existing single-teacher assignment for this course. Are you sure you want to proceed?",
        onConfirm: () => {
          setAssignmentMode('section');
          setDraftCourse(prev => ({ ...prev, teacherId: null })); // Clear the single teacher ID.
          setConfirmation(null);
        }
      });
    } else { // Switching to 'single' mode
      // If switching TO 'single' mode, warn the user it will clear all section assignments.
      const hasSectionAssignments = draftCourse.sectionTeacherIds && Object.keys(draftCourse.sectionTeacherIds).length > 0;
      if (hasSectionAssignments) {
        setConfirmation({
          isOpen: true,
          title: "Confirm Assignment Mode Switch",
          message: "Switching to 'Single Teacher' will clear all existing section-specific teacher assignments. Are you sure you want to proceed?",
          onConfirm: () => {
            setAssignmentMode('single');
            setDraftCourse(prev => {
              const { sectionTeacherIds, ...rest } = prev; // This removes the sectionTeacherIds property.
              return rest as Course;
            });
            setConfirmation(null);
          }
        });
      } else {
        setAssignmentMode(mode); // If no assignments to clear, just switch.
      }
    }
  };

  /**
   * This function runs when the "Reset all to default" button is clicked.
   * It opens a confirmation modal before clearing all section-specific assignments
   * from the draft state, effectively making all sections use the single course teacher.
   */
  const handleResetToDefault = () => {
    const hasSectionAssignments = draftCourse.sectionTeacherIds && Object.keys(draftCourse.sectionTeacherIds).length > 0;
    if (!hasSectionAssignments) {
      alert("No section-specific assignments to reset.");
      return;
    }

    setConfirmation({
      isOpen: true,
      title: "Reset Section Assignments",
      message: "Are you sure you want to clear all section-specific assignments? All sections will revert to using the course default teacher (if set). This change will be staged and can be saved or canceled.",
      onConfirm: () => {
        setDraftCourse(prev => {
          // By creating a new object without the `sectionTeacherIds` key, we effectively remove it.
          const { sectionTeacherIds, ...rest } = prev;
          return rest as Course;
        });
        setConfirmation(null);
      }
    });
  };


  // Handlers for updating the draft state when dropdowns change.
  const handleSingleTeacherChange = (teacherId: string) => {
    setDraftCourse(prev => ({ ...prev, teacherId: teacherId || null }));
  };
  const handleSectionTeacherChange = (sectionId: string, teacherId: string) => {
    setDraftCourse(prev => {
        const newSectionTeachers = { ...(prev.sectionTeacherIds || {}) };
        if (teacherId) {
            newSectionTeachers[sectionId] = teacherId;
        } else {
            delete newSectionTeachers[sectionId];
        }
        return { ...prev, sectionTeacherIds: newSectionTeachers };
    });
  };

  // Handlers for the SaveBar.
  const handleSave = () => {
    setData(prev => ({
        ...prev,
        courses: prev.courses.map(c => c.id === course.id ? draftCourse : c)
    }));
    setInitialCourse(draftCourse);
    alert("Faculty assignments saved!");
  };
  const handleCancel = () => {
    setDraftCourse(initialCourse);
    // Also reset the mode to match the initial state.
    setAssignmentMode(initialCourse.sectionTeacherIds && Object.keys(initialCourse.sectionTeacherIds).length > 0 ? 'section' : 'single');
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-700">Faculty Assignment</h2>
           <div className="flex items-center space-x-2 rounded-lg bg-gray-200 p-1">
                <button 
                    onClick={() => handleModeChange('single')}
                    className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${assignmentMode === 'single' ? 'bg-white text-gray-800 shadow' : 'text-gray-600 hover:bg-gray-300'}`}
                >
                    Single Teacher
                </button>
                <button 
                    onClick={() => handleModeChange('section')}
                    className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${assignmentMode === 'section' ? 'bg-white text-gray-800 shadow' : 'text-gray-600 hover:bg-gray-300'}`}
                >
                    Assign by Section
                </button>
            </div>
      </div>

      {assignmentMode === 'single' && (
        <div className="p-4 border rounded-lg bg-gray-50">
           <label htmlFor="single-teacher-select" className="block text-sm font-medium text-gray-700">
               Assign a single teacher for the entire course
            </label>
           <select
                id="single-teacher-select"
                value={draftCourse.teacherId || ''}
                onChange={(e) => handleSingleTeacherChange(e.target.value)}
                className="mt-2 block w-full max-w-sm pl-3 pr-10 py-2 text-base bg-white text-gray-900 border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
                <option value="">-- Unassigned --</option>
                {managedTeachers.map(teacher => (
                    <option key={teacher.id} value={teacher.id}>{teacher.name}</option>
                ))}
            </select>
            <p className="mt-2 text-xs text-gray-500">This teacher will be the default unless overridden by section-specific assignments.</p>
        </div>
      )}

      {assignmentMode === 'section' && (
         <div className="p-4 border rounded-lg bg-gray-50">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-md font-medium text-gray-700">Assign a teacher to each section</h3>
              {/* The button to reset all section assignments to the course default. */}
              <button
                onClick={handleResetToDefault}
                className="text-sm text-indigo-600 hover:text-indigo-800 font-semibold"
                aria-label="Reset all section assignments to default"
              >
                Reset all to default
              </button>
            </div>
            <div className="space-y-3">
                {courseSections.map(section => (
                    <div key={section.id} className="grid grid-cols-1 md:grid-cols-3 items-center gap-4">
                        <label htmlFor={`section-teacher-${section.id}`} className="font-semibold text-gray-800 text-sm">
                            Section {section.name}
                        </label>
                         <select
                            id={`section-teacher-${section.id}`}
                            value={draftCourse.sectionTeacherIds?.[section.id] || ''}
                            onChange={(e) => handleSectionTeacherChange(section.id, e.target.value)}
                            className="md:col-span-2 block w-full pl-3 pr-10 py-2 text-base bg-white text-gray-900 border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                        >
                            <option value="">-- Use Course Default --</option>
                            {managedTeachers.map(teacher => (
                                <option key={teacher.id} value={teacher.id}>{teacher.name}</option>
                            ))}
                        </select>
                    </div>
                ))}
                 {courseSections.length === 0 && (
                    <p className="text-center text-gray-500 py-4">No sections found for this course. Enroll students to see sections here.</p>
                )}
            </div>
         </div>
      )}
      <SaveBar isDirty={isDirty} onSave={handleSave} onCancel={handleCancel} />
      {confirmation && (
        <ConfirmationModal
            isOpen={confirmation.isOpen}
            title={confirmation.title}
            message={confirmation.message}
            onConfirm={confirmation.onConfirm}
            onClose={() => setConfirmation(null)}
        />
       )}
    </div>
  );
};

export default CourseFacultyAssignment;