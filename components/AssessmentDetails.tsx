/**
 * @file AssessmentDetails.tsx
 * @description
 * This component is the detailed management view for a single assessment. It's one of the most
 * complex components in the application, handling multiple user interactions and data operations.
 *
 * What it does:
 * 1.  **Displays Assessment Info**: Shows the name of the assessment.
 * 2.  **Manages Questions**:
 *     - Allows users to add, edit, and delete questions for the assessment.
 *     - Allows bulk-uploading questions from an Excel file.
 * 3.  **CO Mapping**: Provides a table where each question can be mapped to one or more
 *     Course Outcomes (COs) using checkboxes.
 * 4.  **Manages Student Marks**:
 *     - Provides a "Download Template" button that generates an Excel file with the correct
 *       student list and question columns, ready for filling in marks.
 *     - Provides an "Upload Marks" button that parses a filled-in Excel template and saves
 *       the student scores to the application's state.
 * 5.  **Draft State**: Like other management screens, it uses a "draft state" for all question
 *     and CO mapping changes. These changes are only saved when the user clicks "Save Changes"
 *     in the `SaveBar`. Note: Mark uploads are saved immediately.
 */

import React, { useState, useMemo, useEffect } from 'react';
import { Assessment, AssessmentQuestion, Mark, MarkScore, Course } from '../types';
import { useAppContext } from '../hooks/useAppContext';
import ExcelUploader from './ExcelUploader';
import { PlusCircle, Trash2, Download, ChevronUp, Edit } from './Icons';
import SaveBar from './SaveBar';
import ConfirmationModal from './ConfirmationModal';

// This line tells our code that a library called `XLSX` will be available globally.
// This library is loaded from a `<script>` tag in `index.html`.
declare const XLSX: any;

// This defines the "props" or properties that this component accepts.
interface AssessmentDetailsProps {
  assessmentId: string; // The ID of the assessment we are managing.
  onBack: () => void; // A function to call to go back to the assessment list.
  course: Course; // The parent course, needed for context like finding COs.
}

