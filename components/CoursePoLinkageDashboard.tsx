/**
 * @file CoursePoLinkageDashboard.tsx
 * @description
 * This component is a dashboard displayed on the `ProgramOutcomesList` page. Its purpose is to
 * show how each course in a program contributes to the Program Outcomes (POs).
 *
 * It performs two main calculations:
 * 1.  **Overall CO Attainment per Course**: For each course, it calculates the average
 *     attainment percentage across all its COs for all students in the selected batch. This
 *     gives a single performance score for the entire course.
 * 2.  **Average Linkage to POs**: For each course, it looks at the CO-PO Mapping Matrix
 *     and calculates the average mapping strength (from 0 to 3) from that course to each PO.
 *     This shows how strongly a course is designed to support each program outcome.
 *
 * The result is a table with courses as rows and POs as columns, providing a high-level
 * overview of the curriculum's structure and performance.
 */

import React, { useMemo } from 'react';
import { ProgramOutcome, Course } from '../types';
import { useAppContext } from '../hooks/useAppContext';

// This defines the "props" or properties that this component accepts from its parent.
interface CoursePoLinkageDashboardProps {
    programOutcomes: ProgramOutcome[];
    courses: Course[];
}

const CoursePoLinkageDashboard: React.FC<CoursePoLinkageDashboardProps> = ({ programOutcomes, courses }) => {
    // We get our app's data and the selected batch from the "magic backpack".
    const { data, selectedBatch } = useAppContext();

    /**
     * This is the main calculation logic for the dashboard, wrapped in `useMemo` for performance.
     * It will only re-run if its dependencies (courses, data, selectedBatch) change.
     */
    const courseLinkageData = useMemo(() => {
        if (!selectedBatch || courses.length === 0) return [];
        const programId = courses[0].programId;

        // --- Step 1: Filter students down to the selected batch. ---
        const batch = data.batches.find(b => b.programId === programId && b.name === selectedBatch);
        if (!batch) return [];
        const sectionIdsForBatch = new Set(data.sections.filter(s => s.batchId === batch.id).map(s => s.id));

        // --- Step 2: Pre-calculate lookup maps for performance. ---
        // This is much faster than searching through arrays inside a loop.
        
        // Map of student marks: Student ID -> Assessment ID -> Question Name -> Marks
        const studentMarksMap = new Map<string, Map<string, Map<string, number>>>();
        data.marks.forEach(mark => {
            if (!studentMarksMap.has(mark.studentId)) studentMarksMap.set(mark.studentId, new Map());
            const assessmentMap = studentMarksMap.get(mark.studentId)!;
            assessmentMap.set(mark.assessmentId, new Map(mark.scores.map(s => [s.q, s.marks])));
        });

        // Map of which questions belong to which CO: CO ID -> [List of Questions]
        const coQuestionMap = new Map<string, { q: string; maxMarks: number; assessmentId: string }[]>();
        data.courseOutcomes.forEach(co => coQuestionMap.set(co.id, []));
        data.assessments.forEach(a => a.questions.forEach(q => q.coIds.forEach(coId => coQuestionMap.get(coId)?.push({ ...q, assessmentId: a.id }))));


        // --- Step 3: Loop through each course to calculate its data row. ---
        return courses.map(course => {
            const courseOutcomes = data.courseOutcomes.filter(co => co.courseId === course.id);
            
            // Find all students who are enrolled in this course AND belong to the selected batch.
            const studentsInCourse = data.students.filter(s => 
                s.sectionId && sectionIdsForBatch.has(s.sectionId) &&
                data.enrollments.some(e => e.studentId === s.id && e.courseId === course.id)
            );

            // --- Calculation Part A: Overall CO Attainment for the course ---
            let overallCoAttainment = 0;
            if (studentsInCourse.length > 0 && courseOutcomes.length > 0) {
                // To get the course's overall attainment, we first calculate the average
                // attainment for each individual student in the course...
                const studentOverallAttainments = studentsInCourse.map(student => {
                    const studentCoPercentages = courseOutcomes.map(co => {
                        const questionsForCo = coQuestionMap.get(co.id) || [];
                        if (questionsForCo.length === 0) return 0;
                        
                        let totalMaxMarks = 0;
                        let totalObtainedMarks = 0;
                        const studentAllMarks = studentMarksMap.get(student.id);

                        questionsForCo.forEach(q => {
                            const mark = studentAllMarks?.get(q.assessmentId)?.get(q.q);
                            if (mark !== undefined && mark !== null) {
                                totalObtainedMarks += mark;
                                totalMaxMarks += q.maxMarks;
                            }
                        });

                        return totalMaxMarks > 0 ? (totalObtainedMarks / totalMaxMarks) * 100 : 0;
                    });
                    
                    // ...calculate the student's personal average across all COs...
                    return studentCoPercentages.length > 0 ? studentCoPercentages.reduce((a, b) => a + b, 0) / studentCoPercentages.length : 0;
                });
                // ...and finally, we average all the student averages to get the course's overall score.
                overallCoAttainment = studentOverallAttainments.length > 0 ? studentOverallAttainments.reduce((a,b) => a+b, 0) / studentOverallAttainments.length : 0;
            }

            // --- Calculation Part B: Average Linkage Level from this course to each PO ---
            const averageLinkages: { [poId: string]: number } = {};
            programOutcomes.forEach(po => {
                if (courseOutcomes.length === 0) { averageLinkages[po.id] = 0; return; }

                let totalLinkageLevel = 0;
                let linkedCoCount = 0;

                courseOutcomes.forEach(co => {
                    // Find the mapping strength (1, 2, or 3) from this CO to the current PO.
                    const mapping = data.coPoMapping.find(m => m.courseId === course.id && m.coId === co.id && m.poId === po.id);
                    const level = mapping?.level || 0;
                    if (level > 0) {
                        totalLinkageLevel += level;
                        linkedCoCount++;
                    }
                });

                // The average is the total strength divided by the number of COs that actually map to the PO.
                averageLinkages[po.id] = linkedCoCount > 0 ? totalLinkageLevel / linkedCoCount : 0;
            });
            
            return { course, overallCoAttainment, averageLinkages };
        });

    }, [courses, programOutcomes, data, selectedBatch]);


    if (courses.length === 0) return null;

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Course Contribution to POs</h2>
            <div className="overflow-x-auto">
                <table className="min-w-full border-collapse border border-gray-300">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="border border-gray-300 p-2 text-sm font-medium text-gray-500 uppercase">Course</th>
                            <th className="border border-gray-300 p-2 text-sm font-medium text-gray-500 uppercase">Overall CO Attainment</th>
                            {programOutcomes.map(po => (
                                <th key={po.id} className="border border-gray-300 p-2 text-sm font-medium text-gray-500 uppercase" title={po.description}>{po.number} Linkage</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {/* We loop through our calculated data to build the table rows. */}
                        {courseLinkageData.map(({ course, overallCoAttainment, averageLinkages }) => (
                            <tr key={course.id} className="bg-white hover:bg-gray-50">
                                <td className="border border-gray-300 p-2 font-semibold text-gray-700">{course.name} ({course.code})</td>
                                <td className="border border-gray-300 p-2 text-center">
                                    {/* The overall attainment score for the course. */}
                                    <span className={`font-bold px-2 py-1 rounded-md ${overallCoAttainment >= course.target ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {overallCoAttainment.toFixed(1)}%
                                    </span>
                                </td>
                                {/* The average linkage level from this course to each PO. */}
                                {programOutcomes.map(po => (
                                    <td key={po.id} className="border border-gray-300 p-2 text-center text-gray-600">
                                        {averageLinkages[po.id].toFixed(2)}
                                    </td>
                                ))}
                            </tr>
                        ))}\
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CoursePoLinkageDashboard;