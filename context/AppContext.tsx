/**
 * @file AppContext.tsx
 * @description
 * This file is one of the most important in the application. It creates and manages
 * the "magic backpack" for the entire app, which we call a React Context.
 *
 * What is a "magic backpack" (Context)?
 * Imagine you have data (like the logged-in user) that many different components
 * need to know about. Instead of passing this data down through every single component
 * (parent to child to grandchild...), we can put it in this global backpack. Any
 * component, no matter how deep it is, can then just reach into the backpack and
 * get the data it needs.
 *
 * This file is responsible for:
 * 1. Creating the context (the backpack itself).
 * 2. Creating a "Provider" component that holds all the data and functions and makes them
 *    available to all child components wrapped inside it.
 * 3. Managing all the core "state" (memory) of the app, such as:
 *    - The entire application's data (loaded from mockData.json).
 *    - The `currentUser` who is logged in.
 *    - The `selectedProgram` and `selectedBatch`.
 * 4. Providing essential functions that can be used anywhere, like `login()`, `logout()`,
 *    and `setProgramAndBatch()`.
 */

import React, { createContext, useState, useCallback, useMemo, ReactNode, useEffect } from 'react';
// Imports the data "shapes" from our dictionary (types.ts) to ensure data consistency.
import { User, Program, College, AppData } from '../types';

// This defines what the "magic backpack" (AppContext) will contain.
// It's a list of all the data and tools that will be available to other components.
interface AppContextType {
  data: AppData; // All the app's data from mockData.json
  setData: React.Dispatch<React.SetStateAction<AppData>>; // A tool to update the data
  currentUser: User | null; // The logged-in user, or null if nobody is logged in
  selectedLoginCollege: College | null; // The college selected on the login screen
  selectedProgram: Program | null; // The program the user is currently looking at
  selectedBatch: string | null; // The batch the user has selected
  selectedCollegeId: string | null; // The college ID the user is currently viewing
  setSelectedCollegeId: React.Dispatch<React.SetStateAction<string | null>>; // Tool to change the selected college
  login: (username: string, password: string, college: College) => boolean; // The login function
  logout: () => void; // The logout function
  setProgramAndBatch: (program: Program, batch: string) => void; // Function to select a program/batch
  goBackToProgramSelection: () => void; // Function to clear program/batch selection
}

// Here, we create the actual "backpack". `createContext` is a function from React.
// It's initially empty (`undefined`).
export const AppContext = createContext<AppContextType | undefined>(undefined);

/**
 * This is the main component that manages all the state and logic. It only renders
 * its children *after* the initial data has been successfully loaded.
 * It receives the loaded data as a prop (`initialData`).
 */