const AssessmentDetails: React.FC<AssessmentDetailsProps> = ({ assessmentId, onBack, course }) => {
    // Get all the data and tools from our "magic backpack".
    const { data, setData, currentUser } = useAppContext();
    const canManage = currentUser?.role === 'Teacher' || currentUser?.role === 'Program Co-ordinator';
    
    // State for the "Are you sure?" confirmation popup.
    const [confirmation, setConfirmation] = useState<{
        isOpen: boolean; title: string; message: string; onConfirm: () => void;
    } | null>(null);

    // `useMemo` is a "smart calculator" that finds the full assessment object from our data.
    const assessment = useMemo(() => data.assessments.find(a => a.id === assessmentId), [data.assessments, assessmentId]);

    // --- State Management for Drafts ---
    // `draftQuestions` is the temporary copy of questions we make changes to.
    const [draftQuestions, setDraftQuestions] = useState<AssessmentQuestion[]>([]);
    // `initialQuestions` is the saved version, used for comparison to see if there are unsaved changes.
    const [initialQuestions, setInitialQuestions] = useState<AssessmentQuestion[]>([]);
    // State for handling inline editing of a question.
    const [editingQuestion, setEditingQuestion] = useState<{ originalQ: string; name: string; maxMarks: number } | null>(null);

    // This `useEffect` hook loads the assessment's questions into our draft states when the component first appears.
    useEffect(() => {
        if (assessment) {
            setDraftQuestions(assessment.questions);
            setInitialQuestions(assessment.questions);
        }
    }, [assessment]);

    // `isDirty` checks if there are unsaved changes by comparing the draft to the initial state.
    const isDirty = useMemo(() => JSON.stringify(initialQuestions) !== JSON.stringify(draftQuestions), [initialQuestions, draftQuestions]);

    // This `useMemo` automatically calculates the name for the next question (e.g., "Q3").
    const nextQName = useMemo(() => {
        if (!draftQuestions) return 'Q1';
        const highestNum = draftQuestions.reduce((max, q) => {
            const num = parseInt(q.q.replace('Q', ''), 10);
            return !isNaN(num) && num > max ? num : max;
        }, 0);
        return `Q${highestNum + 1}`;
    }, [draftQuestions]);
    
    // State for the "Add New Question" form fields.
    const [newQName, setNewQName] = useState(nextQName);
    const [newQMaxMarks, setNewQMaxMarks] = useState(10);
    
    // This effect keeps the `newQName` field up-to-date.
    useEffect(() => {
        setNewQName(nextQName);
    }, [nextQName]);
    
    // Safety check: if the assessment or course can't be found, show an error.
    if (!assessment || !course) {
        return (
            <div>
                <p className="text-red-500">Assessment or associated course not found.</p>
                <button onClick={onBack} className="mt-4 flex items-center text-indigo-600 hover:text-indigo-800">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                    Back to Assessments
                </button>
            </div>
        );
    }
    
    // Get the list of COs that belong to this course, which we'll need for mapping.
    const courseOutcomes = data.courseOutcomes.filter(co => co.courseId === course.id);

    // This function runs when the "Download Template" button is clicked.
    const handleDownloadTemplate = () => {
        // Find all students who are enrolled in this assessment's specific section.
        const studentIdsForSection = new Set(data.enrollments.filter(e => e.sectionId === assessment.sectionId).map(e => e.studentId));
        const activeEnrolledStudents = data.students.filter(s => s.status === 'Active' && studentIdsForSection.has(s.id)).sort((a, b) => a.id.localeCompare(b.id));

        // Get the headers for the questions from our draft state.
        const questionHeaders = draftQuestions.map(q => q.q).sort((a, b) => parseInt(a.substring(1)) - parseInt(b.substring(1)));

        // Create the data for the Excel sheet, with one row per student.
        const templateData = activeEnrolledStudents.map(student => {
            const studentRow: { [key: string]: string | number } = { 'Student ID': student.id, 'Student Name': student.name };
            questionHeaders.forEach(header => { studentRow[header] = ''; }); // Leave mark columns empty.
            return studentRow;
        });
        
        // Use the SheetJS library (`XLSX`) to create and download the Excel file.
        try {
            if (typeof XLSX === 'undefined') { alert('Excel library (SheetJS) is not loaded.'); return; }
            const worksheet = XLSX.utils.json_to_sheet(templateData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Marks Template');
            const fileName = `Marks-Template-${course?.code || 'Course'}-${assessment.name}.xlsx`.replace(/\s+/g, '_');
            XLSX.writeFile(workbook, fileName);
        } catch (error) {
            console.error("Error generating Excel template:", error);
            alert("Failed to generate the Excel template.");
        }
    };

    // This function is called by the "Upload Questions" ExcelUploader.
    const handleQuestionsUpload = (uploadedData: { q: string; maxMarks: string | number }[]) => {
      // Convert the uploaded data into proper `AssessmentQuestion` objects.
      const newQuestions: AssessmentQuestion[] = uploadedData
          .filter(row => row.q && row.maxMarks && !isNaN(Number(row.maxMarks)) && Number(row.maxMarks) > 0)
          .map(row => ({ q: String(row.q).trim(), maxMarks: Number(row.maxMarks), coIds: [] }));

      // Add the new questions to our draft, making sure not to add duplicates.
      setDraftQuestions(prevDraft => {
        const existingQNames = new Set(prevDraft.map(q => q.q.toLowerCase()));
        const uniqueNewQs = newQuestions.filter(nq => !existingQNames.has(nq.q.toLowerCase()));
        alert(`${uniqueNewQs.length} new questions staged. ${newQuestions.length - uniqueNewQs.length} duplicates ignored. Click 'Save Changes' to commit.`);
        return [...prevDraft, ...uniqueNewQs];
      });
    };

    // This function is called by the "Upload Marks" ExcelUploader.
    const handleMarksUpload = (uploadedData: any[]) => {
      const studentIdsInSection = new Set(data.enrollments.filter(e => e.sectionId === assessment.sectionId).map(e => e.studentId));

      // This update happens immediately, not in a draft state.
      setData(prev => {
          let updatedMarks = [...prev.marks]; // Make a copy of the marks data.

          // Go through each row in the uploaded Excel file.
          uploadedData.forEach(row => {
              const studentIdKey = Object.keys(row).find(key => key.toLowerCase().includes('id'));
              if (!studentIdKey) return; // Skip if no student ID column is found.
              const studentId = String(row[studentIdKey]);
              if (!studentId || !studentIdsInSection.has(studentId)) return; // Skip if the student isn't in this section.

              // Find or create a mark entry for this student and this assessment.
              let markEntryIndex = updatedMarks.findIndex(m => m.studentId === studentId && m.assessmentId === assessment.id);
              let studentMarkEntry: Mark = markEntryIndex === -1
                  ? { studentId, assessmentId: assessment.id, scores: [] }
                  : { ...updatedMarks[markEntryIndex], scores: [...updatedMarks[markEntryIndex].scores] };

              // Go through each column (e.g., "Q1", "Q2") in the row.
              Object.keys(row).forEach(qName => {
                  if (draftQuestions.some(q => q.q === qName)) { // If this column is a valid question...
                      const score: MarkScore = { q: qName, marks: Number(row[qName]) };
                      const scoreIndex = studentMarkEntry.scores.findIndex(s => s.q === qName);
                      if (scoreIndex > -1) studentMarkEntry.scores[scoreIndex] = score; // Update existing score.
                      else studentMarkEntry.scores.push(score); // Add new score.
                  }
              });

              // Put the updated mark entry back into our list.
              if (markEntryIndex === -1) updatedMarks.push(studentMarkEntry);
              else updatedMarks[markEntryIndex] = studentMarkEntry;
          });
          // Return the new state for the whole application.
          return { ...prev, marks: updatedMarks };
      });
      alert(`Marks processed for ${uploadedData.length} students.`);
    };

    // --- Handlers for Adding/Editing/Removing Questions in the Draft ---
    const handleAddQuestion = () => {
        const newQuestion: AssessmentQuestion = { q: newQName.trim(), maxMarks: Number(newQMaxMarks), coIds: [] };
        setDraftQuestions(prev => [...prev, newQuestion]);
        setNewQMaxMarks(10);
    };

    const handleRemoveQuestion = (questionNameToDelete: string) => {
        setConfirmation({
            isOpen: true, title: 'Delete Question',
            message: `Are you sure you want to delete this question? All student marks for this question will also be removed. This change will be applied when you save.`,
            onConfirm: () => {
                setDraftQuestions(prev => prev.filter(q => q.q !== questionNameToDelete));
                setConfirmation(null);
            },
        });
    };
    
    const handleCoMappingChange = (qName: string, coId: string, isChecked: boolean) => {
      setDraftQuestions(prevQs => prevQs.map(q => 
          q.q === qName ? { ...q, coIds: isChecked ? [...q.coIds, coId] : q.coIds.filter(id => id !== coId) } : q
      ));
    };

    const handleEditStart = (q: AssessmentQuestion) => setEditingQuestion({ originalQ: q.q, name: q.q, maxMarks: q.maxMarks });
    const handleEditCancel = () => setEditingQuestion(null);
    const handleEditSave = () => {
      if (!editingQuestion) return;
      const { originalQ, name: newName, maxMarks } = editingQuestion;
      setDraftQuestions(prev => prev.map(q => q.q === originalQ ? { ...q, q: newName.trim(), maxMarks } : q));
      setEditingQuestion(null);
    };

    // --- Handlers for the SaveBar ---
    const handleSave = () => {
        setData(prev => {
            // Update the assessment in the main data with our draft questions.
            const updatedAssessments = prev.assessments.map(a => 
                a.id === assessment.id ? { ...a, questions: draftQuestions } : a
            );
            
            // Also, if any questions were deleted, we need to remove their scores from the marks data.
            const oldQuestionNames = new Set(initialQuestions.map(q => q.q));
            const newQuestionNames = new Set(draftQuestions.map(q => q.q));
            const deletedQuestionNames = [...oldQuestionNames].filter(name => !newQuestionNames.has(name));
            const updatedMarks = prev.marks.map(mark => {
                if (mark.assessmentId === assessment.id) {
                    const updatedScores = mark.scores.filter(score => !deletedQuestionNames.includes(score.q));
                    return { ...mark, scores: updatedScores };
                }
                return mark;
            }).filter(mark => mark.scores.length > 0 || mark.assessmentId !== assessment.id);

            return { ...prev, assessments: updatedAssessments, marks: updatedMarks };
        });
        setInitialQuestions(draftQuestions); // Reset the "dirty" check.
        alert("Questions and CO mappings saved!");
    };

    const handleCancel = () => {
        setDraftQuestions(initialQuestions); // Discard changes.
        setEditingQuestion(null);
    };

    return (
        <div className="space-y-6 pb-20">
            {/* Header section */}
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Manage: {assessment.name}</h2>
                <button onClick={onBack} className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold">
                    <ChevronUp className="w-5 h-5 mr-2" />
                    Back to List
                </button>
            </div>
            
            {/* Marks Upload Section */}
            <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Upload Student Marks</h3>
                 <div className="flex items-start gap-4">
                    <button type="button" onClick={handleDownloadTemplate} className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 flex items-center gap-2">
                        <Download className="w-5 h-5" /> Download Template
                    </button>
                    <ExcelUploader<any> onFileUpload={handleMarksUpload} label="Upload Marks" format="cols: id, name, Q1, Q2..." />
                </div>
            </div>

            {/* Questions Management Section */}
            <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
                 {canManage && (
                    <div className="pb-4 mb-4 border-b border-gray-200">
                        <h4 className="text-lg font-semibold text-gray-700 mb-2">Bulk Upload Questions</h4>
                        <ExcelUploader<{ q: string; maxMarks: string | number }> onFileUpload={handleQuestionsUpload} label="Upload Questions" format="columns: q, maxMarks" />
                    </div>
                )}
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Manage Questions & CO Mapping</h3>
                {/* The main table for questions and CO mapping */}
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Question</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Max Marks</th>
                            {courseOutcomes.map(co => (
                                <th key={co.id} className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">{co.number}</th>
                            ))}
                            {canManage && <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {/* Loop through draft questions to display them */}
                        {draftQuestions.map(q => (
                            <tr key={q.q}>
                              {editingQuestion?.originalQ === q.q ? (
                                <> {/* Inline editing UI */}
                                  <td className="px-4 py-2"><input type="text" value={editingQuestion.name} onChange={e => setEditingQuestion({...editingQuestion, name: e.target.value})} className="w-full p-2 border rounded-md" /></td>
                                  <td className="px-4 py-2"><input type="number" value={editingQuestion.maxMarks} onChange={e => setEditingQuestion({...editingQuestion, maxMarks: Number(e.target.value)})} className="w-24 p-2 border rounded-md" /></td>
                                  <td colSpan={courseOutcomes.length}></td>
                                  <td className="px-4 py-2 text-right whitespace-nowrap">
                                      <button onClick={handleEditSave} className="text-green-600 font-semibold mr-2">Apply</button>
                                      <button onClick={handleEditCancel} className="text-gray-600">Cancel</button>
                                  </td>
                                </>
                              ) : (
                                <> {/* Standard display UI */}
                                  <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{q.q}</td>
                                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600">{q.maxMarks}</td>
                                  {courseOutcomes.map(co => (
                                      <td key={co.id} className="px-4 py-2 text-center">
                                          <input type="checkbox" checked={q.coIds.includes(co.id)} onChange={(e) => canManage && handleCoMappingChange(q.q, co.id, e.target.checked)} disabled={!canManage} className="h-4 w-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500 disabled:opacity-50" />
                                      </td>
                                  ))}
                                  {canManage && (
                                      <td className="px-4 py-2 text-right">
                                          <button onClick={() => handleEditStart(q)} aria-label={`Edit question ${q.q}`} className="text-indigo-600 hover:text-indigo-800 p-1 mr-1"><Edit className="w-5 h-5" /></button>
                                          <button onClick={() => handleRemoveQuestion(q.q)} aria-label={`Delete question ${q.q}`} className="text-red-600 hover:text-red-800 p-1"><Trash2 className="w-5 h-5" /></button>
                                      </td>
                                  )}
                                </>
                              )}
                            </tr>
                        ))}
                        {/* "Add New Question" form row */}
                        {canManage && !editingQuestion && (
                            <tr className="bg-gray-50">
                                <td className="px-4 py-2"><input type="text" value={newQName} readOnly className="w-full p-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500 cursor-not-allowed focus:ring-0 focus:border-gray-300" /></td>
                                <td className="px-4 py-2"><input type="number" value={newQMaxMarks} onChange={e => setNewQMaxMarks(Number(e.target.value))} className="w-24 p-2 border border-gray-300 rounded-md bg-white text-gray-900" /></td>
                                <td colSpan={courseOutcomes.length}></td>
                                <td className="px-4 py-2 text-right"><button onClick={handleAddQuestion} aria-label="Add new question" className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700"><PlusCircle className="w-5 h-5" /></button></td>
                            </tr>
                        )}
                    </tbody>
                    </table>
                </div>
            </div>
            {/* The SaveBar and ConfirmationModal */}
            <SaveBar isDirty={isDirty} onSave={handleSave} onCancel={handleCancel} />
            {confirmation && (<ConfirmationModal isOpen={confirmation.isOpen} title={confirmation.title} message={confirmation.message} onConfirm={confirmation.onConfirm} onClose={() => setConfirmation(null)}/>)}
        </div>
    );
};

export default AssessmentDetails;