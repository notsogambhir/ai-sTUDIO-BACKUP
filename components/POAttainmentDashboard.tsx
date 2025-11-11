/**
 * @file POAttainmentDashboard.tsx
 * @description
 * This is one of the most important and complex components in the application. It's the dashboard
 * on the `ProgramOutcomesList` page that calculates and displays the attainment levels for each
 * Program Outcome (PO).
 *
 * It consists of three main parts:
 * 1.  **Direct Attainment (Calculated)**: This is the most complex part. It calculates the PO
 *     attainment based on actual student performance in courses. It does this by:
 *     a. Calculating the attainment level for every single Course Outcome (CO) across all
 *        relevant courses in the selected program and batch.
 *     b. Using the CO-PO Mapping Matrix to calculate a weighted average, which becomes the
 *        "Direct Attainment" for each PO.
 * 2.  **Indirect Attainment (Manual Input)**: This provides a row of input fields where a user
 *     can manually enter attainment values, which are typically gathered from sources like
 *     surveys, employer feedback, etc.
 * 3.  **Overall Attainment (Calculated)**: This calculates the final PO attainment by combining
 *     the Direct and Indirect values using a weighted average, which the user can also adjust.
 */

import React, { useMemo } from 'react';
import { ProgramOutcome, Program } from '../types';
import { useAppContext } from '../hooks/useAppContext';

// Defines the "shape" of the settings this dashboard manages (weights and indirect values).
interface DashboardState {
    weights: { direct: number; indirect: number; };
    indirectAttainment: { [poId: string]: string; };
}
// Defines the "props" or properties this component accepts from its parent.
interface POAttainmentDashboardProps {
  programOutcomes: ProgramOutcome[];
  draftState: DashboardState;
  onStateChange: (newState: DashboardState) => void;
  selectedProgram: Program | null;
}

