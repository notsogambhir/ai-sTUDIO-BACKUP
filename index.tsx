/**
 * @file index.tsx
 * @description
 * This is the very first file that runs for our React application.
 * Think of it as the "ignition switch" that starts the engine.
 *
 * Its main jobs are:
 * 1.  Importing the necessary starter tools from React.
 * 2.  Importing our main `App` component and the `AppProvider` (our magic backpack).
 * 3.  Finding the one special `<div>` in `index.html` with the ID "root".
 * 4.  Telling React to render our entire application inside that `<div>`.
 * 5.  Setting up extra tools, like the library for drawing charts (`Chart.js`).
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { AppProvider } from './context/AppContext'; // Imports the "magic backpack" provider.
import App from './App'; // Imports the main "brain" of our app.
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

// This section is for setting up the Chart.js library, which we use to draw graphs.
// It's like telling the app, "Hey, if you need to draw a bar chart, you'll need these tools:
// an X-axis (CategoryScale), a Y-axis (LinearScale), the bars themselves (BarElement), etc."
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// This line looks for the HTML element in `index.html` that has the ID 'root'.
// This is the container where our entire app will live.
const rootElement = document.getElementById('root');
if (!rootElement) {
  // A safety check. If it can't find the 'root' container, it stops and shows an error.
  throw new Error("Could not find root element to mount to");
}

// This creates the main "root" for our React application, using the container we just found.
const root = ReactDOM.createRoot(rootElement);

// This is the final and most important step: `root.render()`.
// It tells React, "Take our App, put it inside the AppProvider, and render it all on the screen."
// - `<React.StrictMode>` is a helper that checks for potential problems in the app.
// - `<AppProvider>` is our "magic backpack" component. It wraps around the entire `App` so that
//   every component inside the app can access the shared data.
// - `<App />` is the main component of our application.
root.render(
  <React.StrictMode>
    <AppProvider>
      <App />
    </AppProvider>
  </React.StrictMode>
);
