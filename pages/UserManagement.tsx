/**
 * @file UserManagement.tsx
 * @description
 * This file defines the `UserManagement` component.
 *
 * **NOTE: This is an older, deprecated component and is no longer actively used in the application.**
 *
 * What was its purpose?
 * Think of this page as the company's original, simple Human Resources (HR) office. It was a place where
 * the main boss (the "Admin") could go to do two specific jobs:
 * 1. Assign a manager ("Program Co-ordinator") to a specific department ("Program").
 * 2. Assign an employee ("Teacher") to report to a specific manager.
 *
 * Why is it no longer used?
 * We built a brand new, much bigger, and more powerful HR department for the boss. This new office is
 * now a part of the main `AdminPanel` and is called `components/admin/AdminUserManagementTab.tsx`.
 *
 * The new HR office can do everything this old one could, plus a lot more! It allows the boss to:
 * - Create brand new employees from scratch.
 * - Edit every detail about an employee (not just their assignments).
 * - Delete employees.
 * - Manage every type of role (not just PCs and Teachers).
 *
 * Because the new HR office is so much better, this old one is now closed and no longer used.
 */

import React, { useMemo, useState, useEffect } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { User, Program } from '../types';
import SaveBar from '../components/SaveBar';

// This is the main (and now deprecated) component function.
const UserManagement: React.FC = () => {
    // It got its data and tools from the "magic backpack".
    const { data, setData, currentUser } = useAppContext();

    // It calculated the lists of PCs, teachers, and programs.
    const { programCoordinators, teachers, programs } = useMemo(() => ({
        programCoordinators: data.users.filter(u => u.role === 'Program Co-ordinator'),
        teachers: data.users.filter(u => u.role === 'Teacher'),
        programs: data.programs,
    }), [data]);

    // It used a "draft state" to manage unsaved changes for assignments.
    const [draftPcAssignments, setDraftPcAssignments] = useState<{ [programId: string]: string }>({});
    const [initialPcAssignments, setInitialPcAssignments] = useState<{ [programId: string]: string }>({});
    const [draftTeacherAssignments, setDraftTeacherAssignments] = useState<{ [teacherId: string]: string[] }>({});
    const [initialTeacherAssignments, setInitialTeacherAssignments] = useState<{ [teacherId: string]: string[] }>({});

    // It loaded the initial assignment data into its draft state when it first appeared.
    useEffect(() => {
        // Init PC assignments
        const pcAssignments: { [programId: string]: string } = {};
        programs.forEach(p => {
            const assignedPC = programCoordinators.find(pc => pc.programId === p.id);
            pcAssignments[p.id] = assignedPC ? assignedPC.id : '';
        });
        setDraftPcAssignments(pcAssignments);
        setInitialPcAssignments(pcAssignments);

        // Init Teacher assignments
        const teacherAssignments: { [teacherId: string]: string[] } = {};
        teachers.forEach(t => {
            teacherAssignments[t.id] = t.programCoordinatorIds || [];
        });
        setDraftTeacherAssignments(teacherAssignments);
        setInitialTeacherAssignments(teacherAssignments);
    }, [programs, programCoordinators, teachers]);

    // It checked if there were any unsaved changes to show the SaveBar.
    const isDirty = useMemo(() => 
        JSON.stringify(draftPcAssignments) !== JSON.stringify(initialPcAssignments) ||
        JSON.stringify(draftTeacherAssignments) !== JSON.stringify(initialTeacherAssignments),
    [draftPcAssignments, initialPcAssignments, draftTeacherAssignments, initialTeacherAssignments]);


    // Handlers for changing the dropdowns, which would update the draft state.
    const handleProgramAssignmentChange = (programId: string, pcId: string) => {
        setDraftPcAssignments(prev => ({...prev, [programId]: pcId}));
    };
    
    const handleTeacherAssignmentChange = (teacherId: string, pcId: string) => {
        setDraftTeacherAssignments(prev => ({...prev, [teacherId]: pcId ? [pcId] : []}));
    };

    // The save handler, which would update the main application data.
    const handleSave = () => {
        setData(prev => {
            const updatedUsers = prev.users.map(user => {
                let updatedUser = { ...user };
                
                // Apply PC assignment changes
                if (updatedUser.role === 'Program Co-ordinator') {
                    const assignedProgramId = Object.keys(draftPcAssignments).find(
                        progId => draftPcAssignments[progId] === updatedUser.id
                    );
                    if (assignedProgramId) {
                        updatedUser.programId = assignedProgramId;
                    } else if (updatedUser.programId && !Object.values(draftPcAssignments).includes(updatedUser.id)) {
                        delete (updatedUser as Partial<User>).programId;
                    }
                }
                
                // Apply Teacher assignment changes
                if (updatedUser.role === 'Teacher') {
                    if (draftTeacherAssignments[updatedUser.id] !== undefined) {
                        updatedUser.programCoordinatorIds = draftTeacherAssignments[updatedUser.id];
                    }
                }
                
                return updatedUser;
            });
            return { ...prev, users: updatedUsers };
        });
        
        setInitialPcAssignments(draftPcAssignments);
        setInitialTeacherAssignments(draftTeacherAssignments);
        alert("User assignments saved!");
    };
    
    // The cancel handler, which would discard all changes.
    const handleCancel = () => {
        setDraftPcAssignments(initialPcAssignments);
        setDraftTeacherAssignments(initialTeacherAssignments);
    };

    // A security check to ensure only Admins could see this page.
    if (currentUser?.role !== 'Admin') {
        return (
            <div className="text-center p-8 bg-white rounded-lg shadow-md">
                <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
                <p className="text-gray-500 mt-2">You do not have permission to view this page.</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-20">
            <h1 className="text-3xl font-bold text-gray-800">User Management (Deprecated)</h1>
            {/* The rest of the component's UI for displaying the assignment tables would go here,
                but since it's deprecated, we are only showing the title. */}
            <p className="p-4 bg-yellow-100 text-yellow-800 rounded-lg">
                This page is no longer in use. All user management is now handled in the "User Management"
                section of the Admin Panel.
            </p>
            <SaveBar isDirty={isDirty} onSave={handleSave} onCancel={handleCancel} />
        </div>
    );
};

export default UserManagement;