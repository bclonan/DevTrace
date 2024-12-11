// Handle messages from the extension
globalThis.addEventListener('message', (event) => {
  const message = event.data;
  switch (message.type) {
    case 'stateChanged': {
      const state = message.state;
      // Update UI based on state changes
      if (state === 'liveTraceMode.tracing') {
        document.getElementById('loader').style.display = 'block';
        document.getElementById('events').style.display = 'none';
        document.getElementById('error').style.display = 'none';
      } else if (state === 'liveTraceMode.completed') {
        document.getElementById('loader').style.display = 'none';
        document.getElementById('events').style.display = 'block';
        document.getElementById('error').style.display = 'none';

        // Display live events
        const eventsContainer = document.getElementById('events');
        eventsContainer.innerHTML = ''; // Clear previous events
        // ... code to display the live events
      } else if (state === 'liveTraceMode.error') {
        document.getElementById('loader').style.display = 'none';
        document.getElementById('events').style.display = 'none';
        document.getElementById('error').style.display = 'block';

        // Display error message
        document.getElementById('error').textContent = message.errorMessage;
      }
      break;
    }
  }
});

// Send a message to the extension to start or stop live tracing
document.getElementById('startTracingButton').addEventListener('click', () => {
  vscode.postMessage({ type: 'startTracing' });
});

document.getElementById('stopTracingButton').addEventListener('click', () => {
  vscode.postMessage({ type: 'stopTracing' });
});