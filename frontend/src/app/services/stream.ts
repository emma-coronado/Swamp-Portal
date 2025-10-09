import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

// export interface StreamData {
//   NumSubs: number;
//   Subs: {
//     Name: string;  // Changed from 'name' to 'Name' to match server data
//     Battery: number;
//     TravelPlan: [number, number, number, number][];
//   }[];
// }

export interface StreamData {
    num_subs: number;
    Subs: {
            name: string;
            new_reports: number;
            role: string;
            travel_plan: {
                timestamp: number;
                position: { x: number; y: number; z: number };
                orientation: {x: number; y: number; z: number; w: number};
            }[];
            // travel_data: { // historic
            //     timestamp: number;
            //     position: { x: number; y: number; z: number };
            //     orientation: {x: number; y: number; z: number; w: number};
            // }
            avg_deviation: number; // past 1 minute
        }[];
    Events: {
        time: number;
        from: string;
        event_type: string;
        msg: string;
        pos: {x: number; y: number; z: number};
    }[];
}


@Injectable({
  providedIn: 'root',
})
export class StreamService {
  private abortController?: AbortController;
  private streamDataSubject = new BehaviorSubject<StreamData | null>(null);
  private connectionStateSubject = new BehaviorSubject<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');

  streamData$ = this.streamDataSubject.asObservable();
  connectionState$ = this.connectionStateSubject.asObservable();

  constructor(private zone: NgZone) {}

  async connect() {
    if (this.abortController) return; // prevent duplicate connections

    this.abortController = new AbortController();
    this.connectionStateSubject.next('connecting');

    try {
      const response = await fetch('/api/stream', {
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

      this.connectionStateSubject.next('connected');
      console.log('Live data stream connected');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk;

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
          this.connectionStateSubject.next('error');
        });
      }
    } finally {
      this.zone.run(() => {
        if (this.connectionStateSubject.value !== 'error') {
          this.connectionStateSubject.next('disconnected');
        }
      });
      this.abortController = undefined;
    }
  }

  private processSSELine(line: string) {
    // Handle SSE data events
    if (line.startsWith('data:')) {
      const jsonData = line.substring(5); // Remove "data:" prefix

      this.zone.run(() => {
        try {
          if (jsonData.trim() === 'null' || jsonData.trim() === '' || jsonData.trim() === 'undefined') {
            this.streamDataSubject.next(null);
          } else {
            const data: StreamData = JSON.parse(jsonData);
            this.streamDataSubject.next(data);
          }
        } catch (e) {
          console.error('Error parsing stream data:', e);
        }
      });
    }
    // Silently handle other SSE fields (event:, id:, retry:, comments)
  }

  disconnect() {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = undefined;
    }
    this.connectionStateSubject.next('disconnected');
  }

  getCurrentData(): StreamData | null {
    return this.streamDataSubject.value;
  }

  getConnectionStatus(): 'disconnected' | 'connecting' | 'connected' | 'error' {
    return this.connectionStateSubject.value;
  }

  // Retry connection with exponential backoff
  async retryConnection(maxRetries: number = 3, initialDelay: number = 1000) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Connection attempt ${attempt}/${maxRetries}`);
        await this.connect();
        return; // Success, exit retry loop
      } catch (error) {
        console.error(`Connection attempt ${attempt} failed:`, error);
        if (attempt < maxRetries) {
          const delay = initialDelay * Math.pow(2, attempt - 1);
          console.log(`Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    console.error(`Failed to establish connection after ${maxRetries} attempts`);
  }


}
