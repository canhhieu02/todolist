import React from 'react';
import { renderToString } from 'react-dom/server';
import CalendarView from './src/components/CalendarView.jsx';

try {
  const html = renderToString(<CalendarView tasks={[]} />);
  console.log("RENDER SUCCESS. HTML length:", html.length);
} catch (e) {
  console.error("RENDER FAILED!");
  console.error(e.message);
  console.error(e.stack);
}
