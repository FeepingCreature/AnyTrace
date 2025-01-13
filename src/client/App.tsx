import React, { useState, useEffect } from 'react';
import { Flow } from '../types/config';

const App: React.FC = () => {
  const [flows, setFlows] = useState<Flow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFlows = async () => {
      try {
        const response = await fetch('/api/flows');
        if (!response.ok) {
          throw new Error('Failed to fetch flows');
        }
        const data = await response.json();
        setFlows(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchFlows();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="container">
      <h1>AnyTrace</h1>
      <div className="flows-list">
        <h2>Available Flows</h2>
        {flows.length === 0 ? (
          <p>No flows configured</p>
        ) : (
          <ul>
            {flows.map(flow => (
              <li key={flow.id} className="flow-item">
                <h3>{flow.name}</h3>
                <p>ID: {flow.id}</p>
                <p>Samplers: {flow.samplers.length}</p>
                <button onClick={() => console.log('Selected flow:', flow.id)}>
                  Start Trace
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default App;
