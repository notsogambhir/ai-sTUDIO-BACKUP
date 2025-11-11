/**
 * @file BatchSelectionModal.tsx
 * @description
 * This file defines the `BatchSelectionModal` component. It's the popup window that
 * appears after a user selects a program on the `ProgramSelectionScreen`.
 *
 * Its main job is to:
 * 1.  Show the name of the program the user selected.
 * 2.  Display a dropdown list of available batches for that specific program.
 * 3.  Allow the user to select a batch and click "Proceed".
 * 4.  When the user proceeds, it calls a function from our "magic backpack" (AppContext)
 *     to save the selected program and batch, allowing the user to enter the main application.
 */

import React, { useMemo, useState } from 'react';
import { useAppContext } from '../hooks/useAppContext'; // Helper to get shared data.
import { Program } from '../types'; // Imports the `Program` type from our data dictionary.

// This defines the "props" or properties that this component accepts.
interface BatchSelectionModalProps {
  program: Program; // The program that the user selected.
  onClose: () => void; // A function to call to close the modal.
}

// This is the main component function for the Batch Selection Modal.
const BatchSelectionModal: React.FC<BatchSelectionModalProps> = ({ program, onClose }) => {
    // We ask our "magic backpack" (AppContext) for the data and tools we need.
    const { data, setProgramAndBatch } = useAppContext();
    
    // `useMemo` is a performance helper. It only recalculates this list of batches
    // when the program changes, preventing unnecessary work.
    const availableBatches = useMemo(() => {
        // We filter all batches in our data to find the ones that match the selected program's ID.
        return data.batches
            .filter(b => b.programId === program.id)
            .sort((a,b) => b.name.localeCompare(a.name)); // We sort them to show the newest first.
    }, [data.batches, program.id]);

    // `useState` gives the component its own memory. Here, we're remembering which
    // batch is currently selected in the dropdown. We default to the first available batch.
    const [batch, setBatch] = useState(availableBatches.length > 0 ? availableBatches[0].name : "");

    // This function runs when the user clicks the "Proceed" button.
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault(); // Prevents the browser from reloading the page.
        if (!batch) {
            alert("Please select a batch.");
            return;
        }
        // This is the most important step: we call the function from our magic backpack
        // to save the selected program and batch globally for the whole app.
        setProgramAndBatch(program, batch);
        onClose(); // Close the modal.
    }

    // The JSX below describes what the modal looks like.
    return (
        // This is the semi-transparent background for the modal.
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            {/* This is the white content box of the modal. */}
            <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-sm">
                <h2 className="text-2xl font-bold mb-2">Select Batch</h2>
                <p className="mb-6 text-gray-600">For Program: <span className="font-semibold">{program.name}</span></p>
                
                {/* We only show the form if there are batches available. */}
                {availableBatches.length > 0 ? (
                    <form onSubmit={handleSubmit}>
                        <label htmlFor="batch-select" className="block text-sm font-medium text-gray-700">Batch Year</label>
                        <select
                            id="batch-select"
                            value={batch} // The dropdown's value is tied to our component's memory.
                            onChange={(e) => setBatch(e.target.value)} // When the user changes it, we update the memory.
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base text-gray-900 bg-white border border-gray-300 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm rounded-md"
                        >
                            {/* We loop through the available batches and create an <option> for each one. */}
                            {availableBatches.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
                        </select>
                        <div className="mt-6 flex justify-end gap-4">
                            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancel</button>
                            <button type="submit" className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">Proceed</button>
                        </div>
                    </form>
                ) : (
                    // If there are no batches, we show a helpful message instead.
                    <div>
                        <p className="text-center text-gray-500 bg-yellow-50 p-4 rounded-md">
                            No batches have been created for this program yet. Please contact an Administrator to set up batches.
                        </p>
                        <div className="mt-6 flex justify-end">
                             <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Close</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BatchSelectionModal;
