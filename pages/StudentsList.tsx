/**
 * @file StudentsList.tsx
 * @description
 * This file defines the `StudentsList` component, which is the main page for viewing and
 * managing students. It's a highly dynamic page that adapts to the user's role and selections.
 *
 * What it does:
 * 1.  **Displays Students**: Shows a table of students.
 * 2.  **Role-Based Filtering**: The list of students is heavily filtered based on the user's
 *     role and their selections in the sidebar.
 *     - An **Admin** sees students based on their College/Program/Batch selection.
 *     - A **Department Head** sees all students in their college, further filtered by sidebar selections.
 *     - A **Program Co-ordinator** or **Teacher** sees all students in their selected program.
 * 3.  **Search**: Provides a search bar to filter students by name or ID.
 * 4.  **Student Management (for PC/Admin/Dept)**:
 *     - Allows adding a new student manually via a form.
 *     - Allows bulk-uploading students from an Excel file.
 *     - Allows changing a student's status ('Active' or 'Inactive') via a dropdown.
 * 5.  **View Details**: Provides a "View Details" button for each student that opens a popup
 *     (`StudentDetailsModal`) showing a detailed performance report for that student.
 */

import React, { useState, useMemo } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { Student, StudentStatus } from '../types';
import ExcelUploader from '../components/ExcelUploader';
import StudentDetailsModal from '../components/StudentDetailsModal';
import ConfirmationModal from '../components/ConfirmationModal';

