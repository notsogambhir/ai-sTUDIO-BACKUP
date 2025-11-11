/**
 * @file CourseFacultyAssignment.tsx
 * @description
 * This component is the "Faculty Assignment" tab within the `CourseDetail` page.
 */

import React, { useState, useMemo, useEffect } from 'react';
import { Course, User } from '../types';
import { useAppContext } from '../hooks/useAppContext';
import SaveBar from './SaveBar';
import ConfirmationModal from './ConfirmationModal';
import apiClient from '../api';

interface CourseFacultyAssignmentProps {
  course: Course;
}
type AssignmentMode = 'single' | 'section';

const CourseFacultyAssignment: React.FC<CourseFacultyAssignmentProps> = ({ course }) => {
  const { data, fetchAppData, currentUser } = useAppContext();
  
  const [draftCourse, setDraftCourse] = useState<Course>(course);
  const [initialCourse, setInitialCourse] = useState<Course>(course);
  
  useEffect(() => {
    setDraftCourse(course);
    setInitialCourse(course);
  }, [course]);

  const [assignmentMode, setAssignmentMode] = useState<AssignmentMode>(
    course.sectionTeacherIds && Object.keys(course.sectionTeacherIds).length > 0 ? 'section' : 'single'
  );

  const [confirmation, setConfirmation] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
    } | null>(null);

  const { managedTeachers, courseSections } = useMemo(() => {
    let teachers: User[] = [];
    if (currentUser?.role === 'Program Co-ordinator') {
        const myManagedTeacherIds = new Set(data?.users.filter(u => u.role === 'Teacher' && u.programCoordinatorIds?.includes(currentUser.id)).map(u => u.id));
        teachers = data?.users.filter(u => myManagedTeacherIds.has(u.id)) || [];
    } else if (currentUser?.role === 'Department' || currentUser?.role === 'Admin') {
        const pcsInCollege = data?.users.filter(u => u.role === 'Program Co-ordinator' && u.collegeId === currentUser.collegeId) || [];
        const pcIds = new Set(pcsInCollege.map(pc => pc.id));
        teachers = data?.users.filter(u => u.role === 'Teacher' && (u.programCoordinatorIds || []).some(id => pcIds.has(id))) || [];
    }

    const enrolledSectionIds = new Set(data?.enrollments
        .filter(e => e.courseId === course.id && e.sectionId)
        .map(e => e.sectionId)
    );
    const sections = data?.sections.filter(s => enrolledSectionIds.has(s.id)) || [];
    
    return { managedTeachers: teachers, courseSections: sections };
  }, [data, currentUser, course.id]);
  
  const isDirty = useMemo(() => JSON.stringify(draftCourse) !== JSON.stringify(initialCourse), [draftCourse, initialCourse]);

  const handleModeChange = (mode: AssignmentMode) => {
    if (mode === assignmentMode) return;

    if (mode === 'section') {
      setConfirmation({
        isOpen: true,
        title: "Confirm Assignment Mode Switch",
        message: "Switching to 'Assign by Section' will clear any existing single-teacher assignment for this course. Are you sure you want to proceed?",
        onConfirm: () => {
          setAssignmentMode('section');
          setDraftCourse(prev => ({ ...prev, teacherId: null }));
          setConfirmation(null);
        }
      });
    } else {
      const hasSectionAssignments = draftCourse.sectionTeacherIds && Object.keys(draftCourse.sectionTeacherIds).length > 0;
      if (hasSectionAssignments) {
        setConfirmation({
          isOpen: true,
          title: "Confirm Assignment Mode Switch",
          message: "Switching to 'Single Teacher' will clear all existing section-specific teacher assignments. Are you sure you want to proceed?",
          onConfirm: () => {
            setAssignmentMode('single');
            setDraftCourse(prev => {
              const { sectionTeacherIds, ...rest } = prev;
              return rest as Course;
            });
            setConfirmation(null);
          }
        });
      } else {
        setAssignmentMode(mode);
      }
    }
  };

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
          const { sectionTeacherIds, ...rest } = prev;
          return rest as Course;
        });
        setConfirmation(null);
      }
    });
  };

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

  const handleSave = async () => {
    try {
      await apiClient.patch(`/courses/${course.id}/`, draftCourse);
      await fetchAppData();
      setInitialCourse(draftCourse);
      alert("Faculty assignments saved!");
    } catch (error) {
      console.error('Failed to save faculty assignments:', error);
      alert('Failed to save assignments. Please try again.');
    }
  };
  const handleCancel = () => {
    setDraftCourse(initialCourse);
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
                            ))}\
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
