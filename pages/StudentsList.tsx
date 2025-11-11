/**
 * @file StudentsList.tsx
 * @description
 * This file defines the `StudentsList` component, which is the main page for viewing and
 * managing students.
 */

import React, { useState, useMemo } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { Student, StudentStatus } from '../types';
import ExcelUploader from '../components/ExcelUploader';
import StudentDetailsModal from '../components/StudentDetailsModal';
import ConfirmationModal from '../components/ConfirmationModal';
import apiClient from '../api';

const StudentsList: React.FC = () => {
  const { selectedProgram, selectedBatch, data, fetchAppData, currentUser, selectedCollegeId } = useAppContext();
  
  const [newStudentId, setNewStudentId] = useState('');
  const [newStudentName, setNewStudentName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [confirmation, setConfirmation] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
    } | null>(null);

  const isAdmin = currentUser?.role === 'Admin';
  const isProgramCoordinator = currentUser?.role === 'Program Co-ordinator';
  const isDepartmentHead = currentUser?.role === 'Department';
  const canManage = isProgramCoordinator || isAdmin || isDepartmentHead;

  const { filteredStudents, pageTitle, subTitle } = useMemo(() => {
    if (!data) return { filteredStudents: [], pageTitle: 'Student Management', subTitle: '' };

    let students: Student[];
        
    if (isAdmin) {
        students = data.students;
        if (selectedProgram) {
            students = students.filter(s => s.programId === selectedProgram.id);
            if (selectedBatch) {
                const batch = data.batches.find(b => b.programId === selectedProgram.id && b.name === selectedBatch);
                if (batch) {
                    const sectionsForBatch = data.sections.filter(s => s.batchId === batch.id);
                    const sectionIdsForBatch = new Set(sectionsForBatch.map(s => s.id));
                    students = students.filter(s => s.sectionId && sectionIdsForBatch.has(s.sectionId));
                } else {
                    students = [];
                }
            }
        } else if (selectedCollegeId) {
            const programIdsInCollege = new Set(data.programs.filter(p => p.collegeId === selectedCollegeId).map(p => p.id));
            students = students.filter(s => programIdsInCollege.has(s.programId));
        }
    } else if (isDepartmentHead && currentUser.collegeId) {
        const programIdsInCollege = new Set(data.programs.filter(p => p.collegeId === currentUser.collegeId).map(p => p.id));
        students = data.students.filter(s => programIdsInCollege.has(s.programId));

        if (selectedProgram) {
            students = students.filter(s => s.programId === selectedProgram.id);
            if (selectedBatch) {
                const batch = data.batches.find(b => b.programId === selectedProgram.id && b.name === selectedBatch);
                if (batch) {
                    const sectionsForBatch = data.sections.filter(s => s.batchId === batch.id);
                    const sectionIdsForBatch = new Set(sectionsForBatch.map(s => s.id));
                    students = students.filter(s => s.sectionId && sectionIdsForBatch.has(s.sectionId));
                } else {
                    students = [];
                }
            }
        }
    }
    else {
        students = data.students.filter(s => s.programId === selectedProgram?.id);
    }

    if (searchTerm) {
      const lowercasedFilter = searchTerm.toLowerCase();
      students = students.filter(student =>
        student.name.toLowerCase().includes(lowercasedFilter) ||
        student.id.toLowerCase().includes(lowercasedFilter)
      );
    }
    
    let title = 'Student Management';
    if (isAdmin) {
        title = selectedProgram
            ? `Students in ${selectedProgram.name}`
            : selectedCollegeId
                ? `Students in ${data.colleges.find(c => c.id === selectedCollegeId)?.name}`
                : 'All Students';
    } else if (isDepartmentHead) {
        title = selectedProgram
            ? `Students in ${selectedProgram.name}`
            : `Students in ${data.colleges.find(c => c.id === currentUser?.collegeId)?.name}`;
    }

    let subtitle = `Manage students for the ${selectedProgram?.name} program.`;
    if (isAdmin || isDepartmentHead) {
        subtitle = selectedBatch && selectedProgram
            ? `Displaying batch ${selectedBatch}`
            : 'Select a program and batch from the sidebar to filter students.';
    }
      
    return {
      filteredStudents: students.sort((a, b) => a.name.localeCompare(b.name)),
      pageTitle: title,
      subTitle: subtitle
    }
  }, [data, selectedProgram, selectedBatch, currentUser, selectedCollegeId, searchTerm, isAdmin, isDepartmentHead]);
  
  const canAddStudents = canManage && (isProgramCoordinator || (isAdmin && selectedProgram) || (isDepartmentHead && selectedProgram));

  const handleStatusChange = (studentId: string, newStatus: StudentStatus) => {
    setConfirmation({
        isOpen: true,
        title: "Confirm Status Change",
        message: "Are you sure you want to change this student's status?",
        onConfirm: async () => {
            try {
                await apiClient.patch(`/students/${studentId}/`, { status: newStatus });
                await fetchAppData();
                setConfirmation(null);
            } catch (error) {
                console.error('Failed to update student status:', error);
                alert('Failed to update status. Please try again.');
            }
        },
    });
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentId.trim() || !newStudentName.trim() || !selectedProgram) {
      alert("Please provide both a Student ID and Name, and ensure a program is selected.");
      return;
    }
    
    if (data?.students.some(s => s.id.toLowerCase() === newStudentId.trim().toLowerCase())) {
        alert("A student with this ID already exists.");
        return;
    }
    const newStudent: Omit<Student, 'id'> = {
      name: newStudentName.trim(), programId: selectedProgram.id, status: 'Active'
    };

    try {
        await apiClient.post('/students/', { ...newStudent, id: newStudentId.trim() });
        await fetchAppData();
        setNewStudentId('');
        setNewStudentName('');
    } catch (error) {
        console.error('Failed to add student:', error);
        alert('Failed to add student. Please try again.');
    }
  };

  const handleExcelUpload = async (uploadedData: { id: string; name: string }[]) => {
    if (!selectedProgram) { alert("Please select a program before bulk uploading students."); return; }
    
    const existingStudentIds = new Set(data?.students.map(s => s.id.toLowerCase()));
    const newStudents: Omit<Student, 'id'>[] = uploadedData
      .filter(row => row.id && row.name && !existingStudentIds.has(String(row.id).toLowerCase()))
      .map(row => ({
        name: String(row.name), programId: selectedProgram.id, status: 'Active'
      }));

    try {
        await Promise.all(newStudents.map(student => apiClient.post('/students/', student)));
        await fetchAppData();
        alert(`${newStudents.length} new students were added.`);
    } catch (error) {
        console.error('Failed to upload students:', error);
        alert('Failed to upload students. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800\">{pageTitle}</h1>
      <p className="text-gray-500\">{subTitle}</p>
      
      {canAddStudents && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-700\">Add Students</h2>
              <ExcelUploader
                onFileUpload={handleExcelUpload}
                label="Upload Excel"
                format="columns: id, name"
              />
          </div>
          <form onSubmit={handleAddStudent} className="flex flex-wrap gap-4 items-end">
              <div className="flex-grow">
                  <label className="block text-sm font-medium text-gray-700\">Student ID</label>
                  <input type="text" value={newStudentId} onChange={e => setNewStudentId(e.target.value)} className="mt-1 w-full p-2 border border-gray-300 rounded-md bg-white text-gray-900\" required />
              </div>
               <div className="flex-grow-[2]\">
                  <label className="block text-sm font-medium text-gray-700\">Student Name</label>
                  <input type="text" value={newStudentName} onChange={e => setNewStudentName(e.target.value)} className="mt-1 w-full p-2 border border-gray-300 rounded-md bg-white text-gray-900\" required />
              </div>
              <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg\">Add Student</button>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 border-b">
          <input
            type="text"
            placeholder="Search students by name or ID..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider\">Student ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider\">Student Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider\">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider\">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredStudents.map((student) => (
              <tr key={student.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900\">{student.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600\">{student.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600\">
                    {canManage ? (
                      <select
                        value={student.status}
                        onChange={(e) => handleStatusChange(student.id, e.target.value as StudentStatus)}
                        className={`p-1 border rounded-md bg-white text-gray-900 focus:ring-indigo-500 focus:border-indigo-500 ${student.status === 'Active' ? 'border-green-300' : 'border-red-300'}`}
                      >
                        <option value="Active\">Active</option>
                        <option value="Inactive\">Inactive</option>
                      </select>
                    ) : (
                       <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${student.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {student.status}
                      </span>
                    )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => setSelectedStudent(student)} className="text-indigo-600 hover:text-indigo-800">
                    View Details
                  </button>
                </td>
              </tr>
            ))}
            {filteredStudents.length === 0 && (
                 <tr>
                    <td colSpan={4} className="text-center py-8 text-gray-500">
                        No students found matching your criteria.
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedStudent && (
        <StudentDetailsModal student={selectedStudent} onClose={() => setSelectedStudent(null)} />
      )}
      
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

export default StudentsList;
