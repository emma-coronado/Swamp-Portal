import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface EventItem {
  time: number;
  from: string;
  event_type: string;
  msg: string;
  pos: { x: number; y: number; z: number };
}

@Component({
  selector: 'app-events-panel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-slate-800 rounded-xl p-6 border border-slate-700">
      <h3 class="text-xl font-bold mb-4">{{ title }}</h3>
      
      <div *ngIf="events.length === 0" class="text-center py-8 text-slate-400">
        <div class="text-lg">No events available</div>
        <div class="text-sm mt-2">Waiting for event data from stream...</div>
      </div>

      <div *ngIf="events.length > 0" class="space-y-3 max-h-96 overflow-y-auto">
        <div 
          *ngFor="let event of sortedEvents" 
          class="bg-slate-700/30 rounded-lg p-4 border-l-4 transition-colors duration-200 hover:bg-slate-700/50"
          [ngClass]="getEventBorderClass(event.event_type)"
        >
          <!-- Event Header -->
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center space-x-3">
              <span 
                class="px-2 py-1 rounded-full text-xs font-medium"
                [ngClass]="getEventTypeClass(event.event_type)"
              >
                {{ event.event_type }}
              </span>
              <span class="text-slate-300 font-medium">{{ event.from }}</span>
            </div>
            <span class="text-xs text-slate-400">
              {{ formatTimestamp(event.time) }}
            </span>
          </div>

          <!-- Event Message -->
          <p class="text-slate-200 mb-3">{{ event.msg }}</p>

          <!-- Position Info -->
          <div class="flex items-center space-x-4 text-xs text-slate-400">
            <span>Position:</span>
            <span class="font-mono">
              X: {{ event.pos.x.toFixed(2) }}
            </span>
            <span class="font-mono">
              Y: {{ event.pos.y.toFixed(2) }}
            </span>
            <span class="font-mono">
              Z: {{ event.pos.z.toFixed(2) }}
            </span>
          </div>
        </div>
      </div>

      <!-- Event Statistics -->
      <div *ngIf="events.length > 0" class="mt-4 pt-4 border-t border-slate-700 grid grid-cols-3 gap-4 text-center">
        <div>
          <div class="text-2xl font-bold text-slate-300">{{ events.length }}</div>
          <div class="text-xs text-slate-400">Total Events</div>
        </div>
        <div>
          <div class="text-2xl font-bold text-green-400">{{ getUniqueEventTypes().length }}</div>
          <div class="text-xs text-slate-400">Event Types</div>
        </div>
        <div>
          <div class="text-2xl font-bold text-yellow-400">{{ getUniqueSources().length }}</div>
          <div class="text-xs text-slate-400">Sources</div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    ::-webkit-scrollbar {
      width: 6px;
    }
    
    ::-webkit-scrollbar-track {
      background: rgba(15, 23, 42, 0.5);
      border-radius: 3px;
    }
    
    ::-webkit-scrollbar-thumb {
      background: rgba(148, 163, 184, 0.3);
      border-radius: 3px;
    }
    
    ::-webkit-scrollbar-thumb:hover {
      background: rgba(148, 163, 184, 0.5);
    }
  `]
})
export class EventsPanelComponent {
  @Input() title: string = 'System Events';
  @Input() events: EventItem[] = [];

  get sortedEvents(): EventItem[] {
    return [...this.events].sort((a, b) => b.time - a.time); // Sort by time, newest first
  }

  formatTimestamp(unixTime: number): string {
    const date = new Date(unixTime * 1000); // Unix timestamp to milliseconds
    return date.toLocaleString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      month: '2-digit',
      day: '2-digit'
    });
  }

  getEventTypeClass(eventType: string): string {
    const type = eventType.toLowerCase();
    
    if (type.includes('error') || type.includes('fail') || type.includes('critical')) {
      return 'bg-red-500/20 text-red-400';
    }
    if (type.includes('warn') || type.includes('caution')) {
      return 'bg-yellow-500/20 text-yellow-400';
    }
    if (type.includes('info') || type.includes('status')) {
      return 'bg-blue-500/20 text-blue-400';
    }
    if (type.includes('success') || type.includes('complete')) {
      return 'bg-green-500/20 text-green-400';
    }
    
    return 'bg-slate-500/20 text-slate-400'; // Default
  }

  getEventBorderClass(eventType: string): string {
    const type = eventType.toLowerCase();
    
    if (type.includes('error') || type.includes('fail') || type.includes('critical')) {
      return 'border-red-500';
    }
    if (type.includes('warn') || type.includes('caution')) {
      return 'border-yellow-500';
    }
    if (type.includes('info') || type.includes('status')) {
      return 'border-blue-500';
    }
    if (type.includes('success') || type.includes('complete')) {
      return 'border-green-500';
    }
    
    return 'border-slate-500'; // Default
  }

  getUniqueEventTypes(): string[] {
    return [...new Set(this.events.map(event => event.event_type))];
  }

  getUniqueSources(): string[] {
    return [...new Set(this.events.map(event => event.from))];
  }
}