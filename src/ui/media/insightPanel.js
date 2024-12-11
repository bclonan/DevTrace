// src/ui/media/insightPanel.js

// Handle messages from the extension
globalThis.addEventListener('message', (event) => {
  const message = event.data;
  switch (message.type) {
    case 'stateChanged': {
      const state = message.state;
      // Update UI based on state changes
      if (state === 'insightMode.analyzing') {
        document.getElementById('loader').style.display = 'block';
        document.getElementById('results').style.display = 'none';
        document.getElementById('suggestions').style.display = 'none';
        document.getElementById('error').style.display = 'none';
      } else if (state === 'insightMode.results') {
        document.getElementById('loader').style.display = 'none';
        document.getElementById('results').style.display = 'block';
        document.getElementById('suggestions').style.display = 'none';
        document.getElementById('error').style.display = 'none';

        // Display analysis results
        const resultsContainer = document.getElementById('results');
        resultsContainer.innerHTML = ''; // Clear previous results
        if (message.analysisResults && message.analysisResults.length > 0) {
          message.analysisResults.forEach((result) => {
            const resultElement = document.createElement('div');
            resultElement.textContent = `${result.severity}: ${result.message} at ${result.filePath}:${result.lineNumber}`;
            resultsContainer.appendChild(resultElement);
          });
        } else {
          resultsContainer.innerHTML = '<p>No issues found.</p>';
        }
      } else if (state === 'insightMode.error') {
        document.getElementById('loader').style.display = 'none';
        document.getElementById('results').style.display = 'none';
        document.getElementById('suggestions').style.display = 'none';
        document.getElementById('error').style.display = 'block';

        // Display error message
        document.getElementById('error').textContent = message.errorMessage;
      } else if (state === 'insightMode.suggestionsReceived') {
        document.getElementById('loader').style.display = 'none';
        document.getElementById('results').style.display = 'none';
        document.getElementById('suggestions').style.display = 'block';
        document.getElementById('error').style.display = 'none';

        // Display suggestions
        const suggestionsContainer = document.getElementById('suggestions');
        suggestionsContainer.innerHTML = ''; // Clear previous suggestions
        message.suggestions.forEach((suggestion, _index) => {
          const suggestionElement = document.createElement('div');
          suggestionElement.classList.add('suggestion');
          suggestionElement.textContent = suggestion.description;
          suggestionElement.addEventListener('click', () => {
            // Send a message to apply the selected suggestion
            vscode.postMessage({
              type: 'applySuggestion',
              suggestion: suggestion.codeSnippet,
            });
          });
          suggestionsContainer.appendChild(suggestionElement);
        });
      }
      break;
    }
  }
});

// Send a message to the extension to request analysis
document.getElementById('analyzeButton').addEventListener('click', () => {
  vscode.postMessage({ type: 'analyze' });
});

/**
 * Handles messages from the extension.
 */
globalThis.addEventListener('message', (event) => {
  const message = event.data;
  switch (message.type) {
    case 'stateChanged':
      updateUiBasedOnState(message);
      break;
  }
});

/**
 * Updates the UI based on the current state of the state machine.
 * @param message The message received from the extension.
 */
function updateUiBasedOnState(message) {
  const state = message.state;

  // Hide all sections initially
  document.getElementById('loader').style.display = 'none';
  document.getElementById('results').style.display = 'none';
  document.getElementById('suggestions').style.display = 'none';
  document.getElementById('error').style.display = 'none';

  if (state === 'insightMode.analyzing') {
    // Show the loader while analyzing
    document.getElementById('loader').style.display = 'block';
  } else if (state === 'insightMode.results') {
    // Show the analysis results
    displayAnalysisResults(message.analysisResults);
  } else if (state === 'insightMode.error') {
    // Show the error message
    document.getElementById('error').style.display = 'block';
    document.getElementById('error').textContent = message.errorMessage;
  } else if (state === 'insightMode.suggestionsReceived') {
    // Show the AI suggestions
    displaySuggestions(message.suggestions);
  }
}

/**
 * Displays the analysis results in the UI.
 * @param results The analysis results received from the extension.
 */
function displayAnalysisResults(results) {
  const resultsContainer = document.getElementById('results');
  resultsContainer.innerHTML = ''; // Clear previous results

  if (results && results.length > 0) {
    results.forEach((result) => {
      const resultElement = document.createElement('div');
      resultElement.textContent = `${result.severity}: ${result.message} at ${result.filePath}:${result.lineNumber}`;
      resultElement.addEventListener('click', () => {
        // Optionally, highlight the code in the editor
        vscode.postMessage({
          type: 'highlightCode',
          filePath: result.filePath,
          lineNumber: result.lineNumber,
        });
      });
      resultsContainer.appendChild(resultElement);
    });
  } else {
    resultsContainer.innerHTML = '<p>No issues found.</p>';
  }

  // Show the results section
  document.getElementById('results').style.display = 'block';

  // Add a button to fetch AI suggestions
  const fetchSuggestionsButton = document.createElement('button');
  fetchSuggestionsButton.textContent = 'Fetch AI Suggestions';
  fetchSuggestionsButton.addEventListener('click', () => {
    vscode.postMessage({ type: 'fetchSuggestions' });
  });
  resultsContainer.appendChild(fetchSuggestionsButton);
}

/**
 * Displays the AI suggestions in the UI.
 * @param suggestions The AI suggestions received from the extension.
 */
function displaySuggestions(suggestions) {
  const suggestionsContainer = document.getElementById('suggestions');
  suggestionsContainer.innerHTML = ''; // Clear previous suggestions

  suggestions.forEach((suggestion, _index) => {
    const suggestionElement = document.createElement('div');
    suggestionElement.classList.add('suggestion');
    suggestionElement.textContent = suggestion.description;
    suggestionElement.addEventListener('click', () => {
      // Apply the selected suggestion
      vscode.postMessage({
        type: 'applySuggestion',
        suggestion: suggestion.codeSnippet,
      });
    });
    suggestionsContainer.appendChild(suggestionElement);
  });

  // Show the suggestions section
  document.getElementById('suggestions').style.display = 'block';
}

// Send a message to the extension to request analysis
document.getElementById('analyzeButton').addEventListener('click', () => {
  vscode.postMessage({ type: 'analyze' });
});