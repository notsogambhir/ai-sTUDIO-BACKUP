/**
 * @file Sidebar.tsx
 * @description
 * This file defines the `Sidebar` component, which is the navigation menu on the
 * left side of the screen. It's a key part of the app's navigation.
 *
 * Responsibilities:
 * 1.  Displays the university logo.
 * 2.  For high-level users (Admin, University, Department), it shows dropdowns to
 *     select a College, Program, and Batch. Changing these dropdowns filters the
 *     data for the entire application.
 * 3.  Displays a list of navigation links (like "Dashboard", "Courses", "Students").
 * 4.  The links shown are based on the logged-in user's role. For example, a "Teacher"
 *     will not see the "User Management" link.
 * 5.  Highlights the currently active link.
 */

import React, { useMemo } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAppContext } from '../hooks/useAppContext'; // Helper to get shared data.
// Importing all the little icon images we need for the menu items.
import {
    PieChart, BookOpen, Users, Target, Settings, Grid
} from './Icons';

// This is the main component function for the Sidebar.
const Sidebar: React.FC = () => {
  // We ask our "magic backpack" (AppContext) for all the data and tools we need.
  const { 
    currentUser, 
    data, 
    selectedProgram, 
    selectedBatch, 
    setProgramAndBatch, 
    goBackToProgramSelection, 
    selectedCollegeId, 
    setSelectedCollegeId 
  } = useAppContext();
  
  // `useNavigate` gives us a function to tell the app to go to a different page.
  const navigate = useNavigate();

  // A simple check to see if the current user is an Admin, University, or Department user.
  // These are the roles that get to see the dropdown filters.
  const isHighLevelUser = currentUser && ['Admin', 'University', 'Department'].includes(currentUser.role);
  
  // `useMemo` is a performance helper. It only recalculates this list of programs
  // when the `selectedCollegeId` changes. This prevents unnecessary work.
  const programsForSelectedCollege = useMemo(() => {
    if (!selectedCollegeId) return []; // If no college is selected, the list is empty.
    // Filter all programs in our data to find the ones that match the selected college.
    return data.programs.filter(p => p.collegeId === selectedCollegeId);
  }, [data.programs, selectedCollegeId]);

  // Similarly, this only recalculates the batches when the `selectedProgram` changes.
  const batchesForProgram = useMemo(() => {
    if (!selectedProgram) return []; // If no program is selected, the list is empty.
    // Find all batches that belong to the selected program and sort them.
    return data.batches
        .filter(b => b.programId === selectedProgram.id)
        .sort((a, b) => b.name.localeCompare(a.name)); // Sort by name, newest first.
  }, [data.batches, selectedProgram]);

  // This function runs when the user changes the College dropdown.
  const handleCollegeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCollegeId = e.target.value;
    setSelectedCollegeId(newCollegeId || null); // Update the selected college in our magic backpack.
    goBackToProgramSelection(); // Clear any previously selected program/batch.
    navigate('/program-selection'); // Go back to the program selection screen.
  };

  // This function runs when the user changes the Program dropdown.
  const handleProgramChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newProgramId = e.target.value;
    if (!newProgramId) {
        // If they selected "-- Select Program --", clear the selection.
        goBackToProgramSelection();
        navigate('/program-selection');
        return;
    }
    const program = data.programs.find(p => p.id === newProgramId);
    if (program) {
        // Find the available batches for this new program.
        const programBatches = data.batches.filter(b => b.programId === program.id).sort((a,b) => b.name.localeCompare(a.name));
        // Automatically select the newest batch as the default.
        const defaultBatch = programBatches.length > 0 ? programBatches[0].name : '';
        // Update the program and batch in our magic backpack.
        setProgramAndBatch(program, defaultBatch);
    }
  };

  // This function runs when the user changes the Batch dropdown.
  const handleBatchChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (selectedProgram) {
        // We only need to update the batch, the program stays the same.
        setProgramAndBatch(selectedProgram, e.target.value);
    }
  };

  // This is a master list of all possible menu items in the sidebar.
  // Each item has a path (`to`), a label, an icon, and a list of `roles` that can see it.
  const allMenuItems = [
    // Department-specific items are listed first to appear at the top for them.
    { to: '/department/faculty', label: 'Faculty Management', icon: <Users />, roles: ['Department'] },
    { to: '/department/students', label: 'Student Management', icon: <Users />, roles: ['Department'] },
    
    // Standard links for most roles.
    { to: '/dashboard', label: 'Dashboard', icon: <PieChart />, roles: ['Teacher', 'Program Co-ordinator', 'University', 'Admin', 'Department'] },
    { to: '/courses', label: 'Courses', icon: <BookOpen />, roles: ['Teacher', 'Program Co-ordinator', 'Admin', 'Department'] },
    { to: '/students', label: 'Students', icon: <Users />, roles: ['Teacher', 'Program Co-ordinator', 'Admin', 'Department'] },
    { to: '/teachers', label: 'Teachers', icon: <Users />, roles: ['Program Co-ordinator', 'Department'] },
    { to: '/program-outcomes', label: 'Program Outcomes', icon: <Target />, roles: ['Program Co-ordinator', 'Admin', 'Department'] },
    { to: '/reports', label: 'Attainment Reports', icon: <PieChart />, roles: ['Teacher', 'Program Co-ordinator', 'University', 'Admin', 'Department'] },

    // Links only visible to Admins.
    { to: '/admin/academic-structure', label: 'Academic Structure', icon: <Grid />, roles: ['Admin'] },
    { to: '/admin/user-management', label: 'User Management', icon: <Users />, roles: ['Admin'] },
    { to: '/admin/system-settings', label: 'System Settings', icon: <Settings />, roles: ['Admin'] },
  ];
  
  // We filter the `allMenuItems` list to get only the items the current user is allowed to see.
  const menuItems = allMenuItems.filter(item => currentUser && item.roles.includes(currentUser.role));

  // The JSX below describes what the Sidebar looks like.
  return (
    <aside className="w-64 bg-white shadow-md flex flex-col hidden sm:flex h-full">
        {/* The top part with the university logo */}
        <div className="flex items-center justify-center p-6 border-b flex-shrink-0">
           <img src="https://d1hbpr09pwz0sk.cloudfront.net/logo_url/chitkara-university-4c35e411" alt="Chitkara University Logo" className="h-10" />
        </div>

        {/* This block of dropdowns is only shown if the user is a "high-level user". */}
        {isHighLevelUser && (
            <div className="p-4 space-y-4 border-b flex-shrink-0">
                <div>
                    <label htmlFor="college-select" className="block text-sm font-medium text-gray-700">College</label>
                    <select id="college-select" value={selectedCollegeId || ''} onChange={handleCollegeChange} disabled={currentUser?.role === 'Department'} className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-white text-gray-900 border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md disabled:bg-gray-100 disabled:cursor-not-allowed">
                        <option value="">-- Select College --</option>
                        {data.colleges.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="program-select" className="block text-sm font-medium text-gray-700">Program</label>
                    <select id="program-select" value={selectedProgram?.id || ''} onChange={handleProgramChange} disabled={!selectedCollegeId} className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-white text-gray-900 border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md disabled:bg-gray-100">
                        <option value="">-- Select Program --</option>
                        {programsForSelectedCollege.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="batch-select" className="block text-sm font-medium text-gray-700">Batch</label>
                    <select id="batch-select" value={selectedBatch || ''} onChange={handleBatchChange} disabled={!selectedProgram} className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-white text-gray-900 border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md disabled:bg-gray-100">
                        <option value="">-- Select Batch --</option>
                        {batchesForProgram.map(batch => <option key={batch.id} value={batch.name}>{batch.name}</option>)}
                    </select>
                </div>
            </div>
        )}

      {/* The main navigation area. It scrolls if there are too many items. */}
      <nav className="flex-1 px-4 py-6 overflow-y-auto">
        {/* We loop through the `menuItems` and create a `NavLink` for each one. */}
        {menuItems.map(item => (
          // `NavLink` is a special type of link from React Router that knows if it's "active".
          <NavLink
            key={item.to} // A unique key for each item in the list.
            to={item.to} // The URL this link will navigate to.
            // This function changes the link's style if it's the active page.
            className={({ isActive }) =>
              `w-full flex items-center px-4 py-3 my-1 rounded-lg transition-colors duration-200 ${
                isActive 
                ? 'bg-blue-500 text-white shadow-lg' // Style for the active link
                : 'text-gray-600 hover:bg-gray-100' // Style for inactive links
            }`}
          >
            {item.icon} {/* The icon for the menu item */}
            <span className="ml-4 font-medium">{item.label}</span> {/* The text label */}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;