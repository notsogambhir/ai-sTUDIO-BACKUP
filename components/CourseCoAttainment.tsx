/**
 * @file CourseCoAttainment.tsx
 * @description
 * This component is the "CO Attainments" tab within the `CourseDetail` page. It's a
 * powerful reporting tool that performs a complex calculation to determine the final
 * attainment level for each of the course's Course Outcomes (COs).
 *
 * What it does:
 * 1.  **Calculates Attainment**: For each CO, it calculates the percentage of students who
 *     met the course's target score for that specific CO.
 * 2.  **Determines Attainment Level**: Based on that percentage, it compares it against the
 *     course's attainment thresholds (Level 1, 2, 3) to assign a final attainment level (0, 1, 2, or 3).
 * 3.  **Displays Results**: It shows a table with each CO, the percentage of students
 *     who met the target, and the final calculated attainment level.
 * 4.  **Scope Filtering**: For PCs and Admins, it provides a dropdown to view the attainment
 *     for the "Overall Course" or for a specific class section. For Teachers, it automatically
 *     scopes the data to only the sections they teach.
 *
 * The calculation is one of the most complex in the app, as it involves data from
 * students, enrollments, assessments, marks, and course outcomes all at once.
 */

import React, { useMemo, useState } from 'react';
import { Course } from '../types';
import { useAppContext } from '../hooks/useAppContext';

// This defines the "props" or properties that this component accepts.
interface CourseCoAttainmentProps {
  course: Course;
}

