import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import '../styles/styles.css';

// Add event debugging
const originalAddEventListener = EventTarget.prototype.addEventListener;
EventTarget.prototype.addEventListener = function(type, listener, options) {
  console.log(`Event listener added - Type: ${type}, Target:`, this);
  return originalAddEventListener.call(this, type, listener, options);
};

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
