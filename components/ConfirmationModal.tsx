/**
 * @file ConfirmationModal.tsx
 * @description
 * This file defines a very simple and reusable `ConfirmationModal` component.
 * It's the popup window that asks the user "Are you sure?" before they perform
 * a potentially destructive action, like deleting something.
 *
 * This component is like a puppet. It has no brain of its own. It is completely
 * controlled by the component that uses it (the "parent" component).
 *
 * How it's controlled by the parent:
 * - `isOpen`: A boolean that tells the modal whether to be visible or not.
 * - `title`: The text to show in the modal's title bar.
 * - `message`: The question or warning to show the user.
 * - `onConfirm`: A function to run ONLY if the user clicks the "Confirm" button.
 * - `onClose`: A function to run if the user clicks "Cancel" or the background.
 */

import React from 'react';

// This defines the "props" or properties that this component accepts from its parent.
interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onClose: () => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, title, message, onConfirm, onClose }) => {
  // If the parent tells us not to be open, we render nothing at all.
  if (!isOpen) return null;

  return (
    // The semi-transparent background. Clicking it calls `onClose`.
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      {/* The white content box. Clicking inside it does NOT close the modal. */}
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-bold text-gray-800">{title}</h2>
        <p className="mt-4 text-gray-600">{message}</p>
        <div className="mt-6 flex justify-end gap-4">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 font-semibold">
            Cancel
          </button>
          <button type="button" onClick={onConfirm} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-semibold">
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
