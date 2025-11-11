/**
 * @file Modal.tsx
 * @description
 * This file defines a generic and reusable `Modal` component. A modal is a "popup"
 * window that appears on top of the main page content.
 *
 * This component is like a blank template for a popup. It provides the basic
 * structure:
 * 1.  A semi-transparent background overlay.
 * 2.  A white content box in the center.
 * 3.  A title bar with a title and a close button.
 *
 * Other components can then use this `Modal` and put whatever content they want
 * inside it by passing `children`. This makes it very flexible and reusable.
 */

import React from 'react';

// This defines the "props" or properties that this component accepts.
interface ModalProps {
  title: string; // The text to display in the modal's title bar.
  onClose: () => void; // A function to call when the modal should be closed.
  children: React.ReactNode; // The content to display inside the modal.
}

// This is the main component function for the Modal.
const Modal: React.FC<ModalProps> = ({ title, onClose, children }) => {
  // The JSX below describes what the modal looks like.
  return (
    // This is the full-screen, semi-transparent background.
    // Clicking on it will call the `onClose` function to close the modal.
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 transition-opacity" onClick={onClose}>
      {/* This is the white content box. 
          `onClick={(e) => e.stopPropagation()}` is a clever trick: it prevents a click
          inside the white box from "bubbling up" to the background. This means clicking
          the content won't close the modal, but clicking the background will. */}
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 transform transition-all" onClick={(e) => e.stopPropagation()}>
        {/* The header section of the modal. */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
          {/* The 'X' close button. */}
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600" aria-label="Close">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        {/* This is where the `children` (the actual content provided by the parent component) will be rendered. */}
        <div>{children}</div>
      </div>
    </div>
  );
};

export default Modal;
