/**
 * @file AttainmentReports.tsx
 * @description
 * This component serves as the central hub for generating all major reports in the application.
 * It features an interactive dashboard with tiles for selecting the report type, contextual
 * dropdowns for filtering, and a preview modal for generating and downloading reports.
 */

import React, { useState, useMemo } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import PrintableReport from '../components/PrintableReport';
import CourseAttainmentSummaryReport from '../components/reports/CourseAttainmentSummaryReport';
import AssessmentComparisonReport from '../components/reports/AssessmentComparisonReport';
import { PieChart, BookOpen } from '../components/Icons'; // Import icons for the tiles.

// Defines the types of reports the user can generate, along with their properties.
const reportTypes = [
    {
        id: 'course-attainment-summary',
        title: 'Course Attainment Summary',
        description: 'Overall CO attainment and a student-wise breakdown for a course or section.',
        icon: <PieChart />,
        requiresCourse: true,
        requiresScope: true,
    },
    {
        id: 'assessment-comparison',
        title: 'Assessment Comparison Report',
        description: 'Compare student performance side-by-side across all assessments in a course.',
        icon: <BookOpen />,
        requiresCourse: true,
        requiresScope: false,
    },
];

type ReportType = typeof reportTypes[number]['id'];

const AttainmentReports: React.FC = () => {
    // Get all data and user info from the "magic backpack".
    const { data, selectedProgram, currentUser } = useAppContext();

    // --- State Management for the Report Generation Form ---
    const [selectedReportId, setSelectedReportId] = useState<ReportType>(reportTypes[0].id);
    const [selectedCourseId, setSelectedCourseId] = useState<string>('');
    const [selectedScopeId, setSelectedScopeId] = useState<string>('overall');
    
    // `reportData` remembers the parameters for the report to be generated.
    // When this is not null, the `PrintableReport` modal is shown.
    const [reportData, setReportData] = useState<{ type: ReportType, courseId: string, scopeId: string } | null>(null);

    // `useMemo` is a smart calculator that gets the currently selected report's configuration.
    const selectedReportInfo = useMemo(() => reportTypes.find(r => r.id === selectedReportId)!, [selectedReportId]);

    // --- Data Filtering for Dropdowns ---
    const availableCourses = useMemo(() => {
        if (!selectedProgram) return [];
        if (currentUser?.role === 'Teacher') {
            return data.courses.filter(c =>
                c.programId === selectedProgram.id &&
                (c.teacherId === currentUser.id ||
                (c.sectionTeacherIds && Object.values(c.sectionTeacherIds).includes(currentUser.id)))
            );
        }
        return data.courses.filter(c => c.programId === selectedProgram.id);
    }, [data.courses, selectedProgram, currentUser]);

    const availableSections = useMemo(() => {
        if (!selectedCourseId) return [];
        const course = data.courses.find(c => c.id === selectedCourseId);
        if (!course) return [];

        const enrolledSectionIds = new Set(data.enrollments.filter(e => e.courseId === course.id && e.sectionId).map(e => e.sectionId!));
        const allCourseSections = data.sections.filter(s => enrolledSectionIds.has(s.id));

        if (currentUser?.role === 'Teacher') {
            const teacherId = currentUser.id;
            return allCourseSections.filter(section => {
                const sectionTeacher = course.sectionTeacherIds?.[section.id];
                return (sectionTeacher && sectionTeacher === teacherId) || (!sectionTeacher && course.teacherId === teacherId);
            });
        }
        
        return allCourseSections;
    }, [data.enrollments, data.sections, data.courses, selectedCourseId, currentUser]);


    // This runs when the "Generate Report" button is clicked.
    const handleGenerateReport = () => {
        if (selectedReportInfo.requiresCourse && !selectedCourseId) {
            alert('Please select a course for this report.');
            return;
        }
        // Set the report data, which will trigger the modal to open.
        setReportData({ type: selectedReportId, courseId: selectedCourseId, scopeId: selectedScopeId });
    };

    /**
     * This helper function renders the correct report component inside the modal.
     */
    const renderReportContent = () => {
        if (!reportData) return null;

        switch (reportData.type) {
            case 'course-attainment-summary':
                return <CourseAttainmentSummaryReport courseId={reportData.courseId} scopeId={reportData.scopeId} />;
            case 'assessment-comparison':
                return <AssessmentComparisonReport courseId={reportData.courseId} scopeId={reportData.scopeId} />;
            default:
                return <p>Invalid report type selected.</p>;
        }
    };
    
    const selectedCourseName = data.courses.find(c => c.id === reportData?.courseId)?.name || '';

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800">Attainment Reports</h1>
            
            {/* Step 1: Report Type Selection Tiles */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold text-gray-700 mb-4">1. Select a Report Type</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {reportTypes.map(report => (
                        <button
                            key={report.id}
                            onClick={() => setSelectedReportId(report.id)}
                            className={`p-4 border rounded-lg text-left transition-all duration-200 ${selectedReportId === report.id ? 'bg-indigo-50 border-indigo-500 ring-2 ring-indigo-500' : 'bg-white hover:bg-gray-50'}`}
                        >
                            <div className="flex items-center">
                                <div className={`p-2 rounded-lg ${selectedReportId === report.id ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-600'}`}>
                                    {React.cloneElement(report.icon, { className: "w-6 h-6" })}
                                </div>
                                <h3 className="ml-4 text-lg font-bold text-gray-800">{report.title}</h3>
                            </div>
                            <p className="mt-2 text-sm text-gray-600">{report.description}</p>
                        </button>
                    ))}
                </div>
            </div>

            {/* Step 2: Select Filters & Generate */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                 <h2 className="text-xl font-semibold text-gray-700 mb-4">2. Set Filters and Generate</h2>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Course Selection Dropdown */}
                    <div>
                        <label htmlFor="course-select" className="block text-sm font-medium text-gray-700">Course</label>
                        <select 
                            id="course-select" 
                            value={selectedCourseId} 
                            onChange={e => { setSelectedCourseId(e.target.value); setSelectedScopeId('overall'); }} 
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-white text-gray-900 border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md disabled:bg-gray-100 disabled:cursor-not-allowed"
                            disabled={!selectedReportInfo.requiresCourse}
                        >
                            <option value="">-- Select a Course --</option>
                            {availableCourses.map(course => (
                                <option key={course.id} value={course.id}>{course.code} - {course.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Scope (Section) Selection Dropdown */}
                    <div>
                        <label htmlFor="scope-select" className="block text-sm font-medium text-gray-700">Scope</label>
                        <select 
                            id="scope-select" 
                            value={selectedScopeId} 
                            onChange={e => setSelectedScopeId(e.target.value)} 
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-white text-gray-900 border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md disabled:bg-gray-100 disabled:cursor-not-allowed"
                            disabled={!selectedReportInfo.requiresScope || !selectedCourseId}
                        >
                            <option value="overall">Overall Course</option>
                            {availableSections.map(section => (
                                <option key={section.id} value={section.id}>Section {section.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="pt-6 text-right">
                    <button onClick={handleGenerateReport} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-lg text-lg">
                        Generate Report
                    </button>
                </div>
            </div>

            {/* The PrintableReport modal is only shown when `reportData` is not null. */}
            {reportData && (
                <PrintableReport
                    title={`${reportTypes.find(r=>r.id === reportData.type)?.title} - ${selectedCourseName}`}
                    onClose={() => setReportData(null)}
                >
                    {renderReportContent()}
                </PrintableReport>
            )}
        </div>
    );
};

export default AttainmentReports;