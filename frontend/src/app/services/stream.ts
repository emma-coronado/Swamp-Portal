import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface StreamData {
  NumSubs: number;
  Subs: {
    name: string;
    Battery: number;
    TravelPlan: [number, number, number, number][];
  }[];
}

@Injectable({
  providedIn: 'root',
})
export class StreamService {
  private abortController?: AbortController;
  private streamDataSubject = new BehaviorSubject<StreamData | null>(null);
  streamData$ = this.streamDataSubject.asObservable();

  constructor(private zone: NgZone) {}

  async connect() {
    if (this.abortController) return; // prevent duplicate connections

    this.abortController = new AbortController();

    try {
      const response = await fetch('http://localhost:8080/api/stream', {
        method: 'GET',
        credentials: 'include', // Include cookies for authentication
        signal: this.abortController.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      if (!response.body) {
        throw new Error('No response body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        
        // Process complete lines/events
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete line in buffer

        for (const line of lines) {
          if (line.trim()) {
            this.processSSELine(line.trim());
          }
        }
      }
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Stream connection error:', error);
        this.zone.run(() => {
          // Optionally emit error state or retry logic here
        });
      }
    } finally {
      this.abortController = undefined;
    }
  }

  private processSSELine(line: string) {
    // Parse SSE format: "data: {json}"
    if (line.startsWith('data: ')) {
      const jsonData = line.substring(6); // Remove "data: " prefix
      this.zone.run(() => {
        try {
          const data: StreamData = JSON.parse(jsonData);
          this.streamDataSubject.next(data);
        } catch (e) {
          console.error('Error parsing SSE data:', e);
        }
      });
    }
    // Handle other SSE fields if needed (id:, event:, retry:)
  }

  disconnect() {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = undefined;
    }
  }

  getCurrentData(): StreamData | null {
    return this.streamDataSubject.value;
  }
}
