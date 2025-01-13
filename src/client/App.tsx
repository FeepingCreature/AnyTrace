import React, { useState, useEffect, useMemo } from 'react';
import { Flow } from '../types/config';

const App: React.FC = () => {
  const [flows, setFlows] = useState<Flow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

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

  const filteredFlows = useMemo(() => {
    return flows.filter(flow => 
      flow.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      flow.id.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [flows, searchQuery]);

  if (loading) {
    return <div className="container loading">Loading traces...</div>;
  }

  if (error) {
    return <div className="container">
      <div className="error">Error: {error}</div>
    </div>;
  }

  return (
    <div className="container">
      <div className="header">
        <h1>AnyTrace</h1>
      </div>
      
      <div className="search-bar">
        <input
          type="text"
          className="search-input"
          placeholder="Search flows by name or ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="flows-table">
        {flows.length === 0 ? (
          <div className="loading">No flows configured</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>ID</th>
                <th>Samplers</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredFlows.map(flow => (
                <tr key={flow.id}>
                  <td>{flow.name}</td>
                  <td>{flow.id}</td>
                  <td>{flow.samplers.length}</td>
                  <td>
                    <button 
                      className="button"
                      onClick={() => console.log('Selected flow:', flow.id)}
                    >
                      Start Trace
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default App;