const StudentsList: React.FC = () => {
  // We ask our "magic backpack" (AppContext) for all the data and tools we need.
  const { selectedProgram, selectedBatch, data, setData, currentUser, selectedCollegeId } = useAppContext();
  
  // --- State Management for Forms and UI ---
  // Memory for the "Add Student" form fields.
  const [newStudentId, setNewStudentId] = useState('');
  const [newStudentName, setNewStudentName] = useState('');
  // Memory for what the user has typed into the search bar.
  const [searchTerm, setSearchTerm] = useState('');
  // Memory to keep track of which student's details are being viewed in the popup.
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  // Memory for the "Are you sure?" confirmation popup.
  const [confirmation, setConfirmation] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
    } | null>(null);

  // Simple booleans to check the user's role.
  const isAdmin = currentUser?.role === 'Admin';
  const isProgramCoordinator = currentUser?.role === 'Program Co-ordinator';
  const isDepartmentHead = currentUser?.role === 'Department';
  // A user can manage students if they are a PC, Admin, or Department Head.
  const canManage = isProgramCoordinator || isAdmin || isDepartmentHead;

  /**
   * `useMemo` is a performance optimization, like a smart calculator. This one is very
   * complex and figures out which students to show based on many different factors.
   * It only recalculates when one of its inputs (the values in `[]`) changes.
   */
  const { filteredStudents, pageTitle, subTitle } = useMemo(() => {
    let students: Student[];
        
    // --- Step 1: Get the initial list of students based on role and sidebar selections. ---
    if (isAdmin) {
        students = data.students; // An Admin starts with all students.
        if (selectedProgram) { // If they selected a program...
            students = students.filter(s => s.programId === selectedProgram.id);
            if (selectedBatch) { // ...and also a batch...
                // ...find the sections for that batch and only show students in those sections.
                const batch = data.batches.find(b => b.programId === selectedProgram.id && b.name === selectedBatch);
                if (batch) {
                    const sectionsForBatch = data.sections.filter(s => s.batchId === batch.id);
                    const sectionIdsForBatch = new Set(sectionsForBatch.map(s => s.id));
                    students = students.filter(s => s.sectionId && sectionIdsForBatch.has(s.sectionId));
                } else {
                    students = []; // If the batch is invalid, show no one.
                }
            }
        } else if (selectedCollegeId) { // If they only selected a college...
            // ...find all programs in that college and show all students from those programs.
            const programIdsInCollege = new Set(data.programs.filter(p => p.collegeId === selectedCollegeId).map(p => p.id));
            students = students.filter(s => programIdsInCollege.has(s.programId));
        }
    } else if (isDepartmentHead && currentUser.collegeId) {
        // A Department Head starts with all students in their assigned college.
        const programIdsInCollege = new Set(data.programs.filter(p => p.collegeId === currentUser.collegeId).map(p => p.id));
        students = data.students.filter(s => programIdsInCollege.has(s.programId));

        // Then, we apply the sidebar filters if the user has selected them.
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
    else { // For Teachers or PCs...
        // ...they only see students from the program they have selected.
        students = data.students.filter(s => s.programId === selectedProgram?.id);
    }

    // --- Step 2: Apply the search term filter. ---
    if (searchTerm) {
      const lowercasedFilter = searchTerm.toLowerCase();
      students = students.filter(student =>
        student.name.toLowerCase().includes(lowercasedFilter) ||
        student.id.toLowerCase().includes(lowercasedFilter)
      );
    }
    
    // --- Step 3: Determine the page titles based on the context. ---
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
      
    // --- Step 4: Return the final, sorted list and titles. ---
    return {
      filteredStudents: students.sort((a, b) => a.name.localeCompare(b.name)),
      pageTitle: title,
      subTitle: subtitle
    }
  }, [data, selectedProgram, selectedBatch, currentUser, selectedCollegeId, searchTerm, isAdmin, isDepartmentHead]);
  
  // A check to see if the "Add Student" form should be visible.
  const canAddStudents = canManage && (isProgramCoordinator || (isAdmin && selectedProgram) || (isDepartmentHead && selectedProgram));

  // This function is called when a user changes a student's status dropdown.
  const handleStatusChange = (studentId: string, newStatus: StudentStatus) => {
    // It opens the "Are you sure?" popup first.
    setConfirmation({
        isOpen: true,
        title: "Confirm Status Change",
        message: "Are you sure you want to change this student's status?",
        onConfirm: () => {
            // Only if the user clicks "Confirm" do we actually update the data.
            setData(prev => ({
                ...prev,
                students: prev.students.map(s => s.id === studentId ? { ...s, status: newStatus } : s)
            }));
            setConfirmation(null); // Close the popup.
        },
    });
  };

  // This function runs when the "Add Student" form is submitted.
  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault(); // Stop the page from reloading.
    if (!newStudentId.trim() || !newStudentName.trim() || !selectedProgram) {
      alert("Please provide both a Student ID and Name, and ensure a program is selected.");
      return;
    }
    
    // Check for duplicate IDs.
    if (data.students.some(s => s.id.toLowerCase() === newStudentId.trim().toLowerCase())) {
        alert("A student with this ID already exists.");
        return;
    }
    // Create the new student object.
    const newStudent: Student = {
      id: newStudentId.trim(), name: newStudentName.trim(), programId: selectedProgram.id, status: 'Active'
    };
    // Add the new student to our main data in the magic backpack.
    setData(prev => ({ ...prev, students: [...prev.students, newStudent] }));
    // Clear the form fields.
    setNewStudentId(''); setNewStudentName('');
  };

  // This is called by the ExcelUploader when a file is parsed.
  const handleExcelUpload = (uploadedData: { id: string; name: string }[]) => {
    if (!selectedProgram) { alert("Please select a program before bulk uploading students."); return; }
    
    const existingStudentIds = new Set(data.students.map(s => s.id.toLowerCase()));
    // Convert the Excel rows into student objects, filtering out any duplicates.
    const newStudents: Student[] = uploadedData
      .filter(row => row.id && row.name && !existingStudentIds.has(String(row.id).toLowerCase()))
      .map(row => ({
        id: String(row.id), name: String(row.name), programId: selectedProgram.id, status: 'Active'
      }));
    // Add the new students to our main data.
    setData(prev => ({ ...prev, students: [...prev.students, ...newStudents] }));
    alert(`${newStudents.length} new students were added.`);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">{pageTitle}</h1>
      <p className="text-gray-500">{subTitle}</p>
      
      {/* The "Add Students" section is only shown if the user has permission. */}
      {canAddStudents && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-700">Add Students</h2>
              <ExcelUploader<{ id: string; name: string }>
                onFileUpload={handleExcelUpload}
                label="Upload Excel"
                format="columns: id, name"
              />
          </div>
          <form onSubmit={handleAddStudent} className="flex flex-wrap gap-4 items-end">
              <div className="flex-grow">
                  <label className="block text-sm font-medium text-gray-700">Student ID</label>
                  <input type="text" value={newStudentId} onChange={e => setNewStudentId(e.target.value)} className="mt-1 w-full p-2 border border-gray-300 rounded-md bg-white text-gray-900" required />
              </div>
               <div className="flex-grow-[2]">
                  <label className="block text-sm font-medium text-gray-700">Student Name</label>
                  <input type="text" value={newStudentName} onChange={e => setNewStudentName(e.target.value)} className="mt-1 w-full p-2 border border-gray-300 rounded-md bg-white text-gray-900" required />
              </div>
              <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg">Add Student</button>
          </form>
        </div>
      )}

      {/* The main table of students. */}
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredStudents.map((student) => (
              <tr key={student.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{student.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {canManage ? (
                      <select
                        value={student.status}
                        onChange={(e) => handleStatusChange(student.id, e.target.value as StudentStatus)}
                        className={`p-1 border rounded-md bg-white text-gray-900 focus:ring-indigo-500 focus:border-indigo-500 ${student.status === 'Active' ? 'border-green-300' : 'border-red-300'}`}
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    ) : (
                       <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${student.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>\n                          {student.status}
                      </span>
                    )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {/* When this button is clicked, it sets the `selectedStudent`, which opens the details modal. */}
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

      {/* The `StudentDetailsModal` is only rendered if `selectedStudent` is not null. */}
      {selectedStudent && (
        <StudentDetailsModal student={selectedStudent} onClose={() => setSelectedStudent(null)} />
      )}
      
      {/* The `ConfirmationModal` is only rendered if `confirmation` is not null. */}
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