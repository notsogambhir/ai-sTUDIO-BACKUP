/**
 * @file CourseAttainmentSummaryReport.tsx
 * @description
 * This component generates the full, detailed "Course Attainment Summary" report.
 * It's designed to be displayed inside the `PrintableReport` previewer.
 *
 * What it does:
 * 1.  **Fetches and Calculates Data**: It performs all the complex calculations needed for the report,
 *     combining the logic from `CourseCoAttainment` and `StudentCOAttainmentReport`.
 * 2.  **Renders Header**: Displays a professional header with the university logo, report title,
 *     and all relevant details (program, course, teacher, etc.).
 * 3.  **Renders CO Summary**: Displays a table showing the final attainment level for each CO.
 * 4.  **Renders Student Breakdown**: Displays a detailed table showing every student's individual
 *     attainment percentage for every CO.
 */

import React, { useMemo } from 'react';
import { useAppContext } from '../../hooks/useAppContext';

// Defines the props this component accepts.
interface ReportProps {
  courseId: string;
  scopeId: string; // 'overall' or a section ID.
}

const CourseAttainmentSummaryReport: React.FC<ReportProps> = ({ courseId, scopeId }) => {
  // Get all data and user info from the "magic backpack".
  const { data, currentUser, selectedProgram, selectedBatch } = useAppContext();

  // `useMemo` is a smart calculator that performs all the complex data fetching and
  // calculations for the report.
  const {
    course,
    coAttainmentData,
    studentAttainmentData,
    scopeName,
  } = useMemo(() => {
    const course = data.courses.find(c => c.id === courseId);
    if (!course) return { course: null, coAttainmentData: { results: [], studentCount: 0 }, studentAttainmentData: { students: [], courseOutcomes: [], reportData: new Map() }, scopeName: '' };
    
    // --- Step 1: Filter students based on the selected scope ('overall' or a section). ---
    let studentsInScope;
    if (scopeId === 'overall') {
        const batch = data.batches.find(b => b.programId === course.programId && b.name === selectedBatch);
        if (!batch) return { course: null, coAttainmentData: { results: [], studentCount: 0 }, studentAttainmentData: { students: [], courseOutcomes: [], reportData: new Map() }, scopeName: 'Overall' };
        
        const sectionIdsForBatch = new Set(data.sections.filter(s => s.batchId === batch.id).map(s => s.id));
        const studentIdsInBatch = new Set(data.students.filter(s => s.sectionId && sectionIdsForBatch.has(s.sectionId)).map(s => s.id));
        studentsInScope = data.students.filter(s => s.status === 'Active' && studentIdsInBatch.has(s.id) && data.enrollments.some(e => e.studentId === s.id && e.courseId === course.id));
    } else {
         studentsInScope = data.students.filter(s => s.status === 'Active' && s.sectionId === scopeId && data.enrollments.some(e => e.studentId === s.id && e.courseId === course.id));
    }
    const studentIdsInScope = new Set(studentsInScope.map(s => s.id));

    // --- Step 2: Pre-calculate helper maps for performance. ---
    const courseOutcomes = data.courseOutcomes.filter(co => co.courseId === course.id).sort((a,b) => a.number.localeCompare(b.number));
    const sectionIdsForCourse = new Set(data.enrollments.filter(e => e.courseId === course.id && e.sectionId).map(e => e.sectionId!));
    const assessmentsForCourse = data.assessments.filter(a => sectionIdsForCourse.has(a.sectionId));
    
    const studentMarksMap = new Map<string, Map<string, Map<string, number>>>();
    data.marks.filter(m => studentIdsInScope.has(m.studentId)).forEach(mark => {
        if (!studentMarksMap.has(mark.studentId)) studentMarksMap.set(mark.studentId, new Map());
        const assessmentMap = studentMarksMap.get(mark.studentId)!;
        assessmentMap.set(mark.assessmentId, new Map(mark.scores.map(s => [s.q, s.marks])));
    });

    const coQuestionMap = new Map<string, { q: string; maxMarks: number; assessmentId: string }[]>();
    courseOutcomes.forEach(co => coQuestionMap.set(co.id, []));
    assessmentsForCourse.forEach(a => a.questions.forEach(q => q.coIds.forEach(coId => coQuestionMap.get(coId)?.push({ ...q, assessmentId: a.id }))));
    
    // --- Step 3: Calculate Overall CO Attainment Summary (like in CourseCoAttainment.tsx) ---
    const coAttainmentResults = courseOutcomes.map(co => {
        const questionsForCo = coQuestionMap.get(co.id) || [];
        if (questionsForCo.length === 0 || studentsInScope.length === 0) return { co, percentageMeetingTarget: 0, attainmentLevel: 0 };
        
        let studentsMeetingTarget = 0;
        studentsInScope.forEach(student => {
            const totalMaxCoMarks = questionsForCo.reduce((sum, q) => sum + q.maxMarks, 0);
            const studentAllMarks = studentMarksMap.get(student.id);
            let totalObtainedCoMarks = studentAllMarks ? questionsForCo.reduce((sum, q) => sum + (studentAllMarks.get(q.assessmentId)?.get(q.q) || 0), 0) : 0;
            if (totalMaxCoMarks > 0 && (totalObtainedCoMarks / totalMaxCoMarks) * 100 >= course.target) {
                studentsMeetingTarget++;
            }
        });
        const percentageMeetingTarget = (studentsMeetingTarget / studentsInScope.length) * 100;
        let attainmentLevel = 0;
        if (percentageMeetingTarget >= course.attainmentLevels.level3) attainmentLevel = 3;
        else if (percentageMeetingTarget >= course.attainmentLevels.level2) attainmentLevel = 2;
        else if (percentageMeetingTarget >= course.attainmentLevels.level1) attainmentLevel = 1;
        return { co, percentageMeetingTarget, attainmentLevel };
    });

    // --- Step 4: Calculate Student-wise Attainment (like in StudentCOAttainmentReport.tsx) ---
    const studentReportData = new Map<string, { [coId: string]: number }>();
    studentsInScope.forEach(student => {
        const studentAttainment: { [coId: string]: number } = {};
        courseOutcomes.forEach(co => {
            const questionsForCo = coQuestionMap.get(co.id) || [];
            const totalMaxCoMarks = questionsForCo.reduce((sum, q) => sum + q.maxMarks, 0);
            const studentAllMarks = studentMarksMap.get(student.id);
            let totalObtainedCoMarks = studentAllMarks ? questionsForCo.reduce((sum, q) => sum + (studentAllMarks.get(q.assessmentId)?.get(q.q) || 0), 0) : 0;
            studentAttainment[co.id] = totalMaxCoMarks > 0 ? (totalObtainedCoMarks / totalMaxCoMarks) * 100 : 0;
        });
        studentReportData.set(student.id, studentAttainment);
    });

    const scopeNameText = scopeId === 'overall' ? 'Overall Course' : `Section ${data.sections.find(s => s.id === scopeId)?.name}`;

    return {
        course,
        coAttainmentData: { results: coAttainmentResults, studentCount: studentsInScope.length },
        studentAttainmentData: { students: studentsInScope.sort((a,b) => a.id.localeCompare(b.id)), courseOutcomes, reportData: studentReportData },
        scopeName: scopeNameText,
    };
  }, [data, courseId, scopeId, selectedBatch, currentUser]);
  
  if (!course) return <p className="text-red-500">Course not found.</p>;

  const attainmentLevelColors: { [key: number]: string } = {
      3: 'bg-green-100 text-green-800', 2: 'bg-blue-100 text-blue-800',
      1: 'bg-yellow-100 text-yellow-800', 0: 'bg-red-100 text-red-800',
  };

  return (
    <div className="space-y-8 text-sm">
        {/* Report Header */}
        <div className="mb-8 pb-4 border-b-2 border-gray-800">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Course Attainment Summary</h1>
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
        
        {/* Overall Attainment by CO */}
        <section>
            <h2 className="text-xl font-bold text-gray-700 mb-4">Overall Attainment by Course Outcome</h2>
            <p className="text-xs text-gray-500 mb-2">Based on {coAttainmentData.studentCount} students in scope.</p>
            <table className="min-w-full border-collapse border border-gray-400">
                <thead className="bg-gray-200">
                    <tr>
                        <th className="p-2 text-left font-medium border border-gray-400">CO</th>
                        <th className="p-2 text-left font-medium border border-gray-400">Description</th>
                        <th className="p-2 text-center font-medium border border-gray-400">% Students Above Target ({course.target}%)</th>
                        <th className="p-2 text-center font-medium border border-gray-400">Attainment Level</th>
                    </tr>
                </thead>
                <tbody>
                    {coAttainmentData.results.map(({ co, percentageMeetingTarget, attainmentLevel }) => (
                        <tr key={co.id}>
                            <td className="p-2 font-medium border border-gray-400">{co.number}</td>
                            <td className="p-2 border border-gray-400">{co.description}</td>
                            <td className="p-2 text-center font-semibold border border-gray-400">{percentageMeetingTarget.toFixed(1)}%</td>
                            <td className={`p-2 text-center font-bold text-lg border border-gray-400 ${attainmentLevelColors[attainmentLevel].replace('bg-', 'text-').split(' ')[1]}`}>{attainmentLevel}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </section>

        {/* Student-wise Attainment */}
        <section>
            <h2 className="text-xl font-bold text-gray-700 mb-4">Student-wise Attainment Details</h2>
            <table className="min-w-full border-collapse border border-gray-400">
                <thead className="bg-gray-200">
                    <tr>
                        <th className="p-2 text-left font-medium border border-gray-400">Student ID</th>
                        <th className="p-2 text-left font-medium border border-gray-400">Student Name</th>
                        {studentAttainmentData.courseOutcomes.map(co => (
                            <th key={co.id} className="p-2 text-center font-medium border border-gray-400">{co.number}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {studentAttainmentData.students.map(student => (
                        <tr key={student.id}>
                            <td className="p-2 font-medium border border-gray-400">{student.id}</td>
                            <td className="p-2 border border-gray-400">{student.name}</td>
                            {studentAttainmentData.courseOutcomes.map(co => {
                                const attainment = studentAttainmentData.reportData.get(student.id)?.[co.id] ?? 0;
                                const achievedTarget = attainment >= course.target;
                                return (
                                    <td key={co.id} className={`p-2 text-center font-semibold border border-gray-400 ${achievedTarget ? 'text-green-700' : 'text-red-700'}`}>
                                        {attainment.toFixed(1)}%
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </section>
    </div>
  );
};

export default CourseAttainmentSummaryReport;
