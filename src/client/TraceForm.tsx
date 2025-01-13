import React, { useState } from 'react';
import { Flow, Variable, Sampler } from '../types/config';

interface TraceFormProps {
  flow: Flow;
  samplers: Sampler[];
  onClose: () => void;
  onSubmit: (variables: Record<string, string>) => void;
}

const TraceForm: React.FC<TraceFormProps> = ({ flow, samplers, onClose, onSubmit }) => {
  const [variables, setVariables] = useState<Record<string, string>>({});

  // Get all unique variables from the flow's samplers
  const uniqueVariables = flow.samplers
    .map(samplerId => samplers.find(s => s.id === samplerId))
    .filter((sampler): sampler is Sampler => sampler !== undefined)
    .flatMap(sampler => sampler.variables)
    .filter((variable, index, self) =>
      index === self.findIndex(v => v.name === variable.name)
    );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(variables);
  };

  return (
    <div className="trace-form-overlay">
      <div className="trace-form">
        <h2>Start Trace: {flow.name}</h2>
        <form onSubmit={handleSubmit}>
          {uniqueVariables.map((variable) => (
            <div key={variable.name} className="form-group">
              <label htmlFor={variable.name}>
                {variable.name}
                {variable.required && <span className="required">*</span>}
              </label>
              <input
                type="text"
                id={variable.name}
                value={variables[variable.name] || ''}
                onChange={(e) => setVariables({
                  ...variables,
                  [variable.name]: e.target.value
                })}
                required={variable.required}
              />
            </div>
          ))}
          <div className="form-actions">
            <button type="button" onClick={onClose} className="button secondary">
              Cancel
            </button>
            <button type="submit" className="button primary">
              Start Trace
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TraceForm;
