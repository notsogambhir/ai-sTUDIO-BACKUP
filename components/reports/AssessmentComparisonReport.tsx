/**
 * @file AssessmentComparisonReport.tsx
 * @description
 * This component generates the "Assessment Comparison Report", which is designed to be
 * displayed inside the `PrintableReport` previewer.
 *
 * It provides a detailed breakdown of each student's performance across all the assessments
 * within a course, allowing for easy comparison of results from different tests or exams.
 *
 * What it does:
 * 1.  **Fetches and Calculates Data**: It finds all students and all assessments within the given
 *     course and scope (overall or a specific section).
 * 2.  **Calculates Scores**: For each student, it calculates their final percentage score on each
 *     individual assessment.
 * 3.  **Renders Header**: Displays a professional header with the university logo and all
 *     relevant report details.
 * 4.  **Renders Comparison Table**: Displays a table with students as rows and assessments as
 *     columns, with each cell showing the student's percentage score for that assessment.
 */

import React, { useMemo } from 'react';
import { useAppContext } from '../../hooks/useAppContext';

// Defines the props this component accepts from its parent (`AttainmentReports.tsx`).
interface ReportProps {
  courseId: string;
  scopeId: string; // 'overall' or a section ID.
}

const AssessmentComparisonReport: React.FC<ReportProps> = ({ courseId, scopeId }) => {
  // Get all data and user info from the "magic backpack".
  const { data, selectedProgram, selectedBatch, currentUser } = useAppContext();

  /**
   * `useMemo` is a smart calculator that performs all the complex data fetching and
   * calculations for this specific report. It only recalculates when its inputs change.
   */
  const {
    course,
    assessments,
    students,
    reportData,
    scopeName
  } = useMemo(() => {
    const course = data.courses.find(c => c.id === courseId);
    if (!course) return { course: null, assessments: [], students: [], reportData: new Map(), scopeName: '' };
    
    // --- Step 1: Filter students based on the selected scope. ---
    let studentsInScope;
    if (scopeId === 'overall') {
        const batch = data.batches.find(b => b.programId === course.programId && b.name === selectedBatch);
        if (!batch) return { course, assessments: [], students: [], reportData: new Map(), scopeName: 'Overall' };
        
        const sectionIdsForBatch = new Set(data.sections.filter(s => s.batchId === batch.id).map(s => s.id));
        const studentIdsInBatch = new Set(data.students.filter(s => s.sectionId && sectionIdsForBatch.has(s.sectionId)).map(s => s.id));
        studentsInScope = data.students.filter(s => s.status === 'Active' && studentIdsInBatch.has(s.id) && data.enrollments.some(e => e.studentId === s.id && e.courseId === course.id));
    } else {
         studentsInScope = data.students.filter(s => s.status === 'Active' && s.sectionId === scopeId && data.enrollments.some(e => e.studentId === s.id && e.courseId === course.id));
    }

    // --- Step 2: Find all assessments relevant to the scope. ---
    const relevantSectionIds = scopeId === 'overall'
        ? new Set(data.enrollments.filter(e => e.courseId === course.id && e.sectionId).map(e => e.sectionId!))
        : new Set([scopeId]);
        
    const assessmentsForScope = data.assessments
        .filter(a => relevantSectionIds.has(a.sectionId))
        .sort((a,b) => a.name.localeCompare(b.name));

    // --- Step 3: Calculate each student's percentage on each assessment. ---
    const reportDataMap = new Map<string, { [assessmentId: string]: number }>();
    studentsInScope.forEach(student => {
        const studentScores: { [assessmentId: string]: number } = {};
        assessmentsForScope.forEach(assessment => {
            const studentMark = data.marks.find(m => m.studentId === student.id && m.assessmentId === assessment.id);
            if (studentMark) {
                const totalObtained = studentMark.scores.reduce((sum, s) => sum + s.marks, 0);
                const totalMax = assessment.questions.reduce((sum, q) => sum + q.maxMarks, 0);
                studentScores[assessment.id] = totalMax > 0 ? (totalObtained / totalMax) * 100 : 0;
            } else {
                studentScores[assessment.id] = 0; // If no marks entry, score is 0.
            }
        });
        reportDataMap.set(student.id, studentScores);
    });

    const scopeNameText = scopeId === 'overall' ? 'Overall Course' : `Section ${data.sections.find(s => s.id === scopeId)?.name}`;

    return {
        course,
        assessments: assessmentsForScope,
        students: studentsInScope.sort((a,b) => a.id.localeCompare(b.id)),
        reportData: reportDataMap,
        scopeName: scopeNameText
    };
  }, [data, courseId, scopeId, selectedBatch]);

  if (!course) return <p className="text-red-500">Course not found.</p>;

  return (
    <div className="space-y-8 text-sm">
      {/* Report Header */}
      <div className="mb-8 pb-4 border-b-2 border-gray-800">
        <div className="flex justify-between items-center">
            <div>
                <h1 className="text-2xl font-bold text-gray-800">Assessment Comparison Report</h1>
                <p className="text-gray-600">Generated on: {new Date().toLocaleDateString()}</p>
            </div>
            <img src="https://d1hbpr09pwz0sk.cloudfront.net/logo_url/chitkara-university-4c35e411" alt="Logo" className="h-16" />
        </div>
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-2 text-sm">
            <p><span className="font-semibold">Program:</span> {selectedProgram?.name}</p>
            <p><span className="font-semibold">Batch:</span> {selectedBatch}</p>
            <p><span className="font-semibold">Course:</span> {course.code} - {course.name}</p>
            <p><span className="font-semibold">Scope:</span> {scopeName}</p>
            <p><span className="font-semibold">Faculty:</span> {currentUser?.name}</p>
            <p><span className="font-semibold">Employee ID:</span> {currentUser?.employeeId}</p>
        </div>
      </div>
      
      {/* Main Report Table */}
      <section>
        <h2 className="text-xl font-bold text-gray-700 mb-4">Student Performance Across Assessments</h2>
        <table className="min-w-full border-collapse border border-gray-400">
            <thead className="bg-gray-200">
                <tr>
                    <th className="p-2 text-left font-medium border border-gray-400">Student ID</th>
                    <th className="p-2 text-left font-medium border border-gray-400">Student Name</th>
                    {assessments.map(assessment => (
                        <th key={assessment.id} className="p-2 text-center font-medium border border-gray-400">{assessment.name}</th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {students.map(student => (
                    <tr key={student.id}>
                        <td className="p-2 font-medium border border-gray-400">{student.id}</td>
                        <td className="p-2 border border-gray-400">{student.name}</td>
                        {assessments.map(assessment => {
                            const percentage = reportData.get(student.id)?.[assessment.id] ?? 0;
                            return (
                                <td key={assessment.id} className={`p-2 text-center font-semibold border border-gray-400`}>
                                    {percentage.toFixed(1)}%
                                </td>
                            );
                        })}
                    </tr>
                ))}
                {students.length === 0 && (
                    <tr>
                        <td colSpan={assessments.length + 2} className="text-center p-4 border border-gray-400">No student data found for this scope.</td>
                    </tr>
                )}
            </tbody>
        </table>
      </section>
    </div>
  );
};

export default AssessmentComparisonReport;