const POAttainmentDashboard: React.FC<POAttainmentDashboardProps> = ({ programOutcomes, draftState, onStateChange, selectedProgram }) => {
  // We get our app's data and the selected batch from the "magic backpack".
  const { data, selectedBatch } = useAppContext();
  const { weights, indirectAttainment } = draftState;

  /**
   * This is the heart of the direct attainment calculation, wrapped in `useMemo` for performance.
   * It's a "smart calculator" that only re-runs this massive calculation when its dependencies change.
   */
  const directAttainment = useMemo(() => {
    if (!selectedProgram || !selectedBatch) return {};

    const { courses, courseOutcomes, students, enrollments, assessments, marks, coPoMapping, batches, sections } = data;

    // --- Step 1: Filter everything down to the selected program and batch. ---
    const batch = batches.find(b => b.programId === selectedProgram.id && b.name === selectedBatch);
    if (!batch) return {}; // Can't calculate without a valid batch.
    const sectionIdsForBatch = new Set(sections.filter(s => s.batchId === batch.id).map(s => s.id));
    const relevantCourses = courses.filter(c => c.programId === selectedProgram.id && (c.status === 'Active' || c.status === 'Completed'));
    
    // `coAttainmentLevelMap` will be our final result from the first major calculation phase.
    // It will store the calculated attainment level (0-3) for every single CO.
    const coAttainmentLevelMap = new Map<string, number>();

    // --- Step 2: Loop through each course to calculate the attainment of its COs. ---
    relevantCourses.forEach(course => {
        const cosForCourse = courseOutcomes.filter(co => co.courseId === course.id);
        
        // Find all students who are enrolled in this course AND belong to the selected batch.
        const studentsInCourseAndBatch = students.filter(s => 
            s.status === 'Active' && s.sectionId && sectionIdsForBatch.has(s.sectionId) &&
            enrollments.some(e => e.studentId === s.id && e.courseId === course.id)
        );
        const totalStudents = studentsInCourseAndBatch.length;
        if (totalStudents === 0 || cosForCourse.length === 0) return; // Skip if no students or COs.

        // --- Step 2a: Create fast lookup maps for this course's data. ---
        const assessmentsForCourse = assessments.filter(a => enrollments.some(e => e.courseId === course.id && e.sectionId === a.sectionId));
        
        // Student marks map: Student ID -> Assessment ID -> Question Name -> Marks
        const studentMarksMap = new Map<string, Map<string, Map<string, number>>>();
        marks.forEach(mark => {
            if (!studentMarksMap.has(mark.studentId)) studentMarksMap.set(mark.studentId, new Map());
            const assessmentMap = studentMarksMap.get(mark.studentId)!;
            assessmentMap.set(mark.assessmentId, new Map(mark.scores.map(s => [s.q, s.marks])));
        });
            
        // CO questions map: CO ID -> [List of Questions]
        const coQuestionMap = new Map<string, { q: string; maxMarks: number; assessmentId: string }[]>();
        cosForCourse.forEach(co => coQuestionMap.set(co.id, []));
        assessmentsForCourse.forEach(a => a.questions.forEach(q => q.coIds.forEach(coId => coQuestionMap.get(coId)?.push({ ...q, assessmentId: a.id }))));
        
        // --- Step 2b: For each CO in this course, calculate its attainment level. ---
        cosForCourse.forEach(co => {
            const questionsForCo = coQuestionMap.get(co.id) || [];
            if (questionsForCo.length === 0) { coAttainmentLevelMap.set(co.id, 0); return; }
            
            let studentsMeetingTarget = 0;
            // Loop through every student.
            studentsInCourseAndBatch.forEach(student => {
                let totalMaxCoMarks = 0;
                let totalObtainedCoMarks = 0;
                const studentAllMarks = studentMarksMap.get(student.id);

                questionsForCo.forEach(q => {
                    const studentMark = studentAllMarks?.get(q.assessmentId)?.get(q.q);
                    
                    // A question is considered attempted if the mark is not undefined or null.
                    // A score of 0 is an attempt.
                    if (studentMark !== undefined && studentMark !== null) {
                        totalObtainedCoMarks += studentMark;
                        totalMaxCoMarks += q.maxMarks;
                    }
                });
                
                // If the student's percentage score for this CO meets the course target, count them.
                if (totalMaxCoMarks > 0 && (totalObtainedCoMarks / totalMaxCoMarks) * 100 >= course.target) {
                    studentsMeetingTarget++;
                }
            });

            // Calculate the percentage of students who met the target.
            const percentageMeetingTarget = totalStudents > 0 ? (studentsMeetingTarget / totalStudents) * 100 : 0;
            
            // Convert that percentage into a final attainment level (0-3) for this CO.
            let attainmentLevel = 0;
            if (percentageMeetingTarget >= course.attainmentLevels.level3) attainmentLevel = 3;
            else if (percentageMeetingTarget >= course.attainmentLevels.level2) attainmentLevel = 2;
            else if (percentageMeetingTarget >= course.attainmentLevels.level1) attainmentLevel = 1;
            
            // Store the result in our map.
            coAttainmentLevelMap.set(co.id, attainmentLevel);
        });
    });

    // --- Step 3: Loop through each PO and calculate its final Direct Attainment. ---
    const poAttainments: { [poId: string]: number } = {};
    programOutcomes.forEach(po => {
        // Find all the COs that are mapped to this PO.
        const relevantMappings = coPoMapping.filter(m => m.poId === po.id && coAttainmentLevelMap.has(m.coId));
        
        let weightedSum = 0; // Sum of (CO Attainment Level * Mapping Strength)
        let totalWeight = 0; // Sum of (Mapping Strength)

        relevantMappings.forEach(mapping => {
            const coLevel = coAttainmentLevelMap.get(mapping.coId);
            if (coLevel !== undefined) {
                weightedSum += coLevel * mapping.level;
                totalWeight += mapping.level;
            }
        });

        // The direct attainment is the weighted average.
        poAttainments[po.id] = totalWeight > 0 ? parseFloat((weightedSum / totalWeight).toFixed(2)) : 0;
    });

    return poAttainments;
  }, [selectedProgram, selectedBatch, data, programOutcomes]);
  

  // This runs when a user types in an "Indirect" attainment input field.
  const handleIndirectChange = (poId: string, value: string) => {
    // It updates the `draftState` in the parent component.
    onStateChange({
        ...draftState,
        indirectAttainment: {
            ...indirectAttainment,
            [poId]: value
        }
    });
  };
  
  // This runs when a user changes the "Weightage" inputs.
  const handleWeightChange = (type: 'direct' | 'indirect', value: string) => {
    const numValue = parseInt(value, 10);
    if (isNaN(numValue) || numValue < 0 || numValue > 100) {
        return; 
    }

    if (type === 'direct') {
        onStateChange({ ...draftState, weights: { direct: numValue, indirect: 100 - numValue } });
    } else { // type === 'indirect'
         onStateChange({ ...draftState, weights: { direct: 100 - numValue, indirect: numValue } });
    }
  };

  // This calculates the final "Overall Attainment" value for a single PO.
  const calculateOverall = (poId: string) => {
    const direct = directAttainment[poId] || 0;
    
    // If the user hasn't entered an indirect value, we default to 3.
    const indirectValue = indirectAttainment[poId];
    const indirect = (indirectValue === undefined || indirectValue.trim() === '') 
      ? 3 
      : parseFloat(indirectValue);

    if (isNaN(indirect)) {
        return 'Invalid';
    }

    // Apply the weights to get the final score.
    const directWeight = weights.direct / 100;
    const indirectWeight = weights.indirect / 100;
    
    return (direct * directWeight + indirect * indirectWeight).toFixed(2);
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">PO Attainment Dashboard</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse border border-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th className="border border-gray-300 p-2 text-sm font-medium text-gray-500 uppercase">Attainment Type</th>
              <th className="border border-gray-300 p-2 text-sm font-medium text-gray-500 uppercase">Weightage</th>
              {programOutcomes.map(po => (
                <th key={po.id} className="border border-gray-300 p-2 text-sm font-medium text-gray-500 uppercase">{po.number}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="bg-white">
              <td className="border border-gray-300 p-2 font-semibold text-gray-700">Direct</td>
              <td className="border border-gray-300 p-1">
                <div className="flex items-center">
                    <input type="number" value={weights.direct} onChange={e => handleWeightChange('direct', e.target.value)} className="w-24 p-2 bg-white text-gray-900 border border-gray-300 rounded-md text-center focus:ring-indigo-500 focus:border-indigo-500" />
                    <span className="ml-1 text-gray-700">%</span>
                </div>
              </td>
              {programOutcomes.map(po => (
                <td key={po.id} className="border border-gray-300 p-2 text-center font-semibold text-green-600">{directAttainment[po.id] ?? 'N/A'}</td>
              ))}
            </tr>
            <tr className="bg-white">
              <td className="border border-gray-300 p-2 font-semibold text-gray-700">Indirect</td>
               <td className="border border-gray-300 p-1">
                 <div className="flex items-center">
                    <input type="number" value={weights.indirect} onChange={e => handleWeightChange('indirect', e.target.value)} className="w-24 p-2 bg-white text-gray-900 border border-gray-300 rounded-md text-center focus:ring-indigo-500 focus:border-indigo-500" />
                    <span className="ml-1 text-gray-700">%</span>
                </div>
              </td>
              {programOutcomes.map(po => (
                <td key={po.id} className="border border-gray-300 p-1">
                  <input
                    type="number"
                    step="0.1"
                    className="w-24 p-2 bg-white text-gray-900 border border-gray-300 rounded-md text-center focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="3"
                    value={indirectAttainment[po.id] ?? ''}
                    onChange={(e) => handleIndirectChange(po.id, e.target.value)}
                  />
                </td>
              ))}
            </tr>
            <tr className="bg-gray-100 font-bold">
              <td className="border border-gray-300 p-2 text-gray-800">Overall Attainment</td>
              <td className="border border-gray-300 p-2 text-center text-gray-800">100%</td>
              {programOutcomes.map(po => (
                <td key={po.id} className="border border-gray-300 p-2 text-center text-xl text-yellow-600">
                  {calculateOverall(po.id)}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default POAttainmentDashboard;