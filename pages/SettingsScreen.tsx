/**
 * @file SettingsScreen.tsx
 * @description
 * This file defines the `SettingsScreen` component.
 *
 * **NOTE: This is an older, deprecated component and is no longer actively used in the application.**
 *
 * What was its purpose?
 * Imagine this page was the first, simple control panel we built for the application's boss (the Admin).
 * It had a few switches and buttons for managing things like colleges and programs.
 *
 * Why is it no longer used?
 * We realized the boss needed a much bigger, better, and more organized control room. So, we built the
 * `AdminPanel`. This new panel has separate, dedicated sections for everything:
 * - `components/admin/AdminAcademicStructureTab.tsx` (for managing colleges, programs, and batches)
 * - `components/admin/AdminSystemSettingsTab.tsx` (for managing system-wide defaults)
 *
 * All the switches and buttons from this old, messy control panel were moved to the new `AdminPanel`.
 * This old room is now empty and unused.
 *
 * This file is kept in the codebase just in case an old wire is still connected to it, to prevent
 * the app from showing an error. It can be safely removed in a future cleanup.
 */

// We still need to import React to define a React component.
import React from 'react';

// This is the main (and now deprecated) component for the Settings Screen.
const SettingsScreen: React.FC = () => {
  return (
    // The component renders a simple placeholder message explaining that its features have moved.
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Settings (Deprecated)</h1>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Manage Colleges</h2>
        <p className="text-gray-600">This functionality has been moved to the Admin Panel under "Academic Structure".</p>
      </div>
       <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Manage Programs</h2>
        <p className="text-gray-600">This functionality has been moved to the Admin Panel under "Academic Structure".</p>
      </div>
    </div>
  );
};

export default SettingsScreen;