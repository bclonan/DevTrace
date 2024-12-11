import axios from 'axios';
import { NodeAdapter } from '../runtimeAdapters/NodeAdapter';

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

  // ... other methods to interact with the adapter and backend API
}