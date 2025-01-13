import React, { useState, useEffect, useMemo } from 'react';
import { Flow, Sampler } from '../types/config';
import TraceForm from './TraceForm';

const App: React.FC = () => {
  const [flows, setFlows] = useState<Flow[]>([]);
  const [samplers, setSamplers] = useState<Sampler[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFlow, setSelectedFlow] = useState<Flow | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [flowsResponse, samplersResponse] = await Promise.all([
          fetch('/api/flows'),
          fetch('/api/samplers')
        ]);
        
        if (!flowsResponse.ok || !samplersResponse.ok) {
          throw new Error('Failed to fetch data');
        }
        
        const [flowsData, samplersData] = await Promise.all([
          flowsResponse.json(),
          samplersResponse.json()
        ]);
        
        setFlows(flowsData);
        setSamplers(samplersData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredFlows = useMemo(() => {
    console.log('Filtering flows:', { flows, searchQuery });
    const filtered = flows.filter(flow => 
      flow.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      flow.id.toLowerCase().includes(searchQuery.toLowerCase())
    );
    console.log('Filtered flows:', filtered);
    return filtered;
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

      <div style={{marginBottom: '1rem'}}>
        Debug - Selected Flow: {selectedFlow ? JSON.stringify(selectedFlow) : 'null'}
      </div>
      <div className="flows-table">
        {filteredFlows.length === 0 ? (
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
              {filteredFlows.length === 0 ? (
                <tr>
                  <td colSpan={4} className="loading">No matching flows found</td>
                </tr>
              ) : filteredFlows.map(flow => (
                <tr key={flow.id}>
                  <td>{flow.name}</td>
                  <td>{flow.id}</td>
                  <td>{flow.samplers.length}</td>
                  <td>
                    <button 
                      className="button"
                      onClick={(e) => {
                        e.preventDefault();
                        console.log('Start Trace clicked for flow:', flow);
                        console.log('Current selectedFlow:', selectedFlow);
                        console.log('Setting selectedFlow state to:', flow);
                        setSelectedFlow(flow);
                        console.log('State set, selectedFlow should update');
                      }}
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

      {selectedFlow && (
        <TraceForm
          flow={selectedFlow}
          samplers={samplers}
          onClose={() => setSelectedFlow(null)}
          onSubmit={async (variables) => {
            console.log('Submitting trace:', { flowId: selectedFlow.id, variables });
            try {
              const response = await fetch('/api/trace', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  flowId: selectedFlow.id,
                  variables
                }),
              });
              
              if (!response.ok) {
                throw new Error('Failed to start trace');
              }
              
              const result = await response.json();
              console.log('Trace result:', result);
              alert('Trace completed successfully!');
              setSelectedFlow(null);
            } catch (err) {
              setError(err instanceof Error ? err.message : 'Failed to start trace');
            }
          }}
        />
      )}
    </div>
  );
};

export default App;
