/**
 * @file CourseDetail.tsx
 * @description
 * This component acts as the main "hub" or "container" for managing a single, specific course.
 * It doesn't have much logic itself; its primary job is to provide a tabbed interface and
 * render the correct component for the currently selected tab.
 *
 * How it works:
 * 1.  It uses the `useParams` hook from React Router to read the `courseId` from the URL.
 *     For example, in `/courses/C101`, it knows that `courseId` is "C101".
 * 2.  It finds the full course object from our main application data using this ID.
 * 3.  It keeps track of which tab is currently `activeTab` in its memory (state).
 * 4.  It displays a list of tab buttons. When a user clicks a button, it updates `activeTab`.
 * 5.  Based on the value of `activeTab`, it uses a `switch` statement to render the
 *     appropriate component (e.g., `ManageCourseOutcomes`, `CoPoMappingMatrix`, etc.).
 * 6.  It also performs a security check to ensure that a Teacher cannot view the details
 *     of a course they are not assigned to.
 */

import React, { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useAppContext } from '../hooks/useAppContext';
// Importing all the different components that will live inside the tabs.
import ManageCourseOutcomes from '../components/ManageCourseOutcomes';
import ManageCourseAssessments from '../components/ManageCourseAssessments';
import CoPoMappingMatrix from '../components/CoPoMappingMatrix';
import CourseOverviewTab from '../components/CourseOverviewTab';
import StudentCOAttainmentReport from './StudentCOAttainmentReport';
import CourseFacultyAssignment from '../components/CourseFacultyAssignment';
import CourseCoAttainment from '../components/CourseCoAttainment';
import { Course } from '../types';

// This defines the possible values for our `activeTab` state.
type Tab = 'Overview' | 'COs' | 'Assessments' | 'CO-PO Mapping' | 'CO Attainments' | 'Student Reports' | 'Faculty Assignment';

const CourseDetail: React.FC = () => {
  // `useParams` is a hook from React Router that gives us access to URL parameters.
  const { courseId } = useParams<{ courseId: string }>();
  // We get our app's data and the current user from the "magic backpack".
  const { data, currentUser } = useAppContext();
  // A piece of memory to remember which tab is currently active. Defaults to 'Overview'.
  const [activeTab, setActiveTab] = useState<Tab>('Overview');

  // Find the course object that matches the ID from the URL.
  // `useMemo` is used here for a small performance optimization.
  const course = useMemo(() => data.courses.find(c => c.id === courseId), [courseId, data.courses]);
  
  // --- Security Check ---
  // If the user is a Teacher, we check if they are actually assigned to this course.
  if (currentUser?.role === 'Teacher' && course && course.teacherId !== currentUser.id && (!course.sectionTeacherIds || !Object.values(course.sectionTeacherIds).includes(currentUser.id))) {
    // If they are not assigned, we show an "Access Denied" message and stop rendering.
    return (
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
            <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
            <p className="text-gray-500 mt-2">You are not assigned to this course.</p>
        </div>
    );
  }

  // If the course ID from the URL doesn't match any course in our data, show an error.
  if (!course) {
    return <div className="text-center text-red-500 p-8">Course not found.</div>;
  }

  // Check the user's role to determine which tabs they should see.
  const isCoordinator = currentUser?.role === 'Program Co-ordinator';
  const isAdmin = currentUser?.role === 'Admin';

  // This is the list of tabs that everyone can see.
  const tabs: Tab[] = ['Overview', 'COs', 'Assessments', 'CO-PO Mapping', 'CO Attainments'];

  // Only Coordinators and Admins can see the "Faculty Assignment" tab.
  if (isCoordinator || isAdmin) {
    tabs.push('Faculty Assignment');
  }
  
  // Everyone can see the student reports.
  tabs.push('Student Reports');


  /**
   * This function acts like a router for the tabs. It looks at the `activeTab`
   * and returns the correct component to display.
   */
  const renderContent = () => {
    switch (activeTab) {
      case 'Overview':
        return <CourseOverviewTab course={course} />;
      case 'COs':
        return <ManageCourseOutcomes />;
      case 'Assessments':
        return <ManageCourseAssessments course={course} />;
      case 'CO-PO Mapping':
        return <CoPoMappingMatrix />;
      case 'CO Attainments':
        return <CourseCoAttainment course={course} />;
      case 'Faculty Assignment':
        // A final check here to make sure only authorized roles see this content.
        return (isCoordinator || isAdmin) ? <CourseFacultyAssignment course={course} /> : null;
      case 'Student Reports':
        return <StudentCOAttainmentReport />;
      default:
        return null;
    }
  };

  // The JSX below describes the layout of the page.
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">{course.name} ({course.code})</h1>
          <p className="text-gray-500">Manage course details, outcomes, and assessments.</p>
        </div>
      </div>

      {/* The navigation bar for the tabs. */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
          {/* We loop through our `tabs` array and create a button for each one. */}
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)} // When a button is clicked, we update the `activeTab`.
              // This dynamically changes the button's style to highlight the active tab.
              className={`${
                activeTab === tab
                  ? 'border-indigo-500 text-indigo-600' // Style for the active tab
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300' // Style for inactive tabs
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>
      
      {/* This is where the content for the active tab will be rendered. */}
      <div className="bg-white p-6 rounded-lg shadow-md min-h-[400px]">
        {renderContent()}
      </div>
    </div>
  );
};


export default CourseDetail;