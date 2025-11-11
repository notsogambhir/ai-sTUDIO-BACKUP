/**
 * @file useAppContext.ts
 * @description
 * This file provides a simple "shortcut" or "helper" for using our app's shared data.
 *
 * In React, to use a context (our "magic backpack"), you typically have to import `useContext`
 * from React and the `AppContext` from our context file. This little helper function,
 * called a "custom hook", does both of those things for us in one go.
 *
 * So, instead of writing two import lines in every component that needs the shared data,
 * we can just write one: `import { useAppContext } from './hooks/useAppContext';`.
 *
 * It also includes an error check to make sure that we are only trying to use this
 * context within a component that is a child of the `AppProvider`. If not, it gives
 * a helpful error message.
 */

import { useContext } from 'react';
import { AppContext } from '../context/AppContext'; // Importing our actual "magic backpack".

/**
 * A custom hook to easily access the AppContext.
 * @returns The context value (all our shared data and functions).
 */
export const useAppContext = () => {
  // `useContext` is the React tool to look inside the "magic backpack".
  const context = useContext(AppContext);

  // If the component is not inside an `AppProvider`, the context will be `undefined`.
  // This is a safety check to prevent bugs and guide developers.
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }

  // If everything is okay, we return the context.
  return context;
};
