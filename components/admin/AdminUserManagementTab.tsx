/**
 * @file AdminUserManagementTab.tsx
 * @description
 * This component is the "User Management" tab within the `AdminPanel`. It's the main
 * interface for an Administrator to view, create, edit, and delete all user accounts
 * in the system.
 *
 * What it does:
 * 1.  **Displays All Users**: It shows a table with every user in the system.
 * 2.  **Search and Filter**: It provides a search bar to quickly find users by name, username,
 *     role, or employee ID.
 * 3.  **Displays Assignments**: For each user, it shows what they are assigned to (e.g., a PC's
 *     program, a Department Head's college), making it easy to see the hierarchy at a glance.
 * 4.  **Triggers User Editing**: It has "Add New User" and "Edit" buttons. When clicked,
 *     these buttons don't show a form directly. Instead, they open the `UserEditModal`
 *     component, which contains the actual form for creating or editing a user. This keeps
 *     this component's code focused on just displaying the list.
 * 5.  **Handles Deletion**: It provides a "Delete" button for each user, which uses a
 *     confirmation modal to prevent accidental deletion.
 */

import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { User } from '../../types';
import UserEditModal from './UserEditModal';
import { Edit, Trash2 } from '../Icons';
import ConfirmationModal from '../ConfirmationModal';

const AdminUserManagementTab: React.FC = () => {
  // Get all data and tools from the "magic backpack".
  const { data, setData } = useAppContext();
  
  // --- State Management ---
  // `isModalOpen` remembers if the Add/Edit User popup is visible.
  const [isModalOpen, setIsModalOpen] = useState(false);
  // `editingUser` remembers which user is being edited (or is `null` if we're adding a new one).
  const [editingUser, setEditingUser] = useState<User | null>(null);
  // `searchTerm` remembers what the user has typed in the search bar.
  const [searchTerm, setSearchTerm] = useState('');
  // State for the "Are you sure?" confirmation popup.
  const [confirmation, setConfirmation] = useState<{ isOpen: boolean, title: string, message: string, onConfirm: () => void } | null>(null);

  // `useMemo` is a smart calculator that filters the user list based on the search term.
  const filteredUsers = useMemo(() => {
    if (!searchTerm) return data.users;
    const lowercasedTerm = searchTerm.toLowerCase();
    return data.users.filter(u =>
      u.name.toLowerCase().includes(lowercasedTerm) ||
      u.username.toLowerCase().includes(lowercasedTerm) ||
      u.role.toLowerCase().includes(lowercasedTerm) ||
      u.employeeId.toLowerCase().includes(lowercasedTerm)
    );
  }, [data.users, searchTerm]);

  // This runs when the "Add New User" button is clicked.
  const handleAddNew = () => {
    setEditingUser(null); // Set to null to tell the modal we're in "create" mode.
    setIsModalOpen(true); // Open the modal.
  };

  // This runs when an "Edit" button is clicked.
  const handleEdit = (user: User) => {
    setEditingUser(user); // Pass the user's data to the modal.
    setIsModalOpen(true);
  };

  // This runs when a "Delete" button is clicked.
  const handleDelete = (userId: string) => {
    // It opens the confirmation popup first.
    setConfirmation({
        isOpen: true, title: "Delete User", message: "Are you sure? This cannot be undone.",
        onConfirm: () => {
            // The actual deletion only happens if the user confirms.
            setData(prev => ({ ...prev, users: prev.users.filter(u => u.id !== userId) }));
            setConfirmation(null);
        }
    });
  };

  /**
   * A helper function to get a user-friendly string describing what a user is assigned to.
   */
  const getAssignmentInfo = (user: User): string => {
      switch (user.role) {
          case 'Department':
              // For a Department Head, find and display the full name of their assigned college.
              return data.colleges.find(c => c.id === user.collegeId)?.name || 'N/A';
          case 'Program Co-ordinator':
              // For a PC, find and display the name of the Department Head they report to.
              const deptHead = data.users.find(u => u.id === user.departmentId);
              return deptHead ? `Dept: ${deptHead.name}` : 'N/A';
          case 'Teacher':
              // For a teacher, find the names of all the PCs they report to.
              const pcNames = user.programCoordinatorIds?.map(pcId => data.users.find(u => u.id === pcId)?.name).filter(Boolean).join(', ');
              return pcNames || 'N/A';
          default: 
              return 'N/A';
      }
  };


  return (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
            <input type="text" placeholder="Search by name, username, role, or ID..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full max-w-sm p-2 border border-gray-300 rounded-md"/>
            <button onClick={handleAddNew} className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">Add New User</button>
        </div>

        <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assignment</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {filteredUsers.map(user => (
                        <tr key={user.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                <div className="text-sm text-gray-500">{user.employeeId}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.username}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.role}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {getAssignmentInfo(user)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button onClick={() => handleEdit(user)} className="text-indigo-600 hover:text-indigo-900 p-1"><Edit className="w-5 h-5"/></button>
                                <button onClick={() => handleDelete(user.id)} className="text-red-600 hover:text-red-900 ml-4 p-1"><Trash2 className="w-5 h-5"/></button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>

        {/* The UserEditModal is only rendered if `isModalOpen` is true. */}
        {isModalOpen && (
            <UserEditModal userToEdit={editingUser} onClose={() => setIsModalOpen(false)} />
        )}
        {/* The ConfirmationModal is only rendered if `confirmation` is not null. */}
        {confirmation?.isOpen && (
            <ConfirmationModal isOpen={confirmation.isOpen} title={confirmation.title} message={confirmation.message} onConfirm={confirmation.onConfirm} onClose={() => setConfirmation(null)}/>
        )}
    </div>
  );
};

export default AdminUserManagementTab;