/**
 * @file PrintableReport.tsx
 * @description
 * This component acts as a "report preview" modal. It takes any content (passed as `children`),
 * displays it in a clean format, and provides a "Download PDF" button.
 *
 * It uses the jsPDF and html2canvas libraries to:
 * 1. Capture the report content as a high-quality image.
 * 2. Create a multi-page PDF document.
 * 3. Add the captured image to the PDF, splitting it across pages if necessary.
 * 4. Trigger a download of the generated PDF file.
 */

import React, { useState } from 'react';

// These lines tell TypeScript that we expect `jspdf` and `html2canvas` to be available
// globally, as they are loaded from script tags in `index.html`.
declare const jspdf: any;
declare const html2canvas: any;


// Defines the props this component accepts.
interface PrintableReportProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

const PrintableReport: React.FC<PrintableReportProps> = ({ title, onClose, children }) => {
  // A piece of memory to track whether the PDF is currently being generated.
  const [isDownloading, setIsDownloading] = useState(false);

  // This function handles the PDF generation and download.
  const handleDownloadPdf = async () => {
    // A safety check to ensure the required libraries are loaded.
    if (typeof jspdf === 'undefined' || typeof html2canvas === 'undefined') {
      alert('PDF generation libraries are not loaded. Please check your internet connection or script tags in index.html.');
      return;
    }

    setIsDownloading(true); // Show the "Downloading..." message on the button.
    const { jsPDF } = jspdf;
    
    // Find the HTML element that contains the report content we want to capture.
    const reportElement = document.getElementById('report-content-to-download');
    if (!reportElement) {
        setIsDownloading(false);
        return;
    }

    try {
      // Use html2canvas to "screenshot" the report content at a higher resolution (scale: 2).
      const canvas = await html2canvas(reportElement, { scale: 2 });
      const imgData = canvas.toDataURL('image/png'); // Convert the canvas to a PNG image.

      // Create a new PDF document in A4 size.
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Calculate the dimensions of the image and the PDF page.
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      
      // Calculate the ratio to maintain the image's aspect ratio when fitting it to the PDF width.
      const ratio = imgWidth / imgHeight;
      const widthInPdf = pdfWidth;
      const heightInPdf = widthInPdf / ratio;

      let position = 0;
      let heightLeft = heightInPdf;

      // Add the first page with the image.
      pdf.addImage(imgData, 'PNG', 0, position, widthInPdf, heightInPdf);
      heightLeft -= pdfHeight;

      // If the report is taller than one page, add more pages.
      while (heightLeft >= 0) {
        position = heightLeft - heightInPdf; // Adjust the position to show the next part of the image.
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, widthInPdf, heightInPdf);
        heightLeft -= pdfHeight;
      }
      
      // Trigger the download of the PDF file.
      pdf.save(`${title.replace(/\\s/g, '_')}.pdf`);

    } catch (error) {
        console.error("Error generating PDF:", error);
        alert("Sorry, there was an error generating the PDF.");
    } finally {
        setIsDownloading(false); // Reset the button text.
    }
  };


  return (
    // The full-screen, semi-transparent background overlay. The `print:hidden` class ensures this doesn't show up on paper.
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4 print:hidden">
      {/* The main white container for the report preview. */}
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[90vh] flex flex-col">
        {/* Header with title and controls */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200 flex-shrink-0">
          <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
          <div className="flex gap-4">
            <button
              onClick={handleDownloadPdf}
              disabled={isDownloading}
              className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-wait"
            >
              {isDownloading ? 'Downloading...' : 'Download PDF'}
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              aria-label="Close"
            >
              Close
            </button>
          </div>
        </div>
        {/* The scrollable content area where the actual report is previewed on screen. */}
        {/* We add an `id` here so that `html2canvas` knows exactly what to capture. */}
        <div id="report-content-to-download" className="flex-grow overflow-y-auto p-6 bg-white">
            {children}
        </div>
      </div>
    </div>
  );
};

export default PrintableReport;