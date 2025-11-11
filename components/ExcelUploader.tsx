/**
 * @file ExcelUploader.tsx
 * @description
 * This file defines a reusable `ExcelUploader` component. It's a button that, when clicked,
 * opens a file selection window for the user to upload an Excel file.
 *
 * It handles the complex process of:
 * 1.  Hiding the ugly default file input and showing a nice button instead.
 * 2.  Reading the contents of the selected file.
 * 3.  Using an external library (`SheetJS/XLSX`) to parse the Excel data into a
 *     format (JSON) that our application can easily use.
 * 4.  Passing this parsed data back up to the parent component that used it.
 *
 * It's made "generic" with `<T>`, which means it can be told what "shape" of data
 * to expect from the Excel file, making it very flexible and safe to use.
 */

import React, { useRef, useCallback } from 'react';
import { Upload } from './Icons'; // Imports the upload icon image.

// This line tells our code that a library called `XLSX` will be available globally.
// This library is loaded from a `<script>` tag in `index.html`.
declare const XLSX: any;

// This defines the "props" or properties that the component accepts.
// The `<T>` makes it generic. `T` is a placeholder for a specific data type,
// like `{ code: string; name: string }`.
interface ExcelUploaderProps<T> {
    onFileUpload: (data: T[]) => void; // A function to call with the parsed data.
    label: string; // The text to display on the button (e.g., "Upload Excel").
    format: string; // A small help text to show below the button (e.g., "cols: code, name").
}

// This is the main component function.
function ExcelUploader<T>({ onFileUpload, label, format }: ExcelUploaderProps<T>) {
    // `useRef` is like creating a direct connection to an HTML element.
    // Here, we're creating a reference to the hidden file input element.
    const inputRef = useRef<HTMLInputElement>(null);

    // This function runs when the user selects a file.
    // `useCallback` is an optimization that prevents this function from being recreated
    // unless its dependencies (like `onFileUpload`) change.
    const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        // Get the first file from the list of selected files.
        const file = e.target.files?.[0];
        if (!file) return; // If no file was selected, do nothing.

        // `FileReader` is a built-in browser tool for reading files.
        const reader = new FileReader();

        // This function is called when the FileReader has finished reading the file.
        reader.onload = (event) => {
            try {
                // A safety check to make sure the `XLSX` library has loaded.
                if(typeof XLSX === 'undefined') {
                    alert('Excel library (SheetJS) is not loaded. Please check your internet connection or script tag.');
                    return;
                }
                // The file data is read as an "ArrayBuffer". We convert it into a format
                // that the XLSX library can understand.
                const data = new Uint8Array(event.target?.result as ArrayBuffer);
                // The XLSX library reads the raw data and creates a "workbook" object.
                const workbook = XLSX.read(data, { type: 'array' });
                // We get the name of the first sheet in the Excel file.
                const sheetName = workbook.SheetNames[0];
                // We get the actual worksheet object.
                const worksheet = workbook.Sheets[sheetName];
                // The library converts the worksheet into JSON (an array of objects).
                const json = XLSX.utils.sheet_to_json(worksheet);
                
                // We call the `onFileUpload` function provided by the parent component,
                // passing it the parsed JSON data. We tell TypeScript to trust that this
                // data has the shape of `<T>`.
                onFileUpload(json as T[]);

            } catch (error) {
                // If anything goes wrong during parsing, we show an error.
                console.error("Error parsing Excel file:", error);
                alert("Failed to parse the Excel file. Please ensure it's a valid format.");
            }
        };

        // Start reading the file.
        reader.readAsArrayBuffer(file);

        // This is a small trick to allow the user to upload the same file again if they want to.
        if (inputRef.current) {
            inputRef.current.value = ''; 
        }
    }, [onFileUpload]);

    // The JSX below describes what the component looks like.
    return (
        <div className="flex flex-col items-end">
            {/* This is the visible button. When it's clicked, it programmatically "clicks"
                the hidden file input. */}
            <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="px-4 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 flex items-center gap-2"
            >
                <Upload className="w-5 h-5" /> {label}
            </button>
            {/* This is the actual file input, but it's hidden from the user. */}
            <input
                type="file"
                ref={inputRef} // We connect our `useRef` reference to this element.
                onChange={handleFileChange} // This function runs when a file is selected.
                className="hidden"
                accept=".xlsx, .xls, .csv" // Only allow Excel and CSV files.
            />
            {/* This shows the small help text below the button. */}
            {format && <p className="text-xs text-gray-500 mt-1">{format}</p>}
        </div>
    );
};

export default ExcelUploader;
