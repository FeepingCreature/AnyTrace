import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import '../styles/styles.css';

// Enable React event debugging
const eventsToLog = ['onClick', 'onMouseDown', 'onMouseUp', 'onClickCapture'];
eventsToLog.forEach(eventName => {
  const original = (React as any).__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.Events[0];
  (React as any).__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.Events[0] = (...args: any[]) => {
    console.log(`React ${eventName} event:`, args);
    return original(...args);
  };
});

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
