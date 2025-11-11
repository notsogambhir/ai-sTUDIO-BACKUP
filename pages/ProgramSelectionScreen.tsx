/**
 * @file ProgramSelectionScreen.tsx
 * @description
 * This file defines the `ProgramSelectionScreen` component. This screen is shown to users
 * (like Teachers and Program Co-ordinators) after they log in but before they can access
 * the main dashboard. It forces them to choose a specific academic program to work with.
 *
 * Responsibilities:
 * 1.  Displays a welcome message with the user's name and role.
 * 2.  Shows a grid of available academic programs.
 * 3.  The list of programs is filtered based on the user's role and the college they
 *     logged in with. (e.g., a PC for "BE ECE" will only see that one program).
 * 4.  When a user clicks on a program, it opens a "modal" (popup) to ask them to
 *     select a specific batch.
 * 5.  Provides a logout button.
 */

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../hooks/useAppContext'; // Helper to get shared data.
import { Program } from '../types'; // Imports the `Program` type from our data dictionary.
import BatchSelectionModal from '../components/BatchSelectionModal'; // Imports the batch selection popup.
import { GraduationCap, LogOut } from '../components/Icons'; // Imports icon images.

// This is the main component function for the Program Selection screen.
const ProgramSelectionScreen: React.FC = () => {
    // We ask our "magic backpack" (AppContext) for the data and tools we need.
    const { data, currentUser, selectedLoginCollege, logout } = useAppContext();
    
    // `useNavigate` gives us a function to tell the app to go to a different page.
    const navigate = useNavigate();
    
    // `useState` gives the component its own memory.
    // `isModalOpen` remembers whether the batch selection popup should be visible or not.
    const [isModalOpen, setIsModalOpen] = useState(false);
    // `selectedProgramForBatch` remembers which program the user just clicked on.
    const [selectedProgramForBatch, setSelectedProgramForBatch] = useState<Program | null>(null);

    // `useMemo` is a performance helper. It only recalculates this list of programs
    // when the data or current user changes.
    const programs = useMemo(() => {
        if (!currentUser) return []; // If there's no user, show no programs.

        // Admins and University users can see all programs.
        if (currentUser.role === 'Admin' || currentUser.role === 'University') {
            return data.programs;
        }
        // A Program Co-ordinator can only see the one program they are assigned to.
        if (currentUser.role === 'Program Co-ordinator') {
            if (currentUser.programId) {
                return data.programs.filter(p => p.id === currentUser.programId);
            }
            return [];
        }
        // Other users (like Teachers) see all programs within the college they logged into.
        return data.programs.filter(p => p.collegeId === selectedLoginCollege);
    }, [data.programs, currentUser, selectedLoginCollege]);
    
    // This function runs when a user clicks on one of the program cards.
    const handleProgramSelect = (program: Program) => {
        setSelectedProgramForBatch(program); // Remember which program was clicked.
        setIsModalOpen(true); // Open the batch selection popup.
    };

    // This function runs when the user clicks the logout button.
    const handleLogout = () => {
        logout(); // Call the logout function from our magic backpack.
        navigate('/login'); // Go back to the login screen.
    };

    // Find the full name of the college for display.
    const collegeName = data.colleges.find(c => c.id === selectedLoginCollege)?.name || 'All Colleges';

    // The JSX below describes what the screen looks like.
    return (
        <div className="h-full bg-gray-100 p-8 flex flex-col">
            <header className="flex items-center justify-between mb-8 flex-shrink-0">
                <div className="flex items-center gap-4">
                   <img src="https://d1hbpr09pwz0sk.cloudfront.net/logo_url/chitkara-university-4c35e411" alt="Logo" className="h-12" />
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Select a Program</h1>
                        {/* Display a welcome message to the user. */}
                        {currentUser && <p className="text-gray-600">
                           Welcome, {currentUser.name} ({currentUser.role}) | College: <strong>{collegeName}</strong>
                        </p>}
                    </div>
                </div>
                <button 
                    onClick={handleLogout} 
                    className="flex items-center px-4 py-2 font-medium text-gray-600 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-100"
                >
                    <LogOut className="w-5 h-5 mr-2" />
                    Logout
                </button>
            </header>
            <div className="flex-grow overflow-y-auto">
                {/* This grid will display all the program cards. */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {/* We loop through our filtered `programs` list and create a button for each one. */}
                    {programs.map(program => (
                        <button 
                            key={program.id} // A unique key for each item in the list.
                            onClick={() => handleProgramSelect(program)} // When clicked, run our handler function.
                            className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col items-center text-center"
                        >
                            <div className="p-4 bg-red-100 text-red-600 rounded-full mb-4">
                                <GraduationCap className="w-8 h-8"/>
                            </div>
                            <h3 className="text-lg font-bold text-gray-800">{program.name}</h3>
                            <p className="text-sm text-gray-500">{data.colleges.find(c => c.id === program.collegeId)?.name}</p>
                        </button>
                    ))}
                </div>
            </div>
            {/* This is a conditional render. The `BatchSelectionModal` is only shown
                if `isModalOpen` is true and a program has been selected. */}
            {isModalOpen && selectedProgramForBatch && (
                <BatchSelectionModal 
                    program={selectedProgramForBatch}
                    onClose={() => setIsModalOpen(false)} // When the modal closes, we set `isModalOpen` back to false.
                />
            )}
        </div>
    );
};

export default ProgramSelectionScreen;