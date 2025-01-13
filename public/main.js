// State management
let flows = [];
let currentFlow = null;

// DOM Elements
const searchInput = document.getElementById('searchInput');
const flowsTableBody = document.getElementById('flowsTableBody');
const traceFormOverlay = document.getElementById('traceFormOverlay');
const traceForm = document.getElementById('traceForm');

// Event Listeners
searchInput.addEventListener('input', filterFlows);
traceForm.addEventListener('submit', handleTraceSubmit);

// Fetch and display flows
async function fetchFlows() {
    try {
        const response = await fetch('/api/flows');
        flows = await response.json();
        displayFlows(flows);
    } catch (error) {
        console.error('Failed to fetch flows:', error);
    }
}

function displayFlows(flowsToDisplay) {
    flowsTableBody.innerHTML = flowsToDisplay.map(flow => `
        <tr>
            <td>${flow.name}</td>
            <td>
                <button class="button primary" onclick="window.showTraceForm('${flow.id}')">
                    Execute
                </button>
            </td>
        </tr>
    `).join('');
}

function filterFlows() {
    const searchTerm = searchInput.value.toLowerCase();
    const filteredFlows = flows.filter(flow =>
        flow.name.toLowerCase().includes(searchTerm)
    );
    displayFlows(filteredFlows);
}

// Expose function globally
window.showTraceForm = async function(flowId) {
    currentFlow = flows.find(f => f.id === flowId);
    if (!currentFlow) return;

    try {
        const response = await fetch('/api/samplers');
        const samplers = await response.json();

        // Get unique variables from all samplers in the flow
        const variables = new Set();
        currentFlow.samplers.forEach(samplerId => {
            const sampler = samplers.find(s => s.id === samplerId);
            if (sampler) {
                sampler.variables.forEach(v => variables.add(JSON.stringify(v)));
            }
        });

        // Generate form fields
        traceForm.innerHTML = `
            ${Array.from(variables).map(v => {
                const variable = JSON.parse(v);
                return `
                    <div class="form-group">
                        <label>
                            ${variable.name}
                            ${variable.required ? '<span class="required">*</span>' : ''}
                        </label>
                        <input
                            type="text"
                            name="${variable.name}"
                            ${variable.required ? 'required' : ''}
                        >
                    </div>
                `;
            }).join('')}
            <div class="form-actions">
                <button type="button" class="button secondary" onclick="hideTraceForm()">
                    Cancel
                </button>
                <button type="submit" class="button primary">
                    Execute
                </button>
            </div>
        `;

        traceFormOverlay.style.display = 'flex';
    } catch (error) {
        console.error('Failed to fetch samplers:', error);
    }
}

function hideTraceForm() {
    traceFormOverlay.style.display = 'none';
    currentFlow = null;
}

async function handleTraceSubmit(event) {
    event.preventDefault();

    if (!currentFlow) return;

    const formData = new FormData(traceForm);
    const variables = {};
    for (const [key, value] of formData.entries()) {
        variables[key] = value;
    }

    try {
        const queryString = new URLSearchParams({
            flowId: currentFlow.id,
            ...variables
        }).toString();
        window.location.href = `/trace?${queryString}`;
    } catch (error) {
        console.error('Failed to execute trace:', error);
    }
}

// Initialize
fetchFlows();
