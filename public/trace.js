// Get parameters from URL
const params = new URLSearchParams(window.location.search);
const flowId = params.get('flowId');

if (!flowId) {
    window.location.href = '/';
}

// DOM Elements
const samplersList = document.getElementById('samplersList');

// EventSource for updates
const events = new EventSource(`/api/trace/events?${params.toString()}`);

events.onmessage = (event) => {
    const update = JSON.parse(event.data);

    if (update.error) {
        console.error('Trace error:', update.error);
        events.close();
        return;
    }

    if (update.done) {
        events.close();
        return;
    }

    updateSamplerStatus(update);
};

events.onerror = (error) => {
    console.error('EventSource error:', error);
    events.close();
};

// Initialize trace view
async function initializeTrace() {
    try {
        const response = await fetch(`/api/trace/${traceId}`);
        const trace = await response.json();

        samplersList.innerHTML = trace.samplers.map(sampler => `
            <div class="sampler-item" id="sampler-${sampler.id}">
                <div class="sampler-header">
                    <span class="sampler-status pending">
                        <svg class="icon" viewBox="0 0 24 24">
                            <circle class="spinner" cx="12" cy="12" r="10" />
                        </svg>
                    </span>
                    <h3>${sampler.name}</h3>
                </div>
                <div class="sampler-output" style="display: none;">
                    <pre><code></code></pre>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Failed to initialize trace:', error);
    }
}

function updateSamplerStatus(update) {
    const samplerElement = document.getElementById(`sampler-${update.samplerId}`);
    if (!samplerElement) return;

    const statusElement = samplerElement.querySelector('.sampler-status');
    const outputElement = samplerElement.querySelector('.sampler-output');
    const codeElement = outputElement.querySelector('code');

    statusElement.className = `sampler-status ${update.status}`;

    // Update status icon
    if (update.status === 'success') {
        statusElement.innerHTML = `
            <svg class="icon" viewBox="0 0 24 24">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
            </svg>
        `;
    } else if (update.status === 'error') {
        statusElement.innerHTML = `
            <svg class="icon" viewBox="0 0 24 24">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
        `;
    }

    // Show output if available
    if (update.output || update.error) {
        outputElement.style.display = 'block';
        codeElement.textContent = update.error || update.output;
    }
}

// Initialize
initializeTrace();