const CourseCoAttainment: React.FC<CourseCoAttainmentProps> = ({ course }) => {
  // We ask our "magic backpack" (AppContext) for the data and current user.
  const { data, currentUser } = useAppContext();
  const isPCorAdmin = currentUser?.role === 'Program Co-ordinator' || currentUser?.role === 'Admin';
  
  // A piece of memory to remember which scope (overall or a specific section) is selected.
  const [selectedScope, setSelectedScope] = useState<'overall' | string>('overall');

  // `useMemo` is a smart calculator that only re-calculates the sections for this course
  // when the course or enrollment data changes.
  const courseSections = useMemo(() => {
    const enrolledSectionIds = new Set(data.enrollments.filter(e => e.courseId === course.id && e.sectionId).map(e => e.sectionId!));
    return data.sections.filter(s => enrolledSectionIds.has(s.id)).sort((a,b) => a.name.localeCompare(b.name));
  }, [data.enrollments, data.sections, course.id]);

  /**
   * This is the main calculation logic for the entire component, wrapped in `useMemo` for performance.
   * It will only re-run if the data, course, user, or selected scope changes.
   */
  const coAttainmentData = useMemo(() => {
    const courseOutcomes = data.courseOutcomes.filter(co => co.courseId === course.id).sort((a,b) => a.number.localeCompare(b.number));
    
    // --- Step 1: Determine which students to include in the calculation based on the selected scope. ---
    let relevantStudentIds: Set<string>;

    if (isPCorAdmin) {
        if (selectedScope === 'overall') {
            // For "Overall Course", include all students enrolled in the course.
            relevantStudentIds = new Set(data.enrollments.filter(e => e.courseId === course.id).map(e => e.studentId));
        } else {
            // If a specific section is selected, only include students from that section.
            relevantStudentIds = new Set(data.enrollments.filter(e => e.courseId === course.id && e.sectionId === selectedScope).map(e => e.studentId));
        }
    } else { // This is the logic for a Teacher.
        const teacherId = currentUser!.id;
        const teacherSectionIds = new Set<string>(); // The sections this teacher is responsible for.

        const allCourseSectionIds = new Set(courseSections.map(s => s.id));
        
        // FIX: Explicitly type `sectionId` as string to resolve TS inference issue.
        allCourseSectionIds.forEach((sectionId: string) => {
            const sectionTeacher = course.sectionTeacherIds?.[sectionId];
            if (sectionTeacher && sectionTeacher === teacherId) {
                // If the teacher is explicitly assigned to this section, add it.
                teacherSectionIds.add(sectionId);
            } else if (!sectionTeacher && course.teacherId === teacherId) {
                // If there's no specific teacher for the section, but this teacher is the course default, add it.
                teacherSectionIds.add(sectionId);
            }
        });
        
        // A teacher's relevant students are those in the sections they are responsible for.
        relevantStudentIds = new Set(data.enrollments.filter(e => e.courseId === course.id && e.sectionId && teacherSectionIds.has(e.sectionId)).map(e => e.studentId));
    }

    // Get the full student objects for the relevant IDs, but only if they are 'Active'.
    const studentsInScope = data.students.filter(s => relevantStudentIds.has(s.id) && s.status === 'Active');
    const totalStudents = studentsInScope.length;

    // If there are no students or no COs, we can't do any calculations.
    if (totalStudents === 0 || courseOutcomes.length === 0) {
        return { results: [], studentCount: 0 };
    }
    
    // --- Step 2: Pre-calculate maps for faster data lookups inside the loop. ---
    // This is a big performance win. Instead of searching through arrays over and over,
    // we build "maps" (like dictionaries) that give us instant access to the data we need.

    // Find all assessments for this course by looking at all sections students are enrolled in.
    const sectionIdsForCourse = new Set(data.enrollments.filter(e => e.courseId === course.id && e.sectionId).map(e => e.sectionId!));
    const assessmentsForCourse = data.assessments.filter(a => sectionIdsForCourse.has(a.sectionId));

    // Create a map of student marks: Student ID -> Assessment ID -> Question Name -> Marks
    const studentMarksMap = new Map<string, Map<string, Map<string, number>>>();
    data.marks.filter(m => relevantStudentIds.has(m.studentId)).forEach(mark => {
        if (!studentMarksMap.has(mark.studentId)) studentMarksMap.set(mark.studentId, new Map());
        const assessmentMap = studentMarksMap.get(mark.studentId)!;
        const scoreMap = new Map<string, number>();
        mark.scores.forEach(s => scoreMap.set(s.q, s.marks));
        assessmentMap.set(mark.assessmentId, scoreMap);
    });
        
    // Create a map of which questions belong to which CO: CO ID -> [List of Questions]
    const coQuestionMap = new Map<string, { q: string; maxMarks: number; assessmentId: string }[]>();
    courseOutcomes.forEach(co => coQuestionMap.set(co.id, []));
    assessmentsForCourse.forEach(assessment => {
        assessment.questions.forEach(q => q.coIds.forEach(coId => coQuestionMap.get(coId)?.push({ q: q.q, maxMarks: q.maxMarks, assessmentId: assessment.id })));
    });

    // --- Step 3: Loop through each CO and calculate its attainment. ---
    const results = courseOutcomes.map(co => {
        const questionsForCo = coQuestionMap.get(co.id) || [];
        
        if (questionsForCo.length === 0) return { co, percentageMeetingTarget: 0, attainmentLevel: 0 };
        
        let studentsMeetingTarget = 0;
        // Loop through every student in our scope.
        studentsInScope.forEach(student => {
            let totalMaxCoMarks = 0;
            let totalObtainedCoMarks = 0;
            const studentAssessmentMarks = studentMarksMap.get(student.id);

            questionsForCo.forEach(q => {
                const mark = studentAssessmentMarks?.get(q.assessmentId)?.get(q.q);
                // A question is considered attempted if the mark is not undefined or null.
                if (mark !== undefined && mark !== null) { 
                    totalObtainedCoMarks += mark;
                    totalMaxCoMarks += q.maxMarks;
                }
            });
            
            // Calculate the student's percentage score for this specific CO.
            const studentCoPercentage = totalMaxCoMarks > 0 ? (totalObtainedCoMarks / totalMaxCoMarks) * 100 : 0;
            // If their score meets the course's target, increment our counter.
            if (studentCoPercentage >= course.target) {
                studentsMeetingTarget++;
            }
        });

        // Calculate the final percentage of students who met the target.
        const percentageMeetingTarget = (studentsMeetingTarget / totalStudents) * 100;
        
        // --- Step 4: Convert the percentage into a final Attainment Level (0-3). ---
        let attainmentLevel = 0;
        if (percentageMeetingTarget >= course.attainmentLevels.level3) attainmentLevel = 3;
        else if (percentageMeetingTarget >= course.attainmentLevels.level2) attainmentLevel = 2;
        else if (percentageMeetingTarget >= course.attainmentLevels.level1) attainmentLevel = 1;

        return { co, percentageMeetingTarget, attainmentLevel };
    });

    return { results, studentCount: totalStudents };

  }, [data, course, currentUser, isPCorAdmin, selectedScope, courseSections]);

  // A helper object to map attainment levels to pretty colors.
  const attainmentLevelColors: { [key: number]: string } = {
      3: 'bg-green-100 text-green-800', 2: 'bg-blue-100 text-blue-800',
      1: 'bg-yellow-100 text-yellow-800', 0: 'bg-red-100 text-red-800',
  };

  // The JSX that describes what this component looks like.
  return (
      <div className="space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-semibold text-gray-700">Course Outcome Attainment Summary</h2>
              <p className="text-sm text-gray-500">Based on {coAttainmentData.studentCount} active students in the selected scope.</p>
            </div>
            {/* The scope selection dropdown is only shown to PCs/Admins if there are sections. */}
            {isPCorAdmin && courseSections.length > 0 && (
                <div>
                    <label htmlFor="section-scope-select" className="block text-sm font-medium text-gray-700">View Attainment For:</label>
                    <select id="section-scope-select" value={selectedScope} onChange={e => setSelectedScope(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-white text-gray-900 border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                        <option value="overall">Overall Course</option>
                        {courseSections.map(section => (
                            <option key={section.id} value={section.id}>Section {section.name}</option>
                        ))}
                    </select>
                </div>
            )}
          </div>
          {/* A handy info box explaining the thresholds used in the calculation. */}
          <div className="bg-gray-50 p-4 rounded-lg border text-sm text-gray-600">
              <h3 className="font-semibold mb-2">Thresholds for this Course:</h3>
              <ul className="list-disc list-inside">
                  <li><span className="font-bold">CO Target:</span> {course.target}% (Individual student must score this percentage on a CO)</li>
                  <li><span className="font-bold">Level 3:</span> At least {course.attainmentLevels.level3}% of students meet the CO target.</li>
                  <li><span className="font-bold">Level 2:</span> At least {course.attainmentLevels.level2}% of students meet the CO target.</li>
                  <li><span className="font-bold">Level 1:</span> At least {course.attainmentLevels.level1}% of students meet the CO target.</li>
              </ul>
          </div>
          {/* The main results table. */}
          <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                      <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CO</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">% Students Above Target</th>
                          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Attainment Level</th>
                      </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                      {coAttainmentData.results.map(({ co, percentageMeetingTarget, attainmentLevel }) => (
                          <tr key={co.id}>
                              <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{co.number}</td>
                              <td className="px-6 py-4 whitespace-normal text-sm text-gray-600">{co.description}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-semibold">
                                 <span className={percentageMeetingTarget >= course.attainmentLevels.level1 ? 'text-green-600' : 'text-red-600'}>
                                     {percentageMeetingTarget.toFixed(2)}%
                                 </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-bold">
                                 <span className={`px-4 py-1 rounded-full text-lg ${attainmentLevelColors[attainmentLevel]}`}>
                                     {attainmentLevel}
                                 </span>
                              </td>
                          </tr>
                      ))}
                      {coAttainmentData.results.length === 0 && (
                          <tr>
                              <td colSpan={4} className="text-center py-8 text-gray-500">
                                  No COs or student data available to calculate attainment.
                              </td>
                          </tr>
                      )}
                  </tbody>
              </table>
          </div>
      </div>
  );
};

export default CourseCoAttainment;