const LoadedAppProvider: React.FC<{ children: ReactNode, initialData: AppData }> = ({ children, initialData }) => {
  // `useState` is a React Hook that gives a component its own memory.
  // It returns a piece of data and a function to update that data.
  
  // Memory for all application data (users, courses, etc.)
  const [data, setData] = useState<AppData>(initialData);
  // Memory for the currently logged-in user.
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  // Memory for the college chosen at the login screen.
  const [selectedLoginCollege, setSelectedLoginCollege] = useState<College | null>(null);
  // Memory for the program selected by the user.
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  // Memory for the batch selected by the user.
  const [selectedBatch, setSelectedBatch] = useState<string | null>(null);
  // Memory for the college selected in the sidebar (for Admin/University users).
  const [selectedCollegeId, setSelectedCollegeId] = useState<string | null>(null);

  /**
   * The login function. It checks if a user with the given credentials exists.
   * `useCallback` is an optimization that prevents this function from being recreated on every render.
   */
  const login = useCallback((username: string, password: string, college: College) => {
    // Find a user in our data that matches the provided username and password.
    const user = data.users.find(
      (u) =>
        u.username.toLowerCase() === username.toLowerCase() &&
        u.password === password
    );
    
    // If we found a matching user...
    if (user) {
      setCurrentUser(user); // Remember this user as the one who is logged in.
      setSelectedLoginCollege(college); // Remember the college they logged in with.

      // For Department users, we immediately set their selected college in the sidebar
      // so they can start working right away.
      if (user.role === 'Department' && user.collegeId) {
        setSelectedCollegeId(user.collegeId);
      }

      // If the user is not a high-level one, clear any previous program selection
      // to force them to pick a new one.
      if (user.role !== 'Admin' && user.role !== 'University' && user.role !== 'Department') {
        setSelectedProgram(null);
        setSelectedBatch(null);
      }
      return true; // Indicate that login was successful.
    }
    return false; // Indicate that login failed.
  }, [data.users]);

  /**
   * The logout function. It clears all user-specific data from memory.
   */
  const logout = useCallback(() => {
    setCurrentUser(null);
    setSelectedLoginCollege(null);
    setSelectedProgram(null);
    setSelectedBatch(null);
    setSelectedCollegeId(null);
  }, []);

  /**
   * This function is called when a user selects a program and a batch.
   */
  const setProgramAndBatch = useCallback((program: Program, batch: string) => {
    setSelectedProgram(program); // Remember the selected program.
    setSelectedBatch(batch); // Remember the selected batch.
    setSelectedCollegeId(program.collegeId); // Also update the selected college to match the program.
  }, []);

  /**
   * This function clears the program/batch selection, usually to send the user
   * back to the program selection screen.
   */
  const goBackToProgramSelection = useCallback(() => {
    setSelectedProgram(null);
    setSelectedBatch(null);
  }, []);

  // `useMemo` is another optimization. It bundles up all the context values and only
  // rebuilds the bundle if one of the values inside has actually changed.
  const value = useMemo(
    () => ({
      data,
      setData,
      currentUser,
      login,
      logout,
      selectedLoginCollege,
      selectedProgram,
      selectedBatch,
      setProgramAndBatch,
      goBackToProgramSelection,
      selectedCollegeId,
      setSelectedCollegeId,
    }),
    [
      data,
      currentUser,
      login,
      logout,
      selectedLoginCollege,
      selectedProgram,
      selectedBatch,
      setProgramAndBatch,
      goBackToProgramSelection,
      selectedCollegeId,
    ]
  );

  // This is the magic part. The `AppContext.Provider` component makes the `value`
  // (our bundle of data and functions) available to all `children` components.
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};


/**
 * This is the component that gets exported and used in `index.tsx`.
 * Its only job is to load the initial data from the fake database (`mockData.json`)
 * and show a loading screen while it's waiting. Once the data is loaded, it
 * renders the `LoadedAppProvider` with that data.
 */
export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // A piece of memory to hold the data once it's loaded from the file. Starts as `null`.
  const [initialData, setInitialData] = useState<AppData | null>(null);

  // `useEffect` is a hook that runs code "on the side" after the component renders.
  // An empty dependency array `[]` means this code runs only once when the component first appears.
  useEffect(() => {
    // We use the browser's `fetch` API to load our local JSON file.
    fetch('./mockData.json')
      .then(res => res.json()) // Convert the response to JSON format.
      .then(jsonData => {
        setInitialData(jsonData); // Store the loaded data in our component's memory.
      })
      .catch(error => console.error("Failed to load mock data:", error)); // Handle any errors.
  }, []);

  // While we're waiting for the data to load (`initialData` is still `null`),
  // we show a friendly loading screen.
  if (!initialData) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
          <div className="text-center">
              <img src="https://d1hbpr09pwz0sk.cloudfront.net/logo_url/chitkara-university-4c35e411" alt="Logo" className="h-20 mx-auto mb-4 animate-pulse" />
              <p className="text-xl font-semibold text-gray-700">Loading Portal...</p>
          </div>
      </div>
    );
  }

  // Once `initialData` has been loaded, we render the main provider and pass the data to it.
  return <LoadedAppProvider initialData={initialData}>{children}</LoadedAppProvider>;
};
