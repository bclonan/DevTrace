// Handle messages from the extension
window.addEventListener('message', (event) => {
  const message = event.data;
  switch (message.type) {
    case 'stateChanged':
      const state = message.state;
      // Update UI based on state changes
      if (state === 'insightMode.analyzing') {
        document.getElementById('loader').style.display = 'block';
        document.getElementById('results').style.display = 'none';
        document.getElementById('error').style.display = 'none';
      } else if (state === 'insightMode.results') {
        document.getElementById('loader').style.display = 'none';
        document.getElementById('results').style.display = 'block';
        document.getElementById('error').style.display = 'none';

        // Display analysis results
        const resultsContainer = document.getElementById('results');
        resultsContainer.innerHTML = ''; // Clear previous results
        message.results.forEach((result) => {
          const resultElement = document.createElement('div');
          resultElement.textContent = `${result.severity}: ${result.message} at ${result.filePath}:${result.lineNumber}`;
          resultsContainer.appendChild(resultElement);
        });
      } else if (state === 'insightMode.error') {
        document.getElementById('loader').style.display = 'none';
        document.getElementById('results').style.display = 'none';
        document.getElementById('error').style.display = 'block';

        // Display error message
        document.getElementById('error').textContent = message.errorMessage;
      }
      break;
  }
});

// Send a message to the extension to request analysis
document.getElementById('analyzeButton').addEventListener('click', () => {
  vscode.postMessage({ type: 'analyze' });
});
