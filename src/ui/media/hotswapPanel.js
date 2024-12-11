// Handle messages from the extension
globalThis.addEventListener('message', (event) => {
  const message = event.data;
  switch (message.type) {
    case 'stateChanged': {
      const state = message.state;
      // Update UI based on state changes
      if (state === 'hotswapMode.swapping') {
        document.getElementById('loader').style.display = 'block';
        document.getElementById('history').style.display = 'none';
        document.getElementById('error').style.display = 'none';
      } else if (state === 'hotswapMode.completed') {
        document.getElementById('loader').style.display = 'none';
        document.getElementById('history').style.display = 'block';
        document.getElementById('error').style.display = 'none';

        // Display hotswap history
        const historyContainer = document.getElementById('history');
        historyContainer.innerHTML = ''; // Clear previous history
        // ... code to display the hotswap history
      } else if (state === 'hotswapMode.error') {
        document.getElementById('loader').style.display = 'none';
        document.getElementById('history').style.display = 'none';
        document.getElementById('error').style.display = 'block';

        // Display error message
        document.getElementById('error').textContent = message.errorMessage;
      }
      break;
    }
  }
});


// Handle messages from the extension
// Send messages to the extension to perform hotswap operations
document.getElementById('rollbackButton').addEventListener('click', () => {
  const stateId = document.getElementById('stateIdInput').value; // Get the state ID from an input field
  vscode.postMessage({ type: 'rollback', stateId });
});

document.getElementById('applyFixButton').addEventListener('click', () => {
  const stateId = document.getElementById('stateIdInput').value; // Get the state ID from an input field
  const newCode = document.getElementById('newCodeInput').value; // Get the new code from an input field
  vscode.postMessage({ type: 'applyFix', stateId, newCode });
});

document.getElementById('playForwardButton').addEventListener('click', () => {
  const stateId = document.getElementById('stateIdInput').value; // Get the state ID from an input field
  vscode.postMessage({ type: 'playForward', stateId });
});