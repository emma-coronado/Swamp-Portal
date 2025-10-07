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
  private eventSource?: EventSource;
  private streamDataSubject = new BehaviorSubject<StreamData | null>(null);
  streamData$ = this.streamDataSubject.asObservable();

  constructor(private zone: NgZone) {}

  connect() {
    if (this.eventSource) return; // prevent duplicate connections

    this.eventSource = new EventSource('http://localhost:8080/api/stream');

    this.eventSource.onmessage = (event) => {
      this.zone.run(() => {
        try {
          const data: StreamData = JSON.parse(event.data);
          this.streamDataSubject.next(data);
        } catch (e) {
          console.error('Error parsing SSE data:', e);
        }
      });
    };

    this.eventSource.onerror = (error) => {
      console.error('SSE error:', error);
      this.eventSource?.close();
      this.eventSource = undefined;
    };
  }

  getCurrentData(): StreamData | null {
    return this.streamDataSubject.value;
  }
}
