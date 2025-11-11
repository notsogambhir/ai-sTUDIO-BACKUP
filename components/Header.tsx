
/**
 * @file Header.tsx
 * @description
 * This file defines the `Header` component, which is the top bar displayed on every page
 * inside the main application layout.
 *
 * It's like the dashboard of a car: it shows important information at a glance.
 *
 * Responsibilities:
 * 1.  Displays the name of the selected program and batch.
 * 2.  Shows the name, role, and ID of the currently logged-in user.
 * 3.  Provides a "Program Selection" button to go back to the program grid.
 * 4.  Provides the "Logout" button to end the user's session.
 */

import React from 'react';
import { useNavigate } from 'react-router-dom'; // A tool for programmatically changing the page.
import { useAppContext } from '../hooks/useAppContext'; // Helper to get shared data.
import { LogOut, Grid } from './Icons'; // Imports the logout and grid icon images.

const Header: React.FC = () => {
    // We ask our "magic backpack" (AppContext) for all the information and tools we need.
    const { currentUser, selectedProgram, selectedBatch, logout, goBackToProgramSelection } = useAppContext();
    
    // `useNavigate` gives us a function (`navigate`) to tell the app to go to a different URL.
    const navigate = useNavigate();

    /**
     * This function is called when the user clicks the logout button.
     */
    const handleLogout = () => {
        logout(); // Call the logout function from our "magic backpack".
        navigate('/login'); // Tell the app's GPS to go to the login screen.
    };

    /**
     * This function is called when the user clicks the grid icon to go back
     * to the program selection screen.
     */
    const handleGoToSelection = () => {
        goBackToProgramSelection(); // Call the function from the backpack to clear the selected program.
        navigate('/program-selection'); // Go to the program selection page.
    };

    // The JSX below describes what the Header looks like using HTML-like tags.
    return (
        <header className="bg-white shadow-sm p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
                {/* Left side of the header */}
                <div>
                    {/* Display the selected program's name, or the user's name if no program is selected. */}
                    <h1 className="text-2xl font-bold text-gray-800">{selectedProgram?.name || currentUser?.name}</h1>
                    {/* Display the selected batch, or the user's role as a fallback. */}
                    <p className="mt-1 text-gray-500">
                        {selectedBatch ? `Batch ${selectedBatch}` : (currentUser?.role || 'User')}
                    </p>
                </div>
                 {/* Right side of the header */}
                 <div className="flex items-center gap-4">
                    {/* User's information block */}
                    <div className="text-right">
                        <p className="font-semibold text-gray-700">{currentUser?.name}</p>
                        <p className="text-sm text-gray-500">{currentUser?.role}</p>
                        <p className="text-xs text-gray-400">{currentUser?.employeeId}</p>
                    </div>
                    {/* Program Selection Button */}
                    <button 
                        onClick={handleGoToSelection}
                        title="Program Selection"
                        aria-label="Program Selection"
                        className="p-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors"
                    >
                        <Grid className="w-6 h-6" />
                    </button>
                    {/* Logout Button */}
                    <button 
                        onClick={handleLogout} 
                        title="Logout"
                        aria-label="Logout"
                        className="p-2 rounded-full hover:bg-red-100 text-gray-600 hover:text-red-600 transition-colors"
                    >
                        <LogOut className="w-6 h-6" />
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;
