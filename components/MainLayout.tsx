/**
 * @file MainLayout.tsx
 * @description
 * This file defines the main visual structure or "layout" for almost every page in the application.
 *
 * Think of it as a picture frame:
 * - The frame itself is the `Sidebar` on the left and the `Header` at the top.
 * - The picture inside the frame is the `children`, which represents the actual content of
 *   whatever page the user is currently on (like the Dashboard or the Courses list).
 *
 * By using this component, we ensure that every page has a consistent look and feel
 * without having to repeat the code for the sidebar and header everywhere.
 */

import React from 'react';
import Sidebar from './Sidebar'; // Importing the sidebar component.
import Header from './Header'; // Importing the header component.

// This defines the "props" or properties that this component accepts.
// In this case, it accepts `children`, which is a standard React prop that
// represents any components nested inside this one.
interface MainLayoutProps {
  children: React.ReactNode;
}

// This is the main component function.
const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  // The `return` statement describes what the component looks like using HTML-like JSX.
  return (
    // This is the main container for the whole screen, using Flexbox to arrange items.
    <div className="flex h-full bg-gray-100 font-sans">
      {/* The Sidebar component is placed on the left. */}
      <Sidebar />
      
      {/* This `main` element will take up the rest of the available space. */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* The Header component is placed at the top of the main content area. */}
        <Header />
        
        {/* This is where the actual page content (`children`) will be displayed. */}
        {/* The classes here make it scrollable if the content is too long. */}
        <div className="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6 lg:p-8">
            {children}
        </div>
      </main>
    </div>
  );
};

// We export the component so it can be used in other files, like `App.tsx`.
export default MainLayout;
