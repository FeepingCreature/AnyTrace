// DOM Elements
const searchInput = document.getElementById('searchInput');
const flowsTableBody = document.getElementById('flowsTableBody');

// Event Listeners
searchInput?.addEventListener('input', filterFlows);

// Fetch and display flows
async function fetchFlows() {
    try {
        const response = await fetch('/api/flows');
        const flows = await response.json();
        displayFlows(flows);
    } catch (error) {
        console.error('Failed to fetch flows:', error);
    }
}

function displayFlows(flowsToDisplay) {
    if (!flowsTableBody) return;
    
    flowsTableBody.innerHTML = flowsToDisplay.map(flow => `
        <tr onclick="window.location.href='/trace?flowId=${flow.id}'" style="cursor: pointer;">
            <td>${flow.name}</td>
            <td>${flow.samplers.length} samplers</td>
        </tr>
    `).join('');
}

function filterFlows() {
    const searchTerm = searchInput.value.toLowerCase();
    fetch('/api/flows')
        .then(response => response.json())
        .then(flows => {
            const filteredFlows = flows.filter(flow =>
                flow.name.toLowerCase().includes(searchTerm)
            );
            displayFlows(filteredFlows);
        })
        .catch(error => console.error('Failed to filter flows:', error));
}

// Initialize if we're on the index page
if (flowsTableBody) {
    fetchFlows();
}
