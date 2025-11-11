/**
 * @file AddProgramOutcomeModal.tsx
 * @description
 * This component is a simple popup window ("modal") with a form for adding a new
 * Program Outcome (PO) to the currently selected program. A PO is a big, important
 * skill that students should have when they graduate from the whole program.
 *
 * What it does:
 * 1.  It's like a suggestion box for adding a new big goal. It displays a form asking for the
 *     "PO Number" (like a label, e.g., "PO1") and its "Description" (e.g., "Ability to work in a team").
 * 2.  It uses its own little notepad (`useState`) to remember what the user is typing.
 * 3.  When the user submits the form, it creates a new `ProgramOutcome` object.
 * 4.  It then adds this new PO to the main application data using the `setData` function
 *     from our "magic backpack" (AppContext), so that everyone knows about the new goal.
 */

import React, { useState } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { ProgramOutcome } from '../types'; // We get the blueprint for a 'ProgramOutcome' from our data dictionary.
import Modal from './Modal'; // We use our generic "popup" component as a base.

// This defines the "props" or properties this component needs from its parent.
interface AddProgramOutcomeModalProps {
  onClose: () => void; // A function to call to close the popup.
}

const AddProgramOutcomeModal: React.FC<AddProgramOutcomeModalProps> = ({ onClose }) => {
  // We get the tools and data we need from our "magic backpack". We need `selectedProgram`
  // to know which program this new PO belongs to.
  const { setData, selectedProgram } = useAppContext();
  
  // We create pieces of memory on our "notepad" (`useState`) to store what the user types.
  const [number, setNumber] = useState('');
  const [description, setDescription] = useState('');

  // This function runs when the user clicks the "Add PO" button.
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // Stop the page from reloading.
    if (!number.trim() || !description.trim() || !selectedProgram) {
      alert("Please fill out all fields.");
      return;
    }
    
    // We create a new "program outcome" object based on the blueprint from `types.ts`.
    const newPO: ProgramOutcome = {
      id: `po_manual_${Date.now()}`, // Create a unique ID based on the current time.
      programId: selectedProgram.id, // Use the currently selected program's ID.
      number: number.trim(), // The number the user typed.
      description: description.trim() // The description the user typed.
    };
    
    // We use our `setData` tool to add the new PO to the main list in our "magic backpack".
    setData(prev => ({
      ...prev,
      programOutcomes: [...prev.programOutcomes, newPO]
    }));
    
    onClose(); // We call the function to close the popup.
  };

  return (
    // We use our reusable `Modal` component as the frame for our popup.
    <Modal title="Add New Program Outcome" onClose={onClose}>
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">PO Number (e.g., PO1)</label>
          <input
            type="text"
            value={number} // The input's value is tied to our component's memory.
            onChange={e => setNumber(e.target.value)} // When the user types, we update the memory.
            className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={3}
            className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
        </div>
        <div className="flex justify-end pt-4 gap-3">
          <button type="button" onClick={onClose} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg">Cancel</button>
          <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg">Add PO</button>
        </div>
      </form>
    </Modal>
  );
};

export default AddProgramOutcomeModal;