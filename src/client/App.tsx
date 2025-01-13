import React, { useState } from 'react';
import { TraceConfig } from '../types/trace';

const App: React.FC = () => {
  const [command, setCommand] = useState('');
  const [output, setOutput] = useState('');

  const handleTrace = async () => {
    try {
      const response = await fetch('/api/trace', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ command }),
      });
      
      const result = await response.json();
      setOutput(result.output);
    } catch (error) {
      console.error('Trace failed:', error);
    }
  };

  return (
    <div className="container">
      <h1>AnyTrace</h1>
      <div>
        <input
          type="text"
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          placeholder="Enter trace command"
        />
        <button onClick={handleTrace}>Execute Trace</button>
      </div>
      {output && (
        <pre>{output}</pre>
      )}
    </div>
  );
};

export default App;
