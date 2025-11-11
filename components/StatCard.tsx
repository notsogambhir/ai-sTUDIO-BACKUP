/**
 * @file StatCard.tsx
 * @description
 * This file defines the `StatCard` component. It's a small, reusable "widget"
 * used on the Dashboard to display a single piece of information, like the total
 * number of students.
 *
 * It's designed to be flexible. You can tell it:
 * - What `title` to show (e.g., "Total Students").
 * - What `value` to display (e.g., 120).
 * - Which `icon` to use.
 * - What `color` theme it should have.
 */

import React from 'react';

// This defines the "props" or properties that the component accepts.
// By being specific, we ensure that anyone using this component provides the right kind of data.
interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactElement<{ className?: string }>; // The icon must be a React component that can accept a `className`.
  color: 'blue' | 'green' | 'purple' | 'red'; // Only these specific colors are allowed.
}

// This is a helper object that maps our simple color names to the more complex
// TailwindCSS classes that actually create the color styles.
const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    red: 'bg-red-100 text-red-600',
}

// This is the main component function. It receives the props from its parent.
const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => (
  // The main container for the card.
  <div className="bg-white p-6 rounded-xl shadow-md flex items-center">
    {/* This is the colored circle that holds the icon.
        `colorClasses[color]` dynamically picks the right style from our helper object. */}
    <div className={`p-4 rounded-full ${colorClasses[color]}`}>
      {/* `React.cloneElement` is used to take the `icon` component we received
          and add a new property to it (`className`) before rendering it.
          This is how we give the icon a specific size (w-6 h-6). */}
      {React.cloneElement(icon, { className: 'w-6 h-6' })}
    </div>
    {/* This container holds the text content. */}
    <div className="ml-4">
      <p className="text-gray-500">{title}</p>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  </div>
);

export default StatCard;
