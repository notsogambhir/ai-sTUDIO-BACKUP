/**
 * @file SaveBar.tsx
 * @description
 * This file defines the `SaveBar` component. It's the bar that appears at the bottom
 * of the screen whenever a user has made unsaved changes on a page.
 *
 * It's a very simple and "dumb" component. It only does two things:
 * 1.  It shows itself if its parent component tells it that there are unsaved changes
 *     (by passing `isDirty={true}`).
 * 2.  It shows "Save" and "Cancel" buttons. When these buttons are clicked, they call
 *     the `onSave` and `onCancel` functions that were given to it by its parent.
 *
 * This makes it a highly reusable "reminder" component for any page that has a
 * "draft state" or unsaved changes.
 */

import React from 'react';

// This defines the "props" or properties that this component accepts from its parent.
interface SaveBarProps {
  isDirty: boolean; // Are there unsaved changes?
  onSave: () => void; // What to do when "Save" is clicked.
  onCancel: () => void; // What to do when "Cancel" is clicked.
}

const SaveBar: React.FC<SaveBarProps> = ({ isDirty, onSave, onCancel }) => {
  // If the parent component tells us there are no unsaved changes (`isDirty` is false),
  // then we render nothing at all. The component is invisible.
  if (!isDirty) {
    return null;
  }

  // If `isDirty` is true, we render the bar.
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-800 bg-opacity-90 shadow-lg p-4 border-t border-gray-600 z-20 flex justify-center sm:justify-end sm:left-64 backdrop-blur-sm">
      <div className="flex items-center gap-4 sm:pr-8">
        <p className="text-white hidden lg:block">You have unsaved changes.</p>
        <button
          onClick={onCancel}
          className="px-6 py-2 bg-gray-500 text-white font-semibold rounded-lg hover:bg-gray-600 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onSave}
          className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default SaveBar;
