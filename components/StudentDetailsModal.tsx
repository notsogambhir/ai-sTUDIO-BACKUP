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

import React, { useMemo, useState, useEffect } from 'react';
import { Student } from '../types';
import { useAppContext } from '../hooks/useAppContext';
import Modal from './Modal';
import apiClient from '../api';

// This defines the "props" or properties that this component accepts.
interface StudentDetailsModalProps {
  student: Student; // The student whose details we want to show.
  onClose: () => void; // A function to close the modal.
}

const StudentDetailsModal: React.FC<StudentDetailsModalProps> = ({ student, onClose }) => {
  // We get all our application data from the "magic backpack".
  const [studentCourseData, setStudentCourseData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get(`/attainment/student/${student.id}/`);
        setStudentCourseData(response.data.co_attainment);
      } catch (error) {
        console.error('Failed to fetch student attainment data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [student.id]);

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
        {loading ? (
            <p className="text-center text-gray-500">Loading course performance...</p>
        ) : (
            Object.entries(studentCourseData).map(([courseId, courseData]) => (
                <div key={courseId} className="bg-gray-50/50 p-4 rounded-lg border">
                    <div className="flex justify-between items-baseline">
                        <h4 className="font-semibold text-gray-800">{courseData.course.name} ({courseData.course.code})</h4>
                        <p className="text-sm font-bold">
                            Overall:
                            <span className={`ml-2 text-base ${courseData.overallAttainment >= courseData.course.target ? 'text-green-600' : 'text-red-600'}`}>
                                {courseData.overallAttainment.toFixed(1)}%
                            </span>
                        </p>
                    </div>

                    <div className="mt-2 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-x-4 gap-y-1 text-sm">
                        {courseData.coAttainments.map(att => (
                            <div key={att.co.id}>
                                <strong>{att.co.number}:</strong>
                                <span className={`ml-1 ${att.attainment >= courseData.course.target ? 'text-green-600' : 'text-red-600'}`}>
                                    {att.attainment.toFixed(1)}%
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            ))
        )}
         {studentCourseData.length === 0 && !loading && (
            <p className="text-gray-500 text-center py-4">This student is not enrolled in any courses.</p>
        )}
      </div>
    </Modal>
  );
};

export default StudentDetailsModal;
