/**
 * @file StudentDetailsModal.tsx
 * @description
 * This component is a popup window ("modal") that shows a detailed performance
 * summary for a single student. It appears when a user clicks "View Details"
 * on the `StudentsList` page.
 *
 * What it does:
 * 1.  Receives a `student` object as a prop.
 * 2.  Finds all the courses the student is enrolled in.
 * 3.  For each course, it performs a complex calculation to determine the student's
 *     attainment percentage for every single Course Outcome (CO).
 * 4.  It also calculates the student's overall average attainment for each course.
 * 5.  It displays all this information in a clear, organized way, with one section
 *     per enrolled course.
 *
 * This component has a complex calculation logic, similar to the main report pages,
 * but it is scoped down to just one student.
 */

import React, { useMemo } from 'react';
import { Student } from '../types';
import { useAppContext } from '../hooks/useAppContext';
import Modal from './Modal';

// This defines the "props" or properties that this component accepts.
interface StudentDetailsModalProps {
  student: Student; // The student whose details we want to show.
  onClose: () => void; // A function to close the modal.
}

const StudentDetailsModal: React.FC<StudentDetailsModalProps> = ({ student, onClose }) => {
  // We get all our application data from the "magic backpack".
  const { data } = useAppContext();

  /**
   * This is the main calculation logic for the modal, wrapped in `useMemo` for performance.
   * It will only re-run if the `student` or `data` changes.
   */
  const studentCourseData = useMemo(() => {
    // --- Step 1: Find all courses this student is enrolled in. ---
    const enrolledCourseIds = new Set(data.enrollments.filter(e => e.studentId === student.id).map(e => e.courseId));
    const enrolledCourses = data.courses.filter(c => enrolledCourseIds.has(c.id));

    // --- Step 2: Loop through each enrolled course and calculate the student's performance. ---
    return enrolledCourses.map(course => {
      const courseOutcomes = data.courseOutcomes.filter(co => co.courseId === course.id);

      // If it's a future course, there's no data to calculate, so we can skip it.
      if (course.status === 'Future') {
        return { course, coAttainments: null, overallAttainment: null };
      }

      // --- Step 3: For each CO in the course, calculate the student's attainment percentage. ---
      const coAttainments = courseOutcomes.map(co => {
        let obtainedMarks = 0;
        let possibleMarks = 0;

        // Find all assessments for this course by looking at the sections.
        const sectionIdsForCourse = new Set(data.enrollments.filter(e => e.courseId === course.id && e.sectionId).map(e => e.sectionId!));
        const assessmentsForCourse = data.assessments.filter(a => sectionIdsForCourse.has(a.sectionId));

        // Go through each assessment for the course.
        assessmentsForCourse.forEach(assessment => {
          // Find all questions in this assessment that are mapped to the current CO.
          const questionsForCo = assessment.questions.filter(q => q.coIds.includes(co.id));

          // For each of those questions...
          questionsForCo.forEach(question => {
            // ...find the student's mark entry for this assessment.
            const studentMark = data.marks.find(m => m.assessmentId === assessment.id && m.studentId === student.id);
            if (studentMark) {
              // ...find their score for this specific question.
              const score = studentMark.scores.find(s => s.q === question.q);
              if (score !== undefined) {
                // Add the student's score and the question's max marks to our totals.
                obtainedMarks += score.marks;
                possibleMarks += question.maxMarks;
              }
            }
          });
        });

        // Calculate the final percentage for this CO.
        const percentage = possibleMarks > 0 ? (obtainedMarks / possibleMarks) * 100 : 0;
        
        return { coNumber: co.number, percentage: percentage };
      });

      // --- Step 4: Calculate the student's overall average attainment for the whole course. ---
      const overallAttainment = coAttainments.length > 0
        ? coAttainments.reduce((sum, att) => sum + att.percentage, 0) / coAttainments.length
        : 0;

      return { course, coAttainments, overallAttainment };
    });
  }, [student, data]);

  // The JSX that describes what the modal looks like.
  return (
    <Modal title={`Student Details: ${student.name}`} onClose={onClose}>
      <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
        {/* Student's basic info */}
        <div className="bg-gray-50 p-4 rounded-lg grid grid-cols-1 md:grid-cols-3 gap-x-4">
            <p><span className="font-semibold text-gray-600">ID:</span> {student.id}</p>
            <p><span className="font-semibold text-gray-600">Name:</span> {student.name}</p>
            <p><span className="font-semibold text-gray-600">Status:</span> {student.status}</p>
        </div>

        <h3 className="text-lg font-semibold text-gray-700 pt-2 border-t">Course Performance</h3>
        {studentCourseData.map(({ course, coAttainments, overallAttainment }) => (
            <div key={course.id} className="bg-gray-50/50 p-4 rounded-lg border">
                <div className="flex justify-between items-baseline">
                    <h4 className="font-semibold text-gray-800">{course.name} ({course.code})</h4>
                    {overallAttainment !== null ? (
                        <p className="text-sm font-bold">
                            Overall:
                            <span className={`ml-2 text-base ${overallAttainment >= course.target ? 'text-green-600' : 'text-red-600'}`}>
                                {overallAttainment.toFixed(1)}%
                            </span>
                        </p>
                    ) : <p className="text-sm text-gray-500">Future Course</p>}
                </div>

                {coAttainments && (
                    <div className="mt-2 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-x-4 gap-y-1 text-sm">
                        {coAttainments.map(att => (
                            <div key={att.coNumber}>
                                <strong>{att.coNumber}:</strong>
                                <span className={`ml-1 ${att.percentage >= course.target ? 'text-green-600' : 'text-red-600'}`}>
                                    {att.percentage.toFixed(1)}%
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        ))}
         {studentCourseData.length === 0 && (
            <p className="text-gray-500 text-center py-4">This student is not enrolled in any courses.</p>
        )}
      </div>
    </Modal>
  );
};

export default StudentDetailsModal;
