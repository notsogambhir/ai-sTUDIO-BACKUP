/**
 * @file CreateAssessmentModal.tsx
 * @description
 * This component is a simple popup window ("modal") with a form for creating a new assessment
 * (like a test, a quiz, or a final exam) for a specific class section.
 *
 * What it does:
 * 1.  It's like a small order form. It receives the `sectionId` from its parent component
 *     (`ManageCourseAssessments`), which is like knowing which classroom the test is for.
 * 2.  It shows a form asking for the "Assessment Name" (e.g., "Mid-Term Exam") and "Assessment Type"
 *     (e.g., "Internal").
 * 3.  It uses its own little notepad (`useState`) to remember what the user is typing into the form.
 * 4.  When the user submits the form, it creates a new `Assessment` object (a new, empty test paper).
 * 5.  Finally, it adds this new test paper to our main application data using the `setData` function
 *     from our "magic backpack", so everyone knows a new test has been created.
 */

import React, { useState } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import Modal from './Modal'; // We use our generic "popup" component as a base.
import { Assessment } from '../types'; // We get the blueprint for an 'Assessment' from our data dictionary.

// This defines the "props" or properties this component needs from its parent.
interface CreateAssessmentModalProps {
  sectionId: string; // The ID of the classroom this new assessment will belong to.
  onClose: () => void; // A function to call to close the popup.
}

const CreateAssessmentModal: React.FC<CreateAssessmentModalProps> = ({ sectionId, onClose }) => {
  // We get the `setData` tool from our "magic backpack" to update the app's main data.
  const { setData } = useAppContext();
  
  // We create pieces of memory on our "notepad" (`useState`) to store what the user types.
  const [name, setName] = useState('');
  const [type, setType] = useState<'Internal' | 'External'>('Internal');

  // This function runs when the user clicks the "Create" button.
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // Stop the page from reloading, which is what forms normally do.
    if (!name.trim()) { alert("Please provide an assessment name."); return; }
    
    // We create a new "assessment" object based on the blueprint from `types.ts`.
    const newAssessment: Assessment = {
      id: `as_${Date.now()}`, // We create a unique ID based on the current time.
      sectionId, // The classroom it belongs to.
      name: name.trim(), // The name the user typed.
      type, // The type the user selected.
      questions: [] // A new assessment always starts with an empty list of questions.
    };
    
    // We use our `setData` tool to add the new assessment to the main list in our "magic backpack".
    setData(prev => ({ ...prev, assessments: [...prev.assessments, newAssessment] }));
    
    onClose(); // We call the function to close the popup.
  };

  return (
    // We use our reusable `Modal` component as the frame for our popup.
    <Modal title="Create New Assessment" onClose={onClose}>
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Assessment Name</label>
          <input
            type="text"
            value={name} // The input's value is tied to our component's memory.
            onChange={e => setName(e.target.value)} // When the user types, we update the memory.
            className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Assessment Type</label>
          <select
            value={type}
            onChange={e => setType(e.target.value as 'Internal' | 'External')}
            className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="Internal">Internal</option>
            <option value="External">External</option>
          </select>
        </div>
        <div className="flex justify-end pt-4 gap-3">
            <button type="button" onClick={onClose} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg">Cancel</button>
            <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg">Create</button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateAssessmentModal;