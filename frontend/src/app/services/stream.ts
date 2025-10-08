import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface StreamData {
  NumSubs: number;
  Subs: {
    Name: string;  // Changed from 'name' to 'Name' to match server data
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
  private connectionStateSubject = new BehaviorSubject<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  
  streamData$ = this.streamDataSubject.asObservable();
  connectionState$ = this.connectionStateSubject.asObservable();

  constructor(private zone: NgZone) {}

  async connect() {
    if (this.abortController) return; // prevent duplicate connections

    this.abortController = new AbortController();
    this.connectionStateSubject.next('connecting');

    try {
      console.log('Attempting to connect to SSE stream...');
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

      this.connectionStateSubject.next('connected');
      console.log('SSE stream connection established');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          console.log('SSE stream ended');
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        console.log('🌊 RAW STREAM CHUNK RECEIVED:', JSON.stringify(chunk));
        console.log('🌊 RAW STREAM CHUNK (readable):', chunk);
        
        buffer += chunk;
        
        // Process complete lines/events
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete line in buffer
        
        console.log('📋 SPLIT INTO LINES:', lines);

        for (const line of lines) {
          if (line.trim()) {
            console.log('🔍 PROCESSING LINE:', JSON.stringify(line.trim()));
            this.processSSELine(line.trim());
          } else if (line === '') {
            console.log('📝 Empty line (SSE event separator)');
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
    console.log('📡 PROCESSING SSE LINE:', line);
    
    // Handle all possible SSE event types
    if (line.startsWith('data:')) {
      const jsonData = line.substring(5); // Remove "data:" prefix (no space)
      console.log('📦 EXTRACTED JSON DATA:', jsonData);
      console.log('📦 JSON DATA LENGTH:', jsonData.length);
      
      this.zone.run(() => {
        try {
          if (jsonData.trim() === 'null' || jsonData.trim() === '' || jsonData.trim() === 'undefined') {
            console.log('⚪ RECEIVED NULL/EMPTY DATA FROM SSE STREAM');
            this.streamDataSubject.next(null);
          } else {
            console.log('🔄 ATTEMPTING TO PARSE JSON:', jsonData);
            const data: StreamData = JSON.parse(jsonData);
            console.log('✅ SUCCESSFULLY PARSED SSE DATA:');
            console.log('   📊 Full data object:', JSON.stringify(data, null, 2));
            console.log('   🔢 NumSubs:', data.NumSubs);
            console.log('   🚢 Subs array:', data.Subs);
            console.log('   📏 Subs array length:', data.Subs?.length);
            
            // Emit the data
            this.streamDataSubject.next(data);
            console.log('📤 DATA EMITTED TO SUBSCRIBERS');
          }
        } catch (e) {
          console.error('❌ ERROR PARSING SSE DATA:', e);
          console.error('❌ RAW DATA THAT FAILED:', jsonData);
          console.error('❌ DATA TYPE:', typeof jsonData);
        }
      });
    } else if (line.startsWith('event:')) {
      console.log('🎯 SSE EVENT TYPE:', line.substring(6));
    } else if (line.startsWith('id:')) {
      console.log('🆔 SSE EVENT ID:', line.substring(3));
    } else if (line.startsWith('retry:')) {
      console.log('🔄 SSE RETRY INTERVAL:', line.substring(6));
    } else if (line.startsWith(':')) {
      console.log('💬 SSE COMMENT:', line.substring(1));
    } else if (line.trim()) {
      console.log('❓ UNKNOWN SSE LINE FORMAT:', line);
    }
  }

  disconnect() {
    console.log('🔌 Disconnecting SSE stream...');
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = undefined;
    }
    
    // Also close EventSource if it exists
    if ((window as any)._currentEventSource) {
      console.log('🔌 Closing EventSource connection');
      (window as any)._currentEventSource.close();
      (window as any)._currentEventSource = null;
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

  // Alternative method using EventSource API (for testing)
  connectWithEventSource() {
    console.log('🔄 Trying alternative EventSource connection...');
    
    if (this.abortController) {
      console.log('⚠️ Disconnecting existing connection first');
      this.disconnect();
    }

    try {
      const eventSource = new EventSource('http://localhost:8080/api/stream', {
        withCredentials: true
      });

      eventSource.onopen = () => {
        console.log('✅ EventSource connection opened');
        this.connectionStateSubject.next('connected');
      };

      eventSource.onmessage = (event) => {
        console.log('📨 EventSource received message:');
        console.log('   Raw event:', event);
        console.log('   Event data:', event.data);
        console.log('   Event type:', event.type);
        console.log('   Event lastEventId:', event.lastEventId);
        
        this.zone.run(() => {
          try {
            if (event.data && event.data !== 'null' && event.data !== '') {
              const data: StreamData = JSON.parse(event.data);
              console.log('✅ EventSource parsed data successfully:', data);
              this.streamDataSubject.next(data);
            } else {
              console.log('⚪ EventSource received null/empty data');
              this.streamDataSubject.next(null);
            }
          } catch (e) {
            console.error('❌ EventSource parsing error:', e, 'Raw data:', event.data);
          }
        });
      };

      eventSource.onerror = (error) => {
        console.error('❌ EventSource error:', error);
        this.connectionStateSubject.next('error');
        eventSource.close();
      };

      // Store reference to close later
      (window as any)._currentEventSource = eventSource;
      
    } catch (error) {
      console.error('❌ Failed to create EventSource:', error);
      this.connectionStateSubject.next('error');
    }
  }

  // Debug method to check current state
  debugStatus() {
    console.log('=== SSE Stream Debug Info ===');
    console.log('Connection Status:', this.connectionStateSubject.value);
    console.log('Current Data:', this.streamDataSubject.value);
    console.log('Has Active Controller:', !!this.abortController);
    console.log('Has EventSource:', !!(window as any)._currentEventSource);
    console.log('Subscribers count:', this.streamDataSubject.observers.length);
    console.log('============================');
  }
}
