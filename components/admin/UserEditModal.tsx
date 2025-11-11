/**
 * @file UserEditModal.tsx
 * @description
 * This component is a popup window ("modal") that contains a form for either creating
 * a new user or editing an existing one. It's used by the `AdminUserManagementTab`.
 *
 * It's a highly dynamic form that changes its appearance based on the user's role.
 *
 * What it does:
 * 1.  **Dual Mode (Create/Edit)**: It checks if a `userToEdit` prop was passed to it.
 *     - If `userToEdit` exists, it pre-fills the form with that user's data for editing.
 *     - If `userToEdit` is `null`, it shows a blank form for creating a new user.
 * 2.  **Manages Form State**: It uses a single `user` object in its state to keep track
 *     of all the data being entered into the form fields.
 * 3.  **Conditional Fields**: It shows and hides certain form fields based on the selected
 *     "Role". For example, if the role is "Department", it shows a dropdown to assign them
 *     to a College. If the role is "Teacher", it shows a multi-select box to assign them
 *     to Program Co-ordinators.
 * 4.  **Handles Submission**: When the form is submitted, it performs validation and then
 *     updates the main application data in the "magic backpack" by either adding a new
 *     user or updating an existing one.
 */

import React, { useState } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { User, Role, College } from '../../types';
import Modal from '../Modal';

// This defines the "props" or properties that this component accepts.
interface UserEditModalProps {
  userToEdit: User | null; // The user to edit, or null if creating a new one.
  onClose: () => void; // A function to close the modal.
}

const UserEditModal: React.FC<UserEditModalProps> = ({ userToEdit, onClose }) => {
    // Get all data and tools from the "magic backpack".
    const { data, setData } = useAppContext();
    
    // --- State Management for the Form ---
    // We initialize our component's memory (`user` state) with the data from `userToEdit`
    // if it exists, or with default empty values if we're creating a new user.
    const [user, setUser] = useState<Partial<User>>({
        id: userToEdit?.id || `U_${Date.now()}`, // Use existing ID or create a new one.
        employeeId: userToEdit?.employeeId || '', 
        name: userToEdit?.name || '',
        username: userToEdit?.username || '', 
        password: '', // Password is always blank for security.
        role: userToEdit?.role || 'Teacher',
        collegeId: userToEdit?.collegeId, 
        departmentId: userToEdit?.departmentId,
        programId: userToEdit?.programId, 
        programCoordinatorIds: userToEdit?.programCoordinatorIds || [],
        status: userToEdit?.status || 'Active'
    });

    const roles: Role[] = ['Teacher', 'Program Co-ordinator', 'Department', 'University', 'Admin'];

    // A generic handler to update our `user` state when any input changes.
    const handleInputChange = (field: keyof User, value: any) => {
        const newUserState = { ...user, [field]: value };
        // When the role changes, we clear out all the role-specific assignment fields
        // to prevent inconsistent data.
        if (field === 'role') {
            newUserState.collegeId = undefined;
            newUserState.departmentId = undefined;
            newUserState.programId = undefined;
            newUserState.programCoordinatorIds = [];
        }
        setUser(newUserState);
    };
    
    // A specific handler for the multi-select dropdown used for assigning teachers.
    const handleMultiSelectChange = (field: keyof User, selectedOptions: string[]) => {
         setUser(prev => ({...prev, [field]: selectedOptions}));
    };

    // This runs when the form is submitted.
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Basic validation.
        if (!user.name || !user.username || !user.employeeId || (!userToEdit && !user.password)) {
            alert('Please fill all required fields, including password for new users.'); return;
        }

        setData(prev => {
            const userExists = prev.users.some(u => u.id === user.id);
            if (userExists) { // If the user already exists, we update them.
                return { 
                    ...prev, 
                    users: prev.users.map(u => 
                        u.id === user.id 
                        // We merge the old user data with the new, and only update the password if a new one was typed.
                        ? { ...u, ...user, password: user.password || u.password } as User
                        : u
                    ) 
                };
            } else { // Otherwise, we add them as a new user.
                return { ...prev, users: [...prev.users, user as User] };
            }
        });
        onClose(); // Close the modal.
    };
    
    // Get lists of Department Heads and PCs for the assignment dropdowns.
    const departmentHeads = data.users.filter(u => u.role === 'Department');
    const programCoordinators = data.users.filter(u => u.role === 'Program Co-ordinator');

    return (
        <Modal title={userToEdit ? 'Edit User' : 'Add New User'} onClose={onClose}>
            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="hidden" value={user.id} />
                    <div><label className="block text-sm font-medium text-gray-700">Full Name</label><input type="text" value={user.name} onChange={e => handleInputChange('name', e.target.value)} className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-900 focus:outline-none focus:ring-indigo-500" required /></div>
                    <div><label className="block text-sm font-medium text-gray-700">Employee ID</label><input type="text" value={user.employeeId} onChange={e => handleInputChange('employeeId', e.target.value)} className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-900 focus:outline-none focus:ring-indigo-500" required /></div>
                    <div><label className="block text-sm font-medium text-gray-700">Username</label><input type="text" value={user.username} onChange={e => handleInputChange('username', e.target.value)} className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-900 focus:outline-none focus:ring-indigo-500" required /></div>
                    <div><label className="block text-sm font-medium text-gray-700">Password</label><input type="password" value={user.password} onChange={e => handleInputChange('password', e.target.value)} placeholder={userToEdit ? 'Leave blank to keep unchanged' : ''} className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-900 focus:outline-none focus:ring-indigo-500" required={!userToEdit} /></div>
                    <div><label className="block text-sm font-medium text-gray-700">Role</label><select value={user.role} onChange={e => handleInputChange('role', e.target.value as Role)} className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-900 focus:outline-none focus:ring-indigo-500">{roles.map(r => <option key={r} value={r}>{r}</option>)}</select></div>
                    <div><label className="block text-sm font-medium text-gray-700">Status</label><select value={user.status} onChange={e => handleInputChange('status', e.target.value as 'Active' | 'Inactive')} className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-900 focus:outline-none focus:ring-indigo-500"><option value="Active">Active</option><option value="Inactive">Inactive</option></select></div>
                </div>

                {/* --- Role-specific assignment fields (conditionally rendered) --- */}
                {user.role === 'Department' && (
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Assigned College</label>
                        <select
                            value={user.collegeId || ''}
                            onChange={(e) => handleInputChange('collegeId', e.target.value as College)}
                            className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            <option value="">-- Unassigned --</option>
                            {data.colleges.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                )}
                {user.role === 'Program Co-ordinator' && (
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Reports to (Department Head)</label>
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
                        <label className="block text-sm font-medium text-gray-700">Reports to (Program Co-ordinator)</label>
                        <select
                            multiple
                            value={user.programCoordinatorIds || []}
                            // FIX: Explicitly type the 'option' parameter as HTMLOptionElement.
                            onChange={(e) => handleMultiSelectChange('programCoordinatorIds', Array.from(e.target.selectedOptions, (option: HTMLOptionElement) => option.value))}
                            className="mt-1 block w-full h-24 bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        >
                           {programCoordinators.map(pc => <option key={pc.id} value={pc.id}>{pc.name}</option>)}
                        </select>
                        <p className="text-xs text-gray-500 mt-1">Hold Ctrl or Cmd to select multiple.</p>
                    </div>
                )}

                <div className="flex justify-end pt-4 gap-3">
                    <button type="button" onClick={onClose} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg">Cancel</button>
                    <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg">{userToEdit ? 'Save Changes' : 'Create User'}</button>
                </div>
            </form>
        </Modal>
    );
};

export default UserEditModal;