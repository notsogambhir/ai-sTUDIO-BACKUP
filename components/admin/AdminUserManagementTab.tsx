/**
 * @file AdminUserManagementTab.tsx
 * @description
 * This component is the "User Management" tab within the `AdminPanel`.
 */

import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { User } from '../../types';
import UserEditModal from './UserEditModal';
import { Edit, Trash2 } from '../Icons';
import ConfirmationModal from '../ConfirmationModal';
import apiClient from '../../api';

const AdminUserManagementTab: React.FC = () => {
  const { data, fetchAppData } = useAppContext();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmation, setConfirmation] = useState<{ isOpen: boolean, title: string, message: string, onConfirm: () => void } | null>(null);

  const filteredUsers = useMemo(() => {
    if (!data?.users) return [];
    if (!searchTerm) return data.users;
    const lowercasedTerm = searchTerm.toLowerCase();
    return data.users.filter(u =>
      u.name.toLowerCase().includes(lowercasedTerm) ||
      u.username.toLowerCase().includes(lowercasedTerm) ||
      u.role.toLowerCase().includes(lowercasedTerm) ||
      u.employeeId.toLowerCase().includes(lowercasedTerm)
    );
  }, [data?.users, searchTerm]);

  const handleAddNew = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleDelete = (userId: string) => {
    setConfirmation({
        isOpen: true, title: "Delete User", message: "Are you sure? This cannot be undone.",
        onConfirm: async () => {
            try {
                await apiClient.delete(`/users/${userId}/`);
                await fetchAppData();
                setConfirmation(null);
            } catch (error) {
                console.error('Failed to delete user:', error);
                alert('Failed to delete user. Please try again.');
            }
        }
    });
  };

  const getAssignmentInfo = (user: User): string => {
    if (!data) return 'N/A';
    switch (user.role) {
        case 'Department':
            return data.colleges.find(c => c.id === user.collegeId)?.name || 'N/A';
        case 'Program Co-ordinator':
            const program = data.programs.find(p => p.id === user.programId);
            return program?.name || 'N/A';
        case 'Teacher':
            const pcNames = user.programCoordinatorIds
                ?.map(pcId => data.users.find(u => u.id === pcId)?.name)
                .filter(Boolean)
                .join(', ');
            return pcNames || 'N/A';
        default:
            return 'N/A';
    }
};


  return (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
            <input type="text" placeholder="Search by name, username, role, or ID..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full max-w-sm p-2 border border-gray-300 rounded-md\"/>
            <button onClick={handleAddNew} className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700\">Add New User</button>
        </div>

        <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider\">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider\">Username</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider\">Role</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider\">Assignment</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider\">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {filteredUsers.map(user => (
                        <tr key={user.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900\">{user.name}</div>
                                <div className="text-sm text-gray-500\">{user.employeeId}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500\">{user.username}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500\">{user.role}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500\">
                                {getAssignmentInfo(user)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button onClick={() => handleEdit(user)} className="text-indigo-600 hover:text-indigo-900 p-1\"><Edit className="w-5 h-5\"/></button>
                                <button onClick={() => handleDelete(user.id)} className="text-red-600 hover:text-red-900 ml-4 p-1\"><Trash2 className="w-5 h-5\"/></button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>

        {isModalOpen && (
            <UserEditModal userToEdit={editingUser} onClose={() => setIsModalOpen(false)} />
        )}
        {confirmation?.isOpen && (
            <ConfirmationModal isOpen={confirmation.isOpen} title={confirmation.title} message={confirmation.message} onConfirm={confirmation.onConfirm} onClose={() => setConfirmation(null)}/>
        )}
    </div>
  );
};

export default AdminUserManagementTab;
