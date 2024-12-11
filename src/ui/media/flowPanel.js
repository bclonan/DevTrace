// Handle messages from the extension
window.addEventListener('message', (event) => {
  const message = event.data;
  switch (message.type) {
    case 'stateChanged': {
      const state = message.state;
      // Update UI based on state changes
      if (state === 'flowMode.processing') {
        document.getElementById('loader').style.display = 'block';
        document.getElementById('flow').style.display = 'none';
        document.getElementById('error').style.display = 'none';
      } else if (state === 'flowMode.completed') {
        document.getElementById('loader').style.display = 'none';
        document.getElementById('flow').style.display = 'block';
        document.getElementById('error').style.display = 'none';

        // Display flow data
        const flowContainer = document.getElementById('flow');
        flowContainer.innerHTML = ''; // Clear previous flow data
        // ... code to visualize the flow data (e.g., using a graph library)
      } else if (state === 'flowMode.error') {
        document.getElementById('loader').style.display = 'none';
        document.getElementById('flow').style.display = 'none';
        document.getElementById('error').style.display = 'block';

        // Display error message
        document.getElementById('error').textContent = message.errorMessage;
      }
      break;
    }
  }
});

// Send a message to the extension to generate flow data
document.getElementById('generateFlowButton').addEventListener('click', () => {
  const functionName = document.getElementById('functionNameInput').value;
  vscode.postMessage({ type: 'generateFlow', functionName });
});