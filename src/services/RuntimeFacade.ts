import axios from 'axios';
import { NodeAdapter } from '../runtimeAdapters/NodeAdapter';
import type { AISuggestion, FetchSuggestionsRequest } from '../types';

export class RuntimeFacade {
  private adapter: NodeAdapter;

  constructor() {
    this.adapter = new NodeAdapter();
  }

  startTracing() {
    this.adapter.startTracing();
  }

  stopTracing() {
    this.adapter.stopTracing();
  }

  async analyzeCode() {
    try {
      const response = await axios.post('http://localhost:3000/analyze');
      return response.data.issues;
    } catch (error) {
      console.error('Error analyzing code:', error);
      throw error;
    }
  }

  async generateFlowData(functionName: string) {
    try {
      const response = await axios.post('http://localhost:3000/flow', {
        functionName,
      });
      return response.data;
    } catch (error) {
      console.error('Error generating flow data:', error);
      throw error;
    }
  }

  async startLiveTrace() {
    try {
      const response = await axios.get('http://localhost:3000/live');
      return response.data;
    } catch (error) {
      console.error('Error starting live trace:', error);
      throw error;
    }
  }

  async performHotswap(stateId: string, newCode: string) {
    try {
      const response = await axios.post('http://localhost:3000/hotswap', {
        stateId,
        newCode,
      });
      return response.data;
    } catch (error) {
      console.error('Error performing hotswap operation:', error);
      throw error;
    }
  }

  async fetchSuggestions(request: FetchSuggestionsRequest) {
    try {
      const response = await axios.post('http://localhost:3000/ai/suggestFix', request);
      return response.data;
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      throw error;
    }
  }

  async applySuggestion(currentFile: string, suggestion: AISuggestion) {
    try {
      const response = await axios.post('http://localhost:3000/code/applySuggestion', {
        currentFile,
        suggestion,
      });
      return response.data.success;
    } catch (error) {
      console.error('Error applying suggestion:', error);
      throw error;
    }
  }
}