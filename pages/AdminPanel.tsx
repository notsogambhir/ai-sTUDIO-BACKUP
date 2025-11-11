/**
 * @file AdminPanel.tsx
 * @description
 * This component acts as the main "container" or "router" for all the pages
 * that are exclusive to the Administrator role.
 *
 * It's a very simple component with one main job:
 * 1.  It receives a `view` prop (property) from the main app router (`App.tsx`).
 *     This prop tells it which admin page to display (e.g., "Academic Structure").
 * 2.  Based on the `view`, it uses a `switch` statement (which is like a series of "if"
 *     statements) to render the correct component for that view.
 *
 * This keeps the main `App.tsx` router cleaner and centralizes the logic for
 * displaying different admin-only pages.
 */

import React from 'react';
// We import all the different "tabs" or "pages" that can be shown within the admin panel.
import AdminAcademicStructureTab from '../components/admin/AdminAcademicStructureTab';
import AdminUserManagementTab from '../components/admin/AdminUserManagementTab';
import AdminSystemSettingsTab from '../components/admin/AdminSystemSettingsTab';

// This defines the allowed values for the `view` prop. It can only be one of these three strings.
type AdminView = 'Academic Structure' | 'User Management' | 'System Settings';

// This defines the full set of props that the component accepts.
interface AdminPanelProps {
  view: AdminView;
}

// A simple helper object to map the `view` prop to a nice-looking title for the page.
const viewTitles: Record<AdminView, string> = {
  'Academic Structure': 'Academic Structure',
  'User Management': 'User Management',
  'System Settings': 'System Settings',
};

// This is the main component function for the Admin Panel.
const AdminPanel: React.FC<AdminPanelProps> = ({ view }) => {
  /**
   * This function decides which component to show based on the `view` prop.
   */
  const renderContent = () => {
    switch (view) {
      case 'Academic Structure':
        return <AdminAcademicStructureTab />;
      case 'User Management':
        return <AdminUserManagementTab />;
      case 'System Settings':
        return <AdminSystemSettingsTab />;
      default:
        // If for some reason the `view` is not one of the allowed values, show nothing.
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Display the title for the current view. */}
      <h1 className="text-3xl font-bold text-gray-800">{viewTitles[view]}</h1>
      {/* This is the main content box where the selected admin component will be rendered. */}
      <div className="bg-white p-6 rounded-lg shadow-md min-h-[400px]">
        {renderContent()}
      </div>
    </div>
  );
};

export default AdminPanel;
