/**
 * @file StudentCOAttainmentReport.tsx
 * @description
 * This component calculates and displays a detailed report of each student's attainment
 * for every Course Outcome (CO) in a specific course.
 *
 * It has two modes:
 * 1.  **Standalone Page**: When navigated to directly (e.g., from `CourseDetail`), it acts
 *     as a full page with a header, filters, and a print button.
 * 2.  **Embedded Report**: When used inside the `PrintableReport` component (from the main
 *     `AttainmentReports` dashboard), it accepts an `isPrintable` prop and renders a simplified,
 *     print-optimized table without any extra UI.
 */

import React, { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAppContext } from '../hooks/useAppContext';
import PrintableReport from '../components/PrintableReport';

// This defines the "props" or properties that this component accepts.
// They are optional to allow the component to work in both standalone and embedded modes.
interface StudentCOAttainmentReportProps {
    courseId?: string;
    isPrintable?: boolean;
}

const StudentCOAttainmentReport: React.FC<StudentCOAttainmentReportProps> = ({ courseId: propCourseId, isPrintable = false }) => {
    // Get the courseId from the URL if it's not passed as a prop.
    const { courseId: paramCourseId } = useParams<{ courseId: string }>();
    const courseId = propCourseId || paramCourseId;

    // Get data and user info from the "magic backpack".
    const { data, selectedBatch, currentUser } = useAppContext();
    const [isPrintModalOpen, setPrintModalOpen] = useState(false);

    const isPCorAdmin = currentUser?.role === 'Program Co-ordinator' || currentUser?.role === 'Admin';
    const [selectedScope, setSelectedScope] = useState<'overall' | string>('overall');

    // `useMemo` is a smart calculator that finds the course and its sections.
    const course = useMemo(() => data.courses.find(c => c.id === courseId), [data.courses, courseId]);
    const courseSections = useMemo(() => {
        if (!course) return [];
        const enrolledSectionIds = new Set(data.enrollments.filter(e => e.courseId === course.id && e.sectionId).map(e => e.sectionId!));
        return data.sections.filter(s => enrolledSectionIds.has(s.id)).sort((a,b) => a.name.localeCompare(b.name));
    }, [data.enrollments, data.sections, course]);

    /**
     * This is the main calculation logic for the report, wrapped in `useMemo` for performance.
     */
    const attainmentData = useMemo(() => {
        if (!course || !selectedBatch) return { students: [], courseOutcomes: [], reportData: new Map() };

        // --- Step 1: Filter students based on the user's role and selected scope. ---
        const courseOutcomes = data.courseOutcomes.filter(co => co.courseId === course.id).sort((a,b) => a.number.localeCompare(b.number));
        let studentsInScope;
        // Logic for PC/Admin with scope dropdown
        if (isPCorAdmin) {
            if (selectedScope === 'overall') {
                const batch = data.batches.find(b => b.programId === course.programId && b.name === selectedBatch);
                if (!batch) return { students: [], courseOutcomes: [], reportData: new Map() };
                const sectionIdsForBatch = new Set(data.sections.filter(s => s.batchId === batch.id).map(s => s.id));
                const studentIdsInBatch = new Set(data.students.filter(s => s.sectionId && sectionIdsForBatch.has(s.sectionId)).map(s => s.id));
                studentsInScope = data.students.filter(s => studentIdsInBatch.has(s.id) && data.enrollments.some(e => e.studentId === s.id && e.courseId === course.id));
            } else { // A specific section is selected
                 studentsInScope = data.students.filter(s => s.sectionId === selectedScope && data.enrollments.some(e => e.studentId === s.id && e.courseId === course.id));
            }
        } else { // Logic for a Teacher (auto-scoped)
            const teacherId = currentUser!.id;
            const teacherSectionIds = new Set<string>();
            courseSections.forEach(section => {
                const sectionTeacher = course.sectionTeacherIds?.[section.id];
                if ((sectionTeacher && sectionTeacher === teacherId) || (!sectionTeacher && course.teacherId === teacherId)) {
                    teacherSectionIds.add(section.id);
                }
            });
            studentsInScope = data.students.filter(s => s.sectionId && teacherSectionIds.has(s.sectionId) && data.enrollments.some(e => e.studentId === s.id && e.courseId === course.id));
        }

        const activeStudents = studentsInScope.filter(s => s.status === 'Active').sort((a, b) => a.id.localeCompare(b.id));

        // --- Step 2: Pre-calculate helper maps for performance. ---
        const sectionIdsForCourse = new Set(data.enrollments.filter(e => e.courseId === course.id && e.sectionId).map(e => e.sectionId!));
        const assessmentsForCourse = data.assessments.filter(a => sectionIdsForCourse.has(a.sectionId));
        const coQuestionMap = new Map<string, { q: string; maxMarks: number; assessmentId: string }[]>();
        courseOutcomes.forEach(co => coQuestionMap.set(co.id, []));
        assessmentsForCourse.forEach(assessment => {
            assessment.questions.forEach(q => q.coIds.forEach(coId => coQuestionMap.get(coId)?.push({ ...q, assessmentId: assessment.id })));
        });

        // --- Step 3: Loop through each student and calculate their attainment for each CO. ---
        const reportData = new Map<string, { [coId: string]: number }>();
        activeStudents.forEach(student => {
            const studentAttainment: { [coId: string]: number } = {};
            const studentMarks = data.marks.filter(m => m.studentId === student.id);
            courseOutcomes.forEach(co => {
                const questionsForCo = coQuestionMap.get(co.id) || [];
                let totalObtainedCoMarks = 0;
                let totalMaxCoMarks = 0;
                
                questionsForCo.forEach(q => {
                    const mark = studentMarks.find(m => m.assessmentId === q.assessmentId);
                    const score = mark?.scores.find(s => s.q === q.q);
                    // A question is considered attempted if a score object exists for it.
                    if (score !== undefined) { 
                        totalObtainedCoMarks += score.marks;
                        totalMaxCoMarks += q.maxMarks;
                    }
                });

                studentAttainment[co.id] = totalMaxCoMarks > 0 ? (totalObtainedCoMarks / totalMaxCoMarks) * 100 : 0;
            });
            reportData.set(student.id, studentAttainment);
        });
        return { students: activeStudents, courseOutcomes, reportData };
    }, [course, selectedBatch, data, selectedScope, isPCorAdmin, currentUser, courseSections]);

    if (!course) return <div>Course not found.</div>;
    const { students, courseOutcomes, reportData } = attainmentData;

    /**
     * A reusable function to render the main data table. It can render a full version for the
     * screen or a simplified, denser version for printing.
     */
    const renderTable = (printable: boolean) => (
        <table className={`min-w-full border-collapse ${printable ? 'text-xs border border-gray-400' : 'divide-y divide-gray-200'}`}>
            <thead className={`${printable ? 'bg-gray-200' : 'bg-gray-50'}`}>
                <tr>
                    <th className={`p-2 text-left font-medium ${printable ? 'border border-gray-400' : 'px-6 py-3 text-gray-500 uppercase tracking-wider'}`}>Student ID</th>
                    <th className={`p-2 text-left font-medium ${printable ? 'border border-gray-400' : 'px-6 py-3 text-gray-500 uppercase tracking-wider'}`}>Student Name</th>
                    {courseOutcomes.map(co => (
                        <th key={co.id} className={`p-2 text-center font-medium ${printable ? 'border border-gray-400' : 'px-4 py-3 text-gray-500 uppercase tracking-wider'}`}>{co.number}</th>
                    ))}
                </tr>
            </thead>
            <tbody className={`${printable ? '' : 'bg-white divide-y divide-gray-200'}`}>
                {students.map(student => (
                    <tr key={student.id}>
                        <td className={`p-2 font-medium ${printable ? 'border border-gray-400' : 'px-6 py-4 whitespace-nowrap text-gray-900'}`}>{student.id}</td>
                        <td className={`p-2 ${printable ? 'border border-gray-400' : 'px-6 py-4 whitespace-nowrap text-gray-600'}`}>{student.name}</td>
                        {courseOutcomes.map(co => {
                            const attainment = reportData.get(student.id)?.[co.id] ?? 0;
                            const achievedTarget = attainment >= course.target;
                            return (
                                <td key={co.id} className={`p-2 text-center font-semibold ${printable ? 'border border-gray-400' : ''} ${achievedTarget ? 'text-green-600' : 'text-red-600'}`}>
                                    {attainment.toFixed(1)}%
                                </td>
                            );
                        })}
                    </tr>
                ))}
            </tbody>
        </table>
    );

    // If the component is in "printable" mode, it just renders the table.
    if (isPrintable) {
        return (
            <div className="space-y-4">
                <h2 className="text-xl font-bold text-gray-700 mb-4">Student-wise Attainment Details</h2>
                {students.length > 0 ? renderTable(true) : <p className="text-center py-8 text-gray-500">No student data available for this report.</p>}
            </div>
        );
    }
    
    // Otherwise, it renders the full standalone page.
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Student-wise CO Attainment Report</h2>
                    <p className="text-gray-500">Course: {course.name} ({course.code}) | Target: {course.target}%</p>
                </div>
                <button onClick={() => setPrintModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">
                    Print Report
                </button>
            </div>
            {isPCorAdmin && courseSections.length > 0 && (
                 <div>
                    <label htmlFor="section-scope-select" className="block text-sm font-medium text-gray-700">Filter by Section:</label>
                    <select id="section-scope-select" value={selectedScope} onChange={e => setSelectedScope(e.target.value)} className="mt-1 block w-full max-w-xs pl-3 pr-10 py-2 text-base bg-white text-gray-900 border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                        <option value="overall">Overall Batch</option>
                        {courseSections.map(section => ( <option key={section.id} value={section.id}>Section {section.name}</option> ))}
                    </select>
                </div>
            )}
            <div className="overflow-x-auto bg-white rounded-lg shadow-md">
                {students.length > 0 ? renderTable(false) : <p className="text-center py-8 text-gray-500">No student data available for the selected scope.</p>}
            </div>
            {isPrintModalOpen && (
                <PrintableReport title={`Student CO Attainment - ${course.name}`} onClose={() => setPrintModalOpen(false)}>
                    {renderTable(true)}
                </PrintableReport>
            )}
        </div>
    );
};

export default StudentCOAttainmentReport;