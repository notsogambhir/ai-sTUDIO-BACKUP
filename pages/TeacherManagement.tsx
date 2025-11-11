/**
 * @file TeacherManagement.tsx
 * @description
 * This component is the main page for managing teachers. It's primarily used by
 * Program Co-ordinators and Department Heads.
 *
 * What it does:
 * 1.  **Displays Teachers**: It shows a table of teachers.
 * 2.  **Role-Based Filtering**: The list of teachers is filtered based on the user's role:
 *     - A **Program Co-ordinator** sees only the teachers that are assigned to them.
 *     - A **Department Head** sees all teachers who belong to any of the Program Co-ordinators
 *       within their department.
 * 3.  **Search**: Provides a search bar to filter teachers by name or employee ID.
 * 4.  **Status Management**: Allows authorized users to change a teacher's status ('Active' or 'Inactive').
 * 5.  **Navigation**: Provides a "View Dashboard" link for each teacher, which navigates
 *     to the `TeacherDetails` page for that specific teacher.
 */

import React, { useMemo, useState } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { Link } from 'react-router-dom';
import ConfirmationModal from '../components/ConfirmationModal';
import { User } from '../types';

const TeacherManagement: React.FC = () => {
    // We get our app's data, tools, and the current user from the "magic backpack".
    const { data, setData, currentUser } = useAppContext();
    // A piece of memory for what the user has typed in the search bar.
    const [searchTerm, setSearchTerm] = useState('');
    // A piece of memory for the "Are you sure?" confirmation popup.
    const [confirmation, setConfirmation] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
    } | null>(null);

    /**
     * `useMemo` is a performance helper. It calculates the list of teachers to display
     * and only recalculates it if the data, user, or search term changes.
     */
    const managedTeachers = useMemo(() => {
        if (!currentUser) return [];

        let teachers: User[] = [];

        // --- Role-Based Filtering Logic ---
        if (currentUser.role === 'Program Co-ordinator') {
            // A PC sees teachers whose `programCoordinatorIds` array includes the PC's own ID.
            teachers = data.users.filter(u => u.role === 'Teacher' && u.programCoordinatorIds?.includes(currentUser.id));
        } else if (currentUser.role === 'Department') {
            // A Department Head first finds all the PCs that belong to them.
            const pcsInDepartment = data.users.filter(u => u.role === 'Program Co-ordinator' && u.departmentId === currentUser.id);
            const pcIds = new Set(pcsInDepartment.map(pc => pc.id));
            // Then, they find all teachers who are managed by any of those PCs.
            teachers = data.users.filter(u => u.role === 'Teacher' && (u.programCoordinatorIds || []).some(id => pcIds.has(id)));
        }

        // --- Search Filter ---
        if (searchTerm) {
            const lowercasedFilter = searchTerm.toLowerCase();
            teachers = teachers.filter(teacher =>
                teacher.name.toLowerCase().includes(lowercasedFilter) ||
                teacher.employeeId.toLowerCase().includes(lowercasedFilter)
            );
        }
        
        return teachers;
    }, [data.users, currentUser, searchTerm]);

    // This function is called when a user changes a teacher's status in the dropdown.
    const handleStatusChange = (teacherId: string, status: 'Active' | 'Inactive') => {
        // It opens the confirmation popup first.
        setConfirmation({
            isOpen: true,
            title: "Confirm Status Change",
            message: "Are you sure you want to change this teacher's status?",
            onConfirm: () => {
                // Only if the user confirms do we update the main application data.
                setData(prev => ({
                    ...prev,
                    users: prev.users.map(u => u.id === teacherId ? { ...u, status } : u)
                }));
                setConfirmation(null); // Close the popup.
            }
        });
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800">Teacher Management</h1>
            <p className="text-gray-500">Manage teachers and course assignments for your program.</p>
            
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-4 border-b">
                  <input
                    type="text"
                    placeholder="Search by Teacher Name or Employee ID..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <table className="min-w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teacher Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {managedTeachers.length > 0 ? (
                            managedTeachers.map(teacher => (
                                <tr key={teacher.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {teacher.name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {teacher.employeeId}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <select
                                            value={teacher.status}
                                            onChange={(e) => handleStatusChange(teacher.id, e.target.value as 'Active' | 'Inactive')}
                                            className={`p-1 border rounded-md bg-white text-gray-900 focus:ring-indigo-500 focus:border-indigo-500 ${teacher.status === 'Active' ? 'border-green-300' : 'border-red-300'}`}
                                        >
                                            <option value="Active">Active</option>
                                            <option value="Inactive">Inactive</option>
                                        </select>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        {/* This `Link` component from React Router navigates to the teacher's detail page. */}
                                        <Link to={`/teachers/${teacher.id}`} className="text-indigo-600 hover:text-indigo-800 font-semibold">
                                            View Dashboard
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        ) : (
                             <tr>
                                <td colSpan={4} className="text-center py-8 text-gray-500">
                                    No teachers found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* The confirmation modal is only rendered if it has been activated. */}
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

export default TeacherManagement;