/**
 * @file UserEditModal.tsx
 * @description
 * This component is a popup modal for creating or editing a user.
 */

import React, { useState } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { User, Role, College } from '../../types';
import Modal from '../Modal';
import apiClient from '../../api';

interface UserEditModalProps {
  userToEdit: User | null;
  onClose: () => void;
}

const UserEditModal: React.FC<UserEditModalProps> = ({ userToEdit, onClose }) => {
    const { data, fetchAppData } = useAppContext();
    
    const [user, setUser] = useState<Partial<User>>({
        id: userToEdit?.id || undefined,
        employeeId: userToEdit?.employeeId || '', 
        name: userToEdit?.name || '',
        username: userToEdit?.username || '', 
        password: '',
        role: userToEdit?.role || 'Teacher',
        collegeId: userToEdit?.collegeId, 
        departmentId: userToEdit?.departmentId,
        programId: userToEdit?.programId, 
        programCoordinatorIds: userToEdit?.programCoordinatorIds || [],
        status: userToEdit?.status || 'Active'
    });

    const roles: Role[] = ['Teacher', 'Program Co-ordinator', 'Department', 'University', 'Admin'];

    const handleInputChange = (field: keyof User, value: any) => {
        const newUserState = { ...user, [field]: value };
        if (field === 'role') {
            newUserState.collegeId = undefined;
            newUserState.departmentId = undefined;
            newUserState.programId = undefined;
            newUserState.programCoordinatorIds = [];
        }
        setUser(newUserState);
    };
    
    const handleMultiSelectChange = (field: keyof User, selectedOptions: string[]) => {
         setUser(prev => ({...prev, [field]: selectedOptions}));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user.name || !user.username || !user.employeeId || (!userToEdit && !user.password)) {
            alert('Please fill all required fields, including password for new users.'); return;
        }

        try {
            if (userToEdit) {
                const { id, ...userData } = user;
                await apiClient.patch(`/users/${id}/`, userData);
            } else {
                await apiClient.post('/users/', user);
            }
            await fetchAppData();
            onClose();
        } catch (error) {
            console.error('Failed to save user:', error);
            alert('Failed to save user. Please try again.');
        }
    };
    
    const departmentHeads = data?.users.filter(u => u.role === 'Department') || [];
    const programCoordinators = data?.users.filter(u => u.role === 'Program Co-ordinator') || [];

    return (
        <Modal title={userToEdit ? 'Edit User' : 'Add New User'} onClose={onClose}>
            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="hidden" value={user.id} />
                    <div><label className="block text-sm font-medium text-gray-700\">Full Name</label><input type="text" value={user.name} onChange={e => handleInputChange('name', e.target.value)} className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-900 focus:outline-none focus:ring-indigo-500\" required /></div>
                    <div><label className="block text-sm font-medium text-gray-700\">Employee ID</label><input type="text" value={user.employeeId} onChange={e => handleInputChange('employeeId', e.target.value)} className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-900 focus:outline-none focus:ring-indigo-500\" required /></div>
                    <div><label className="block text-sm font-medium text-gray-700\">Username</label><input type="text" value={user.username} onChange={e => handleInputChange('username', e.target.value)} className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-900 focus:outline-none focus:ring-indigo-500\" required /></div>
                    <div><label className="block text-sm font-medium text-gray-700\">Password</label><input type="password" value={user.password} onChange={e => handleInputChange('password', e.target.value)} placeholder={userToEdit ? 'Leave blank to keep unchanged' : ''} className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-900 focus:outline-none focus:ring-indigo-500\" required={!userToEdit} /></div>
                    <div><label className="block text-sm font-medium text-gray-700\">Role</label><select value={user.role} onChange={e => handleInputChange('role', e.target.value as Role)} className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-900 focus:outline-none focus:ring-indigo-500\">{roles.map(r => <option key={r} value={r}>{r}</option>)}</select></div>
                    <div><label className="block text-sm font-medium text-gray-700\">Status</label><select value={user.status} onChange={e => handleInputChange('status', e.target.value as 'Active' | 'Inactive')} className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-900 focus:outline-none focus:ring-indigo-500\"><option value=\"Active\">Active</option><option value=\"Inactive\">Inactive</option></select></div>
                </div>

                {user.role === 'Department' && (
                     <div>
                        <label className="block text-sm font-medium text-gray-700\">Assigned College</label>
                        <select
                            value={user.collegeId || ''}
                            onChange={(e) => handleInputChange('collegeId', e.target.value as College)}
                            className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            <option value="">-- Unassigned --</option>
                            {data?.colleges.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                )}
                {user.role === 'Program Co-ordinator' && (
                     <div>
                        <label className="block text-sm font-medium text-gray-700\">Reports to (Department Head)</label>
                        <select
                            value={user.departmentId || ''}
                            onChange={(e) => handleInputChange('departmentId', e.target.value)}
                            className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            <option value="">-- Unassigned --</option>
                            {departmentHeads.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                        </select>
                    </div>
                )}
                 {user.role === 'Teacher' && (
                     <div>
                        <label className="block text-sm font-medium text-gray-700\">Reports to (Program Co-ordinator)</label>
                        <select
                            multiple
                            value={user.programCoordinatorIds || []}
                            onChange={(e) => handleMultiSelectChange('programCoordinatorIds', Array.from(e.target.selectedOptions, option => option.value))}
                            className="mt-1 block w-full h-24 bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        >
                           {programCoordinators.map(pc => <option key={pc.id} value={pc.id}>{pc.name}</option>)}
                        </select>
                        <p className="text-xs text-gray-500 mt-1\">Hold Ctrl or Cmd to select multiple.</p>
                    </div>
                )}

                <div className="flex justify-end pt-4 gap-3">
                    <button type="button" onClick={onClose} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg\">Cancel</button>
                    <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg\">{userToEdit ? 'Save Changes' : 'Create User'}</button>
                </div>
            </form>
        </Modal>
    );
};

export default UserEditModal;
